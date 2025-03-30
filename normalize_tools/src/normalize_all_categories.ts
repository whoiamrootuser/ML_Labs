import { createReadStream } from "fs";
import path from "path";
import csv from "csv";
import ExcelJS from "exceljs"

export async function normalizeAllCategories(): Promise<void> {
    const readStream = createReadStream(path.resolve("data", "categories.csv")).pipe(csv.parse({ delimiter: ",", trim: true, columns: true }));
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ useStyles: true, filename: path.resolve("data", "output-all-categories.xlsx") });
    const worksheet = workbook.addWorksheet("subcategory");
    const allSubcategories = []
    readStream.on("data", ({ new_subcategory: subcategory, family, category, segment }: Record<string, string>) => {
        const startsNumberRegex = /^\d+\-/g
        const segmentWithoutNumber = segment.replace(startsNumberRegex, "").toUpperCase();
        const categoryWithoutNumber = category.replace(startsNumberRegex, "").toUpperCase();
        const familyWithoutNumber = family.replace(startsNumberRegex, "").toUpperCase();

        const existsSubcategory = allSubcategories.some((findSubcategory: string) => findSubcategory === subcategory);
        if (!existsSubcategory) {
            allSubcategories.push(subcategory);
        };
        worksheet.addRow([subcategory, familyWithoutNumber, categoryWithoutNumber, segmentWithoutNumber]).commit();
    })

    readStream.on("end", () => {
        worksheet.commit();
        workbook.commit().then(() => console.log("created file"));

    })
}