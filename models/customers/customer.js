const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: String,
  mobileNumber: { type: String, unique: true },
  email:{type: String, default: "example@gmail.com"},
  howDidYouHear:{type: String},
  profile: {type: String},
  age: Number,
  gender: String,
  address: String,
  otp: String,
  otpExpiresAt: Date,
  createdAt: { type: Date, default: Date.now },
},{collection:'Customers'});

module.exports = mongoose.model('Customers', customerSchema);

