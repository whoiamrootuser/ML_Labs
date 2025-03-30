import { createReadStream } from "fs";
import { logger } from "./logger";
import path from "path";
import csv from "csv";
import ExcelJS from "exceljs"

export async function normalizeSubcategory(): Promise<void> {
    const readStream = createReadStream(path.resolve("data", "other-products.csv")).pipe(csv.parse({ delimiter: ",", trim: true }));
    //const readStream = createReadStream(path.resolve("data", "products-normalized-categories_full.csv")).pipe(csv.parse({ delimiter: ",", trim: true }));
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ useStyles: true, filename: path.resolve("data", "output-other-products.xlsx") });
    const worksheet = workbook.addWorksheet("output");
    const subcategoryWorksheet = workbook.addWorksheet("subcategories");
    const orginalDataWorksheet = workbook.addWorksheet("original_data");
    const allSubcategories = []
    let isHeader = true;
    readStream.on("data", (data: string[]) => {
        if (isHeader) {
            isHeader = false;
            return;
        }
        const description = data[0];
        const segment = data[1];
        const category = data[2];
        const subcategory = data[3];
        orginalDataWorksheet.addRow([description, segment, category, subcategory]).commit();

        const spaceRegex = /\s/g
        const descriptionWithoutSpaces = description.replace(spaceRegex, "").toUpperCase();
        const subcategoryWithoutSpaces = subcategory.replace(spaceRegex, "").toUpperCase();
        const cleanSubcategory = subcategoryWithoutSpaces.replace(descriptionWithoutSpaces, "");

        const originalSubcategory = subcategory.split(/\s/);
        let normalizeSubcategory = originalSubcategory.reduce((acc, value) => {
            if (cleanSubcategory.includes(value))
                return `${acc} ${value}`.trim();
            return acc;
        }, "")

        normalizeSubcategory = [...new Set(normalizeSubcategory.split(" "))].join(" ");

        const existsSubcategory = allSubcategories.some((findSubcategory: string) => findSubcategory === normalizeSubcategory);
        if (!existsSubcategory) {
            allSubcategories.push(normalizeSubcategory);
            subcategoryWorksheet.addRow([normalizeSubcategory, category, segment]).commit();
        };
        worksheet.addRow([description, segment, category, normalizeSubcategory]).commit();
    })

    readStream.on("end", () => {
        orginalDataWorksheet.commit();
        subcategoryWorksheet.commit();
        worksheet.commit();
        workbook.commit().then(() => console.log("created file"));

    })
}