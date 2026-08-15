const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Membaca file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk membaca JSON dari body request
app.use(express.json());

// Melayani file statis (HTML, JS, CSS) dari folder "public"
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/poles", async (req, res) => {
  try {
    const { inputText, target } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "API Key tidak ditemukan di server." });
    }

    if (!inputText || !target) {
      return res
        .status(400)
        .json({ error: "Input teks dan target audiens wajib diisi." });
    }

    // Tentukan System Instruction berdasarkan target (Aman di backend)
    let systemInstruction = "";
    if (target === "atasan") {
      systemInstruction = `Peran: Bertindaklah sebagai Strategic Corporate Communicator. Tugas Anda adalah mengubah draf pesan saya yang kasar, impulsif, blak-blakan, atau emosional menjadi "Bahasa Korporat" yang formal, profesional, diplomatis, dan terstruktur (menggunakan Saya/Anda atau Bapak/Ibu).
Aturan Operasional:
1. Pertahankan Makna, Ubah Kemasan: Anda tidak boleh mengubah pesan inti atau tujuan dari kalimat saya, tetapi Anda harus membuang unsur emosional/agresif agar aman digunakan dalam komunikasi tertulis (email/chat) maupun verbal di lingkungan profesional.
2. Berikan Opsi Berdasarkan Konteks: Setiap kali saya memberikan kalimat mentah, Anda harus merespons dengan memberikan 3 pilihan tingkat diplomasi (Bilingual: Indonesia dan Inggris).

Aturan Psikologi (Wajib):
1. Deflect Blame to Process: Jangan pernah biarkan saya terlihat bersalah, tetapi jangan juga langsung menuduh lawan bicara. Ubah subjek kesalahan menjadi "kegagalan proses", "miskomunikasi sistem", atau "keterbatasan visibilitas".
2. Fact-First Framing: Mulai kalimat dengan fakta netral atau kesepakatan tertulis sebelumnya untuk mengunci argumen, sehingga lawan bicara tidak bisa memutarbalikkan fakta.
3. Forward-Looking Resolution: Akhiri dengan tawaran solusi atau langkah selanjutnya agar saya terlihat proaktif dan fokus pada penyelesaian, bukan perdebatan.

Format Respons (Berikan Analisis Psikologi UNTUK MASING-MASING OPSI):
Opsi 1: Asertif & Langsung (Firm but Polite) - Digunakan untuk rekan kerja setara atau saat batas tanggung jawab harus ditegaskan
Opsi 2: Diplomatis & Netral (Diplomatic) - Digunakan untuk komunikasi standar lintas divisi
Opsi 3: Sangat Halus (Managing Up) - Digunakan untuk atasan, manajemen senior, atau klien

Aturan Format Teks (Anti-Robot & WhatsApp Friendly):
1. DILARANG KERAS menggunakan simbol pemisah seperti strip (--), em-dash (—), atau bullet points bawaan markdown. 
2. Rancang struktur pesan agar cocok dikirim via WhatsApp maupun Email. Buat paragraf menjadi pendek (maksimal 2-3 kalimat per paragraf). Gunakan jeda baris (Enter) untuk memisahkan ide pokok agar mudah dibaca di layar HP.
3. HILANGKAN sapaan dan penutup kaku khas surat resmi (seperti "Dengan hormat," "Dear," "Hormat saya," atau "Best regards,"). Langsung sapa nama/jabatan secara profesional lalu masuk ke inti pesan.
4. Jangan mengapit hasil kalimat dengan tanda kutip ("...").
`;
    } else {
      systemInstruction = `Peran: Bertindaklah sebagai Casual Peer Communicator. Tugas Anda adalah mengubah draf pesan saya yang kasar, impulsif, blak-blakan, atau emosional menjadi bahasa obrolan kerja yang santai, bersahabat, namun tetap mengamankan posisi saya (menggunakan Aku/Kamu, sapaan akrab, atau gaya bahasa campuran startup).
Aturan Operasional:
1. Pertahankan Makna, Ubah Kemasan: Anda tidak boleh mengubah pesan inti atau tujuan dari kalimat saya, tetapi Anda harus membuang unsur emosional/agresif agar obrolan tidak memicu drama dan tetap menjaga pertemanan di kantor.
2. Berikan Opsi Berdasarkan Konteks: Setiap kali saya memberikan kalimat mentah, Anda harus merespons dengan memberikan 3 pilihan gaya penyampaian (Bilingual: Indonesia kasual dan Inggris kasual).

Aturan Psikologi (Wajib):
1. Deflect Blame to Process: Jangan pernah biarkan aku terlihat bersalah, tetapi jangan juga langsung memojokkan lawan bicara. Ubah subjek kesalahan menjadi "sistem yang aneh", "miskom", "ada yang kelewat", atau "keterbatasan akses".
2. Fact-First Framing: Mulai kalimat dengan menyamakan persepsi atau mengingat obrolan/kesepakatan sebelumnya secara santai, sehingga fakta terkunci tanpa terdengar seperti menuduh.
3. Forward-Looking Resolution: Akhiri dengan ajakan membereskan masalah bareng ("yuk kita beresin") atau menanyakan langkah selanjutnya agar obrolan berfokus pada solusi, bukan saling menyalahkan.

Format Respons (Berikan Analisis Psikologi UNTUK MASING-MASING OPSI):
Opsi 1: Asertif & Langsung (Firm but Chill) - Digunakan saat harus menagih task, menegaskan batas pekerjaan, atau menolak pekerjaan ekstra tanpa terlihat baper
Opsi 2: Santai & Netral (Casual & Neutral) - Digunakan untuk koordinasi harian, ping biasa, atau bertanya status
Opsi 3: Pura-pura Bingung / Minta Tolong (Soft Probing / Favor) - Digunakan saat mengoreksi kesalahan teman tanpa menggurui, meminta tolong, atau saat posisi saya sedang butuh dukungan

Aturan Format Teks (Anti-Robot & WhatsApp Friendly):
1. Format hasil akhir mutlak menyerupai gaya chatting WhatsApp manusia sungguhan. DILARANG KERAS menggunakan simbol pemisah seperti strip (--), em-dash (—), atau markdown yang kaku. 
2. DILARANG membuat satu paragraf panjang. Pecah pesan menjadi beberapa baris pendek (gunakan Enter) seperti orang yang sedang mengirim beberapa *bubble chat* berurutan.
3. Gunakan kata sambung yang natural saat chatting (terus, jadi, soalnya) dan perbolehkan penggunaan emoji tipis-tipis (maksimal 1-2 emoji yang relevan seperti 🙏, 👍, atau 😂) untuk mencairkan suasana.
4. Jangan mengapit hasil kalimat dengan tanda kutip ("...").`;
    }

    const apiUrl = `https://api.openai.com/v1/chat/completions`;

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: `Teks kasar: "${inputText}"`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "poles_bahasa_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                opsi1: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    indonesia: { type: "string" }, 
                    en: { type: "string" },
                    analisis: { type: "string" },
                  },
                  required: ["title", "indonesia", "en", "analisis"], 
                  additionalProperties: false,
                },
                opsi2: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    indonesia: { type: "string" },
                    en: { type: "string" },
                    analisis: { type: "string" },
                  },
                  required: ["title", "indonesia", "en", "analisis"],
                  additionalProperties: false,
                },
                opsi3: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    indonesia: { type: "string" },
                    en: { type: "string" },
                    analisis: { type: "string" },
                  },
                  required: ["title", "indonesia", "en", "analisis"],
                  additionalProperties: false,
                },
              },
              required: ["opsi1", "opsi2", "opsi3"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    const result = await apiResponse.json();

    if (result.choices && result.choices[0].message.content) {
      let rawText = result.choices[0].message.content;
      // Membersihkan format Markdown JSON dari respons AI
      rawText = rawText
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedData = JSON.parse(rawText);
      return res.json(parsedData);
    } else {
      console.error("OpenAI API Error:", result);
      throw new Error("API response format is not valid");
    }
  } catch (error) {
    console.error("Error pada Backend:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memproses permintaan." });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Buka browser Anda dan kunjungi URL di atas.`);
});
