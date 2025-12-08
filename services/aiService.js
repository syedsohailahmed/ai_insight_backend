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
You are an AI product analyst. ALWAYS respond in valid JSON using this structure:

{
  "summary": "",
  "pros": [],
  "cons": [],
  "hiddenIssues": [],
  "alternatives": [],
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
  if (!reviews || reviews.length === 0) {
    return { pros: [], cons: [], rating: 0 };
  }

  const text = reviews.map(r => r.review).join("\n");

  const prompt = `
Summarize the following reviews. ALWAYS respond ONLY with valid JSON:

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
      max_tokens: 400,
      temperature: 0.4,
    }),
  });

  const data = await response.json();

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI failed (summaries)");

  try {
    return JSON.parse(raw);     // ⬅️ structured output
  } catch (err) {
    console.error("JSON parse error:", raw);
    throw new Error("Invalid AI JSON");
  }
}


