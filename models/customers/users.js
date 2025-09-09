const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema
const userProfileSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  age: {
    type: Number,
    required: true,
    min: 18, // you can change this based on your needs
    max: 100
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  highestEducation: {
    type: String,
    required: true,
    enum: ['High School', 'Associate Degree', 'Bachelor’s Degree', 'Master’s Degree', 'PhD']
  },
  profession: {
    type: String,
    required: true
  },
  annualIncome: {
    type: Number,
    required: true,
    min: 0
  },
  // Embedding location as an object with state, city, country, and address
  location: {
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  profileType: {
    type: String,
    enum: ['For myself', 'For relative'],
    required: true
  },
  currently_active_package:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseHistory'
  },
  image: {
    type: String,
    default: null
  }
});

// Create the model
const UserProfile = mongoose.model('Users', userProfileSchema);

module.exports = UserProfile;


userProfileSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userProfileSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};