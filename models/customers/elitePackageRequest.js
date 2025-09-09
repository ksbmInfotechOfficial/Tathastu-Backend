const mongoose = require('mongoose');

const elitePackageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customers' },
  packageType: { type: String, enum: ['Elite', 'Super Elite'], required: true },
  preferences: { type: [String], required: true },
  preferredTime: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
},{collection: 'ElitePackageRequest'});

const ElitePackageRequest = mongoose.model('ElitePackageRequest', elitePackageSchema);

module.exports = ElitePackageRequest;