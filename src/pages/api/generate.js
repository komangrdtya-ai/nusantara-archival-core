// src/pages/api/generate.ts
export const prerender = false; // WAJIB untuk API di Astro v7

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const apiKey = import.meta.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API Key tidak ditemukan" }), { status: 500 });
        }

        const promptText = body.contents?.[0]?.parts?.[0]?.text;
        const imageData = body.contents?.[0]?.parts?.[1]?.inline_data;

        const messageContent = [{ type: "text", text: promptText || "Analisis gambar ini" }];
        if (imageData) {
            messageContent.push({
                type: "image_url",
                image_url: { url: `data:${imageData.mime_type};base64,${imageData.data}` }
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                max_tokens: 1500,
                messages: [{ role: "user", content: messageContent }]
            }),
        });

        const data = await response.json();

        // Tambahkan logika pengecekan saldo
        if (!response.ok) {
            // Cek apakah error karena kredit habis
            const errorMsg = data.error?.message?.toLowerCase() || "";
            if (errorMsg.includes("insufficient") || errorMsg.includes("balance")) {
                console.error("ALERT: KREDIT OPENROUTER HABIS!");
                // Kamu bisa kirim notifikasi ke frontend agar user tahu
                return new Response(JSON.stringify({ error: "KREDIT_HABIS" }), { status: 402 });
            }
            throw new Error(data.error?.message || "Gagal");
        }

        return new Response(JSON.stringify({
            candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }]
        }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};