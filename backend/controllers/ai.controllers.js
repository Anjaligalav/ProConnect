import axios from "axios";
import User from "../models/user.models.js";

// Only use models that are currently available on Groq.
// If the first model fails (decommissioned / no access), the next one is tried.
const GROQ_MODELS = [
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b"
].filter(Boolean);

/**
 * AI Post Enhancer Controller (Using Groq API)
 * Takes a short prompt from the user and turns it into a professional LinkedIn-style post
 */
export const enhancePost = async (req, res) => {
    const { token, prompt } = req.body;

    // Step 1: Verify the user — AI cannot be used without logging in
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Step 2: Check that the user actually wrote something
    if (!prompt || prompt.trim() === "") {
        return res.status(400).json({ message: "Please provide a prompt" });
    }

    if (!process.env.GROQ_API_KEY) {
        console.error("AI Enhancement Error: GROQ_API_KEY is missing");
        return res.status(500).json({ message: "AI service is not configured." });
    }

    // Step 3: System prompt — tell the AI what to do
    const systemPrompt = `You are a professional LinkedIn post writer.
Your job is to take a short idea or prompt from the user and convert it into a well-written, professional LinkedIn post.

Rules:
- Write in a professional yet engaging tone
- Add relevant emojis where appropriate (but don't overdo it)
- Include 2-3 relevant hashtags at the end
- Keep the post between 100-200 words
- Make it inspiring and motivational
- Use line breaks for readability
- Do NOT use any markdown formatting like asterisks (*) or bold — write plain text only
- Do NOT include any introductory text like "Here's a post..." — directly give the post content

The user's name is: ${user.name}`;

    let lastError = null;

    // Step 4: Call the Groq API — try the models one by one
    for (const model of GROQ_MODELS) {
        try {
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 1024,
                    reasoning_effort: "low"
                },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    timeout: 30000
                }
            );

            // Step 5: Get the text out of the response
            const enhancedPost = response.data?.choices?.[0]?.message?.content?.trim();
            if (!enhancedPost) throw new Error("Empty response from AI");

            // Step 6: Send the enhanced post back to the frontend
            return res.json({
                enhancedPost,
                message: "Post enhanced successfully"
            });

        } catch (error) {
            lastError = error;
            const status = error.response?.status;
            const apiError = error.response?.data?.error;
            console.error(`AI Enhancement failed on model "${model}":`, status, apiError || error.message);

            // Model not found / no access -> try the next model
            if (status === 404 || apiError?.code === "model_not_found") continue;

            // For problems like rate limits or auth, retrying will not help
            break;
        }
    }

    const status = lastError?.response?.status;
    if (status === 401 || status === 403) {
        return res.status(500).json({ message: "AI service authentication failed. Please check the API key." });
    }
    if (status === 429) {
        return res.status(429).json({ message: "AI limit reached. Please try again in a few minutes." });
    }

    return res.status(500).json({
        message: "AI service is currently unavailable. Please try again later."
    });
};
