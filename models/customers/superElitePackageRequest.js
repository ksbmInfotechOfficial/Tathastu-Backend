const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers'
  }, 
  type: { type: String, required: true },
  numberOfCalls: { type: String, required: true },
  callDuration: { type: String, required: true },
  applicabilityOfDuration: { type: String, required: true },
  description: { type: String, required: true },
  actualPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
//   expiryDate: { type: Date, required: true },
});

const superElitePackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variants: [variantSchema],
  remainingSession: { type: Number, default: 0 },
  consumedSessions: [{  
    sessionDate: { type: Date, required: true }
  }],
  purchaseFor: {
    isFamilyMember: { type: Boolean, default: false },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    relation: { type: String } // e.g., "Mother", "Spouse"
  },
  status: { 
    type: String, 
    enum: ['contacted', 'not-contacted', 'purchased', 'payment-link-sended'], 
    default: 'not-contacted' 
  }
},{timestamps: true,collectionName: 'SuperElitePackageRequest'});

module.exports = mongoose.model('SuperElitePackageRequest', superElitePackageSchema);
