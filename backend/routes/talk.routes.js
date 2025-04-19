// routes/talk.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { talk } = require("../controllers/talk.controller");

const upload = multer({ dest: "uploads/" });

router.post("/talk", upload.single("audio"), talk);

module.exports = router;
