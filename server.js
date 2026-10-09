const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
// require("./utils/cronJobs"); // Initialize cron jobs (DISABLED)

const http = require("http");
const { Server } = require("socket.io");
const pool = require("./config/db"); // Added db pool import


dotenv.config();
const app = express();
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Parse form-data with multer
app.use(bodyParser.json());

// Debugging middleware to log all requests
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} (originalUrl: ${req.originalUrl})`);
  next();
});

//  CREATE SERVER (instead of app.listen)
const server = http.createServer(app);

//  INIT SOCKET
const io = new Server(server, {
  cors: { origin: "*" }
});

// ================= SOCKET LOGIC =================
let activeUsers = {};

function toTimeString(dateObj) {
  if (!dateObj) return null;
  // Adjust to local time format HH:MM:SS
  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  const s = String(dateObj.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // START (sign_in)
  socket.on("user_login_detail_start", (data) => {
    const { user_id } = data;

    activeUsers[user_id] = {
      socketId: socket.id,
      sign_in: new Date()
    };

    console.log("Login start:", user_id);
  });

  // UPDATE (optional)
  socket.on("user_login_detail_update", (data) => {
    console.log("User active:", data.user_id);
  });

  // END (sign_out + save DB)
  socket.on("user_login_detail_end", async (data) => {
    const { user_id } = data;

    if (activeUsers[user_id]) {
      const sign_in = toTimeString(activeUsers[user_id].sign_in);
      const sign_out = toTimeString(new Date());

      await pool.query(
        `INSERT INTO user_login_details (user_id, sign_in, sign_out, date)
         VALUES (?, ?, ?, CURDATE())`,
        [user_id, sign_in, sign_out]
      );

      delete activeUsers[user_id];
      console.log("Login end:", user_id);
    }
  });

  // AUTO DISCONNECT
  socket.on("disconnect", async () => {
    const userEntry = Object.entries(activeUsers).find(
      ([_, val]) => val.socketId === socket.id
    );

    if (userEntry) {
      const [user_id, userData] = userEntry;

      const sign_in = toTimeString(userData.sign_in);
      const sign_out = toTimeString(new Date());

      await pool.query(
        `INSERT INTO user_login_details (user_id, sign_in, sign_out, date)
         VALUES (?, ?, ?, CURDATE())`,
        [user_id, sign_in, sign_out]
      );

      delete activeUsers[user_id];
    }
  });
});

///////////////////////route logic//////////////////
// User Routes
app.use("/api/users", userRoutes);

// admin Routes
app.use("/api/admin", adminRoutes);

// Use IISNode-compatible port
const port = process.env.PORT || 5054;

//app.listen(port, () => {
 // console.log(`Server running on port ${port}`);
//});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});