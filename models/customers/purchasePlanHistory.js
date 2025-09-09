const mongoose = require('mongoose');

const variantDetailsSchema = new mongoose.Schema({
  numberOfCalls: String,
  callDuration: String,
  applicabilityOfDuration: String,
  description: String,
}, { _id: false });

const purchaseHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customers'
  },
 purchaseFor: {
  isFamilyMember: { type: Boolean, default: false },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
  name: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  relation: { type: String } // e.g., "Mother", "Spouse"
},
  packageName: {
    type: String,
    required: true,
  },
  schedulingType: {
    type: String,
    required: true,
  },
  sessionLength: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  
  variantDetails: variantDetailsSchema,
  status: {
    type: String,
    enum: ['active', 'expired', 'completed', 'cancelled'],
    default: 'active',
  },
  remainingSessions: {
    type: Number,
    default: 0,
  },
  expiryDate:{
    type: String
  }
},{collection: 'PurchaseHistory'});

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);
