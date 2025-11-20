const Customer = require('../models/customers/customer');
const Sms = require('../config/sms');
const Razorpay = require('razorpay');
const configureMulter = require('../middlewares/configureMulter');
const { deleteFile } = require('../helpers/deleteFile');
const jwt = require("jsonwebtoken");
const Booking = require('../models/customers/booking');
const FamilyMember = require('../models/customers/familyMember');
const PurchaseHistory = require("../models/customers/purchasePlanHistory");
const ElitePackageRequest = require("../models/customers/elitePackageRequest");
const SuperElitePackageRequest = require('../models/customers/superElitePackageRequest');
const {generateScheduleEmail, generateRescheduleEmail, generateBookingConfirmationEmail}  = require('../utils/generateScheduleEmail');
const mongoose = require('mongoose');
const MasterOtp = require('../models/admin/masterOtp')
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 1000 to 9999
}


exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if(!mobileNumber || mobileNumber == " "){
        return res.status(400).json({
            success: false,
            message: 'mobileNumber is required!'
        })
    }
    let otp = '1234'
    if(mobileNumber == '9560402739'  || mobileNumber == "6393234384" || mobileNumber == "9319727429"){
        otp = '1234'
    }
    else{
      otp = generateOtp();
    }
    
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 min

    let patient = await Customer.findOne({ mobileNumber });

    if (!patient) {
        if(mobileNumber != '9560402739'  || mobileNumber != "6393234384"){
           const sms = await Sms.smsOTp(mobileNumber, otp);
           console.log(sms, "user new ")
        }
        
        patient = new Customer({ mobileNumber });
    }

    if(mobileNumber != '9560402739'  || mobileNumber != "6393234384"){
           const sms = await Sms.smsOTp(mobileNumber, otp);
           console.log(sms, "user new ")
        }

    patient.otp = otp;
    patient.otpExpiresAt = expiresAt;
    await patient.save();

    console.log(`OTP for ${mobileNumber} is ${otp}`);

    res.json({success: true,  message: 'OTP sent successfully (valid for 3 minutes).' , otp});
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({success: false, message: 'Internal server error' });
  }
};



// exports.sendOtp = async (req, res) => {
//   try {
//     const { mobileNumber } = req.body;
//     if (!mobileNumber || mobileNumber == " ") {
//       return res.status(400).json({
//         success: false,
//         message: 'mobileNumber is required!'
//       });
//     }

//     let otp = '1234';

//     // Apply static OTP '1234' for specific numbers
//     // if (mobileNumber == '9560402739' || mobileNumber == "6393234384") {
//     //   otp = '1234';
//     // } else {
//     //   otp = generateOtp(); // If number is not static, generate random OTP
//     // }

//     const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 min expiration time

//     let patient = await Customer.findOne({ mobileNumber });

//     if (!patient) {
//       // If user doesn't exist, save the new customer
//       patient = new Customer({ mobileNumber });
//     }

//     // Send OTP via SMS (static OTP or generated OTP)
//     // if (mobileNumber == '9560402739' || mobileNumber == "6393234384") {
//     //   console.log(`Sending static OTP to ${mobileNumber}: ${otp}`);
//     // } else {
//     //   const sms = await Sms.smsOTp(mobileNumber, otp);
//     //   console.log(sms, "user new ");
//     // }

//     // Save OTP and expiration time in the database
//     patient.otp = otp;
//     patient.otpExpiresAt = expiresAt;
//     await patient.save();

//     console.log(`OTP for ${mobileNumber} is ${otp}`);

//     // Send response back to the user
//     res.json({
//       success: true,
//       message: 'OTP sent successfully (valid for 3 minutes).',
//       otp: otp
//     });
//   } catch (error) {
//     console.error('Send OTP error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };


// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobileNumber, otp } = req.body;
//     const customer = await Customer.findOne({ mobileNumber });
//     const master_otp = await MasterOtp.find({})
    
//     if (!customer || !customer.otp || !customer.otpExpiresAt) {
//       return res.status(400).json({ success: false, message: 'No OTP request found.' });
//     }

//     if (new Date() > Customer.otpExpiresAt) {
//       return res.status(400).json({success: false, message: 'OTP expired. Please request a new one.' });
//     }

//     if (customer.otp !== otp) {
//       return res.status(400).json({ success: false, message: 'Invalid OTP.' });
//     }

//     customer.otp = undefined;
//     customer.otpExpiresAt = undefined;
//     await customer.save();
//     // Step 4: Generate JWT token
//         const token = jwt.sign(
//           { id: customer._id, email: customer.email, phone: customer.mobileNumber },
//           process.env.JWT_SECRET || 'your_jwt_secret',
//           { expiresIn: '1d' }
//         );

//     res.json({
//       success: true,
//       message: 'OTP verified successfully.',
//       token,
//       isNew: !customer.fullName,
//       customer
//     });
//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     res.status(500).json({success: false, message: 'Internal server error' });
//   }
// };



exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    // Fetch customer and master OTP
    const customer = await Customer.findOne({ mobileNumber });
    const masterOtpRecord = await MasterOtp.findOne({});

    // If no customer or OTP request, return error
    if (!customer || !customer.otp || !customer.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No OTP request found.' });
    }

    // Check if OTP has expired
    if (new Date() > customer.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // If the provided OTP matches the customer OTP OR master OTP is provided
    if (customer.otp === otp || (masterOtpRecord && masterOtpRecord.masterOtp === otp)) {
      // Clear OTP fields after verification
      customer.otp = undefined;
      customer.otpExpiresAt = undefined;
      await customer.save();

      // Generate JWT token after successful verification
      const token = jwt.sign(
        { id: customer._id, email: customer.email, phone: customer.mobileNumber },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );

      // Return response with the generated token
      return res.json({
        success: true,
        message: masterOtpRecord && masterOtpRecord.masterOtp === otp ? 'Master OTP verified. Login successful.' : 'OTP verified successfully.',
        token,
        isNew: !customer.fullName,
        customer
      });
    } else {
      // Invalid OTP (normal or master OTP)
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};






exports.createRazorpayOrder = async function (req, res) {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(200).send({ status: false, message: "amount field is required", });
    }

    // var instance = new Razorpay({
    //   key_id: 'rzp_test_7FcETDDAqUcnFu', // Replace with your Razorpay Key
    //   key_secret: 'utSY0U8YmaNjuvEmJ7HBP1XA', // Replace with your Razorpay Secret Key
    // });

     var instance = new Razorpay({
      key_id: 'rzp_test_KdQkg4iGuqKFIH', // Replace with your Razorpay Key
      key_secret: 'bB0jbwrN2RaXVhmvVgAnfZaK', // Replace with your Razorpay Secret Key
    });


    // var instance = new Razorpay({
    //   key_id: 'rzp_live_fycM10IO0gAtF9', // Replace with your Razorpay Key
    //   key_secret: 'MjuXvZiu60d6BXwqgr2SDXNW', // Replace with your Razorpay Secret Key
    // });

    const response = await instance.orders.create({
      "amount": amount * 100,  // Amount in paise
      "currency": "INR",
    });

    console.log("resposne",response)

    if (response?.status == 'created') {
      return res.status(200).json({ success: true, data: response });
    }

    return res.status(200).json({ success: false, message: "Order not created", });
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};



exports.checkSlotPaymentStatus = async function (req, res) {
  try {
    const { paymentId, doctorId, amount, slotId, appointmentId, patientId } = req.body;

    // if (!paymentId || !doctorId || !slotId || !appointmentId || !patientId) {
    //   return res.status(400).json({ success: false, message: "Missing required fields" });
    // }

    const instance = new Razorpay({
      key_id: 'rzp_test_7FcETDDAqUcnFu',
      key_secret: 'utSY0U8YmaNjuvEmJ7HBP1XA',
    });

    // Fetch payment details from Razorpay
    const paymentDetails = await instance.payments.fetch(paymentId);
    console.log("paymentDetails", paymentDetails);

    const slotDetail = await DoctorSlot.findById(slotId);
    const appointmentDetail = await Appointment.findById(appointmentId);
    const patientDetail = await Patient.findById(patientId);

    if (!slotDetail || !appointmentDetail || !patientDetail) {
      return res.status(404).json({
        success: false,
        message: "Slot, appointment, or patient not found",
      });
    }

    // Ensure bookings is an array
    if (!Array.isArray(slotDetail.bookings)) {
      slotDetail.bookings = [];
    }

    if (paymentDetails?.status === 'captured') {
      // Check max booking
      if (slotDetail.bookings.length >= slotDetail.maxBookings) {
        return res.status(400).json({
          success: false,
          message: "This slot is fully booked.",
        });
      }

      // Prevent duplicate booking
      const alreadyBooked = slotDetail.bookings.some(
        (b) => b.patientId?.toString() === patientDetail._id.toString()
      );

      if (alreadyBooked) {
        return res.status(400).json({
          success: false,
          message: "You have already booked this slot.",
        });
      }

      // Save appointment history
      appointmentDetail.paymentStatus = 'completed';
      appointmentDetail.razorpayPaymentId = paymentId;
      appointmentDetail.doctorId = doctorId
      appointmentDetail.slotId = slotId
      appointmentDetail.bookingHistory.push({
        status: 'booked',
        date: new Date(),
        notes: `Payment received for amount ₹${amount} with Razorpay Payment ID: ${paymentId}`,
      });

      // Add booking to slot
      slotDetail.bookings.push({
        patientId: patientDetail._id, // include patientId
        patientName: patientDetail.fullName,
        patientPhone: patientDetail.mobileNumber,
      });

      await appointmentDetail.save();
      await slotDetail.save();

      return res.status(200).json({
        success: true,
        message: "Slot booking successful",
        data: paymentDetails,
      });

    } else if (paymentDetails?.status === 'failed') {
      return res.status(200).json({
        success: false,
        message: "Payment Failed",
        data: paymentDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Payment status unknown",
        data: paymentDetails,
      });
    }
  } catch (error) {
    console.error("Error in checkSlotPaymentStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};



exports.addCustomer = async (req, res) => {
  const upload = configureMulter("uploads/customerImage/", [
    { name: "image", maxCount: 1 },
  ]);

  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }

    try {
      const { fullName, mobileNumber, age, gender, address, email, howDidYouHear } = req.body;

      // Image handling
      let profileImagePath = "";
      if (req.files && req.files.image && req.files.image[0]) {
        profileImagePath = req.files.image[0].path
          .replace(/\\/g, '/')
          .replace('uploads/', '');
      }

      // Create new customer
      const newCustomer = new Customer({
        fullName,
        mobileNumber,
        age,
        gender,
        address,
        email,
        howDidYouHear,
        profileImage: profileImagePath,
      });

      await newCustomer.save();

      return res.status(201).json({
        success: true,
        message: "Customer created successfully.",
        data: newCustomer,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });
};





exports.updateProfile = async (req, res) => {
  const upload = configureMulter("uploads/customerImage/", [
    { name: "image", maxCount: 1 },
  ]);

  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }

    try {
      const { id } = req.params;
      const { fullName, mobileNumber, age, gender, address, email, howDidYouHear } = req.body;

      // Find existing profile using Mongoose
      const existingCustomer = await Customer.findById(id);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: "Profile not found.",
        });
      }

      // Prepare update fields
      if (fullName) existingCustomer.fullName = fullName;
      if (mobileNumber) existingCustomer.mobileNumber = mobileNumber;
      if (age) existingCustomer.age = age;
      if (gender) existingCustomer.gender = gender;
      if (address) existingCustomer.address = address;
      if (email) existingCustomer.email = email;
      if (howDidYouHear) existingCustomer.howDidYouHear = howDidYouHear;

      // Handle image update
      if (req.files && req.files.image && req.files.image[0]) {
        const newImagePath = req.files.image[0].path
          .replace(/\\/g, '/')
          .replace('uploads/', '');

        // Delete old image if it exists
        if (existingCustomer.profileImage) {
          const oldImagePath = `uploads/${existingCustomer.profileImage}`;
          await deleteFile(oldImagePath);
        }

        existingCustomer.profile = newImagePath;
      }

      // Save the updated customer
      await existingCustomer.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: existingCustomer,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });
};


exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    // Optional: delete profile image from server
    if (customer.profile) {
      const fs = require('fs');
      const imagePath = `uploads/${customer.profile}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Customer.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};


exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.user;

    // Find the customer by ID
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer details fetched successfully.',
      data: customer,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};



// exports.bookSession = async (req, res)=>{

//   try {
//     const {
//       sessionType,
//       selectedAddOns,
//       sessionName,
//       urgency,
//       selectedDate,
//       user,
//       userId,
//       notes,
//       payment,
//     } = req.body

//     if(!userId){
//       return res.status(400).json({
//         success: false,
//         message: 'userId is required!'
//       })
//     }

//     const booking = await Booking.create({
//       sessionType,
//       sessionName,
//       selectedAddOns,
//       urgency,
//       selectedDate,
//       user,
//       userId,
//       notes,
//       payment,
//     })

//     res.status(201).json({
//       success: true,
//       bookingId: booking._id,
//       message: "Booking saved successfully",
//     })
//   } catch (err) {
//     console.error("Booking error:", err)
//     res.status(500).json({ success: false, message: "Failed to save booking" })
//   }
// }



// exports.bookSession = async (req, res) => {
//   try {
//     const {
//       sessionType,
//       selectedAddOns,
//       sessionName,
//       urgency,
//       selectedDate,
//       user,
//       userId,
//       notes,
//       payment,
//       bookedFor,
//       bookingType,
//       bookingPackageId,
//     } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: 'userId is required!',
//       });
//     }

//     const booking = await Booking.create({
//       sessionType,
//       sessionName,
//       selectedAddOns,
//       urgency,
//       selectedDate,
//       user,
//       userId,
//       notes,
//       payment,
//       bookedFor: bookedFor || { isFamilyMember: false },
//       bookingType,
//     });

    

//     res.status(201).json({
//       success: true,
//       bookingId: booking._id,
//       message: 'Booking saved successfully',
//     });
//   } catch (err) {
//     console.error('Booking error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


 

exports.bookSession = async (req, res) => {
  try {
    const {
      sessionType,
      selectedAddOns,
      sessionName,
      urgency,
      selectedDate,
      user,
      userId,
      notes,
      payment,
      bookedFor,
      bookingType,
      bookingPackageId,
      sessionsToDeduct,
    } = req.body;

    console.log(req.body);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required!',
      });
    }

    if (bookingType === 'Booking with package') {
      if (!bookingPackageId) {
        return res.status(400).json({
          success: false,
          message: 'bookingPackageId is required for package bookings.',
        });
      }

      const purchaseHistory = await PurchaseHistory.findOne({
        _id: bookingPackageId,
        userId: userId,
      });

      if (!purchaseHistory) {
        return res.status(404).json({
          success: false,
          message: 'Package not found.',
        });
      }

      const today = new Date();
      const expiryDate = new Date(purchaseHistory.expiryDate);

      if (expiryDate < today) {
        return res.status(400).json({
          success: false,
          message: 'The selected package has expired.',
        });
      }

      if (purchaseHistory.remainingSessions <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No remaining sessions left in this package.',
        });
      }

      if (purchaseHistory.remainingSessions < sessionsToDeduct) {
        return res.status(400).json({
          success: false,
          message: `Only ${purchaseHistory.remainingSessions} session(s) remaining. Cannot deduct ${sessionsToDeduct}.`,
        });
      }

      purchaseHistory.remainingSessions -= sessionsToDeduct;
      await purchaseHistory.save();
    }

    // Booking create karo
    const booking = await Booking.create({
      sessionType,
      sessionName,
      selectedAddOns,
      urgency,
      selectedDate,
      user,
      userId,
      notes,
      payment,
      bookedFor: bookedFor || { isFamilyMember: false },
      bookingType,
      bookingPackageId: bookingPackageId || null,
    });

    // Email content generate karo
    if (user.email) { // email check kar lo
      const emailContent = generateBookingConfirmationEmail({
        name: user.name || 'User',
        sessionName,
        date: selectedDate,
        sessionType,
        time: urgency, // urgency ko time assume kar raha hoon, agar alag time hai toh usko bhejo
        bookedFor,
      });

      // Email bhejne ki koshish karo (await karo)
      try {
        await sendMail(user.email, 'Booking Confirmation - Tathastu', emailContent);
        console.log('Booking confirmation email sent to', user.email);
      } catch (emailErr) {
        console.error('Failed to send booking confirmation email:', emailErr.message);
        // Agar chahe toh user ko email failure ka bhi response bhej sakte hain, ya silently ignore kar sakte hain
      }
    }

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      message: 'Booking saved successfully',
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};





// exports.bookSessionOneTime = async (req, res) => {
//   try {
//     const { sessionType, sessionName, userId, bookingType } = req.body;

//     // Input validation
//     if (!userId || !sessionType || !sessionName || !bookingType) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: userId, sessionType, sessionName, bookingType',
//       });
//     }

//     // Create booking
//     const booking = await Booking.create({
//       sessionType,
//       sessionName,
//       userId,
//       bookingType,
//     });

//     // Respond with success
//     return res.status(201).json({
//       success: true,
//       bookingId: booking._id,
//       message: 'Booking saved successfully',
//     });

//   } catch (err) {
//     console.error('Booking error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: err.message,
//     });
//   }
// };


exports.bookSessionOneTime = async (req, res) => {
  try {
    const {
      sessionType,
      sessionName,
      userId,
      bookingType,
      bookedFor, 
    } = req.body;

    // Input validation
    if (!userId || !sessionType || !sessionName || !bookingType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, sessionType, sessionName, bookingType',
      });
    }

    // Create booking
    const booking = await Booking.create({
      sessionType,
      sessionName,
      userId,
      bookingType,
      bookedFor: bookedFor?.isFamilyMember ? {
        isFamilyMember: true,
        name: bookedFor.name,
        age: bookedFor.age,
        gender: bookedFor.gender,
        relation: bookedFor.relation,
      } : undefined,
    });

    return res.status(201).json({
      success: true,
      bookingId: booking._id,
      message: 'Booking saved successfully',
    });

  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};




exports.bookSessionaWithMyPackage = async (req, res) => {
  try {
    const {
      sessionType,
      selectedAddOns,
      sessionName,
      urgency,
      selectedDate,
      user,
      userId,
      notes,
      payment,
      bookedFor,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required!',
      });
    }

    const booking = await Booking.create({
      sessionType,
      sessionName,
      selectedAddOns,
      urgency,
      selectedDate,
      user,
      userId,
      notes,
      payment,
      bookedFor: bookedFor || { isFamilyMember: false }, // Default to false if not sent
    });

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      message: 'Booking saved successfully',
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// POST: Add a new family member
exports.addFamilyMember = async (req, res) => {
  try {
    const { customerId, name, age, gender, relation } = req.body;

    if (!customerId || !name || !age || !relation) {
      return res.status(400).json({
        message: 'customerId, name, age, and relation are required.'
      });
    }

    const newMember = new FamilyMember({
      customerId,
      name,
      age,
      gender,
      relation,
    });

    const savedMember = await newMember.save();

    return res.status(201).json({
      success: true,
      message: '✅ Family member added successfully.',
      member: savedMember
    });

  } catch (error) {
    console.error('Error adding family member:', error);
    return res.status(500).json({ success: false, message: 'Internal Server error', error: error.message });
  }
};



exports.getFamilyMembers = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required in URL.' });
    }

    const members = await FamilyMember.find({ customerId });

    return res.status(200).json({
      success: true,
      message: '✅ Family members fetched successfully.',
      members
    });

  } catch (error) {
    console.error('Error fetching family members:', error);
    return res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};



exports.addPurchase = (req, res) => {
  const {
    userId,
    packageName,
    schedulingType,
    sessionLength,
    price,
    remainingSessions,
    expiryDate,
    variantDetails,
    purchaseDate,
    purchaseFor
  } = req.body;

  console.log(req.body, 'test ');

  const newPurchase = new PurchaseHistory({
    userId,
    packageName,
    schedulingType,
    sessionLength,
    price,
    remainingSessions,
    expiryDate,
    variantDetails,
    purchaseDate,
    purchaseFor
  });

  newPurchase
    .save()
    .then((result) => {
      res.status(201).json({
        success: true,
        message: "Purchase recorded successfully",
        result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Error saving purchase",
        error: err.message || err,
      });
    });
};


// exports.getPurchasePlanHistory = async (req, res)=>{
//   try{

//   const {userId} = req.body;
//   if(!userId || userId == " "){
//     return res.status(400).json({
//       success: false,
//       message: 'userId is required!'
//     })
//   }

//   const history = await PurchaseHistory.find({userId},{})

//   return res.status(200).json({
//     success: false,
//     message: 'Getting data successfully',
//     results: history
//   })

//   }

//   catch(error){
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     })
//   }
// }





exports.getPurchasePlanHistory = async (req, res) => {
  try {
    const { userId, memberId } = req.body;

    // Validate userId
    if (!userId || userId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: 'userId is required!',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    let query = {};

    // If memberId is provided, include it in the query
    if (memberId && memberId.trim() !== "") {
      const memberObjectId = new mongoose.Types.ObjectId(memberId);
      query = {
        userId: userObjectId,
        "purchaseFor.memberId": memberObjectId,
        remainingSessions: { $gt: 0 } // Ensure remainingSessions is greater than 0
      };
    } else {
      // Fetch plans that are not for family members and have remaining sessions
      query = {
        userId: userObjectId,
        "purchaseFor.isFamilyMember": false,
        remainingSessions: { $gt: 0 } // Ensure remainingSessions is greater than 0
      };
    }

    // Fetch purchase history sorted by remainingSessions (active plans first) and then by purchaseDate (latest first)
    // const history = await PurchaseHistory.find(query)
    //   .sort({ remainingSessions: -1, purchaseDate: -1 });  // Remaining sessions descending, latest purchase first

    const history = await PurchaseHistory.find(query)
    return res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      results: history
    });

  } catch (error) {
    console.error("Error in getPurchasePlanHistory:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




// exports.getPurchasePlanHistory = async (req, res) => {
//   try {
//     const { userId, memberId } = req.body;

//     if (!userId || userId.trim() === "") {
//       return res.status(400).json({
//         success: false,
//         message: 'userId is required!',
//       });
//     }

//     const userObjectId = new mongoose.Types.ObjectId(userId);
//     let query = {};

//     if (memberId && memberId.trim() !== "") {
//       const memberObjectId = new mongoose.Types.ObjectId(memberId);
//       query = {
//         userId: userObjectId,
//         "purchaseFor.memberId": memberObjectId
//       };
//     } else {
//       query = {
//         userId: userObjectId,
//         "purchaseFor.isFamilyMember": false
//       };
//     }

//     const history = await PurchaseHistory.find(query);

//     return res.status(200).json({
//       success: true,
//       message: 'Data fetched successfully',
//       results: history
//     });

//   } catch (error) {
//     console.error("Error in getPurchasePlanHistory:", error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };


exports.elightPackageRequest = async (req, res)=>{
  try {
    const { userId, packageType, preferences, preferredTime } = req.body;

    if (!userId || !packageType || !preferences || !preferredTime) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newRequest = new ElitePackageRequest({
      userId,
      packageType,
      preferences,
      preferredTime
    });

    await newRequest.save();

    res.status(200).json({
      success: true,
      message: 'Elite package request saved successfully. Our team will contact you shortly.'
    });
  } catch (error) {
    console.error('Error saving Elite package request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}



// exports.getBookingsByUserId = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'userId is required' });
//     }

//     const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       data: bookings,
//       length: bookings.length
//     });
//   } catch (error) {
//     console.error('Error fetching bookings by userId:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };



exports.getBookingsByUserId = async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    // Build query object
    const query = { userId, status:'confirmed' };

    // If 'name' is provided, search within 'bookedFor' for a family member with the name
    if (name) {
      query['bookedFor.name'] = name;
      query['bookedFor.isFamilyMember'] = true;
    }

    // Fetch bookings based on query
    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
      length: bookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings by userId and name:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




// exports.getUnscheduledBookingsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const unscheduledBookings = await Booking.find({
//       userId,
//       $or: [
//         { 'scheduledSession.date': { $exists: false } },
//         { 'scheduledSession.date': null },
//         { 'scheduledSession.startTime': { $exists: false } },
//         { 'scheduledSession.startTime': null },
//         { 'scheduledSession.endTime': { $exists: false } },
//         { 'scheduledSession.endTime': null }
//       ]
//     });

//     res.status(200).json({ success: true, data: unscheduledBookings });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



exports.getUnscheduledBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isFamilyMember, familyMemberName, sessionType } = req.query;

    // Base filter for unscheduled sessions
    const query = {
      userId,
      $or: [
        { 'scheduledSession.date': { $exists: false } },
        { 'scheduledSession.date': null },
        { 'scheduledSession.startTime': { $exists: false } },
        { 'scheduledSession.startTime': null },
        { 'scheduledSession.endTime': { $exists: false } },
        { 'scheduledSession.endTime': null }
      ]
    };

    // Optional filter: whether booking is for family member
    if (isFamilyMember !== undefined) {
      query['bookedFor.isFamilyMember'] = isFamilyMember === 'true'; // converts string to boolean
    }

    // Optional filter: by family member's name
    if (familyMemberName) {
      query['bookedFor.name'] = familyMemberName;
    }

    // Optional filter: by session type
    if (sessionType) {
      query.sessionType = sessionType;
    }

    const unscheduledBookings = await Booking.find(query);

    res.status(200).json({ success: true, data: unscheduledBookings });
  } catch (err) {
    console.error("Error fetching unscheduled bookings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.superElitePackageRequest = async (req, res) => {
  try {
    const { name, variants, purchaseFor } = req.body;

    if (!name || !variants || !Array.isArray(variants)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const newPackage = new SuperElitePackageRequest({
      name,
      variants,
      purchaseFor
    });

    const savedPackage = await newPackage.save();

    res.status(201).json({
      message: 'Super Elite Package created successfully',
      data: savedPackage
    });

  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: error.message });
  }
};


// exports.checkMainKundliStatus = async (req, res) => {
//   try {
//     const { userId, bookedForName } = req.body;

//     // Only one of them must be provided
//     if ((!userId && !bookedForName) || (userId && bookedForName)) {
//       return res.status(400).json({
//         error: "Please provide either userId or bookedForName, but not both.",
//       });
//     }

//     let filter = {};

//     if (userId) {
//       filter.userId = userId;
//     } else if (bookedForName) {
//       filter["bookedFor.name"] = bookedForName;
//     }

//     const completedBookings = await Booking.findOne({
//       ...filter,
//       status: "completed",
//     });

//     const isCompleted = !!completedBookings; // true if found, false if not

//     res.json({ isCompleted });
//   } catch (error) {
//     console.error("Error checking booking status:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };


exports.checkMainKundliStatus = async (req, res) => {
  try {
    const { userId, bookedForName } = req.body;

    // Validation
    if ((!userId && !bookedForName) || (!userId && bookedForName)) {
      return res.status(400).json({
        error: "Please provide both userId and bookedForName for family member check, or only userId for self-check.",
      });
    }

    let filter = { status: "confirmed" };

    if (userId && !bookedForName) {
      // Check main user bookings
      filter.userId = userId;
    } else if (userId && bookedForName) {
      // Check if family member with same name is booked by this user
      filter.userId = userId;
      filter["bookedFor.name"] = bookedForName;
    }

    const completedBooking = await Booking.findOne(filter);

    const isCompleted = !!completedBooking;

    res.json({ isCompleted });
  } catch (error) {
    console.error("Error checking booking status:", error);
    res.status(500).json({ error: "Server error" });
  }
};



exports.checkBookingConfirmedStatus = async (req, res) => {
  try {
    const { userId, bookedForName } = req.body;

    // Validation: Either provide userId for self-check, or both userId and bookedForName for family member check
    if ((!userId && !bookedForName) || (!userId && bookedForName)) {
      return res.status(400).json({
        error: "Please provide both userId and bookedForName for family member check, or only userId for self-check.",
      });
    }

    let filter = { status: "confirmed" };

    if (userId && !bookedForName) {
      // Check main user bookings with confirmed status
      filter.userId = userId;
    } else if (userId && bookedForName) {
      // Check if a family member with the same name is booked by this user
      filter.userId = userId;
      filter["bookedFor.name"] = bookedForName;
    }

    const confirmedBooking = await Booking.findOne(filter);

    const isConfirmed = !!confirmedBooking;

    res.json({ isConfirmed });
  } catch (error) {
    console.error("Error checking booking status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

