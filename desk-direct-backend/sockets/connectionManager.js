const db = require('../dbServices'); // Ensure this path is correct

module.exports = (socket, io, userSocketMap) => {
    
    // EXPECT A FULL OBJECT, NOT JUST A STRING
    socket.on('join', async (userProfile) => {
        if (!userProfile || !userProfile.user_id) return;

        socket.userId = userProfile.user_id; 
        userSocketMap.set(userProfile.user_id, socket.id);
        
        // Pass the whole profile to Aarya's updated DB function
        await db.setUserOnline(userProfile, socket.id);
        
        const onlineUsers = await db.getOnlineRoster();
        io.emit('update_roster', onlineUsers); 
        console.log(`User ${userProfile.name} joined and roster updated.`);
    });

    socket.on('disconnect', async () => {
        if (socket.userId) {
            userSocketMap.delete(socket.userId);
            await db.setUserOffline(socket.userId);
            const onlineUsers = await db.getOnlineRoster();
            io.emit('update_roster', onlineUsers);
            console.log(`User ${socket.userId} left.`);
        }
    });
};

// module.exports = (socket, userSocketMap, redisClient) => {
//     // 1. Link Socket ID to User ID
//     socket.on('register', (userId) => {
//         userSocketMap.set(userId, socket.id);
//         socket.userId = userId; // Attach to the socket object for cleanup later

//         console.log(`User ${userId} registered with socket ${socket.id}`);

//         // 2. Broadcast globally via Redis
//         redisClient.publish('deskdirect_global_events', JSON.stringify({
//             event: 'user_joined',
//             userId: userId,
//             timestamp: Date.now()
//         }));
//     });

//     // 3. Handle Disconnects
//     socket.on('disconnect', () => {
//         if (socket.userId) {
//             userSocketMap.delete(socket.userId);
            
//             // Broadcast user_left globally
//             redisClient.publish('deskdirect_global_events', JSON.stringify({
//                 event: 'user_left',
//                 userId: socket.userId,
//                 timestamp: Date.now()
//             }));
            
//             console.log(`User ${socket.userId} disconnected`);
//         }
//     });
// };