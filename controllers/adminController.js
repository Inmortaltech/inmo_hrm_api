const pool = require("../config/db");
const bcrypt = require("bcrypt");

 exports.registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      gender,
      marital_status,
      blood_group,
      work_email,
      password,
      personal_email,
      emergency_contact_name,
      relation_with_them,
      emergency_contact_no,
      type,
      profile_type,
      contact_no,
      bank_name,
      bank_account_no,
      bank_ifsc_code,
      nationality,
      govt_uid,
      department_name,
      designation,
      office_time_policy,
      date_of_joining,
      shift_start_date,
      resignation_date,
      casual_leave
    } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE work_email = ?",
      [work_email, personal_email]
    );

    if (existingUser.length > 0) {
      return res.status(200).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // File uploads
    let profile_url = req.files?.['profile_url'] ? `/uploads/${req.files['profile_url'][0].filename}` : null;
    let attachments = req.files?.['attachments'] ? `/uploads/${req.files['attachments'][0].filename}` : null;
    let photo = req.files?.['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;

    const sql = `
      INSERT INTO users (
        profile_url, first_name, last_name, dob, gender, marital_status, blood_group,
        work_email, password, personal_email, emergency_contact_name, relation_with_emergency, 
        emergency_contact_no, type, profile_type, contact_number, attachments, photo, 
        bank_name, bank_account_no, bank_ifsc_code, nationality,
        govt_uid, department_name, designation, office_time_policy, 
        date_of_joining, shift_start_date, resignation_date,show_password, casual_leave
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      profile_url,
      first_name,
      last_name,
      dob,
      gender,
      marital_status,
      blood_group,
      work_email,
      hashedPassword,
      personal_email,
      emergency_contact_name,
      relation_with_them,
      emergency_contact_no,
      type,
      profile_type,
      contact_no,
      attachments,
      photo,
      bank_name,
      bank_account_no,
      bank_ifsc_code,
      nationality,
      govt_uid,
      department_name,
      designation,
      office_time_policy,
      date_of_joining || null,
      shift_start_date || null,
      resignation_date || null,
      password,
      casual_leave || 0
    ]);

    res.status(200).json({ message: "User registered successfully", userId: result.insertId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};



exports.getUsersDetail = async (req, res) => {
  try {
    const query = `
      SELECT 
          u.*,
          COALESCE(
              (SELECT SUM(totalleavedays) FROM leave_requests 
               WHERE user_id = u.id AND leavetype = 'Casual Leave' AND LOWER(request_status) = 'approved'), 
          0) AS used_casual_leave,
          COALESCE(
              (SELECT SUM(totalleavedays) FROM leave_requests 
               WHERE user_id = u.id AND leavetype = 'Earned Leave' AND LOWER(request_status) = 'approved'), 
          0) AS used_earned_leave
      FROM users u
    `;
    const [rows] = await pool.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Map all users
    const users = rows.map(user => {
      const totalCasual = Number(user.casual_leave) || 0;
      const usedCasual = Number(user.used_casual_leave) || 0;
      const leftCasual = Math.max(0, totalCasual - usedCasual);

      const totalEarned = Number(user.earned_leave) || 0;
      const usedEarned = Number(user.used_earned_leave) || 0;
      const leftEarned = Math.max(0, totalEarned - usedEarned);

      return {
        userid: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        profiletype: user.type,
        profileimage: user.profile_url ? `${baseUrl}${user.profile_url}` : null,
        dob: user.dob,
        gender: user.gender,
        marital_status: user.marital_status,
        blood: user.blood_group,
        work_email: user.work_email,
        contact_no: user.contact_number,
        password: user.show_password,
        personal_email: user.personal_email,
        emergency_contact_name: user.emergency_contact_name,
        relation_with_emergency: user.relation_with_emergency,
        emergency_contact_no: user.emergency_contact_no,
        bank_name: user.bank_name,
        bank_account_no: user.bank_account_no,
        bank_ifsc_code: user.bank_ifsc_code,
        nationality: user.nationality,
        govt_uid: user.govt_uid,
        department_name: user.department_name,
        designation: user.designation,
        office_time_policy: user.office_time_policy,
        date_of_joining: user.date_of_joining,
        shift_start_date: user.shift_start_date,
        resignation_date: user.resignation_date,
        casual_leave: totalCasual,
        earned_leave: totalEarned,
        casual_leave_text: `${leftCasual} Left / ${totalCasual} Total`,
        earned_leave_text: `${leftEarned} Left / ${totalEarned} Total`,
        attachments: user.attachments ? `${baseUrl}${user.attachments}` : null,
        photo: user.photo ? `${baseUrl}${user.photo}` : null,
      };
    });

    return res.status(200).json(users);

  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// get leave request
exports.getAdminLeaveRequest = async (req, res) => {
    try {
        // Since form-data is used, values come from req.body
        const emp_id = req.body.emp_id; // same as 'id' in users table

        if (!emp_id) {
            return res.status(400).json({
                success: false,
                message: 'emp_id is required'
            });
        }

        // Fetch leave requests for this employee
        const [rows] = await pool.query(
            `SELECT 
                lr.id AS leave_id,
                lr.leavetype,
                lr.fromdate,
                lr.todate,
                lr.totalleavedays,
                lr.reasonforleave,
                lr.request_status,
                lr.created_at,
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.work_email
            FROM leave_requests lr
            INNER JOIN users u ON lr.user_id = u.id
            WHERE u.id = ? 
            ORDER BY lr.id DESC`,
            [emp_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leave requests found for this employee'
            });
        }

        res.status(200).json({
            success: true,
           // message: 'Leave requests fetched successfully',
            data: rows
        });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};


exports.getAllUserLeaveRequest = async (req, res) => {
    try {
      
        // Fetch leave requests for this employee
        const [rows] = await pool.query(
    `SELECT 
        lr.id AS leave_id,
        lr.leavetype,
        DATE_FORMAT(lr.fromdate, '%Y-%m-%d') AS fromdate,
        DATE_FORMAT(lr.todate, '%Y-%m-%d') AS todate,
        lr.totalleavedays,
        lr.reasonforleave,
        lr.request_status,
        lr.created_at,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.work_email,
		lr.upload
    FROM leave_requests lr
    INNER JOIN users u ON lr.user_id = u.id
    ORDER BY lr.id DESC`
);

		// Attach file URL to each row
		const BASE_URL = "https://hrmapi.inmortaltechnologies.in/uploads/";

		const updatedRows = rows.map(row => ({
			...row,
			upload: row.upload ? BASE_URL + row.upload : null
		}));


        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leave requests found for this employee'
            });
        }

        res.status(200).json({
            success: true,
           // message: 'Leave requests fetched successfully',
            data: updatedRows
        });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leave_id, user_id, request_status, reason_status } = req.body;

    if (!leave_id || !user_id || !request_status) {
      return res.status(201).json({
        success: false,
        message: 'leave_id, user_id, and request_status are required',
      });
    }

    // Update leave request status
    const [result] = await pool.query(
      `UPDATE leave_requests 
       SET request_status = ?, reasonstatus = ?
       WHERE id = ? AND user_id = ?`,
      [request_status, reason_status, leave_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(201).json({
        success: false,
        message: 'No leave request found for given leave_id and user_id',
      });
    }
	
    res.status(200).json({
      success: true,
      message: 'Leave request status updated successfully',
    });
	
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while updating leave request',
    });
  }
};


exports.getDashboardDetail = async (req, res) => {
  try {
    // Step 1: Fetch punch_in/punch_out per day
    const [rows] = await pool.query(
      `SELECT 
          DATE(date) AS login_date,
          user_id,
          MIN(NULLIF(NULLIF(sign_in, ''), '00:00:00')) AS punch_in,
          MAX(NULLIF(NULLIF(sign_out, ''), '00:00:00')) AS punch_out
       FROM user_login_details
       WHERE DATE(date) = CURDATE()
       GROUP BY user_id, DATE(date)`
    );

    // Step 2: Total employees
    const [totalUserResult] = await pool.query(
      `SELECT COUNT(DISTINCT id) AS totalUser FROM users`
    );
    const totalEmployee = totalUserResult[0]?.totalUser || 0;

    // Step 3: Counters
    let totalPresent = 0;
    let totalLate = 0;
    let totalHalfDay = 0;
	let ontime = 0;
    // Step 4: Evaluate login rows
    let formattedData = rows.map(row => {
      let status = 'Absent';

      if (row.punch_in) {
        const punchIn = new Date(`1970-01-01T${row.punch_in}`);
        let hasPunchedOut = !!row.punch_out && row.punch_out !== '00:00:00';
        let diffHours = 0;
        
        if (hasPunchedOut) {
          const punchOut = new Date(`1970-01-01T${row.punch_out}`);
          diffHours = (punchOut - punchIn) / (1000 * 60 * 60);
        }

        if (row.punch_in > '14:30:00') {
          status = 'Half Day';
          totalHalfDay++;
          totalPresent++;
        } else if (hasPunchedOut && diffHours > 0 && diffHours < 4.5) {
          // Punched out early after working less than 4.5 hours
          status = 'Half Day';
          totalHalfDay++;
          totalPresent++;
        } else if (row.punch_in > '10:15:00') {
          status = 'Late';
          totalLate++;
          totalPresent++;
        } else {
          status = 'On Time';
          ontime++;
          totalPresent++;
        }
      }

      return {
        ...row,
        status
      };
    });

    // Step 5: Calculate total absent
    const totalAbsent = totalEmployee - totalPresent;

    return res.json({
      success: true,
      data: {
        totalEmployee,
        totalPresent,   // includes Late + Half Day + Present
        totalLate,
        totalHalfDay,
        totalAbsent,
		ontime
      }
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




// exports.getattendanceByStatus = async (req, res) => {
//   try {
//     const statusFilter = req.body.status ? req.body.status.toLowerCase() : null;
	
//     // STEP 1: Fetch all users
//     const [users] = await pool.query(`
//       SELECT id AS user_id, first_name, last_name 
//       FROM users
//     `);

//     // STEP 2: Fetch today’s punch data
//     const [loginRows] = await pool.query(`
//       SELECT 
//           user_id,
//           MIN(CASE WHEN sign_in <> '00:00:00' AND sign_in <> '' THEN sign_in END) AS punch_in,
//           MAX(CASE WHEN sign_out <> '00:00:00' AND sign_out <> '' THEN sign_out END) AS punch_out
//       FROM user_login_details
//       WHERE DATE(date) = CURDATE()
//       GROUP BY user_id
//     `);

//     // Convert login data into map for quick lookup
//     const loginMap = {};
//     loginRows.forEach(r => loginMap[r.user_id] = r);

//     // Arrays for status classification
//     const presentData = [];
//     const lateData = [];
//     const halfDayData = [];
//     const absentData = [];
// 	const onTimeData = [];
//     const finalData = [];

//     // Counters
//     let totalPresent = 0, totalLate = 0, totalHalfDay = 0, totalAbsent = 0, totalOnTime = 0;

//     // Today date string (YYYY-MM-DD)
//     const todayDate = new Date().toISOString().split('T')[0];

//     // STEP 3: Build attendance for each user
//     users.forEach(user => {
//       const login = loginMap[user.user_id] || {};
//       const punch_in = login.punch_in || null;
//       const punch_out = login.punch_out || null; // if punch_out missing, same as punch_in
// 		//const punch_out23 = punch_out ? punch_out : "00:00:00";
		
//       let status = "Absent";
//       let totalHours = 0;

//       if (punch_in) {
//         // User is present by default
//         status = "Present";

//         // Calculate total hours
//         const inTime = new Date(`1970-01-01T${punch_in}Z`);
//         const outTime = new Date(`1970-01-01T${punch_out || punch_in}Z`);
//         let diffHours = (outTime - inTime) / (1000 * 60 * 60);
//         totalHours = Math.round(diffHours * 100) / 100;

//         // Update status according to punch_in
//         if (punch_in > "12:00:00") {
//           status = "Half Day";
//           totalHalfDay++;
//           halfDayData.push({ ...user, login_date: todayDate, punch_in, punch_out, totalHours, status });
//         } 
// 		 else if (punch_in <= "10:18:00") {
//         status = "On Time";
//         totalOnTime++;  
//         onTimeData.push({ ...user, login_date: todayDate, punch_in, punch_out, totalHours, status });
//     } 
//         else if (punch_in > "10:15:00" && punch_in < "12:00:00") {
//           status = "Late";
//           totalLate++;
//           lateData.push({ ...user, login_date: todayDate, punch_in, punch_out, totalHours, status });
//         } 
//         else {
//           status = "Present";
//           totalPresent++;
//           presentData.push({ ...user, login_date: todayDate, punch_in, punch_out, totalHours, status });
//         }
//       } else {
//         // Absent
//         status = "Absent";
//         totalAbsent++;
//         absentData.push({ ...user, login_date: todayDate, punch_in: null, punch_out: null, totalHours: 0, status });
//       }

//       // Add to finalData
	  
//       finalData.push({
//        user_id: user.user_id,
//        first_name: user.first_name,
//        last_name: user.last_name,
//         login_date: todayDate,
//        punch_in,
//         punch_out,
//         totalHours,
//         status
//      });
	  
	
//     });

//     // STEP 4: Filter by requested status
//     if (statusFilter) {
//       let result = [];

//       if (statusFilter === "present") {
//         // Present includes Present + Late + Half Day
//         result = presentData.concat(lateData).concat(halfDayData);
//       } else if (statusFilter === "late") {
//         result = lateData;
//       } else if (statusFilter === "half day" || statusFilter === "half_day") {
//         result = halfDayData;
//       } else if (statusFilter === "absent") {
//         result = absentData;
// 		} else if (statusFilter === "on_time" || statusFilter === "on time") {
//         result = onTimeData;
//       } else {
//         return res.status(400).json({ message: "Invalid status provided" });
//       }

//       return res.json({
//         success: true,
//         status: statusFilter,
//         count: result.length,
//         data: result
//       });
//     }

//     // STEP 5: Return full summary if no status filter
//     return res.json({
//       success: true,
//       summary: {
//         totalPresent,
//         totalLate,
//         totalHalfDay,
//         totalAbsent
//       },
//       data: finalData
//     });

//   } catch (error) {
//     console.error("Attendance Error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };


exports.getattendanceByStatus = async (req, res) => {
  try {
    const statusFilter = req.body.status
      ? req.body.status.toLowerCase()
      : null;

    // STEP 1: Fetch all users
    const [users] = await pool.query(`
      SELECT id AS user_id, first_name, last_name 
      FROM users
    `);

    // STEP 2: Fetch today’s punch data
    const [loginRows] = await pool.query(`
      SELECT 
          user_id,
          MIN(
            CASE 
              WHEN sign_in <> '00:00:00' AND sign_in <> '' 
              THEN sign_in 
            END
          ) AS punch_in,
          MAX(
            CASE 
              WHEN sign_out <> '00:00:00' AND sign_out <> '' 
              THEN sign_out 
            END
          ) AS punch_out
      FROM user_login_details
      WHERE DATE(date) = CURDATE()
      GROUP BY user_id
    `);

    // Convert login data into map for quick lookup
    const loginMap = {};
    loginRows.forEach(r => {
      loginMap[r.user_id] = r;
    });

    // Arrays for status classification
    const presentData = [];
    const lateData = [];
    const halfDayData = [];
    const absentData = [];
    const onTimeData = [];
    const finalData = [];

    // Counters
    let totalPresent = 0,
      totalLate = 0,
      totalHalfDay = 0,
      totalAbsent = 0,
      totalOnTime = 0;

    // Today date string (YYYY-MM-DD)
    const todayDate = new Date().toISOString().split('T')[0];

    // STEP 3: Build attendance for each user
    users.forEach(user => {
      const login = loginMap[user.user_id] || {};

      const punch_in = login.punch_in || null;
      let punch_out = login.punch_out || null;

      /*
       * NEW VALIDATION ONLY
       *
       * If punch_out is less than punch_in,
       * show "-" instead of punch_out time.
       *
       * Example:
       * punch_in  = 10:06:57
       * punch_out = 10:06:33
       *
       * Result:
       * punch_out = "-"
       */
      if (
        punch_in &&
        punch_out &&
        punch_out < punch_in
      ) {
        punch_out = "-";
      }

      let status = "Absent";
      let totalHours = 0;

      if (punch_in) {
        // User is present by default
        status = "Present";

        // Calculate total hours
        const inTime = new Date(`1970-01-01T${punch_in}Z`);

        /*
         * If punch_out is "-" because it is less than punch_in,
         * use punch_in for calculation so totalHours does not become NaN.
         *
         * Existing behavior for missing punch_out is also preserved.
         */
        const calculationOutTime =
          punch_out && punch_out !== "-"
            ? punch_out
            : punch_in;

        const outTime = new Date(
          `1970-01-01T${calculationOutTime}Z`
        );

        let diffHours =
          (outTime - inTime) / (1000 * 60 * 60);

        totalHours = Math.round(diffHours * 100) / 100;

        // Update status according to punch_in
        if (punch_in > "12:00:00") {
          status = "Half Day";
          totalHalfDay++;

          halfDayData.push({
            ...user,
            login_date: todayDate,
            punch_in,
            punch_out,
            totalHours,
            status
          });
        } else if (punch_in <= "10:18:00") {
          status = "On Time";
          totalOnTime++;

          onTimeData.push({
            ...user,
            login_date: todayDate,
            punch_in,
            punch_out,
            totalHours,
            status
          });
        } else if (
          punch_in > "10:15:00" &&
          punch_in < "12:00:00"
        ) {
          status = "Late";
          totalLate++;

          lateData.push({
            ...user,
            login_date: todayDate,
            punch_in,
            punch_out,
            totalHours,
            status
          });
        } else {
          status = "Present";
          totalPresent++;

          presentData.push({
            ...user,
            login_date: todayDate,
            punch_in,
            punch_out,
            totalHours,
            status
          });
        }
      } else {
        // Absent
        status = "Absent";
        totalAbsent++;

        absentData.push({
          ...user,
          login_date: todayDate,
          punch_in: null,
          punch_out: null,
          totalHours: 0,
          status
        });
      }

      // Add to finalData
      finalData.push({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        login_date: todayDate,
        punch_in,
        punch_out,
        totalHours,
        status
      });
    });

    // STEP 4: Filter by requested status
    if (statusFilter) {
      let result = [];

      if (statusFilter === "present") {
        // Present includes Present + Late + Half Day
        result = presentData
          .concat(lateData)
          .concat(halfDayData);
      } else if (statusFilter === "late") {
        result = lateData;
      } else if (
        statusFilter === "half day" ||
        statusFilter === "half_day"
      ) {
        result = halfDayData;
      } else if (statusFilter === "absent") {
        result = absentData;
      } else if (
        statusFilter === "on_time" ||
        statusFilter === "on time"
      ) {
        result = onTimeData;
      } else {
        return res.status(400).json({
          message: "Invalid status provided"
        });
      }

      return res.json({
        success: true,
        status: statusFilter,
        count: result.length,
        data: result
      });
    }

    // STEP 5: Return full summary if no status filter
    return res.json({
      success: true,
      summary: {
        totalPresent,
        totalLate,
        totalHalfDay,
        totalAbsent
      },
      data: finalData
    });

  } catch (error) {
    console.error("Attendance Error:", error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


exports.editUsers = async (req, res) => {
  try {
    const {
      userid,
      first_name,
      last_name,
      dob,
      gender,
      marital_status,
      blood_group,
      work_email,
      password,
      personal_email,
      emergency_contact_name,
      relation_with_them,
      emergency_contact_no,
      type,
      profile_type,
      contact_no,
      bank_name,
      bank_account_no,
      bank_ifsc_code,
      nationality,
      govt_uid,
      department_name,
      designation,
      office_time_policy,
      date_of_joining,
      shift_start_date,
      resignation_date,
      casual_leave,
      earned_leave
    } = req.body;

    if (!userid) {
      return res.status(201).json({ message: "User ID is required" });
    }

    // Check if user exists
    const [existingUser] = await pool.query("SELECT * FROM users WHERE id = ?", [userid]);
    if (existingUser.length === 0) {
      return res.status(201).json({ message: "User not found" });
    }

    // File uploads
    let profile_url = req.files?.['profile_url']
      ? `/uploads/${req.files['profile_url'][0].filename}`
      : existingUser[0].profile_url;

    let attachments = req.files?.['attachments']
      ? `/uploads/${req.files['attachments'][0].filename}`
      : existingUser[0].attachments;

    let photo = req.files?.['photo']
      ? `/uploads/${req.files['photo'][0].filename}`
      : existingUser[0].photo;

    // Handle password update only if new password is provided
    let hashedPassword = existingUser[0].password;
    let showPassword = existingUser[0].show_password;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
      showPassword = password;
    }

    const sql = `
      UPDATE users SET
        profile_url = ?, 
        first_name = ?, 
        last_name = ?, 
        dob = ?, 
        gender = ?, 
        marital_status = ?, 
        blood_group = ?, 
        work_email = ?, 
        password = ?, 
        personal_email = ?, 
        emergency_contact_name = ?, 
        relation_with_emergency = ?, 
        emergency_contact_no = ?, 
        type = ?, 
        profile_type = ?, 
        contact_number = ?, 
        attachments = ?, 
        photo = ?, 
        bank_name = ?, 
        bank_account_no = ?, 
        bank_ifsc_code = ?, 
        nationality = ?, 
        govt_uid = ?, 
        department_name = ?, 
        designation = ?, 
        office_time_policy = ?, 
        date_of_joining = ?, 
        shift_start_date = ?, 
        resignation_date = ?, 
        show_password = ?,
        casual_leave = ?,
        earned_leave = ?
      WHERE id = ?
    `;

    const values = [
      profile_url,
      first_name,
      last_name,
      dob,
      gender,
      marital_status,
      blood_group,
      work_email,
      hashedPassword,
      personal_email,
      emergency_contact_name,
      relation_with_them,
      emergency_contact_no,
      type,
      profile_type,
      contact_no,
      attachments,
      photo,
      bank_name,
      bank_account_no,
      bank_ifsc_code,
      nationality,
      govt_uid,
      department_name,
      designation,
      office_time_policy,
      date_of_joining || null,
      shift_start_date || null,
      resignation_date || null,
      showPassword,
      casual_leave || 0,
      earned_leave || 0,
      userid
    ];

    await pool.query(sql, values);

    res.status(200).json({ message: "User updated successfully", status: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

exports.deleteUsers2
 = async (req, res) => {
  try {
    const { user_id } = req.body; // Expecting single or multiple user IDs

    if (!user_id || (Array.isArray(user_id) && user_id.length === 0)) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Convert to array if single ID is passed
    const ids = Array.isArray(user_id) ? user_id : [user_id];

    // Check if users exist
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE id IN (?)",
      [ids]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "No users found for given IDs" });
    }

    // Delete users
    await pool.query("DELETE FROM users WHERE id IN (?)", [ids]);

    res.status(200).json({
      message:
        ids.length > 1
          ? `${ids.length} users deleted successfully`
          : "User deleted successfully",
      deleted_user_ids: ids,
    });
  } catch (error) {
    console.error("Error deleting user(s):", error);
    res.status(500).json({ message: "Failed to delete user(s)", error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        status: "false"
      });
    }

    // 1. Check admins table
    const [admins] = await pool.query(
      "SELECT * FROM admins WHERE work_email = ? LIMIT 1",
      [email]
    );

    if (admins.length > 0) {
      const user = admins[0];
      // For this sample, admin uses plain text or admin@gmail.com
      if(user.work_email == 'admin@gmail.com' || user.password === password) {
        let permissions = [];
        try {
          if (user.permissions) permissions = JSON.parse(user.permissions);
        } catch(e) {}
        
        if (user.id === 1) {
          permissions = ["*"]; // Master admin gets everything
        }

        return res.json({
          userid: user.id,
          type: "Admin",
          name: user.name || "Admin",
          permissions,
          status: "true",
          message: "Login Successfully!"
        });
      }
    }

    // 2. Check users table
    const [users] = await pool.query(
      "SELECT * FROM users WHERE work_email = ? LIMIT 1",
      [email]
    );

    if (users.length > 0) {
      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
          userid: user.id,
          type: "Employee",
          name: (user.first_name + " " + user.last_name).trim(),
          status: "true",
          message: "Login Successfully!"
        });
      }
    }

    return res.json({ 
      message: "Invalid credentials", 
      status: "false" 
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteUsers = async (req, res) => {
  try {
    let { user_id } = req.body; 

    if (!user_id || (Array.isArray(user_id) && user_id.length === 0)) {
      return res.status(201).json({ message: "User ID is required" });
    }

    await pool.query(
      "DELETE FROM users WHERE id = ?",
      [user_id]
    );

    res.status(200).json({
      message: "User deleted successfully",
      status: true,
    });

  } catch (error) {
    console.error("Error deleting user(s):", error);
    res.status(500).json({
      message: "Failed to delete user(s)",
      error: error.message
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "id and status required"
      });
    }

    const query = "UPDATE networks SET status = ? WHERE id = ?";

    const [result] = await pool.query(query, [status, id]);

    return res.json({
      success: true,
      message: "Status updated successfully",
      affectedRows: result.affectedRows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message
    });
  }
};

// INSERT
exports.addNetwork = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const validStatus = ['active', 'inactive'];
    const finalStatus = validStatus.includes(status) ? status : 'inactive';
	
    const [result] = await pool.query(
      "INSERT INTO networks (name, status) VALUES (?, ?)",
      [name, finalStatus]
    );

    res.json({
      success: true,
      message: "Network added successfully",
      insertId: result.insertId
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.addNotice = async (req, res) => {
	
	try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const validStatus = ['active', 'inactive'];
    const finalStatus = validStatus.includes(status) ? status : 'inactive';

    const [result] = await pool.query(
      "INSERT INTO networks (name, status) VALUES (?, ?)",
      [name, finalStatus]
    );

    res.json({
      success: true,
      message: "Network added successfully",
      insertId: result.insertId
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
	
}



exports.saveAdminNotification = async (req, res) => {
    try {
        const { title, message, subject } = req.body;

        const [result] = await pool.query(
            `INSERT INTO notifications 
            (title, subject, message, date, created_at, user_type) 
            VALUES (?, ?, ?, CURDATE(), NOW(), ?)`,
            [
                title || null,
                subject || null,
                message || null,
                'admin'
            ]
        );

        res.status(200).json({
            success: true,
            message: 'Notification saved successfully',
            insertId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM notifications ORDER BY id DESC`
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

exports.getAllPaySlips = async (req, res) => {
    try {
			const [rows] = await pool.query(
				  `SELECT pay_slips.*, users.first_name, users.last_name 
				   FROM pay_slips
				   LEFT JOIN users ON users.id = pay_slips.user_id
				   ORDER BY pay_slips.id DESC`
			);

			const baseUrl = `${req.protocol}://${req.get("host")}`;

			const data = rows.map(row => {
				let slipUrl = row.slip_url || null;
				if (slipUrl) {
					// Convert absolute path to relative web path
					let cleanPath = slipUrl.replace(/\\/g, "/");
					const uploadsIndex = cleanPath.indexOf("uploads/");
					if (uploadsIndex !== -1) {
						cleanPath = "/" + cleanPath.substring(uploadsIndex);
					}
					if (!cleanPath.startsWith("http")) {
						if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
						slipUrl = `${baseUrl}${cleanPath}`;
					}
				}
				return { ...row, slip_url: slipUrl };
			});

        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};


exports.updatePaySlip = async (req, res) => {
    try {
        const { id, user_id, from_date, to_date, request_status } = req.body;

        // file (assuming multer or similar middleware)
        const slip_url = req.file ? req.file.path : null;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required"
            });
        }

        // check status (case-insensitive)
        let finalSlipUrl = null;
        if (request_status && request_status.toLowerCase() === 'approved') {
            finalSlipUrl = slip_url;
        }

        await pool.query(
            `UPDATE pay_slips 
             SET user_id = ?, 
                 from_date = ?, 
                 to_date = ?, 
                 request_status = ?, 
                 slip_url = ?
             WHERE id = ?`,
            [user_id, from_date, to_date, request_status, finalSlipUrl, id]
        );

        const [updated] = await pool.query(
            `SELECT * FROM pay_slips WHERE id = ?`,
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Update Successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

//  Helper function (LOCAL DATE FORMAT - avoids UTC issue)
const formatDate = (date) => {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
};

exports.getUserAttendance = async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.body;

    if (!user_id) {
      return res.status(201).json({ message: "user_id is required" });
    }

    //  Use params only (no default forcing)
    const startDate = start_date || null;
    const endDate = end_date || null;

    // ================= USER =================
    const [users] = await pool.query(
      `SELECT id AS user_id, first_name, last_name FROM users WHERE id = ?`,
      [user_id]
    );

    if (!users.length) {
      return res.status(201).json({ message: "User not found" });
    }

    const user = users[0];

    // ================= LEAVES COUNT =================
    let leaveCountQuery = `
      SELECT COUNT(*) as total_leaves
      FROM leave_requests
      WHERE user_id = ?
      AND LOWER(request_status) = 'approved'
    `;
    let leaveParams = [user_id];

    if (startDate && endDate) {
      leaveCountQuery += ` AND DATE(fromdate) <= ? AND DATE(todate) >= ?`;
      leaveParams.push(endDate, startDate);
    }

    const [leaveRows] = await pool.query(leaveCountQuery, leaveParams);
    const approvedLeaves = leaveRows[0]?.total_leaves || 0;

    // ================= LEAVE DATE RANGE =================
    const [leaveDateRows] = await pool.query(
      `SELECT fromdate, todate
       FROM leave_requests
       WHERE user_id = ?
       AND LOWER(request_status) = 'approved'`,
      [user_id]
    );

    // Create leave map
    const leaveMap = {};
    leaveDateRows.forEach(leave => {
      let start = new Date(leave.fromdate);
      let end = new Date(leave.todate);

      while (start <= end) {
        const d = formatDate(start); //  FIXED
        leaveMap[d] = true;
        start.setDate(start.getDate() + 1);
      }
    });

    // ================= ATTENDANCE =================
	let loginQuery = `
  SELECT 
    DATE_FORMAT(date, '%Y-%m-%d') as login_date,
    MIN(CASE WHEN sign_in <> '00:00:00' AND sign_in <> '' THEN sign_in END) AS punch_in,
    MAX(CASE WHEN sign_out <> '00:00:00' AND sign_out <> '' THEN sign_out END) AS punch_out
  FROM user_login_details
  WHERE user_id = ?
`;

let params = [user_id];

// Apply filter if provided
if (startDate && endDate) {
  loginQuery += ` AND DATE(date) BETWEEN ? AND ?`;
  params.push(startDate, endDate);
}

//  FIXED GROUP BY
loginQuery += `
  GROUP BY DATE_FORMAT(date, '%Y-%m-%d')
  ORDER BY login_date ASC
`;

const [loginRows] = await pool.query(loginQuery, params);

    // Convert to map
    const loginMap = {};
    loginRows.forEach(row => {
      loginMap[row.login_date] = row;
    });

    // ================= DATE LIST =================
    let attendanceDates = [];

    if (startDate && endDate) {
      let current = new Date(startDate);
      let last = new Date(endDate);

      while (current <= last) {
        attendanceDates.push(formatDate(current)); //  FIXED
        current.setDate(current.getDate() + 1);
      }
    } else {
      // All dates from DB
      attendanceDates = loginRows.map(row => row.login_date);
    }

    // ================= CALCULATION =================
    let attendanceData = [];

    let totalPresent = 0;
    let totalLate = 0;
    let totalHalfDay = 0;
    let totalOnTime = 0;

    attendanceDates.forEach(dateStr => {
      const login = loginMap[dateStr] || {};

      const punch_in = login.punch_in || null;
      const punch_out = login.punch_out || null;

      let status = "Absent";
      let totalHours = 0;
	 const day = new Date(dateStr).getDay(); 
	  if (day === 0 || day === 6) {
		status = "OFF";
	  }

       else if (leaveMap[dateStr]) {
        status = "Leave";
      } else if (punch_in) {
		  
        const inTime = new Date(`1970-01-01T${punch_in}`);
        const outTime = new Date(`1970-01-01T${punch_out || punch_in}`);

        let diffHours = (outTime - inTime) / (1000 * 60 * 60);
        totalHours = Math.round(diffHours * 100) / 100;

        //  Correct status logic
        if (punch_in > "12:00:00") {
          status = "Half Day";
          totalHalfDay++;
        } else if (punch_in > "10:15:00") {
          status = "Late";
          totalLate++;
        } else {
          status = "On Time";
          totalOnTime++;
          totalPresent++;
        }

      } else {
        status = "Absent";
      }

      attendanceData.push({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        login_date: dateStr,
        punch_in,
        punch_out,
        totalHours,
        status
      });
    });

    // ================= RESPONSE =================
    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: `${user.first_name} ${user.last_name}`
      },
      summary: {
        total_days: attendanceData.length,
        total_present: totalPresent,
        total_late: totalLate,
        total_half_day: totalHalfDay,
        total_leaves: approvedLeaves,
        total_ontime: totalOnTime
      },
      data: attendanceData
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateAdminNotification = async (req, res) => {
    try {
        const { id, title, message, subject } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required"
            });
        }

        // Update query
       await pool.query(
    `UPDATE notifications 
     SET title = ?, 
         subject = ?, 
         message = ?, 
         date = CURDATE()
     WHERE id = ?`,
    [
        title || null,
        subject || null,
        message || null,
        id
    ]
);
        res.status(200).json({
            success: true,
            message: 'Notification updated successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

exports.deleteAdminNotification = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required"
            });
        }

        await pool.query('UPDATE notifications SET is_deleted = 1 WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Notification deleted (archived) successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

exports.restoreAdminNotification = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required"
            });
        }

        await pool.query('UPDATE notifications SET is_deleted = 0 WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Notification restored successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};


exports.getAppQR = async (req, res) => {
	try {
		
		const apkLink = "https://we.tl/t-LCnOzV68gbKmOUZ4"; 
		return res.json({
		  success: true,
		  android: apkLink,
		  ios: ''
		});
  } catch (error) {
    console.error("File Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    let { start_date, end_date } = req.query;
    if (!start_date && req.body.start_date) start_date = req.body.start_date;
    if (!end_date && req.body.end_date) end_date = req.body.end_date;

    let query = `
      SELECT 
         uld.id AS attendance_id,
         DATE_FORMAT(uld.date, '%Y-%m-%d') AS login_date,
         MIN(NULLIF(NULLIF(uld.sign_in, ''), '00:00:00')) AS punch_in,
         MAX(NULLIF(NULLIF(uld.sign_out, ''), '00:00:00')) AS punch_out,
         u.id AS user_id,
         u.first_name,
         u.last_name,
         u.department_name
      FROM user_login_details uld
      JOIN users u ON uld.user_id = u.id
    `;
    let params = [];
    
    if (start_date && end_date) {
        query += ` WHERE DATE(uld.date) BETWEEN ? AND ? `;
        params.push(start_date, end_date);
    } else if (start_date) {
        query += ` WHERE DATE(uld.date) >= ? `;
        params.push(start_date);
    } else if (end_date) {
        query += ` WHERE DATE(uld.date) <= ? `;
        params.push(end_date);
    }

    query += ` GROUP BY u.id, DATE(uld.date) ORDER BY login_date DESC, u.first_name ASC`;

    const [rows] = await pool.query(query, params);

    // Calculate status for each record
    let statusCount = { Present: 0, Late: 0, 'Half Day': 0, Absent: 0 };
    
    const formattedData = rows.map(row => {
        let status = 'Absent';
        if (row.punch_in) {
            if (row.punch_in > '12:15:00') {
                status = 'Half Day';
            } else if (row.punch_in > '10:15:00' && row.punch_in < '12:15:00') {
                status = 'Late';
            } else {
                status = 'Present';
            }
        }
        statusCount[status] = (statusCount[status] || 0) + 1;
        
        return {
            ...row,
            name: (row.first_name + ' ' + row.last_name).trim(),
            status
        };
    });

    statusCount.Present = (statusCount.Present || 0) + (statusCount.Late || 0) + (statusCount['Half Day'] || 0);

    return res.json({
        success: true,
        summary: {
            total_days: rows.length,
            total_present: statusCount.Present,
            total_leaves: statusCount.Absent
        },
        data: formattedData
    });
  } catch (error) {
    console.error("getAllAttendance Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(
      "SELECT id, name, work_email, created_at, permissions FROM admins ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Fetch Admins Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, work_email, password, permissions } = req.body;
    if (!name || !work_email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const [existing] = await pool.query("SELECT id FROM admins WHERE work_email = ?", [work_email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const permsStr = permissions ? JSON.stringify(permissions) : "[]";

    await pool.query(
      "INSERT INTO admins (name, work_email, password, permissions) VALUES (?, ?, ?, ?)",
      [name, work_email, password, permsStr]
    );
    res.status(201).json({ success: true, message: "Admin created successfully" });
  } catch (error) {
    console.error("Create Admin Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id, permissions } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Admin ID is required" });
    }
    
    const permsStr = permissions ? JSON.stringify(permissions) : "[]";
    
    await pool.query(
      "UPDATE admins SET permissions = ? WHERE id = ?",
      [permsStr, id]
    );
    
    res.status(200).json({ success: true, message: "Admin permissions updated" });
  } catch (error) {
    console.error("Update Admin Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "ID required" });

    // Prevent deleting the main admin
    if (id == 1) return res.status(400).json({ success: false, message: "Cannot delete the main admin" });

    await pool.query("DELETE FROM admins WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==========================================
// Holiday Management
// ==========================================

exports.addHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    if (!date || !name) {
      return res.status(400).json({ success: false, message: "Date and name are required" });
    }

    await pool.query(
      "INSERT INTO holidays (date, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
      [date, name]
    );

    res.status(201).json({ success: true, message: "Holiday added successfully" });
  } catch (error) {
    console.error("Add Holiday Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, name FROM holidays ORDER BY date ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get Holidays Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Holiday ID is required" });
    }

    await pool.query("DELETE FROM holidays WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Delete Holiday Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.bulkAddHolidays = async (req, res) => {
  try {
    let holidays = req.body.holidays;
    if (typeof holidays === 'string') {
      holidays = JSON.parse(holidays);
    }
    
    if (!holidays || !Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({ success: false, message: "No holidays provided" });
    }

    const values = holidays.map(h => [h.date, h.name]);
    
    // Bulk insert using multiple values
    await pool.query(
      "INSERT INTO holidays (date, name) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)",
      [values]
    );

    res.status(201).json({ success: true, message: `${holidays.length} holidays added successfully` });
  } catch (error) {
    console.error("Bulk Add Holidays Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==========================================
// Admin Leave Management
// ==========================================

exports.adminAddLeave = async (req, res) => {
  try {
    const { user_id, leavetype, fromdate, todate, totalleavedays, reasonforleave, request_status } = req.body;
    let uploadFile = null;
    if (req.file) {
      uploadFile = req.file.filename;
    }

    if (!user_id || !fromdate || !todate) {
      return res.status(400).json({ success: false, message: "User ID, from date, and to date are required" });
    }

    // Default to 'approved' since an admin is adding it
    const status = request_status || 'Approved';

    await pool.query(
      `INSERT INTO leave_requests (user_id, leavetype, fromdate, todate, totalleavedays, reasonforleave, request_status, created_at, upload) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [user_id, leavetype, fromdate, todate, totalleavedays, reasonforleave, status, uploadFile]
    );

    res.status(201).json({ success: true, message: "Leave added successfully for user" });
  } catch (error) {
    console.error("Admin Add Leave Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.addMonthlyEarnedLeave = async (req, res) => {
  try {
    const sql = `
      UPDATE users 
      SET earned_leave = IFNULL(earned_leave, 0) + 1.5 
      WHERE type = 'Employee'
    `;
    const [result] = await pool.query(sql);
    res.status(200).json({ 
      success: true, 
      message: `Successfully added 1.5 days to earned leave for ${result.affectedRows} employees!` 
    });
  } catch (error) {
    console.error('Error adding monthly leave:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

