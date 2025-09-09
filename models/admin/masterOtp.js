const mongoose = require('mongoose');

const masterOTPSchema = new mongoose.Schema(
  {
    masterOtp: {
      type: String,
      required: [true, 'OTP is required'],
      minlength: [4, 'OTP must be at least 4 characters'],
      maxlength: [10, 'OTP cannot exceed 10 characters'],
      trim: true,
    },
  },
  {
    collection: 'MasterOtp',
    timestamps: true,
    versionKey: false,
  }
);

// Optional: Add TTL index if OTPs should expire (e.g., 5 minutes)
// masterOTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const MasterOtp = mongoose.model('MasterOtp', masterOTPSchema);

module.exports = MasterOtp;
