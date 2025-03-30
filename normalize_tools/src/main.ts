import { generateDataset } from "./generate_dataset";
import { logger } from "./logger";
import { normalizeAllCategories } from "./normalize_all_categories";
import { normalizeSubcategory } from "./normalize_subcategory";

async function main() {
    logger.info(`START => ${main.name}`);

    //await normalizeSubcategory()
    //await normalizeAllCategories();
    await generateDataset();
}

main();

