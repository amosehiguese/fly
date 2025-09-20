const express = require('express');
const router = express.Router(); 
const LoginUser = require('../controllers/loginController/loginControllerUser')



router.post('/login', LoginUser.login);
router.post('/admin-login', LoginUser.adminLogin);
router.post('/driver-login', LoginUser.driversLogin);


module.exports = router;
