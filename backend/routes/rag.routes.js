const express = require("express");
const router = express.Router();
const { uploadText, queryText } = require("../controllers/rag.controller");

router.post("/rag/upload", uploadText);
router.post("/rag/query", queryText);

module.exports = router;
