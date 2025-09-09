const express = require('express');
const route = express.Router();
const upload = require('../middlewares/upload');
const userController = require('../controllers/user.controller')
const{ registerUserValidation, loginValidator, updateProfileValidator, passwordResetValidator} = require('../helpers/validation');
const auth = require('../middlewares/auth');


// route
route.post('/user_register', upload.single('image'), registerUserValidation, userController.userRegister);
route.post('/user_login', loginValidator, userController.userLogin);
route.post('/register_user', userController.userRegister1)

// authenticated routes
route.get('/user_profile', auth, userController.userProfile);
route.post('/update_profile', auth, upload.single('image'), updateProfileValidator, userController.updateProfile);
route.post('/forgot_password', passwordResetValidator, userController.forgotPassword);


module.exports = route;