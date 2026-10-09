//socketServer.js


const { Server } = require("socket.io");
const pool = require("./config/db"); // adjust path if needed

// store active users in memory
const activeUsers = {};

function getTime() {
    return new Date().toTimeString().split(" ")[0];
}

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket Connected:", socket.id);

        // -----------------------------
        // 🔹 Punch In
        // -----------------------------
        socket.on("punch_in", async (data) => {
            try {
                const { user_id } = data;

                socket.user_id = user_id; // store in socket

                activeUsers[user_id] = {
                    sign_in: getTime()
                };

                // check if already signed in
                const [latest] = await pool.query(
                    `SELECT * FROM user_login_details 
                     WHERE user_id = ? AND date = CURDATE()
                     ORDER BY id DESC LIMIT 1`,
                    [user_id]
                );

                if (latest.length > 0 && latest[0].sign_out === "00:00:00") {
                    console.log("Already signed in");
                    return;
                }

                // insert only once
                await pool.query(
                    `INSERT INTO user_login_details (user_id, sign_in, sign_out, date)
                     VALUES (?, ?, ?, CURDATE())`,
                    [user_id, getTime(), "00:00:00"]
                );

                console.log("Punch In Saved");
            } catch (err) {
                console.error("Punch In Error:", err);
            }
        });

        // -----------------------------
        //  Heartbeat (NO DB SAVE)
        // -----------------------------
        socket.on("userreq", (data) => {
            const { user_id } = data;

            if (activeUsers[user_id]) {
                activeUsers[user_id].last_seen = new Date();
            }
        });

        // -----------------------------
        //  Punch Out
        // -----------------------------
        socket.on("punch_out", async (data) => {
            try {
                const { user_id } = data;

                if (activeUsers[user_id]) {

                    await pool.query(
                        `UPDATE user_login_details 
                         SET sign_out = ? 
                         WHERE user_id = ? AND date = CURDATE()
                         ORDER BY id DESC LIMIT 1`,
                        [getTime(), user_id]
                    );

                    delete activeUsers[user_id];

                    console.log("Punch Out Saved");
                }
            } catch (err) {
                console.error("Punch Out Error:", err);
            }
        });

        // -----------------------------
        //  Auto Logout on Disconnect
        // -----------------------------
        socket.on("disconnect", async () => {
            try {
                const user_id = socket.user_id;

                if (user_id && activeUsers[user_id]) {
                    await pool.query(
                        `UPDATE user_login_details 
                         SET sign_out = ? 
                         WHERE user_id = ? AND date = CURDATE()
                         ORDER BY id DESC LIMIT 1`,
                        [getTime(), user_id]
                    );

                    delete activeUsers[user_id];

                    console.log("Auto Punch Out (Disconnect)");
                }
            } catch (err) {
                console.error("Disconnect Error:", err);
            }
        });

    });

    return io;
};