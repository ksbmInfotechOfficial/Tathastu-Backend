const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const mailer = require('../helpers/mailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const {deleteFile} = require('../helpers/deleteFile');
const randomString = require('randomstring');
const passwordResetModel = require('../models/passwordReset');
const configureMulter = require('../middlewares/configureMulter');
const users = require('../models/customers/users');



const uploadCustomerImage = configureMulter("uploads/customerImage/", [
    { name: "image", maxCount: 1 },
  ]);

const userRegister = async(req, res)=>{

    uploadCustomerImage(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res
            .status(500)
            .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Error uploading file", error: err });
        }
 
    try{

        const {name, email, mobile, password} = req.body;

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                message: 'msg',
                errors: errors.array()
            })
        }

        const isExist = await userModel.findOne({email});

        if(isExist){
            return res.status(400).json({
                success: false,
                message: 'user email exist already'
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = {
            name,
            email,
            mobile,
            password:hashPassword,
            image: '/images' + req.file.filename
        }


        const userData = await userModel.create(user)


        const message = '<p> Hii '+name+' please <a href="http://127.0.0.1:8000/mail-verification?id='+userData._id+'">verify </a> your email</p>'

        mailer.sendMail(email, 'Mail Verification', message)

        return res.status(200).json({
            success: true,
            message: 'user register successfully',
            user: userData
        })


    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

});
}




const userRegister1 = async (req, res) => {
    uploadCustomerImage(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ success: false, message: "Multer error", error: err });
      } else if (err) {
        return res.status(500).json({ success: false, message: "Error uploading file", error: err });
      }
  
      try {
        // Destructure user details from request body
        const { fullName, email, phone, password, age, gender, highestEducation, profession, annualIncome, location, profileType } = req.body;
  
        // Validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array(),
          });
        }
  
        // Check if email or phone already exists
        const isEmailExist = await UserProfile.findOne({ email });
        const isPhoneExist = await UserProfile.findOne({ phone });
  
        if (isEmailExist) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists',
          });
        }
  
        if (isPhoneExist) {
          return res.status(400).json({
            success: false,
            message: 'User with this phone number already exists',
          });
        }
  
        // Hash the password before saving it
        const hashPassword = await bcrypt.hash(password, 10);
  
        // Create the user object
        const user = new users({
          fullName,
          email,
          phone,
          password: hashPassword,
          age,
          gender,
          highestEducation,
          profession,
          annualIncome,
          location,
          profileType,
          image: req.file ? '/images/' + req.file.filename : null // Use the uploaded image path if available
        });
  
        // Save the user profile to the database
        const userData = await user.save();
  
        // Send the email verification link to the user
        const verificationLink = `http://127.0.0.1:8000/mail-verification?id=${userData._id}`;
        const message = `<p>Hi ${fullName}, please <a href="${verificationLink}">verify</a> your email.</p>`;
  
        // Assuming mailer is configured correctly
        mailer.sendMail(email, 'Email Verification', message);
  
        return res.status(200).json({
          success: true,
          message: 'User registered successfully, please check your email to verify your account.',
          user: userData,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });
  };



const generateAccessToken = async(user)=>{

    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'24h'})
    return token;

}




const userLogin = async(req, res)=>{
    try{

        const {email, password} = req.body;

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                message: 'errors',
                errors: errors.array()
            })
        }


        const userData = await userModel.findOne({email})

        if(!userData){
            return res.status(400).json({
                success: false,
                message: 'email or password incorrect'
            })
        }


        const passwordMatch = await bcrypt.compare(password, userData.password)

        if(!passwordMatch){
            return res.status(401).json({
                success: false,
                message: 'email and password incorrect'
            })
        }

        const accessToken = await generateAccessToken({user: userData});

        return res.status(200).json({
            success: true,
            message: 'login successfully',
            user: userData,
            accessToken: accessToken,
            tokenType: 'Bearer'
        })

    }

    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}



const userProfile = (req, res)=>{
    try{

        const userData = req.user.user;

        return res.status(200).json({
            success: true,
            message: 'user data getting successfully',
            data: userData
        })

    }

    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


const updateProfile  = async(req, res)=>{
    try{
        const {name, mobile} = req.body;
        const user_id = req.user.user._id;

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                message: 'errors',
                errors: errors.array()
            })
        }

        const data = {
            name,
            mobile
        }

        if(req.file !== undefined ){
            data.image = '/images/' + req.file.filename
            const oldUser = await userModel.findOne({_id: user_id})
            const oldFilePath = path.join(__dirname, '../public'+oldUser.image);
            deleteFile(oldFilePath)
        }

        const userData = await userModel.findByIdAndUpdate({_id:user_id},{$set:data},{new:true});
        return res.status(200).json({
            success: true,
            message:'user data updated successfully',
            data: userData
        })

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



const mailVerification = async(req, res)=>{
    try{

        if(req.query.id == undefined){
           return res.render('404')
        }

        const userData = await userModel.findOne({_id: req.query.id});

        if(userData.is_verified === 1){
            return res.render('mailVerification', {message: 'Your mail already verified!'})
        }

        if(userData){

            await userModel.findByIdAndUpdate({_id:req.query.id},{$set:{is_verified:1}})

            return res.render('mailVerification', {message: 'Mail has been verified successfully!'})

        }

        else{

            return res.render('mailVerification', {message: 'User not found!'})

        }


    }

    catch(error){
        console.log(error.message);
        return res.render('404')
    }
}








const forgotPassword = async(req, res)=>{

    try{

        const {email} = req.body;

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                message: 'errors',
                errors: errors.array()
            })
        }

        const userData = await userModel.findOne({email});

        if(!userData){
            return res.status(400).json({
                success: false,
                message: 'Email does not exists!'
            })
        }


        const random_string = randomString.generate();
        const msg = '<p>Hii '+userData.name+', please <a href="http://127.0.0.1:8000/reset_password?token='+random_string+'">click</a> to change user password</p>';

        await passwordResetModel.deleteMany({user_id: userData._id})

        const passwordReset = new passwordResetModel({
            user_id: userData._id,
            token: random_string
        })
 
        await passwordReset.save();
        mailer.sendMail(userData.email, 'Reset Password', msg);

        return res.status(201).json({
            success: true, 
            message: 'Reset password link send to your email please check'
        })


        

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}




const resetPassword = async(req, res)=>{
    try{

        if(req.query.token == undefined){

            res.render('404')

        }

        const resetData = await passwordResetModel.findOne({token: req.query.token})

        if(!resetData){
            res.render('404')
        }

        res.render('resetPassword', {resetData})


    }

    catch(error){
        res.status(500).json({
            success: false, 
            message: error.message
        })
    }
}


const updatePassword = async(req, res)=>{
    try{

        const{user_id, password, c_password} = req.body;

        const resetData = await passwordResetModel.findOne({user_id});

        if(password != c_password){
            res.render('resetPassword', {resetData, error:'Confirm password does not match'})
        }

        const hash_password = await bcrypt.hash(c_password, 10);
        
        await userModel.findByIdAndUpdate({_id:user_id},{
            $set:{
                password: hash_password
            }
        })

        await passwordResetModel.deleteOne({user_id})

        return res.redirect('/reset-success')


    }

    catch(error){
       return res.render('404')
    }
}


const resetSuccess = (req, res)=>{
    try{
        return res.render('reset-success')
    }

    catch(error){
        return res.render('404')
    }
}



module.exports = {userRegister,mailVerification, userLogin, userProfile, updateProfile, forgotPassword, resetPassword, updatePassword, resetSuccess, userRegister1}