const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const User = require('./user');
const ChatRoom = require('./chatRoom');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 解析 JSON 请求体
app.use(express.json());

const userList = []; // 存储用户的数组

// 用户注册
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const user = new User(username, password);
    const success = User.register(userList);
    if (success) {
        res.status(201).json({ message: '注册成功' });
    } else {
        res.status(400).json({ message: '用户名已存在' });
    }
});

// 用户登录
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = new User(username, password);
    const success = User.login(userList);
    if (success) {
        res.status(200).json({ message: '登录成功' });
    } else {
        res.status(401).json({ message: '用户名或密码错误' });
    }
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

    socket.on('chatMessage', (data) => {
        // 广播消息，包含用户名和消息内容
        io.emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('用户已断开连接');
    });
});

// 启动服务器
server.listen(3000, () => {
    console.log('服务器正在运行在 http://localhost:3000');
}); 