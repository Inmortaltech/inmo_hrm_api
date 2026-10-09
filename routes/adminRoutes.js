const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// Import the whole controller
const adminController = require("../controllers/adminController");

//router.post("/register", upload.single("profile_url"), adminController.registerUser);

router.post("/register",upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachments", maxCount: 1 },
    { name: "profile_url", maxCount: 1 }
  ]),
  adminController.registerUser
);

router.get('/get_users_detail', adminController.getUsersDetail);
router.post("/get_admin_leaverequest", upload.none(), adminController.getAdminLeaveRequest);
router.get('/get_allUser_leaveRequest', adminController.getAllUserLeaveRequest);
router.post('/update-leave-status', upload.none(), adminController.updateLeaveStatus);
router.get('/get_dashboard_detail', adminController.getDashboardDetail);
router.post('/get_attendance_ByStatus', upload.none(), adminController.getattendanceByStatus);
router.post('/get_all_attendance', upload.none(), adminController.getAllAttendance);
router.get('/get_all_admins', adminController.getAllAdmins);
router.post('/create_admin', upload.none(), adminController.createAdmin);
router.post('/update_admin', upload.none(), adminController.updateAdmin);
router.post('/delete_admin', upload.none(), adminController.deleteAdmin);

// Holiday Routes
router.get('/get_holidays', adminController.getHolidays);
router.post('/add_holiday', upload.none(), adminController.addHoliday);
router.post('/bulk_add_holidays', upload.none(), adminController.bulkAddHolidays);
router.post('/delete_holiday', upload.none(), adminController.deleteHoliday);

router.post('/admin_add_leave', upload.single("upload"), adminController.adminAddLeave);

//router.post('/edit_users', upload.none(), adminController.editUsers);

router.post("/edit_users",upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachments", maxCount: 1 },
    { name: "profile_url", maxCount: 1 }
  ]),
  adminController.editUsers
);



router.post('/update-status', upload.none(), adminController.updateStatus);

//router.post("/add-network", upload.none(), adminController.addNetwork);

router.post('/login', upload.none(), adminController.login);

router.post('/save_admin_notification', upload.none(), adminController.saveAdminNotification);

router.get('/get_admin_notifications', adminController.getAdminNotifications);

router.get('/get_allPaySlips', adminController.getAllPaySlips);

router.post('/update_paySlip', upload.single("slip_url"), adminController.updatePaySlip);


router.post('/get_userAttendance', upload.none(), adminController.getUserAttendance);



router.post('/update_notification', upload.none(), adminController.updateAdminNotification);
router.post('/delete_notification', upload.none(), adminController.deleteAdminNotification);
router.post('/restore_notification', upload.none(), adminController.restoreAdminNotification);

router.get('/get_appQR', adminController.getAppQR);


router.post('/add_monthly_leave', adminController.addMonthlyEarnedLeave);

module.exports = router;


