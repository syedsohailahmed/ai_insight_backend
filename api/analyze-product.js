import { createEmbedding, generateProductAnalysis, summarizeReviews } from "../services/aiService.js";
import { upsertVector, querySimilar, initPinecone } from "../services/vectorService.js";

// Initialize Pinecone once
await initPinecone();

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { title, description, price, url, reviews } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    // const fullText = `${title}\n${description}`;

    // Create embedding
    // const embedding = await createEmbedding(fullText);

    // Query similar products
    // const similarProducts = await querySimilar(embedding, 3);
    
    // Upsert into Pinecone
    // await upsertVector(url, embedding, { title, description, price, url });

    // Generate AI analysis
    const analysis = await generateProductAnalysis({ title, description, price }, similarProducts);

    // Summarize reviews
    const reviewSummary = await summarizeReviews(reviews);

    res.status(200).json({
      analysis,
      reviewSummary,
      similar: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
