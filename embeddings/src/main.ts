import OpenAI from "openai";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const openai = new OpenAI()

export type DataWithEmbeddings = {
    input: string,
    embedding: number[]
}

export async function generateEmbeddings(input: string | string[]) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
    });
    return response.data;
}

export function loadJSONData<T>(filePath: string): T {
    const path = join(__dirname, filePath);
    const rowData = readFileSync(path);
    return JSON.parse(rowData.toString());
}

function saveDataToJSONFile(data: any, fileName: string) {
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString);
    const path = join(__dirname, fileName);
    writeFileSync(path, dataBuffer);
    console.log(`Data saved to ${fileName}`);
}

export async function saveEmbeddingsFromDataFile(sourceFile: string, outputFile: string) {
    const data = loadJSONData<string[]>(sourceFile);
    const embeddings = await generateEmbeddings(data);
    const dataWithEmbeddings: DataWithEmbeddings[] = data.map((input, i) => ({
        input,
        embedding: embeddings[i].embedding,
    }));
    saveDataToJSONFile(dataWithEmbeddings, outputFile);
}

async function main() {
    await saveEmbeddingsFromDataFile("data.json", "dataWithEmbeddings.json");
    await saveEmbeddingsFromDataFile("data2.json", "dataWithEmbeddings2.json");
}

if (require.main === module) {
    main();
}