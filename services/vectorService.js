import { Pinecone } from '@pinecone-database/pinecone';

let index;

export async function initPinecone() {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    index = pc.index(process.env.PINECONE_INDEX_NAME);
  } catch (err) {
    console.error("Pinecone initialization error:", err);
  }
}

export async function upsertVector(id, values, metadata) {
  if (!index) throw new Error("Pinecone index not initialized");

  const ns = index.namespace(process.env.PINECONE_NAMESPACE || "");

  await ns.upsert([
    {
      id,
      values,
      metadata,
    }
  ]);
}

export async function querySimilar(vector, topK = 5) {
  if (!index) throw new Error("Pinecone index not initialized");

  const ns = index.namespace(process.env.PINECONE_NAMESPACE || "");

  const response = await ns.query({
    topK,
    vector,
    includeMetadata: true,
  });

  return response.matches?.map(m => m.metadata) || [];
}
