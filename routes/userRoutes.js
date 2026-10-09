const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// Import the whole controller
const userController = require("../controllers/userController");

//router.post("/register", upload.single("profile_url"), userController.registerUser);
router.post('/login', upload.none(), userController.loginUser);
router.post('/get_profile', upload.none(), userController.getProfile);
router.post('/update_profile', upload.single("profile_url"), userController.updateProfile);

router.post('/user_login_detail', upload.none(), userController.userLoginDetail);
router.post('/get_login_detail', upload.none(), userController.getLoginDetail);

router.post('/get_user_attendance', upload.none(), userController.getUserAttendance);

router.post('/month_wise_status', upload.none(), userController.monthWiseStatus);



router.post('/save_leave_request', upload.single('upload'), userController.saveLeaveRequest);

router.post('/get_leave_request', upload.none(), userController.getLeaveRequest);

router.post('/save_pay_slip', upload.none(), userController.savePaySlip);

router.post('/save_notification', upload.none(), userController.saveNotification);

router.post('/get_notification', upload.none(), userController.getNotification);

router.post('/reset_password_request', upload.none(), userController.resetPasswordRequest);


// router.post('/get_login_detail_bkp', upload.none(), userController.getLoginDetailbkp);
router.post('/get_payslip', upload.none(), userController.getPayslipStatus);



router.get('/networks', userController.getNetworks);

router.post('/logout', upload.none(), userController.logout);

router.get('/get_holidays', userController.getHolidays);
router.post('/get_leave_count', upload.none(), userController.getLeaveCount);

module.exports = router;

