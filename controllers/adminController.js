const Admin = require('../models/admin/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const configureMulter = require('../middlewares/configureMulter');
const Package = require('../models/admin/subscription');
const Customer = require('../models/customers/customer');
const Booking = require('../models/customers/booking');
const FamilyMember = require('../models/customers/familyMember');
const ElitePackageRequest = require('../models/customers/elitePackageRequest');
const PurchaseHistory = require('../models/customers/purchasePlanHistory');
const { sendMail } = require("../helpers/mailer");
const {generateScheduleEmail, generateRescheduleEmail}  = require('../utils/generateScheduleEmail');
const SuperElitePackageRequest = require('../models/customers/superElitePackageRequest');
const MasterOtp = require('../models/admin/masterOtp');
const mongoose = require('mongoose');
 
exports.createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, password is required!'
      })
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }


    // Create admin
    const admin = new Admin({
      fullName,
      email,
      password: password,
    });

    await admin.save();
    res.status(201).json({ message: 'Admin added successfully', admin });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let userType = 'SuperAdmin'
    // Step 1: Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required!',
      });
    }

    // Step 2: Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Step 3: Check password (plain-text)
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Step 4: Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Step 5: Send response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: userType
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


exports.createPackage = async (req, res) => {
  try {
    const { name, frequency, isCustomPrice, variants } = req.body;

    if (!name || !variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: 'name' and at least one variant are required."
      });
    }

    const newPackage = new Package({
      name,
      frequency,
      isCustomPrice: isCustomPrice || false,
      variants
    });

    await newPackage.save();

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: newPackage
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating package',
      error: err.message
    });
  }
};


exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching packages', error: err.message });
  }
};


exports.getPackageById = async (req, res) => {
  try {
    const pack = await Package.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, package: pack });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching package', error: err.message });
  }
};


exports.updatePackage = async (req, res) => {
  try {
    const updated = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, message: 'Package updated successfully', package: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating package', error: err.message });
  }
};


exports.deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting package', error: err.message });
  }
};



exports.getAllCustomer = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      gender
    } = req.query;

    const query = {};

    // Search by name or mobile
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by gender if provided
    if (gender) {
      query.gender = gender;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [patients, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Customer.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Customer fetched successfully',
      data: patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};



exports.getCustomerDetails = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Pagination inputs
    const {
      purchasePage = 1,
      purchaseLimit = 5,
      bookingPage = 1,
      bookingLimit = 5
    } = req.query;

    const purchaseSkip = (parseInt(purchasePage) - 1) * parseInt(purchaseLimit);
    const bookingSkip = (parseInt(bookingPage) - 1) * parseInt(bookingLimit);

    // 1. Fetch customer info
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // 2. Family members
    const familyMembers = await FamilyMember.find({ customerId });

    // 3. Purchase history (paginated)
    const [purchaseHistory, totalPurchases] = await Promise.all([
      PurchaseHistory.find({ userId: customerId })
        .populate('purchaseFor.memberId', 'name age gender relation')
        .sort({ purchaseDate: -1 })
        .skip(purchaseSkip)
        .limit(parseInt(purchaseLimit)),
      PurchaseHistory.countDocuments({ userId: customerId })
    ]);

    // 4. Bookings (paginated)
    const [bookings, totalBookings] = await Promise.all([
      Booking.find({ userId: customerId })
        .populate('bookingPackageId', 'packageName price sessionLength')
        .sort({ createdAt: -1 })
        .skip(bookingSkip)
        .limit(parseInt(bookingLimit)),
      Booking.countDocuments({ userId: customerId })
    ]);

    return res.status(200).json({
      success: true,
      message: "Customer details fetched successfully",
      data: {
        customer,
        familyMembers,
        purchaseHistory: {
          data: purchaseHistory,
          pagination: {
            total: totalPurchases,
            page: parseInt(purchasePage),
            limit: parseInt(purchaseLimit),
            totalPages: Math.ceil(totalPurchases / purchaseLimit)
          }
        },
        bookings: {
          data: bookings,
          pagination: {
            total: totalBookings,
            page: parseInt(bookingPage),
            limit: parseInt(bookingLimit),
            totalPages: Math.ceil(totalBookings / bookingLimit)
          }
        }
      }
    });

  } catch (error) {
    console.error("Error fetching customer details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


exports.getAdminDashboard = async (req, res) => {
  try {
    // Total customers count
    const totalCustomers = await Customer.countDocuments();

    // Total purchase amount
    const purchases = await PurchaseHistory.aggregate([
      { $match: {} },
      { $group: { _id: null, totalAmount: { $sum: '$price' } } }
    ]);


    // Total booking revenue (only 'paid' bookings)
    const bookingRevenueResult = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, totalAmount: { $sum: '$payment.amount' } } }
    ]);
    const totalBookingRevenue = bookingRevenueResult.length ? bookingRevenueResult[0].totalAmount : 0;

  
    const totalPurchaseAmount = purchases.length ? purchases[0].totalAmount : 0;
  // ✅ Combine both for total revenue
    const totalRevenue = totalPurchaseAmount + totalBookingRevenue;
    // Total bookings count
    const totalBookings = await Booking.countDocuments();

    // Total completed bookings count
    const totalCompletedBookings = await Booking.countDocuments({ status: 'completed' });

    // Total scheduled bookings count (assuming status 'scheduled')
    const totalScheduledBookings = await Booking.countDocuments({ status: 'scheduled' });

    // Today bookings (status can be any, just based on date)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayBookingsCount = await Booking.countDocuments({
      selectedDate: { $gte: todayStart, $lte: todayEnd }
    });

    // Recent customers (joined in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // const recentCustomers = await Customer.find({ createdAt: { $gte: sevenDaysAgo } })
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .select('fullName email createdAt');

    // Today registered customers
    const todayRegisteredCustomersCount = await Customer.countDocuments({
  createdAt: { $gte: todayStart, $lte: todayEnd }
});

    // Top customers by total purchase amount (limit 5)
    const topCustomers = await PurchaseHistory.aggregate([
      { $group: { _id: '$customerId', totalSpent: { $sum: '$price' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          fullName: '$customer.fullName',
          email: '$customer.email',
          totalSpent: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalPurchaseAmount:totalRevenue,
        totalBookings,
        totalCompletedBookings,
        totalScheduledBookings,
        todayBookingsCount,
        todayRegisteredCustomersCount,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

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



// exports.getAllBookings = async (req, res)=>{
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       userId,
//       sessionType,
//       urgency,
//       status,
//       fromDate,
//       toDate,
//     } = req.query;

//     const filter = {};

//     if (userId) filter.userId = userId;
//     if (sessionType) filter.sessionType = sessionType;
//     if (urgency) filter.urgency = urgency;
//     if (status) filter.status = status;

//     if (fromDate || toDate) {
//       filter.selectedDate = {};
//       if (fromDate) filter.selectedDate.$gte = new Date(fromDate);
//       if (toDate) filter.selectedDate.$lte = new Date(toDate);
//     }

//     const total = await Booking.countDocuments(filter);

//     const bookings = await Booking.find(filter)
//       .sort({ createdAt: -1 }) // latest first
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.status(200).json({
//       success: true,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       data: bookings,
//     });
//   } catch (error) {
//     console.error("Error fetching bookings:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }


// exports.getAllBookings = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       userId,
//       sessionType,
//       urgency,
//       status,
//       fromDate,
//       toDate,
//     } = req.query;

//     const filter = {};

//     if (userId) filter.userId = userId;
//     if (sessionType) filter.sessionType = sessionType;
//     if (urgency) filter.urgency = urgency;
//     if (status) filter.status = status;

//     if (fromDate || toDate) {
//       filter.selectedDate = {};
//       if (fromDate) filter.selectedDate.$gte = new Date(fromDate);
//       if (toDate) filter.selectedDate.$lte = new Date(toDate);
//     }

//     // 👇 Add filter to include only unscheduled bookings
//     filter.$or = [
//       { 'scheduledSession.date': { $exists: false } },
//       { 'scheduledSession.date': null },
//       { 'scheduledSession.startTime': { $exists: false } },
//       { 'scheduledSession.startTime': null },
//       { 'scheduledSession.endTime': { $exists: false } },
//       { 'scheduledSession.endTime': null },
//     ];

//     const total = await Booking.countDocuments(filter);

//     const bookings = await Booking.find(filter)
//       .sort({ createdAt: -1 }) // latest first
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.status(200).json({
//       success: true,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       data: bookings,
//     });
//   } catch (error) {
//     console.error("Error fetching bookings:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }

// exports.getAllBookings = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       userId,
//       sessionType,
//       urgency,
//       status,
//       fromDate,
//       toDate,
//     } = req.query;

//     const filter = {}

//     if (userId) filter.userId = userId
//     if (sessionType) filter.sessionType = sessionType
//     if (urgency) filter.urgency = urgency
//     if (status) filter.status = status

//     if (fromDate || toDate) {
//       filter.selectedDate = {}
//       if (fromDate) filter.selectedDate.$gte = new Date(fromDate)
//       if (toDate) filter.selectedDate.$lte = new Date(toDate)
//     }

//     // ✅ Only unscheduled sessions
//     filter['$or'] = [
//       { scheduledSession: { $exists: false } },
//       {
//         $and: [
//           { 'scheduledSession.date': null },
//           { 'scheduledSession.startTime': null },
//           { 'scheduledSession.endTime': null }
//         ]
//       }
//     ]

//     const total = await Booking.countDocuments(filter)

//     const bookings = await Booking.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))

//     res.status(200).json({
//       success: true,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       data: bookings,
//     })
//   } catch (error) {
//     console.error("Error fetching bookings:", error)
//     res.status(500).json({ success: false, message: "Server error" })
//   }
// }


exports.getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      sessionType,
      urgency,
      status,
      fromDate,
      toDate,
    } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const filter = {};

    if (userId) filter.userId = userId;
    if (sessionType) filter.sessionType = sessionType;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;

    if (fromDate || toDate) {
      filter.selectedDate = {};
      if (fromDate) filter.selectedDate.$gte = new Date(fromDate);
      if (toDate) filter.selectedDate.$lte = new Date(toDate);
    }

    // Only unscheduled sessions
    filter['$or'] = [
      { scheduledSession: { $exists: false } },
      {
        $and: [
          { 'scheduledSession.date': null },
          { 'scheduledSession.startTime': null },
          { 'scheduledSession.endTime': null },
        ],
      },
    ];

    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1, _id: -1 }) // <- ensures newest first
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.status(200).json({
      success: true,
      total,
      page: parsedPage,
      limit: parsedLimit,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};






exports.getAllElitePackageRequests = async (req, res) => {
  try {
    // Get page and limit from query params, set defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Fetch total count for metadata
    const total = await ElitePackageRequest.countDocuments();

    // Fetch paginated data with user details
    const requests = await ElitePackageRequest.find()
      .populate('userId', 'fullName email mobileNumber') // populate selected fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching paginated Elite package requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




// exports.getAllPurchaseHistory = async (req, res) => {
//   try {
//     // Get page and limit from query params, set defaults
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     const skip = (page - 1) * limit;

//     // Fetch total count for metadata
//     const total = await PurchaseHistory.countDocuments();

//     // Fetch paginated data with user details
//     const requests = await PurchaseHistory.find()
//       .populate('userId', 'fullName email mobileNumber') // populate selected fields
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({
//       success: true,
//       data: requests,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching paginated Elite package requests:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };


exports.getAllPurchaseHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || '';

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchTerm, 'i');

    const matchStage = searchTerm
      ? {
          $or: [
            { 'customer.fullName': searchRegex },
            { 'customer.email': searchRegex },
            { 'customer.mobileNumber': searchRegex },
          ],
        }
      : {};

    const pipeline = [
      {
        $lookup: {
          from: 'Customers', // EXACT collection name from your schema
          localField: 'userId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      { $match: matchStage },
      { $sort: { purchaseDate: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await PurchaseHistory.aggregate(pipeline);

    const total = result[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      success: true,
      data: result[0].data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching paginated purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




exports.scheduleSession = async (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime } = req.body;

  if (!date || !startTime ) {
    return res.status(400).json({
      message: "All fields (date, startTime) are required.",
    });
  }

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Update session
    booking.scheduledSession = {
      date: new Date(date),
      startTime,
      endTime,
    };

    booking.status = "confirmed";

    await booking.save();

   const emailContent = generateScheduleEmail({
  name: booking.user.name,
  date: booking.scheduledSession.date,
  startTime: booking.scheduledSession.startTime,
  endTime: booking.scheduledSession.endTime,
  sessionType: booking.sessionType,
});





await sendMail(booking.user.email, "Your Tathastu Session is Scheduled", emailContent);


    res.status(200).json({
      message: "Session scheduled and email sent successfully.",
      booking,
    });
  } catch (error) {
    console.error("Error in scheduleSession:", error);
    res.status(500).json({ message: "Server error." });
  }
};


exports.getAllScheduledSessions = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const filter = {
      'scheduledSession.date': { $ne: null },
      'scheduledSession.startTime': { $ne: null },
      'scheduledSession.endTime': { $ne: null },
      status: { $ne: 'completed' }
    };

    const [sessions, total] = await Promise.all([
      Booking.find(filter)
        .sort({ 'scheduledSession.date': 1 }) // Upcoming first
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: sessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get all completed sessions
exports.getAllCompletedSessions = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      Booking.find({ status: 'completed' })
        .sort({ 'scheduledSession.date': -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ status: 'completed' })
    ]);

    res.status(200).json({
      success: true,
      data: sessions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





// exports.getSuperElitePackages = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;

//     const parsedPage = parseInt(page);
//     const parsedLimit = parseInt(limit);

//     const skip = (parsedPage - 1) * parsedLimit;

//     const [packages, totalCount] = await Promise.all([
//       SuperElitePackageRequest.find()
//         .skip(skip)
//         .limit(parsedLimit)
//         .sort({ createdAt: -1 }), // optional: newest first
//       SuperElitePackageRequest.countDocuments()
//     ]);

//     res.status(200).json({
//       message: 'Super Elite Packages fetched successfully',
//       currentPage: parsedPage,
//       totalPages: Math.ceil(totalCount / parsedLimit),
//       totalItems: totalCount,
//       data: packages
//     });
//   } catch (error) {
//     console.error('Error fetching packages:', error);
//     res.status(500).json({ message: error.message });
//   }
// };



// exports.getSuperElitePackages = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;

//     const parsedPage = parseInt(page);
//     const parsedLimit = parseInt(limit);
//     const skip = (parsedPage - 1) * parsedLimit;

//     const [packages, totalCount] = await Promise.all([
//       SuperElitePackageRequest.find()
//         .skip(skip)
//         .limit(parsedLimit)
//         .sort({ createdAt: -1 })
//         .populate('variants.userId'), // 👈 populate only fullName from Customers
//       SuperElitePackageRequest.countDocuments()
//     ]);

//     res.status(200).json({
//       message: 'Super Elite Packages fetched successfully',
//       currentPage: parsedPage,
//       totalPages: Math.ceil(totalCount / parsedLimit),
//       totalItems: totalCount,
//       data: packages
//     });
//   } catch (error) {
//     console.error('Error fetching packages:', error);
//     res.status(500).json({ message: error.message });
//   }
// };


exports.getSuperElitePackages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    console.log("CHECKKKK SEARCHHHH", search);

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    // Initialize filter for the packages
    let filter = {};

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    // Search by customer's full name if search query is provided
    if (search) {
      // 1. Find Customers with the given search term
      const customers = await mongoose.model('Customers').find({
        fullName: { $regex: search.trim(), $options: 'i' } // Case insensitive search
      }).select('_id');

      // 2. Check if customers are found and filter packages based on matching userId
      if (customers.length > 0) {
        const customerIds = customers.map(customer => customer._id);
        filter['variants.userId'] = { $in: customerIds }; // Filter variants that match userId
      } else {
        // If no customers are found, return empty response or handle accordingly
        return res.status(200).json({
          message: 'No records found matching search criteria.',
          currentPage: parsedPage,
          totalPages: 0,
          totalItems: 0,
          data: []
        });
      }
    }

    // Fetch packages with filters applied
    const [packages, totalCount] = await Promise.all([
      SuperElitePackageRequest.find(filter)
        .skip(skip)
        .limit(parsedLimit)
        .sort({ createdAt: -1 })
        .populate('variants.userId'), // Populate full name from Customers
      SuperElitePackageRequest.countDocuments(filter) // Count total items with filters
    ]);

    res.status(200).json({
      message: 'Super Elite Packages fetched successfully',
      currentPage: parsedPage,
      totalPages: Math.ceil(totalCount / parsedLimit),
      totalItems: totalCount,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: error.message });
  }
};





exports.updateSuperEliteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the status value
  if (!['contacted', 'not-contacted', 'payment-link-sended', 'purchased'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    // Find the request by ID
    const superElitePackageRequest = await SuperElitePackageRequest.findById(id);

    if (!superElitePackageRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if status is 'purchased' and update remainingSession based on the variant's numberOfCalls
    if (status === 'purchased') {
      // Find the number of sessions in the variants array
      const variant = superElitePackageRequest.variants[0]; // Assuming there's only one variant in the array

      // Extract the number of sessions from the string in the numberOfCalls field
      const sessionCount = parseInt(variant.numberOfCalls.match(/\d+/)[0], 10); // Extract the first number from the string

      if (!isNaN(sessionCount)) {
        superElitePackageRequest.remainingSession = sessionCount;
      } else {
        return res.status(400).json({ message: 'Invalid number of sessions in the variant' });
      }
    }

    // Update the status field
    superElitePackageRequest.status = status;

    // Save the updated request
    const updatedRequest = await superElitePackageRequest.save();

    // Return the updated request
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deductSessionAndUpdate = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the request by ID
    const superElitePackageRequest = await SuperElitePackageRequest.findById(id);

    if (!superElitePackageRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if there are remaining sessions
    if (superElitePackageRequest.remainingSession <= 0) {
      return res.status(400).json({ message: 'No remaining sessions to deduct' });
    }

    // Deduct one session
    superElitePackageRequest.remainingSession -= 1;

    // Log the session consumption date
    superElitePackageRequest.consumedSessions.push({
      sessionDate: new Date() // Add current date to the consumed sessions array
    });

    // Save the updated request
    const updatedRequest = await superElitePackageRequest.save();

    // Return the updated request with remaining session count and session date
    res.status(200).json({
      message: 'Session deducted and date updated successfully',
      remainingSession: updatedRequest.remainingSession,
      consumedSessions: updatedRequest.consumedSessions
    });
  } catch (error) {
    console.error('Error deducting session and updating date:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// exports.updateSuperEliteRequestPrice = async (req, res) => {
//   try {
//     // Get the variantId from request params (you might want to adjust this based on your route)
//     const { variantId } = req.params;
//     const { price } = req.body;

//     // Check if the variantId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(variantId)) {
//       return res.status(400).json({ success: false, message: 'Invalid variant ID format' });
//     }

//     // Update the actualPrice for the variant that matches the variantId inside the variants array
//     const updatedRequest = await SuperElitePackageRequest.findOneAndUpdate(
//       { '_id': variantId }, // Find by variantId inside the variants array
//       {
//         $set: { 
//           'variants.$.actualPrice': price // Update the actualPrice of the matched variant
//         }
//       },
//       { new: true, runValidators: true } // Ensure you return the updated document
//     );

//     if (!updatedRequest) {
//       return res.status(404).json({ message: 'Variant not found in the request' });
//     }

//     // Return the updated request
//     res.status(200).json({ success: true, updatedRequest });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };



exports.updateSuperEliteRequestPrice = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { variantId, price } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ success: false, message: 'Invalid price' });
    }

    const updatedRequest = await SuperElitePackageRequest.findOneAndUpdate(
      { _id: parentId }, // ✅ Only filter by parent ID
      {
        $set: {
          'variants.$[elem].actualPrice': price
        }
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ 'elem._id': variantId }] // ✅ Match variant here
      }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Parent or variant not found' });
    }

    res.status(200).json({ success: true, updatedRequest });

  } catch (error) {
    console.error("Error updating price:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};






exports.markBookingAsCompleted = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'completed' },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      message: 'Booking marked as completed successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getFamilyMemberFullDetails = async (req, res) => {
  try {
    const familyMemberId = req.params.id;

    // Validate ID format
    if (!familyMemberId || familyMemberId.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid family member ID' });
    }

    // 1. Get Family Member Details
    const familyMember = await FamilyMember.findById(familyMemberId).populate('customerId', 'fullName email mobileNumber');

    if (!familyMember) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    // 2. Get Purchase History for this family member
    const purchases = await PurchaseHistory.find({ 'purchaseFor.memberId': familyMemberId })
      .populate('userId', 'fullName email mobileNumber')
      .sort({ purchaseDate: -1 });

    // 3. Get Bookings made for this family member
    const bookings = await Booking.find({ 'bookedFor.isFamilyMember': true, 'bookedFor.name': familyMember.name })
      .populate('userId', 'fullName email mobileNumber')
      .populate('bookingPackageId')
      .sort({ createdAt: -1 });

    // 4. Send Combined Response
    res.status(200).json({
      success: true,
      data: {
        familyMember,
        purchases,
        bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching family member details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



exports.rescheduleSession = async (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime, reason } = req.body;

  // Validate required fields
  if (!date || !startTime) {
    return res.status(400).json({
      message: "All fields (date, startTime) are required.",
    });
  }

  // Optional: Validate reason if provided
  if (reason && reason.length > 500) {
    return res.status(400).json({
      message: "Reason is too long. Please provide a valid reason.",
    });
  }

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Ensure the status is confirmed before rescheduling
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be rescheduled." });
    }

    // Update the scheduled session with new details and include the reason
    booking.scheduledSession = {
      date: new Date(date),
      startTime,
      endTime,
      rescheduleReason: reason || "No reason provided", // Include reason for rescheduling
    };

    // Save the updated booking
    await booking.save();

    // Generate email content for the rescheduled session
    const emailContent = generateRescheduleEmail({
  name: booking.user.name,
  date: booking.scheduledSession.date,
  startTime: booking.scheduledSession.startTime,
  endTime: booking.scheduledSession.endTime,
  sessionType: booking.sessionType,
  reason: booking.scheduledSession.reason, // assuming you saved it here
});

    // Send email to the user notifying them of the rescheduled session and the reason
    await sendMail(
  booking.user.email,
  "Your Tathastu Session Has Been Rescheduled",
  emailContent
);

    res.status(200).json({
      message: "Session rescheduled and email sent successfully.",
      booking,
    });
  } catch (error) {
    console.error("Error in rescheduleSession:", error);
    res.status(500).json({ message: "Server error." });
  }
};




exports.createOrUpdateMasterOtp = async (req, res) => {
  try {
    const { masterOtp } = req.body;

    // Validation
    if (!masterOtp || typeof masterOtp !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'masterOtp is required and must be a string.',
      });
    }

    // Create or update master OTP (only one record maintained)
    const updatedOtp = await MasterOtp.findOneAndUpdate(
      {}, // empty filter to match any existing document
      { masterOtp }, // update the masterOtp field
      {
        new: true,     // return the updated document
        upsert: true,  // create if not exists
        setDefaultsOnInsert: true, // apply defaults if creating new
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Master OTP created or updated successfully',
      data: updatedOtp,
    });
  } catch (error) {
    console.error('Error creating/updating Master OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


exports.getMasterOtp = async (req, res) => {
  try {
    const masterOtpData = await MasterOtp.findOne({});

    if (!masterOtpData) {
      return res.status(404).json({
        success: false,
        message: 'Master OTP not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Master OTP fetched successfully.',
      data: masterOtpData,
    });
  } catch (error) {
    console.error('Error fetching Master OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




exports.updateRemainingSession = async (req, res) => {
  const { id } = req.params;
  const { remainingSessions } = req.body;

  // Validate input
  if (typeof remainingSessions !== 'number' || remainingSessions < 0) {
    return res.status(400).json({ error: 'Invalid remainingSessions value' });
  }

  try {
    const purchase = await PurchaseHistory.findByIdAndUpdate(
      id,
      { remainingSessions },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(200).json({
      message: 'Remaining sessions updated successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error while updating purchase' });
  }
}