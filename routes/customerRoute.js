const express = require('express');
const route = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/auth');

// route
route.post('/send_otp', customerController.sendOtp);
route.post('/verify_otp', customerController.verifyOtp);
route.post('/add_customer', customerController.addCustomer);
route.post('/update_profile/:id', auth, customerController.updateProfile);
route.get('/get_profile', auth, customerController.getCustomerById);
route.post('/book_session', customerController.bookSession);
route.post('/book_session_one_time', customerController.bookSessionOneTime);
route.post('/add_family_member', customerController.addFamilyMember);
route.get('/get_family_members/:customerId', customerController.getFamilyMembers);
route.post('/purchase_plan', customerController.addPurchase);
route.post('/get_puchase_plan_history', customerController.getPurchasePlanHistory);
route.post('/elite_package_request', customerController.elightPackageRequest);
route.post('/get_booking_by_id', customerController.getBookingsByUserId);
route.get('/bookings/unscheduled/:userId', customerController.getUnscheduledBookingsByUser)
route.post('/super_elite_package_request', customerController.superElitePackageRequest);
route.post('/create_razorpay_order', customerController.createRazorpayOrder);
route.post('/check_main_kundli_status', customerController.checkMainKundliStatus);
route.post('/check_booking_confirmed_status', customerController.checkBookingConfirmedStatus)
route.delete('/delete_customer/:id', customerController.deleteCustomer);
module.exports = route;