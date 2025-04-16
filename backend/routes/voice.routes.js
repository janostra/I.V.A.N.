const express = require("express");
const multer = require("multer");
const { handleVoiceInput } = require("../controllers/voice.controller");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/voice", upload.single("audio"), handleVoiceInput);

module.exports = router;
