import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/generate-summary", async (req, res) => {
    try {
        const { personal, experience, education, skills } = req.body;

        const prompt = `
Generate a professional ATS resume summary (max 80 words):

Name: ${personal?.firstName || ""} ${personal?.lastName || ""}

Experience: ${JSON.stringify(experience)}

Education: ${JSON.stringify(education)}

Skills: ${JSON.stringify(skills)}
`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        const summary = data?.choices?.[0]?.message?.content || "";

        res.json({
            success: true,
            summary
        });

    } catch (err) {
        res.json({
            success: false,
            message: err.message
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("AI service running");
});