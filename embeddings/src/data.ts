import OpenAI from "openai";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const openai = new OpenAI()

type DataWithEmbeddings = {
    input: string;
    embedding: number[];
}

async function generateEmbeddings(input: string | string[]) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
    });
    return response.data;
}

function loadJSONData<T>(filePath: string): T {
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

async function main() {
    const data = loadJSONData<string[]>("data.json");
    const embeddings = await generateEmbeddings(data);
    const dataWithEmbeddings: DataWithEmbeddings[] = []

    for (let i = 0; i < data.length; i++) {
        dataWithEmbeddings.push({
            input: data[i],
            embedding: embeddings[i].embedding,
        });
    }
    saveDataToJSONFile(dataWithEmbeddings, "dataWithEmbeddings.json");
}

main();