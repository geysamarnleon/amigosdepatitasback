const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");
const multer = require("multer");
const FormData = require("form-data");
const path = require("path");

const router = express.Router();

// 🔐 Firebase Admin
const serviceAccount = require(path.join(__dirname, "../config/serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 🔒 Middleware verificar token Firebase
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verificando token:", error);
    return res.status(401).json({ error: "Token inválido" });
  }
}

// 📦 Multer memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Verificación
router.get("/ping", (req, res) => {
  res.json({ message: "Upload route funcionando 🚀" });
});

// 📌 SUBIR IMAGEN
router.post("/", verifyFirebaseToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

    const cloudUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await axios.post(cloudUrl, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    return res.json({ secure_url: response.data.secure_url });

  } catch (error) {
    console.error("🔥 Error subiendo imagen a Cloudinary:", error.response?.data || error);
    res.status(500).json({ error: "Error subiendo imagen" });
  }
});

module.exports = router;
