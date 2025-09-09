const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  type: String,
  actualPrice: Number,
  discountedPrice: Number,
  numberOfCalls: String,
  callDuration: String,
  applicabilityOfDuration: String,
  description: String,
  notes: [String]
});



const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  frequency: String,
  isCustomPrice: Boolean,
  variants: [VariantSchema]
}, {collection: 'SubscriptionPlan'});


const Plan = mongoose.model('SubscriptionPlan', PackageSchema);
module.exports = Plan;
