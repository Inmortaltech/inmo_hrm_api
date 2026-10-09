const pool = require("../config/db");
const bcrypt = require("bcrypt");

 

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        status: "false"
      });
    }
	
    const [users] = await pool.query(
      "SELECT * FROM users WHERE work_email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.json({ 
        message: "Invalid credentials", 
        status: "false" 
      });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ 
        message: "Invalid credentials", 
        status: "false" 
      });
    }

    // Build profile image
    let image_url = null;
    if (user.profile_url) {
      image_url = `http://72.61.239.7:5054${user.profile_url}`;
    }
	
		const [result] = await pool.query(
		  "UPDATE users SET is_logged_in = 1 WHERE id = ?",
		  [user.id]
		);

    // Success response
    return res.json({
      userid: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      type: user.type,
      profiletype: user.profile_type,
      profileimage: image_url,
      status: "true",
      message: "Login Successfully!"
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { user_id } = req.body;
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
      WHERE u.id = ?
    `;
    const [rows] = await pool.query(query, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
	
    const user = rows[0];
    // Build full URL for profile image
    const baseUrl = `${req.protocol}://${req.get("host")}`; 
    const profileImageUrl = `${baseUrl}${user.profile_url}` 
      ? `${baseUrl}${user.profile_url}` 
      : null;

    // Success response
    return res.status(200).json({
      userid: user.id,
      first_name: user.first_name,
      last_name:  user.last_name,
      profiletype: user.profile_type,
      profileimage: profileImageUrl, 
      dob: user.dob,
      gender: user.gender,
      marital_status: user.marital_status,
      blood: user.blood_group,
      work_email: user.work_email,
      contact_number: user.contact_number,
      personal_email: user.personal_email,
      emergency_contact_name: user.emergency_contact_name,
      relation_with_emergency: user.relation_with_emergency,
      emergency_contact_no:user.emergency_contact_no,
      casual_leave: Number(user.casual_leave) || 0,
      earned_leave: Number(user.earned_leave) || 0,
      casual_leave_text: `${Math.max(0, (Number(user.casual_leave) || 0) - (Number(user.used_casual_leave) || 0))} Left / ${Number(user.casual_leave) || 0} Total`,
      earned_leave_text: `${Math.max(0, (Number(user.earned_leave) || 0) - (Number(user.used_earned_leave) || 0))} Left / ${Number(user.earned_leave) || 0} Total`
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      gender,
      marital_status,
      blood_group,
      work_email,
      personal_email,
      emergency_contact_name,
      relation_with_them,
      emergency_contact_no,
      type,
      profile_type,
      user_id
    } = req.body;

    let profile_url = null;
    if (req.file) {
      profile_url = `/uploads/${req.file.filename}`;
    }
     console.log(profile_url,"profile_url");
    let fields = [];
    let values = [];

    // Add fields dynamically
    if (first_name) { fields.push("first_name = ?"); values.push(first_name); }
    if (last_name) { fields.push("last_name = ?"); values.push(last_name); }
    if (dob) { fields.push("dob = ?"); values.push(dob); }
    if (gender) { fields.push("gender = ?"); values.push(gender); }
    if (marital_status) { fields.push("marital_status = ?"); values.push(marital_status); }
    if (blood_group) { fields.push("blood_group = ?"); values.push(blood_group); }
    if (work_email) { fields.push("work_email = ?"); values.push(work_email); }
    if (personal_email) { fields.push("personal_email = ?"); values.push(personal_email); }
    if (emergency_contact_name) { fields.push("emergency_contact_name = ?"); values.push(emergency_contact_name); }
    if (relation_with_them) { fields.push("relation_with_them = ?"); values.push(relation_with_them); }
    if (emergency_contact_no) { fields.push("emergency_contact_no = ?"); values.push(emergency_contact_no); }
    if (type) { fields.push("type = ?"); values.push(type); }
    if (profile_type) { fields.push("profile_type = ?"); values.push(profile_type); }

    if (profile_url) {
      fields.push("profile_url = ?");
      values.push(profile_url);
    }

    values.push(user_id);

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await pool.query(sql, values);
    console.log("result", result);
    const imagevalue = `http://72.61.239.7:5054${profile_url}`;
    res.status(200).json({ 
			message: "User updated successfully", 
			'name':	`${first_name} ${last_name}`.trim(),
			'profile_url': imagevalue,
			status: true,
	});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

exports.logout = async (req, res) => {
	try {
		const { user_id } = req.body;  
		if (!user_id) {
		  return res.status(400).json({ message: "user_id is required" });
		}
		const [result] = await pool.query(
			  "UPDATE users SET is_logged_in = 0 WHERE id = ?",
			  [user_id]
		);

		if (result.affectedRows === 0) {
		   return res.status(404).json({ message: "User not found", status: "false" });
		}
       return res.status(200).json({ message: "Logout Successful!", status: "true" });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "failed", error: error.message})
	}
}


exports.userLoginDetail = async (req, res) => {
  try {
    const { user_id, sign_in, sign_out, date } = req.body;

    // =========================
    //  INPUT VALIDATION
    // =========================
    if (!user_id || !date) {
      return res.status(400).json({
        message: "user_id and date are required",
        status: "false"
      });
    }

    // =========================
    //  RATE LIMITING: 60s cooldown between punches
    // =========================
    const [lastAction] = await pool.query(
      `SELECT created_at FROM user_login_details 
       WHERE user_id = ? AND date = ? 
       ORDER BY id DESC LIMIT 1`,
      [user_id, date]
    );

    if (lastAction.length > 0) {
      const lastTime = new Date(lastAction[0].created_at);
      const now = new Date();
      const diffSeconds = (now - lastTime) / 1000;
      if (diffSeconds < 60) {
        return res.status(200).json({
          message: "Please wait before punching again.",
          status: "false"
        });
      }
    }

    // =========================
    //  CASE 1: BOTH PROVIDED
    // =========================
    if (sign_in && sign_in !== "00:00:00" && sign_out && sign_out !== "00:00:00") {
      // Validate sign_out is after sign_in
      if (sign_out <= sign_in) {
        return res.status(200).json({
          message: "Sign out time must be after sign in time.",
          status: "false"
        });
      }

      await pool.query(
        `INSERT INTO user_login_details (user_id, sign_in, sign_out, date) 
         VALUES (?, ?, ?, ?)`,
        [user_id, sign_in, sign_out, date]
      );
      return res.status(201).json({
        message: "Data Save Successfully!",
        status: "true"
      });
    }

    // =========================
    //  CASE 2: PUNCH OUT ONLY
    // =========================
    if (sign_out && (!sign_in || sign_in === "00:00:00")) {
      // Find the latest open punch for today
      const [openPunch] = await pool.query(
        `SELECT id FROM user_login_details 
         WHERE user_id = ? AND DATE(date) = DATE(?) AND (sign_out IS NULL OR sign_out = '00:00:00' OR sign_out = '') 
         ORDER BY id DESC LIMIT 1`,
        [user_id, date]
      );

      if (openPunch.length === 0) {
        return res.status(200).json({
          message: "Please Punch In first!",
          status: "false"
        });
      }

      // Update the open punch with the sign_out time
      await pool.query(
        `UPDATE user_login_details SET sign_out = ? WHERE id = ?`,
        [sign_out, openPunch[0].id]
      );

      return res.status(201).json({
        message: "Punch Out saved successfully!",
        status: "true"
      });
    }

    // =========================
    //  CASE 3: PUNCH IN ONLY
    // =========================
    if (sign_in && sign_in !== "00:00:00") {
      // Prevent duplicate punch-in: check if user already has an open session today
      const [existingOpen] = await pool.query(
        `SELECT id FROM user_login_details 
         WHERE user_id = ? AND DATE(date) = DATE(?) AND (sign_out IS NULL OR sign_out = '00:00:00' OR sign_out = '') 
         ORDER BY id DESC LIMIT 1`,
        [user_id, date]
      );

      if (existingOpen.length > 0) {
        return res.status(200).json({
          message: "Already punched in! Please punch out first.",
          status: "false"
        });
      }

      // Insert new paired record (sign_out defaults to NULL)
      await pool.query(
        `INSERT INTO user_login_details (user_id, sign_in, date) 
         VALUES (?, ?, ?)`,
        [user_id, sign_in, date]
      );

      return res.status(201).json({
        message: "Data Save Successfully!",
        status: "true"
      });
    }

    return res.status(400).json({
      message: "Invalid punch data",
      status: "false"
    });
    
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Failed!",
      error: error.message
    });
  }
};

////////////////////////user login get backup//////////////////////////

exports.getLoginDetail = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Step 0: Check user exists or not
    const [userCheck] = await pool.query(
      `SELECT id FROM users WHERE id = ?`,
      [user_id]
    );

    if (userCheck.length === 0) {
      return res.status(200).json({
        user_id,
        is_user: "User Not Exist",
        date: null,
        sign_in: "-",
        sign_out: "-",
        total_hours: "00:00:00",
        intervals: [],
        status: "Absent",
      });
    }

    const [rows] = await pool.query(
      `SELECT sign_in, sign_out, DATE(date) as login_date
       FROM user_login_details
       WHERE user_id = ? AND DATE(date) = CURDATE()
       ORDER BY id ASC`,
      [user_id]
    );

    if (!rows.length) {
      return res.status(200).json({
        user_id,
        is_user: "User Exist",
        date: null,
        sign_in: "-",
        sign_out: "-",
        total_hours: "00:00:00",
        intervals: [],
        status: "Absent",
      });
    }

    const toSeconds = (time) => {
      if (!time || time === "00:00:00") return null;
      const [h, m, s] = time.split(":").map(Number);
      return h * 3600 + m * 60 + (s || 0);
    };

    const formatSeconds = (secs) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const toAmPm = (time) => {
      if (!time || time === "00:00:00" || time === "-") return "-";
      const parts = time.toString().split(":");
      if (parts.length < 2) return "-";
      const [h, m, s = "00"] = parts.map(Number);
      if (isNaN(h) || isNaN(m)) return "-";

      let period = "AM";
      let hour = h;

      if (h === 0) hour = 12;
      else if (h === 12) period = "PM";
      else if (h > 12) {
        hour = h - 12;
        period = "PM";
      }

      return `${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ${period}`;
    };

    let totalSeconds = 0;
    const intervals = [];

    // Because of the new paired architecture, each row is a valid punch-in/out interval
    for (const row of rows) {
      const inSec = toSeconds(row.sign_in);
      let outTime = "-";
      
      if (row.sign_out && row.sign_out !== "00:00:00") {
        outTime = row.sign_out;
        const outSec = toSeconds(row.sign_out);
        if (inSec !== null && outSec !== null && outSec > inSec) {
          totalSeconds += (outSec - inSec);
        }
      } else {
        const now = new Date();
        const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        if (inSec !== null && currentSec > inSec) {
          totalSeconds += (currentSec - inSec);
        }
      }
      
      if (row.sign_in && row.sign_in !== "00:00:00") {
        intervals.push({
          sign_in: row.sign_in,
          sign_out: outTime
        });
      }
    }

    const firstSignIn = intervals.length > 0 ? intervals[0].sign_in : "-";
    const lastSignOut = intervals.length > 0 ? intervals[intervals.length - 1].sign_out : "-";

    // Attendance Status logic
    let status = "Absent";
    let attendance_type = "Absent"; // substatus: On Time / Late / Half Day

    if (firstSignIn !== "-") {
      const firstSignInSec = toSeconds(firstSignIn);
      const limitLate = 10 * 3600 + 15 * 60; // 10:15 AM
      const limitHalfDay = 14 * 3600 + 30 * 60; // 2:30 PM (14:30)

      if (firstSignInSec > limitHalfDay) {
        attendance_type = "Half Day";
      } else if (firstSignInSec > limitLate) {
        attendance_type = "Late";
      } else {
        attendance_type = "On Time";
      }

      status = attendance_type;
    }

    return res.status(200).json({
      user_id,
      is_user: "User Exist",
      date: rows[0].login_date,
      sign_in: toAmPm(firstSignIn),
      sign_out: toAmPm(lastSignOut),
      total_hours: formatSeconds(totalSeconds),
      intervals: intervals.map((i) => ({
        sign_in: toAmPm(i.sign_in),
        sign_out: toAmPm(i.sign_out),
      })),
      status
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Failed!",
      error: error.message
    });
  }
};

exports.getUserAttendance = async (req, res) => {
  try {
    let { user_id, month, status: statusFilter } = req.body;

    if (!user_id || !month) {
      return res.status(400).json({ message: "user_id and month are required" });
    }

    // Step 1: Fetch punch_in/punch_out per day
    const [rows] = await pool.query(
      `SELECT 
         DATE(date) AS login_date,
         MIN(NULLIF(NULLIF(sign_in, ''), '00:00:00')) AS punch_in,
         MAX(NULLIF(NULLIF(sign_out, ''), '00:00:00')) AS punch_out
       FROM user_login_details
       WHERE user_id = ?
         AND MONTH(date) = ?
         AND YEAR(date) = YEAR(CURDATE())
       GROUP BY DATE(date)
       ORDER BY login_date desc`,
      [user_id, month]
    );

    // Step 2: Calculate status per day
  let formattedData = rows.map(row => {
  let status = 'Absent';

  if (row.punch_in) {

    //  Case 1: punch_in 
    //if (!row.punch_out) {
     // status = 'Half Day';
    //} else {
      const punchIn = new Date(`1970-01-01T${row.punch_in}Z`);
      const punchOut = new Date(`1970-01-01T${row.punch_out}Z`);
      let diffHours = (punchOut - punchIn) / (1000 * 60 * 60);

     //if (diffHours < 4) {
    if(row.punch_in > '12:15:00'){
          status = 'Half Day';
        } else if (row.punch_in > '10:15:00' && row.punch_in < '12:15:00') {
          status = 'Late';
        } else {
          status = 'Present';
        }
      //}
    }

    return {
      ...row,
      login_date: new Date(row.login_date).toLocaleDateString('en-CA'),
      status
    };
  });

    // Step 3: Apply optional status filter
   // function to normalize status
  const normalizeStatus = (str) => {
    return String(str)
      .toLowerCase()
      .replace(/[\s_]/g, ""); // remove space & underscore
  };

  // Step 3: Apply optional status filter
  if (
    statusFilter &&
    String(statusFilter).trim() !== "" &&
    String(statusFilter).toLowerCase() !== "null"
  ) {
    const normalizedFilter = normalizeStatus(statusFilter);

    formattedData = formattedData.filter(
      d => normalizeStatus(d.status) === normalizedFilter
    );
  }

    return res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.monthWiseStatus = async (req, res) => {
  try {
    let { user_id, month } = req.body;

    if (!user_id || !month) {
      return res.status(400).json({ message: "user_id and month are required" });
    }

    // Step 1: Fetch all days data for the month
    const [rows] = await pool.query(
      `SELECT 
         DATE(date) AS login_date,
         MIN(NULLIF(NULLIF(sign_in, ''), '00:00:00')) AS punch_in,
         MAX(NULLIF(NULLIF(sign_out, ''), '00:00:00')) AS punch_out
       FROM user_login_details
       WHERE user_id = ?
         AND MONTH(date) = ?
         AND YEAR(date) = YEAR(CURDATE())
       GROUP BY DATE(date)
       ORDER BY login_date ASC`,
      [user_id, month]
    );

    // Step 2: Initialize counters
    let statusCount = {
      Present: 0,
      Late: 0,
      'Half Day': 0,
      Absent: 0
    };

    // Step 3: Calculate status per day and count
    rows.forEach(row => {
      let status = 'Absent'; // default

      if (row.punch_in) {

    //  Case 1: punch_in 
    //if (!row.punch_out) {
      //status = 'Half Day';
    //} else {
      const punchIn = new Date(`1970-01-01T${row.punch_in}Z`);
      const punchOut = new Date(`1970-01-01T${row.punch_out}Z`);
      let diffHours = (punchOut - punchIn) / (1000 * 60 * 60);

      //if (diffHours < 4) {
       // status = 'Half Day';
      //} else if (row.punch_in > '10:15:00') {
	if(row.punch_in > '12:15:00'){
        status = 'Half Day';
      } else if (row.punch_in > '10:15:00' && row.punch_in < '12:15:00') {
        status = 'Late';
      } else {
        status = 'Present';
      }
    //}
  }
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Step 4: Add Late + Half Day into Present
    statusCount.Present =
      (statusCount.Present || 0) +
      (statusCount.Late || 0) +
      (statusCount['Half Day'] || 0);

    return res.json({
      success: true,
      data: statusCount
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Save leave request
exports.saveLeaveRequest = async (req, res) => {
    try {
        const { user_id, leavetype, fromdate, todate, totalleavedays, reasonforleave } = req.body;

        // Get uploaded file name (or path)
        const upload = req.file ? req.file.filename : null;

        // Insert into table
        const [result] = await pool.query(
            `INSERT INTO leave_requests 
            (user_id, leavetype, fromdate, todate, totalleavedays, reasonforleave, request_status, upload) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, leavetype, fromdate, todate, totalleavedays, reasonforleave, 'pending', upload]
        );

        res.status(200).json({
            success: true,
            message: 'Leave request saved successfully',
            insertId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

exports.getLeaveRequest = async (req, res) => {
    try {
        let { type, user_id } = req.body;
        let query = '';
        let params = [];

        // ====== Build main query based on type ======
        if (!type || type.toLowerCase() === 'all') {
            query = `SELECT 
                        *,
                        DATE_FORMAT(fromdate, '%Y-%m-%d') AS fromdate,
                        DATE_FORMAT(todate, '%Y-%m-%d') AS todate
                     FROM leave_requests 
                     WHERE user_id = ? 
                     ORDER BY created_at DESC`;
            params = [user_id];
        } else if (Array.isArray(type)) {
            const placeholders = type.map(() => '?').join(',');
            query = `SELECT 
                        *,
                        DATE_FORMAT(fromdate, '%Y-%m-%d') AS fromdate,
                        DATE_FORMAT(todate, '%Y-%m-%d') AS todate
                     FROM leave_requests 
                     WHERE user_id = ? 
                     AND leavetype IN (${placeholders}) 
                     ORDER BY created_at DESC`;
            params = [user_id, ...type];
        } else {
            query = `SELECT 
                        *,
                        DATE_FORMAT(fromdate, '%Y-%m-%d') AS fromdate,
                        DATE_FORMAT(todate, '%Y-%m-%d') AS todate
                     FROM leave_requests 
                     WHERE user_id = ? 
                     AND leavetype = ? 
                     ORDER BY created_at DESC`;
            params = [user_id, type];
        }
        const [rows] = await pool.query(query, params);
		
      // Add full file URL
      const updatedRows = rows.map(row => {
          return {
              ...row,
              request_status: row.request_status
                  ? row.request_status.charAt(0).toUpperCase() + row.request_status.slice(1)
                  : row.request_status,
              upload_url: row.upload
                  ? `${req.protocol}://${req.get('host')}/uploads/${row.upload}`
                  : null
          };
      });

        // ===== Get counts =====
        // const [countRows] = await pool.query(
        //     `SELECT 
        //         SUM(CASE WHEN leavetype = 'Casual Leave' THEN 1 ELSE 0 END) AS casual_leave,
        //         SUM(CASE WHEN leavetype = 'Earned Leave' THEN 1 ELSE 0 END) AS earned_leave
        //      FROM leave_requests
        //      WHERE user_id = ?`,
        //     [user_id]
        // );

        // const totalCasual = 10;
        // const totalEarned = 10;

        // const counts = {
        //     casual_leave: `${countRows[0].casual_leave || 0}/${totalCasual}`,
        //     earned_leave: `${countRows[0].earned_leave || 0}/${totalEarned}`
        // };

        const [countRows] = await pool.query(
        `SELECT
            COALESCE(SUM(
                CASE
                    WHEN leavetype = 'Casual Leave'
                    THEN totalleavedays
                    ELSE 0
                END
            ), 0) AS casual_leave,

            COALESCE(SUM(
                CASE
                    WHEN leavetype = 'Earned Leave'
                    THEN totalleavedays
                    ELSE 0
                END
            ), 0) AS earned_leave

        FROM leave_requests
        WHERE user_id = ?`,
        [user_id]
    );

    const [userRows] = await pool.query("SELECT casual_leave, earned_leave FROM users WHERE id = ?", [user_id]);
    const totalCasual = userRows[0] ? (Number(userRows[0].casual_leave) || 0) : 0;
    const totalEarned = userRows[0] ? (Number(userRows[0].earned_leave) || 0) : 0;

    const usedCasual = Number(countRows[0].casual_leave) || 0;
    const usedEarned = Number(countRows[0].earned_leave) || 0;

    const counts = {
        casual_leave: `${usedCasual}/${totalCasual}`,
        earned_leave: `${usedEarned}/${totalEarned}`
    };
      

        res.status(200).json({
            success: true,
            data: updatedRows,
            counts: counts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};


////save pay slips//
// exports.savePaySlip = async (req, res) => {
//     try {
//         const { user_id, from_date, to_date, request_status } = req.body;
//         // Insert into pay_slips table
//         const [result] = await pool.query(
//             `INSERT INTO pay_slips 
//             (user_id, from_date, to_date, request_status, created_at) 
//             VALUES (?, ?, ?, ?, NOW())`,
//             [user_id || null, from_date || null, to_date || null, request_status || 'pending']
//         );

//         res.status(200).json({
//             success: true,
//             message: 'Pay slip saved successfully',
//             insertId: result.insertId
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Something went wrong' });
//     }
// };


exports.savePaySlip = async (req, res) => {
    try {
        const { user_id, from_date, to_date, request_status } = req.body;

        // Required validation
        if (!user_id || !from_date || !to_date) {
            return res.status(400).json({
                success: false,
                message: "user_id, from_date and to_date are required"
            });
        }

        // Date validation
        if (new Date(from_date) > new Date(to_date)) {
            return res.status(400).json({
                success: false,
                message: "from_date cannot be greater than to_date"
            });
        }

        // Check existing payslip for same user and overlapping date
        const [existingPaySlip] = await pool.query(
            `SELECT id, from_date, to_date
             FROM pay_slips
             WHERE user_id = ?
             AND from_date <= ?
             AND to_date >= ?
             LIMIT 1`,
            [user_id, to_date, from_date]
        );

        if (existingPaySlip.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Pay slip already taken for this date range",
                data: existingPaySlip[0]
            });
        }

        // Insert
        const [result] = await pool.query(
            `INSERT INTO pay_slips
            (user_id, from_date, to_date, request_status, created_at)
            VALUES (?, ?, ?, ?, NOW())`,
            [
                user_id,
                from_date,
                to_date,
                request_status || "pending"
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Pay slip saved successfully",
            insertId: result.insertId
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};




// Save Notification
exports.saveNotification = async (req, res) => {
    try {
        const { user_id, title, message } = req.body;

        // Insert into notifications table
        const [result] = await pool.query(
            `INSERT INTO notifications 
            (user_id, title, message, date, created_at) 
            VALUES (?, ?, ?, CURDATE(), NOW())`,
            [user_id || null, title || null, message || null]
        );

        res.status(200).json({
            success: true,
            message: 'Notification saved successfully',
            insertId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};




exports.getNotification = async (req, res) => {
    try {
        const { status } = req.body; // status = today | all | week | month
        // Select only columns you want to return
        let query = `SELECT id, user_id, title, message, created_at FROM notifications WHERE is_deleted = 0`;
        let params = [];

        if (status === "today") {
            query += ` AND DATE(CONVERT_TZ(date, '+00:00', '+05:30')) = CURDATE()`;
        } else if (status === "week") {
            query += ` AND YEARWEEK(CONVERT_TZ(date, '+00:00', '+05:30'), 1) = YEARWEEK(CURDATE(), 1)`;
        } else if (status === "month") {
            query += ` AND YEAR(CONVERT_TZ(date, '+00:00', '+05:30')) = YEAR(CURDATE()) 
                       AND MONTH(CONVERT_TZ(date, '+00:00', '+05:30')) = MONTH(CURDATE())`;
        } 
        // "all" will just return everything (no filter)

        query += ` ORDER BY created_at DESC`;

        const [rows] = await pool.query(query, params);

        if (rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No notifications found for this filter"
            });
        }

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};


// Update password_request to 'pending'
exports.resetPasswordRequest = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ success: false, message: "user_id is required" });
        }

        // Update query
        const [result] = await pool.query(
            `UPDATE users 
             SET password_request = 'pending' 
             WHERE id = ?`,
            [user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Reset Password Rquest Send Successfully!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

exports.getNetworks = async (req, res) => {
  try {
    const query = "SELECT * FROM networks";

    const [rows] = await pool.query(query);

    return res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "DB Error",
      error: error.message
    });
  }
};




// exports.getPayslipStatus = async (req, res) => {
//   try {
//     const { user_id } = req.body;

//     // 1. Validate input
//     if (!user_id) {
//       return res.json({
//         status: false,
//         message: "user_id is required"
//       });
//     }

//     //  Base URL (auto detect)
//     const baseUrl = req.protocol + "://" + req.get("host");

//     // 2. Check payslip request
//     const [rows] = await pool.query(
//       `SELECT slip_url, request_status 
//        FROM pay_slips 
//        WHERE user_id = ? 
//        ORDER BY id DESC 
//        LIMIT 1`,
//       [user_id]
//     );

//     // 3. If no record found
//     if (rows.length === 0) {
//       return res.json({
//         status: false,
//         message: "Payslip not requested"
//       });
//     }

//     const payslip = rows[0];

//     // 4. Check status (case-insensitive)
//     if (payslip.request_status && payslip.request_status.toLowerCase() === 'approved') {

//       let fullUrl = null;

//     if (payslip.slip_url) {
//       let cleanPath = payslip.slip_url.replace(/\\/g, "/"); // fix here

//       // remove extra slash if already starts with /
//       cleanPath = cleanPath.replace(/^\/+/, "");

//       if (cleanPath.startsWith('http')) {
//         fullUrl = cleanPath;
//       } else {
//         fullUrl = `${baseUrl}/${cleanPath}`;
//       }
//     }

//       return res.json({
//         status: true,
//         url: fullUrl || "URL not available"
//       });

//     } else {
//       return res.json({
//         status: false,
//         message: "Payslip not requested"
//       });
//     }

//   } catch (error) {
//     console.error(error);
//     return res.json({
//       status: false,
//       message: "Something went wrong"
//     });
//   }
// };

exports.getPayslipStatus = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.json({
                status: false,
                message: "user_id is required"
            });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const [rows] = await pool.query(
            `SELECT slip_url, request_status
             FROM pay_slips
             WHERE user_id = ?
             ORDER BY id DESC
             LIMIT 1`,
            [user_id]
        );

        // No payslip request
        if (rows.length === 0) {
            return res.json({
                status: false,
                message: "Payslip not requested"
            });
        }

        const payslip = rows[0];

        const requestStatus = (payslip.request_status || "").toLowerCase();

        // Pending
        if (requestStatus === "pending") {
            return res.json({
                status: false,
                request_status: "pending",
                message: "Payslip request is pending"
            });
        }

        // Rejected
        if (requestStatus === "rejected") {
            return res.json({
                status: false,
                request_status: "rejected",
                message: "Payslip request was rejected"
            });
        }

        // Approved
        if (requestStatus === "approved") {

            let fullUrl = null;

            if (payslip.slip_url) {
                let cleanPath = payslip.slip_url.replace(/\\/g, "/");

                cleanPath = cleanPath.replace(/^\/+/, "");

                if (cleanPath.startsWith("http")) {
                    fullUrl = cleanPath;
                } else {
                    fullUrl = `${baseUrl}/${cleanPath}`;
                }
            }

            return res.json({
                status: true,
                request_status: "approved",
                url: fullUrl || "URL not available"
            });
        }

        // Unknown status
        return res.json({
            status: false,
            request_status: requestStatus,
            message: "Invalid payslip status"
        });

    } catch (error) {
        console.error("Get Payslip Status Error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};

// ==========================================
// Holiday Endpoints
// ==========================================

exports.getHolidays = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, name FROM holidays ORDER BY date ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get Holidays Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==========================================
// Leave Count Endpoint
// ==========================================

exports.getLeaveCount = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id is required" });
    }

    const [userRows] = await pool.query(
      `SELECT casual_leave, earned_leave FROM users WHERE id = ?`,
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const casualAllowed = parseFloat(userRows[0].casual_leave) || 0;
    const earnedAllowed = parseFloat(userRows[0].earned_leave) || 0;

    const [leaveRows] = await pool.query(
      `SELECT leavetype, request_status, SUM(totalleavedays) as total_days
       FROM leave_requests 
       WHERE user_id = ? 
       GROUP BY leavetype, request_status`,
      [user_id]
    );

    let casualUsed = 0;
    let earnedUsed = 0;
    let casualPending = 0;
    let earnedPending = 0;
    let otherLeavesUsed = 0;
    let otherLeavesPending = 0;

    leaveRows.forEach(row => {
      const type = row.leavetype;
      const status = String(row.request_status).toLowerCase();
      const days = parseFloat(row.total_days) || 0;

      if (type === 'Casual Leave') {
        if (status === 'approved') casualUsed += days;
        if (status === 'pending') casualPending += days;
      } else if (type === 'Earned Leave') {
        if (status === 'approved') earnedUsed += days;
        if (status === 'pending') earnedPending += days;
      } else {
        if (status === 'approved') otherLeavesUsed += days;
        if (status === 'pending') otherLeavesPending += days;
      }
    });

    const data = {
      casual_leave: {
        allowed: casualAllowed,
        used: casualUsed,
        pending: casualPending,
        remaining: Math.max(0, casualAllowed - casualUsed)
      },
      earned_leave: {
        allowed: earnedAllowed,
        used: earnedUsed,
        pending: earnedPending,
        remaining: Math.max(0, earnedAllowed - earnedUsed)
      },
      other_leaves: {
        used: otherLeavesUsed,
        pending: otherLeavesPending
      },
      raw_breakdown: leaveRows
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Leave Count Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};