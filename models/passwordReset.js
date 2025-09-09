const mongoose  = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    user_id:{
        type: String,
        required: true,
        ref: 'userModel',

    },

    token:{
        type: String,
        required: true
    }
})


module.exports = mongoose.model('password_reset', passwordResetSchema);