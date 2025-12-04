import { createEmbedding, generateProductAnalysis, summarizeReviews } from "../services/aiService.js";
import { upsertVector, querySimilar, initPinecone } from "../services/vectorService.js";

// Initialize Pinecone once
await initPinecone();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { title, description, price, url, reviews } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const fullText = `${title}\n${description}`;

    // Create embedding
    const embedding = await createEmbedding(fullText);

    // Upsert into Pinecone
    await upsertVector(url, embedding, { title, description, price, url });

    // Query similar products
    const similarProducts = await querySimilar(embedding, 5);

    // Generate AI analysis
    const analysis = await generateProductAnalysis({ title, description, price }, similarProducts);

    // Summarize reviews
    const reviewSummary = await summarizeReviews(reviews);

    res.status(200).json({
      result: { raw: analysis },
      reviews: reviewSummary,
      similar: similarProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
