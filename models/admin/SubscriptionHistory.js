const mongoose = require('mongoose');

const subscriptionHistorySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // References the Doctor model
    required: true,
  },
  planId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  planName:{
    type: String,
  },
  planType: {
    type: String,
    // enum: ['starter', 'clinic'],
    // required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    enum: ['monthly', 'half-yearly', 'yearly'],
    // required: true,
  },

  amount:{
    type: Number
  },
  paymentDetails: {
    paymentId: String,
    provider: String,
    amountPaid: {
      type: Number,
      // required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SubscriptionHistory', subscriptionHistorySchema);
