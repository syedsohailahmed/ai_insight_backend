const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Create embedding using OpenRouter
 */
export async function createEmbedding(text) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: text,
      }),
    });

    const data = await response.json();

    if (!data.data?.[0]?.embedding) {
      console.error("Embedding error:", data);
      throw new Error("Embedding failed");
    }

    return data.data[0].embedding;
  } catch (err) {
    console.log("Embedding error:", err);
    throw err;
  }
}

/**
 * Generate product analysis
 */
export async function generateProductAnalysis(product, similarProducts = []) {
  const { title, description, price } = product;

  const prompt = `
You are an AI product analyst. ALWAYS respond in valid JSON using this structure and return buyScore out of 100:

{
  "summary": "",
  "pros": [],
  "cons": [],
  "hiddenIssues": [],
  "priceInsight": "",
  "buyScore": 0
}

Product info:
Title: ${title}
Description: ${description}
Price: ${price}

Similar products: ${similarProducts.map(p => p.title).join(", ") || "None"}
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.1-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI failed (analysis)");

  try {
    return JSON.parse(raw);     // ⬅️ structured output
  } catch (err) {
    console.error("JSON parse error:", raw);
    throw new Error("Invalid AI JSON");
  }
}

export async function summarizeReviews(reviews) {
  if (!reviews) return "No reviews available.";

  // FIX: If reviews arrive as a single string containing an array → parse it
  if (typeof reviews === "string") {
    try {
      reviews = JSON.parse(reviews.replace(/'/g, '"'));
    } catch (e) {
      console.error("Failed to parse reviews string:", e);
      return "No reviews available.";
    }
  }

  // Ensure it's an array
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return "No reviews available.";
  }

  const text = reviews.join("\n");

  const prompt = `
Summarize these customer reviews into JSON with fields:
{
  "pros": [],
  "cons": [],
  "rating": 0
}

Reviews:
${text}
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.1-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;

  if (!raw) return "No response";

  try {
    return JSON.parse(raw);   // AI returns pure JSON
  } catch {
    return { pros: [], cons: [], rating: 0 };
  }
}



