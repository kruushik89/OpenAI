import OpenAI from "openai";

const openai = new OpenAI()

async function generateEmbeddings(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    console.log("text: ", text, "embedding: ", response.data[0].embedding);
    return response;
}

generateEmbeddings("cat");