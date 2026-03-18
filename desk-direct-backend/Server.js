const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./dbServices'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"],
        allowedHeaders: ["ngrok-skip-browser-warning"] // <-- THIS IS THE MAGIC KEY!
    }
});

io.on('connection', (socket) => {
    // 1. When a user logs in
    socket.on('join', async (userProfile) => {
        if (!userProfile || !userProfile.user_id) return;
        
        socket.userId = userProfile.user_id; 
        await db.setUserOnline(userProfile, socket.id);
        
        const onlineUsers = await db.getOnlineRoster();
        io.emit('update_roster', onlineUsers); 
        console.log(`User ${userProfile.name} joined. Roster updated.`);
    });

    // 2. THE UNIVERSAL WEBRTC ROUTER
    // Automatically forwards ANY call state to the exact right person
    const signalingEvents = ['offer', 'answer', 'ice-candidate', 'end-call', 'call-rejected'];
    
    signalingEvents.forEach(eventName => {
        socket.on(eventName, async (data) => {
            const targetId = data.to || data.targetUserId;
            const targetSocketId = await db.getSocketIdByUserId(targetId);
            
            if (targetSocketId) {
                // Instantly forward the exact event to the target device
                io.to(targetSocketId).emit(eventName, { ...data, from: socket.userId });
            }
        });
    });

    // 3. When a user logs out or closes the tab
    socket.on('disconnect', async () => {
        if (socket.userId) {
            await db.setUserOffline(socket.userId);
            const onlineUsers = await db.getOnlineRoster();
            io.emit('update_roster', onlineUsers);
            console.log(`User ${socket.userId} went offline.`);
        }
    });
});

// --- UNIFIED MARKET DATA TICKER ---
// Broadcasts identical stock prices to all devices every 3 seconds
setInterval(() => {
    const unifiedMarketData = [
        { symbol: 'RELIANCE', price: (2800 + (Math.random() * 50 - 25)).toFixed(2), change: '+1.12%' },
        { symbol: 'TCS', price: (3900 + (Math.random() * 40 - 20)).toFixed(2), change: '+0.85%' },
        { symbol: 'HDFCBANK', price: (1700 + (Math.random() * 20 - 10)).toFixed(2), change: '-0.45%' },
        // Feel free to add more dummy stocks here for your presentation!
    ];
    io.emit('market_update', unifiedMarketData);
}, 3000);

// 4. Wipe the stale Redis cache on startup
const clearCacheAndStart = async () => {
    try {
        await db.redisClient.del('online_users');
        console.log('🧹 Cleared stale Redis ghost users.');
    } catch (err) {
        console.error('Failed to clear Redis:', err);
    }

    server.listen(3000, () => {
        console.log('DeskDirect Signaling Server is listening on port 3000');
    });
};

clearCacheAndStart();


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const db = require('./dbServices'); 

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: { origin: "*" }
// });

// io.on('connection', (socket) => {
//     // 1. When a user logs in
//     socket.on('join', async (userProfile) => {
//         if (!userProfile || !userProfile.user_id) return;
        
//         socket.userId = userProfile.user_id; 
//         await db.setUserOnline(userProfile, socket.id);
        
//         const onlineUsers = await db.getOnlineRoster();
//         io.emit('update_roster', onlineUsers); 
//         console.log(`User ${userProfile.name} joined. Roster updated.`);
//     });

//     // 2. THE WEBRTC ROUTER (Fixes the Silent Call!)
//     // Forwards the connection payloads to the exact right person
//     socket.on('offer', async (data) => {
//         const targetId = data.to || data.targetUserId;
//         const targetSocketId = await db.getSocketIdByUserId(targetId);
//         if (targetSocketId) io.to(targetSocketId).emit('offer', { ...data, from: socket.userId });
//     });

//     socket.on('answer', async (data) => {
//         const targetId = data.to || data.targetUserId;
//         const targetSocketId = await db.getSocketIdByUserId(targetId);
//         if (targetSocketId) io.to(targetSocketId).emit('answer', data);
//     });

//     socket.on('ice-candidate', async (data) => {
//         const targetId = data.to || data.targetUserId;
//         const targetSocketId = await db.getSocketIdByUserId(targetId);
//         if (targetSocketId) io.to(targetSocketId).emit('ice-candidate', data);
//     });

//     // 3. When a user logs out or closes the tab (Fixes Zombie Users!)
//     socket.on('disconnect', async () => {
//         if (socket.userId) {
//             await db.setUserOffline(socket.userId);
//             const onlineUsers = await db.getOnlineRoster();
//             io.emit('update_roster', onlineUsers);
//             console.log(`User ${socket.userId} went offline.`);
//         }
//     });
// });


// // --- ADD THIS TO THE VERY BOTTOM OF server.js ---

// // 4. Wipe the stale Redis cache on startup
// const clearCacheAndStart = async () => {
//     try {
//         await db.redisClient.del('online_users');
//         console.log('🧹 Cleared stale Redis ghost users.');
//     } catch (err) {
//         console.error('Failed to clear Redis:', err);
//     }

//     server.listen(3000, () => {
//         console.log('DeskDirect Signaling Server is listening on port 3000');
//     });
// };

// clearCacheAndStart();

// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// // Import Harsh's modular socket handlers
// const handleConnections = require('./sockets/connectionManager');
// const handleSignaling = require('./sockets/signaling');

// // Setup a basic Express app and HTTP server
// const app = express();
// const server = http.createServer(app);

// // Initialize Socket.io
// const io = new Server(server, {
//     cors: { origin: '*' } // Update this to match your frontend domain in production
// });

// // Centralized state: Maps User IDs to their current Socket IDs
// const userSocketMap = new Map();

// // Socket.io connection handler
// io.on('connection', (socket) => {
//     console.log(`New incoming connection: ${socket.id}`);

//     // FIXED: Injecting 'io' as the second parameter instead of redisClient
//     handleConnections(socket, io, userSocketMap);
//     handleSignaling(socket, io, userSocketMap);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`DeskDirect Signaling Server is listening on port ${PORT}`);
// });








// require('dotenv').config();
// const http = require('http');
// const { Server } = require('socket.io');

// const app = require('./app');
// const redisClient = require('./config/redisClient');
// const handleConnections = require('./sockets/connectionManager');
// const handleSignaling = require('./sockets/signaling');

// // Create HTTP server wrapping the Express app
// const server = http.createServer(app);

// // Initialize Socket.io
// const io = new Server(server, {
//     cors: { origin: '*' } // Update this to match your frontend domain in production
// });

// // Centralized state: Maps User IDs to their current Socket IDs
// const userSocketMap = new Map();

// // Socket.io connection handler
// io.on('connection', (socket) => {
//     console.log(`New incoming connection: ${socket.id}`);

//     // Inject dependencies into our modular handlers
//     handleConnections(socket, userSocketMap, redisClient);
//     handleSignaling(socket, io, userSocketMap);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`DeskDirect Signaling Server is listening on port ${PORT}`);
// });