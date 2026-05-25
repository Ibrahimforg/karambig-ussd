const express = require('express');
const router  = express.Router();
const { handleSMS } = require('../controllers/smsController');
router.post('/', handleSMS);
module.exports = router;
