const express = require('express');
const router = express.Router();
const { generateAudio } = require('../controllers/audioController');

router.post('/audio', generateAudio);

module.exports = router;
