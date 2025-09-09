const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customers",
  },
  provider: String, // e.g. "razorpay"
  transactionId: String,
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
  },
  amount: Number,
  paidAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {collection:'PaymentHistory'})


module.exports = mongoose.model('PaymentHistory', paymentSchema);