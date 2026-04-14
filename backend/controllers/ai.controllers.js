import axios from "axios";
import User from "../models/user.models.js";

/**
 * AI Post Enhancer Controller (Using Groq API)
 * User ka short prompt lega aur usse professional LinkedIn-style post mein convert karega
 */
export const enhancePost = async (req, res) => {
    const { token, prompt } = req.body;

    // Step 1: User verify karo — bina login ke AI use nahi kar sakte
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Step 2: Check karo ki user ne kuch likha hai ya nahi
    if (!prompt || prompt.trim() === "") {
        return res.status(400).json({ message: "Please provide a prompt" });
    }

    try {
        // Step 3: System Prompt — AI ko batao ki kya karna hai
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

The user's name is: ${user.name}

User's prompt: "${prompt}"

Generate the LinkedIn post now:`;

        // Step 4: Groq API ko call karo axios se
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile", // Fast and powerful model
                messages: [
                    {
                        role: "user",
                        content: systemPrompt
                    }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Step 5: Response se text nikalo
        const enhancedPost = response.data.choices[0].message.content;

        // Step 6: Enhanced post frontend ko bhejo
        return res.json({ 
            enhancedPost: enhancedPost,
            message: "Post enhanced successfully" 
        });

    } catch (error) {
        console.error("AI Enhancement Error:", error.response?.data || error.message);
        return res.status(500).json({ 
            message: "AI service is currently unavailable. Please try again later." 
        });
    }
};
