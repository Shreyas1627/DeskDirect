module.exports = (socket, io, userSocketMap) => {
    // Relay Offer
    socket.on('offer', (payload) => {
        // EXPECT 'to' INSTEAD OF 'targetUserId'
        const { to, offer } = payload; 
        const targetSocketId = userSocketMap.get(to);

        if (targetSocketId) {
            io.to(targetSocketId).emit('offer', {
                from: socket.userId, // SEND 'from' INSTEAD OF 'senderUserId'
                offer: offer
            });
        } else {
            socket.emit('error', { message: `User ${to} is offline or does not exist.` });
        }
    });

    // Relay Answer
    socket.on('answer', (payload) => {
        const { to, answer } = payload; 
        const targetSocketId = userSocketMap.get(to);

        if (targetSocketId) {
            io.to(targetSocketId).emit('answer', {
                from: socket.userId, 
                answer: answer
            });
        }
    });

    // Relay ICE Candidate
    socket.on('ice-candidate', (payload) => {
        const { to, candidate } = payload; 
        const targetSocketId = userSocketMap.get(to);

        if (targetSocketId) {
            io.to(targetSocketId).emit('ice-candidate', {
                from: socket.userId, 
                candidate: candidate
            });
        }
    });
};