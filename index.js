require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Ruta para enviar notificación
app.post("/send-notification", async (req, res) => {
  const { playerId, title, message, chatId } = req.body;

  if (!playerId || !title || !message) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [playerId],
        headings: { en: title },
        contents: { en: message },
        data: { chatId } // 🔹 Incluimos el chatId para navegación
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error("Error enviando notificación:", error.response?.data || error.message);
    res.status(500).json({ error: "Error enviando notificación" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Hello Render!'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
