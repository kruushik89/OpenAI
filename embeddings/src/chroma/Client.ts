import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from '@chroma-core/openai';

const client = new ChromaClient({
    host: 'localhost',
    port: 8000,
});

// Усі embeddings в одній collection мають однакову розмірність
const EMBEDDING = [0.1, 0.2, 0.3];

const embeddingFunction = new OpenAIEmbeddingFunction({
    apiKey: process.env.OPENAI_API_KEY!,
    modelName: 'text-embedding-3-small',
});

const collectionName = 'data-test2';

async function addData() {
    const collection = await client.getCollection({
        name: collectionName,
    });

    await collection.add({
        ids: ['id1'],
        documents: ['TEST DATA'],
        embeddings: [EMBEDDING],
    });

    console.log('Added document');
}

async function main() {
    await client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction,
    });

    await addData();

    const collection = await client.getCollection({ name: collectionName });
    const data = await collection.get({ include: ['documents'] });

    console.log('Count:', await collection.count());
    console.log('IDs:', data.ids);
    console.log('Documents:', data.documents);
}

main();
