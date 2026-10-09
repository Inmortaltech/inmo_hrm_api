// const cron = require('node-cron');
// const pool = require('../config/db');

// // Add 1.5 days to earned leave for all Employee accounts on the 1st of every month at Midnight
// // Schedule: '0 0 1 * *' -> At 00:00 on day-of-month 1
// cron.schedule('0 0 1 * *', async () => {
//   try {
//     console.log('Cron job started: Adding 1.5 days to earned_leave for Employees');
    
//     // Using IFNULL to handle cases where earned_leave might be NULL (defaulting to 0)
//     const sql = `
//       UPDATE users 
//       SET earned_leave = IFNULL(earned_leave, 0) + 1.5 
//       WHERE type = 'Employee'
//     `;
    
//     const [result] = await pool.query(sql);
    
//     console.log(`Cron job finished: Updated earned leave for ${result.affectedRows} employees.`);
//   } catch (error) {
//     console.error('Error executing cron job (Add Earned Leave):', error.message);
//   }
// });

// console.log('Cron jobs scheduler initialized.');
