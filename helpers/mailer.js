const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure:false,
    requireTLS: true,
    auth:{
        user:process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    }

})


const sendMail = async(email, subject, content)=>{

    try{

        var mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: subject,
            html: content
        }

       transport.sendMail(mailOptions, (err, info)=>{
        if(err){
            console.log(err.message)
        }

        else{
            console.log('Mail Sent', info.messageId)
        }
       })

    }

    catch(error){
        console.log(error.message)
    }
}


module.exports = {sendMail}
