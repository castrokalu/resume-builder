import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
    origin: "*"
}));

app.use(express.json());

/* =========================
   ROUTE
========================= */

app.post("/api/generate-summary", async (req, res) => {
    try {

        const { personal, experience, education, skills } = req.body;

        const prompt = `
Generate a professional ATS resume summary (max 80 words):

Name: ${personal?.firstName || ""} ${personal?.lastName || ""}

Experience: ${JSON.stringify(experience)}

Education: ${JSON.stringify(education)}

Skills: ${JSON.stringify(skills)}
`;

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional resume writer."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            }
        );

        const data = await response.json();

        /* =========================
           ERROR HANDLING FIX
        ========================= */

        if (!response.ok) {
            return res.status(500).json({
                success: false,
                message: "OpenAI request failed",
                error: data
            });
        }

        const summary = data?.choices?.[0]?.message?.content;

        if (!summary) {
            return res.status(500).json({
                success: false,
                message: "No summary generated",
                raw: data
            });
        }

        return res.json({
            success: true,
            summary
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`AI service running on port ${PORT}`);
});