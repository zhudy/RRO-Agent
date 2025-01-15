const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const User = require('./user');
const ChatRoom = require('./chatRoom');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 用户注册和登录
app.post('/register', (req, res) => {
    // 注册逻辑
});

app.post('/login', (req, res) => {
    // 登录逻辑
});

// Socket.io 连接
io.on('connection', (socket) => {
    console.log('用户已连接');

    // 处理房间创建和加入
    socket.on('createRoom', (roomName) => {
        // 创建房间逻辑
    });

    socket.on('joinRoom', (roomName) => {
        // 加入房间逻辑
    });

    socket.on('disconnect', () => {
        console.log('用户已断开连接');
    });
});

// 启动服务器
server.listen(3000, () => {
    console.log('服务器正在运行在 http://localhost:3000');
}); 