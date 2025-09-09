const express  = require('express');
const route = express.Router();
const bodyParser = require('body-parser');

route.use(bodyParser.json());
route.use(bodyParser.urlencoded({extended:true}));
const userController = require('../controllers/user.controller');

route.get('/mail-verification', userController.mailVerification);
route.get('/reset_password', userController.resetPassword);
route.post('/reset_password', userController.updatePassword);
route.get('/reset-success', userController.resetSuccess);


module.exports = route;