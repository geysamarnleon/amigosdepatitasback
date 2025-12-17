require("dotenv").config();
console.log("CLOUDINARY_CLOUD_NAME desde index:", process.env.CLOUDINARY_CLOUD_NAME);
const express = require("express");
const axios = require("axios");
const uploadRoute = require("./routes/upload"); // 👈 Ruta de subida de imágenes

const app = express();
app.use(express.json());

/**
 * ✅ Ruta para enviar notificaciones con deep link
 */
app.post("/send-notification", async (req, res) => {
  const { playerId, title, message, chatId, receiverId, receiverName, receiverPlayerId } = req.body;

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
        data: { 
          chatId,
          receiverId,
          receiverName,
          receiverPlayerId,
          deep_link: `myapp://chat/${chatId}/${receiverId}/${encodeURIComponent(receiverName)}/${receiverPlayerId}`
        }
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error(
      "Error enviando notificación:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error enviando notificación" });
  }
});

/**
 * ✅ Ruta para subida de imágenes
 */
app.use("/upload-image", uploadRoute);
console.log("✅ Ruta /upload-image cargada correctamente");

// Ruta raíz
app.get("/", (req, res) => res.send("Hello Render!"));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
