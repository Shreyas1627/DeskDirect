const { Pool } = require('pg');
const { createClient } = require('redis');

// 1. PostgreSQL Connection
const pool = new Pool({
    user: 'root',
    host: 'localhost',
    database: 'mdmminiproject',
    password: 'root', // Make sure this matches your actual local password
    port: 5432,
});

// 2. Redis Connection
const redisClient = createClient();
redisClient.on('error', err => console.log('Redis Error', err));
redisClient.connect();

// ─── THE MAGIC HAPPENS HERE ───────────────────────────────────────
const setUserOnline = async (userProfile, socketId) => {
    try {
        // STEP A: Save to PostgreSQL (Permanent Storage for pgAdmin)
        const query = `
            INSERT INTO users (user_id, name, department, desk_number, avatar_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE 
            SET name = EXCLUDED.name, 
                department = EXCLUDED.department,
                desk_number = EXCLUDED.desk_number,
                avatar_url = EXCLUDED.avatar_url;
        `;
        const values = [
            userProfile.user_id, 
            userProfile.name || 'Unknown', 
            userProfile.department || 'General', 
            userProfile.desk_number || 'N/A', 
            userProfile.avatar_url || ''
        ];
        
        // Execute the SQL Query
        await pool.query(query, values);
        console.log(`✅ Saved ${userProfile.name} to PostgreSQL!`);

        // STEP B: Save to Redis (High-Speed Memory for WebRTC Routing)
        const dataToStore = { ...userProfile, socketId };
        await redisClient.hSet('online_users', String(userProfile.user_id), JSON.stringify(dataToStore));
        
    } catch (err) {
        console.error("Database Error in setUserOnline:", err.message);
    }
};

const setUserOffline = async (userId) => {
    await redisClient.hDel('online_users', String(userId));
};

// 3. Fetch Roster (Pulling from Redis is much faster for real-time UIs)
const getOnlineRoster = async () => {
    const usersData = await redisClient.hGetAll('online_users');
    if (!usersData) return [];
    
    return Object.values(usersData).map(data => JSON.parse(data));
};

// 4. Socket Lookup for Signaling
const getSocketIdByUserId = async (userId) => {
    const data = await redisClient.hGet('online_users', String(userId));
    if (data) {
        return JSON.parse(data).socketId;
    }
    return null;
};

module.exports = {
    setUserOnline,
    setUserOffline,
    getOnlineRoster,
    getSocketIdByUserId,
    redisClient 
};



// const { Pool } = require('pg');
// const { createClient } = require('redis');


// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'mdmminiproject',
//     password: 'postgres', 
//     port: 5432,
// });

// const redisClient = createClient();
// redisClient.on('error', err => console.log('Redis Error', err));
// redisClient.connect();




// const setUserOnline = async (userProfile, socketId) => {
//     // Combine the profile from the frontend with their active socket ID
//     const dataToStore = { ...userProfile, socketId };
//     await redisClient.hSet('online_users', String(userProfile.user_id), JSON.stringify(dataToStore));
// };

// const setUserOffline = async (userId) => {
//     await redisClient.hDel('online_users', String(userId));
// };



// // 2. Fetch everything directly from Redis (Bypass Postgres entirely!)
// const getOnlineRoster = async () => {
//     const usersData = await redisClient.hGetAll('online_users');
//     if (!usersData) return [];
    
//     // Parse the JSON strings back into objects for the frontend
//     return Object.values(usersData).map(data => JSON.parse(data));
// };



// // 3. Extract the socketId from the JSON string for Harsh's signaling
// const getSocketIdByUserId = async (userId) => {
//     const data = await redisClient.hGet('online_users', String(userId));
//     if (data) {
//         return JSON.parse(data).socketId;
//     }
//     return null;
// };


// module.exports = {
//     setUserOnline,
//     setUserOffline,
//     getOnlineRoster,
//     getSocketIdByUserId,
//     redisClient 
// };