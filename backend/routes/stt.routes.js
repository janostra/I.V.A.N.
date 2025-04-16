const express = require("express");
const router = express.Router();
const multer = require("multer");
const { transcribeAudio } = require("../controllers/stt.controller");

const upload = multer({ dest: "uploads/" });

router.post("/stt/transcribe", upload.single("audio"), transcribeAudio);

module.exports = router;
