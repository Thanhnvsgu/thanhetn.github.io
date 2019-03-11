const io = require('socket.io')(5000);

io.on('connection', socket => {
    console.log(`Đã tạo ra kết nối : ${socket.id}`);
});