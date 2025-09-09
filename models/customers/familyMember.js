const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers', // assuming your main user model is 'Customer'
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other',
  },

  relation: {
    type: String,
    required: true,
    enum: ['Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Other', 'Brother', 'Sister', 'Son', 'Daughter'],
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
  collection: 'FamilyMember'
});

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
