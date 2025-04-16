const express = require('express');
const router = express.Router();
const { chatWithIvan } = require('../controllers/chatController');

router.post('/chat', chatWithIvan);

module.exports = router;
