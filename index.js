//聊天服务器
//npm install socket.io-client
//node index.js #可能需要多运行两次才能正常创建db.sqlite 和对应的表

import express from 'express';
import { Server } from 'socket.io';
import * as database from './database.js';
import { getRooms } from './database.js';
import User from './user.js';

const app = express();
const httpServer = app.listen(3000, () => {
    console.log('服务器正在运行，监听端口 3000');
});
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static('public'));

// 从数据库获取用户列表
const userList = await database.getUsers();

/**
 * 用户注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userId = await database.addUser(username, password);
        res.status(201).json({ message: '注册成功', userId });
    } catch (error) {
        res.status(400).json({ message: '用户名已存在或其他错误', error: error.message });
    }
});

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userList = await database.getUsers();
    const user = userList.find(u => u.username === username && u.password === password);
    if (user) {
        res.status(200).json({ message: '登录成功', userId: user.id });
    } else {
        res.status(401).json({ message: '用户名或密码错误' });
    }
});

/**
 * 发送消息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.post('/messages', async (req, res) => {
    const { userId, message } = req.body;
    try {
        const messageId = await database.addMessage(userId, message);
        res.status(201).json({ message: '消息发送成功', messageId });
    } catch (error) {
        res.status(400).json({ message: '发送消息失败', error: error.message });
    }
});

/**
 * 列出所有房间
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
app.post('/rooms', async (req, res) => {
    try {
        const rooms = await getRooms();
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ error: '获取房间列表失败' });
    }
});

// Socket.io 连接
io.on('connection', (socket) => {
    console.log('用户已连接');

    // 处理房间创建和加入
    socket.on('createRoom', async (roomName, userName) => {
        try {
            console.log('创建房间: ' + roomName + " userName: " + userName);
            const roomId = await database.addRoom(roomName, userName);
            socket.emit('roomCreated', { roomId, roomName });
        } catch (error) {
            console.error('创建房间失败:', error.message);
        }
    });

    socket.on('joinRoom', (roomName) => {
        // 加入房间逻辑
    });

    socket.on('chatMessage', (data) => {
        const message = data.message;
        const username = data.username;
        const currentroom = data.currentroom;

        socket.username = data.username;    //以便后续消息处理中引用
        //console.log(username, message, currentroom);
        console.log(message);
        // 检查消息是否包含 "to uname:xxx" 格式
        const privateMessageMatch = message.match(/^to\s+uname:\s*(\w+) (.+)$/);

        if (privateMessageMatch) {
            const targetUsername = privateMessageMatch[1]; // 提取目标用户名
            const privateMessage = privateMessageMatch[2]; // 提取私信内容

            // 查找目标用户的 socket ID
            //console.log(io.sockets.sockets.values());
            const targetSocket = Array.from(io.sockets.sockets.values()).find(socket => socket.username === targetUsername);

            if (targetSocket) {
                // 发送私信给目标用户
                targetSocket.emit('chatMessage', {
                    username: username,
                    message: privateMessage,
                    currentroom: currentroom
                });
                console.log(`私信发送给 ${targetUsername}: ${privateMessage}`);
                // 反馈给发送方
                const senderSocket = Array.from(io.sockets.sockets.values()).find(socket => socket.username === data.username);
                senderSocket.emit('chatMessage', {
                    username: data.username,
                    message: '私信发送成功：' + message,
                    currentroom: currentroom
                });
            } else {
                console.log(`用户 ${targetUsername} 不在线`);
                // 反馈给发送方
                const senderSocket = Array.from(io.sockets.sockets.values()).find(socket => socket.username === data.username);
                senderSocket.emit('chatMessage', {
                    username: data.username,
                    message: '用户不在线私信发送失败：' + message,
                    currentroom: currentroom
                });
            }
        } else {
            // 群发消息,包含用户名和消息内容
            io.emit('chatMessage', data);
        }

        // 将消息存储到数据库
        database.addMessage(currentroom, username, message);
    });

    socket.on('disconnect', () => {
        console.log('用户已断开连接');
    });
}); 
