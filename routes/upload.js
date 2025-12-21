const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const router = express.Router();

/************************************************
 * MULTER EN MEMORIA
 ************************************************/
const storage = multer.memoryStorage();
const upload = multer({ storage });

/************************************************
 * RUTA DE PRUEBA
 ************************************************/
router.get("/ping", (req, res) => {
  res.json({ message: "Upload route funcionando 🚀" });
});

/************************************************
 * SUBIR IMAGEN A CLOUDINARY (SIN FIREBASE)
 ************************************************/
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    formData.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET
    );

    const cloudUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await axios.post(cloudUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return res.json({
      secure_url: response.data.secure_url,
    });

  } catch (error) {
    console.error(
      "🔥 Error subiendo imagen a Cloudinary:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error subiendo imagen" });
  }
});

module.exports = router;
