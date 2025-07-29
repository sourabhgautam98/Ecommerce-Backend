const express = require('express');
const router = express.Router();
const { registerUser, loginUser ,registerSuperAdmin, getUser} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-super-admin', registerSuperAdmin);
router.get('/getUser',auth, getUser);
module.exports = router;