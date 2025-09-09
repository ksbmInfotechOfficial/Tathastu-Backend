
const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    // 1. Session Type
    sessionType: {
      type: String,
      enum: ["telephonic", "face-to-face"],
      required: true,
    },

    sessionName:{
        type: String,
    },

    // 2. Add-ons selected by the user
    selectedAddOns: {
      type: [String], // e.g. ["birth-time-correction", "video-call"]
      default: [],
    },

    // 3. Urgency of the session
    urgency: {
      type: String,
    //   enum: ["normal", "urgent"],
      default: "normal",
    },

    // 4. Date selected by user
    selectedDate: {
      type: Date,
      required: true,
    },

    // 5. User contact details
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // 6. Reference to registered user (if logged in)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      required: false,
    },

    bookedFor: {
      isFamilyMember: { type: Boolean, default: false },
      name: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      relation: { type: String }, // e.g., "Mother", "Spouse"
    },

    bookingType:{
      type: String,
      enum: ["Booking with package", "one-time-booking", "follow-up-sesson"], 
    },

    bookingPackageId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseHistory'
    },

    // 7. Optional notes by user
    notes: {
      type: String,
    },

    // 8. Booking status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },

    // 9. Payment details (embedded)
    payment: {
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      amount: {
        type: Number, // total price including add-ons
      },
      provider: {
        type: String, // e.g. "razorpay"
      },
      transactionId: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
    },

scheduledSession: {
  date: {
    type: Date,
  },
  startTime: {
    type: String, // Format: "HH:mm"
  },
  endTime: {
    type: String, // Format: "HH:mm"
  },
},
    // 10. Auto timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "FollowUpBookings" }
)

module.exports = mongoose.model('FollowUpBookings', bookingSchema);