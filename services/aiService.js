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
You are an AI product analyst. Provide:
- Summary
- Pros
- Cons
- Hidden issues
- Alternatives
- Price insight
- Buy score (0-10)

Also consider similar products:
${similarProducts.map((p) => p.title).join(", ") || "None"}

Product:
Title: ${title}
Description: ${description}
Price: ${price}
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
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    console.error("LLM error:", data);
    throw new Error("AI failed");
  }

  return data.choices[0].message.content;
}

export async function summarizeReviews(reviews) {
  if (!reviews || reviews.length === 0) return "No reviews available.";

  const text = reviews.map(r => r.review).join("\n");

  const prompt = `
    You are an AI assistant. Summarize the following product reviews into:
    - Pros
    - Cons
    - Overall rating (0-10)
    Reviews: ${text}`;

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
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    console.error("LLM error:", data);
    throw new Error("AI failed");
  }

  return data.choices[0].message.content;
}

