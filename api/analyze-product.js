import { createEmbedding, generateProductAnalysis, summarizeReviews } from "../services/aiService.js";
import { upsertVector, querySimilar } from "../services/vectorService.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { title, description, price, url, reviews } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const fullText = `${title}\n${description}`;
    const embedding = await createEmbedding(fullText);

    await upsertVector(url, embedding, { title, description, price, url });
    const similarProducts = await querySimilar(embedding, 5);

    const analysis = await generateProductAnalysis({ title, description, price }, similarProducts);
    const reviewsSummary = await summarizeReviews(reviews);

    res.status(200).json({
      result: { raw: analysis },
      reviewsSummary,
      similar: similarProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
