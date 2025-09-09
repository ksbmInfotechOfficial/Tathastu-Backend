const {check} = require('express-validator');

exports.registerUserValidation = [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'email is required').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('mobile', 'mobile number should be contain 10 digits').isLength({
        min:10,
        max:10
    }),

    check('password', 'password must be greater than 6 characters, and atleast contains one should be uppercase and one lowercase and one special character and one number').isStrongPassword({
        minLength:6,
        minNumbers:1,
        minUppercase:1,
        minLowercase:1
    }),

    check('image').custom((value,{req})=>{
        if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png'){

            return true

        }

        else{
            return false
        }
    }).withMessage('please upload an image jpeg and png')
]



exports.loginValidator = [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
]


exports.updateProfileValidator = [

    check('name', 'name is required').not().isEmpty(),
    check('mobile', 'Mobile no. should be contain 10 digits').isLength({
        min: 10,
        max: 10
    }),
 
]


exports.passwordResetValidator = [
    check('email', 'Please provide a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    })
]