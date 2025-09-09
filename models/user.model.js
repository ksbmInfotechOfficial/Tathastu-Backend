const { selectFields } = require('express-validator/lib/field-selection');
const {Schema, model} = require('mongoose');


const userSchema = new Schema({

    name:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true
    },

    mobile:{
        type: Number,
        required: true
    },


    password: {
        type: String,
        required: true
    },


    is_verified:{
        type: Number,
        default: 0, // 1 for verified
        required: true
    },

    image:{
        type: String,
        required: true
    }

})


const userModel = model('users', userSchema);


module.exports = userModel;