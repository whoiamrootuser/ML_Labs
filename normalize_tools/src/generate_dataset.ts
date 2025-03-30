import { createReadStream, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import csv from "csv";
import { logger } from "./logger";

interface ProductInfo {
    description: string;
    category: string;
}

export async function generateDataset(): Promise<void> {
    let fileIndex = 0;
    const readStream = createReadStream(path.resolve("data", "dataset.csv")).pipe(csv.parse({ delimiter: ";", trim: true, columns: true }));
    readStream.on("data", ({ category, description }: ProductInfo) => {
        if(!category){
            logger.error(`Product: ${description} \n without category: ${category}`);
            return;
        }
        
        fileIndex++;
        const folderPath = createFolderForCategory(category);
        writeProductTextFile(description, `${folderPath}/${fileIndex}.txt`)
    });
}

function createFolderForCategory(category: string): string {
    const defaultFolderPath = path.resolve('data/dataset/train', category);
    try {
        if (!existsSync(defaultFolderPath)) {
            mkdirSync(defaultFolderPath);
        }
        return defaultFolderPath;
    } catch (err) {
        console.error(err);
    }
}

async function writeProductTextFile(content: string, filePath: string): Promise<void> {
    try {
        writeFileSync(filePath, content);
    } catch (err) {
        console.error(err);
    }
}