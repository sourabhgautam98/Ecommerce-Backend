const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 
const { uploadDocument } = require('../controllers/uploadController');

router.post('/uploadFile', upload.single('file'), uploadDocument);

module.exports = router;