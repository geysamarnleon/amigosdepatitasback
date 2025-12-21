/************************************************
 * CARGA DE VARIABLES DE ENTORNO
 ************************************************/
require("dotenv").config();

/************************************************
 * VARIABLES DE ENTORNO (UNA SOLA VEZ)
 ************************************************/
const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const PORT = process.env.PORT || 3000;

console.log(
  "✅ CLOUDINARY_CLOUD_NAME cargado:",
  CLOUDINARY_CLOUD_NAME ? "OK" : "NO DEFINIDO"
);

/************************************************
 * IMPORTACIONES
 ************************************************/
const express = require("express");
const axios = require("axios");
const uploadRoute = require("./routes/upload");

/************************************************
 * CONFIGURACIÓN DE EXPRESS
 ************************************************/
const app = express();
app.use(express.json());

/************************************************
 * RUTA: ENVIAR NOTIFICACIÓN (OneSignal + Deep Link)
 ************************************************/
app.post("/send-notification", async (req, res) => {
  const {
    playerId,
    title,
    message,
    chatId,
    receiverId,
    receiverName,
    receiverPlayerId,
  } = req.body;

  if (!playerId || !title || !message) {
    return res.status(400).json({ error: "Faltan parámetros obligatorios" });
  }

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: ONE_SIGNAL_APP_ID,
        include_player_ids: [playerId],
        headings: { en: title },
        contents: { en: message },
        data: {
          chatId,
          receiverId,
          receiverName,
          receiverPlayerId,
          deep_link: `myapp://chat/${chatId}/${receiverId}/${encodeURIComponent(
            receiverName
          )}/${receiverPlayerId}`,
        },
      },
      {
        headers: {
          Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      oneSignalResponse: response.data,
    });
  } catch (error) {
    console.error(
      "❌ Error enviando notificación:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error enviando notificación" });
  }
});

/************************************************
 * RUTA: SUBIDA DE IMÁGENES (Cloudinary)
 ************************************************/
app.use("/upload-image", uploadRoute);
console.log("✅ Ruta /upload-image cargada correctamente");

/************************************************
 * RUTA RAÍZ
 ************************************************/
app.get("/", (req, res) => {
  res.send("🐾 Amigos de Patitas Backend funcionando");
});

/************************************************
 * INICIAR SERVIDOR
 ************************************************/
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
