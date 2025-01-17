//编写nodejs客户端代码，接受参数：url: 聊天服务器的访问地址; rname: 房间名
//npm install socket.io-client
//node agent-rro.js http://localhost:3000 defaultRoom userName
//实操：node agent-rro.js http://localhost:3000 rro 罗蜜欧

import { io } from 'socket.io-client'; // 导入 socket.io-client

class ChatClient {
    /**
     * 创建一个新的 ChatClient 实例
     * @param {string} url - 聊天服务器的访问地址
     * @param {string} rname - 房间名
     * @param {string} userName - 用户名
     */
    constructor(url, rname, userName) {
        this.url = url; // 聊天服务器的访问地址
        this.rname = rname; // 房间名
        this.userName = userName; // 用户名
        this.socket = null; // Socket 连接
    }

    /**
     * 初始化 Socket 连接
     */
    init() {
        this.socket = io(this.url); // 使用 Socket.IO 连接到聊天服务器
        this.socket.on('connect', () => {
            console.log(`已连接到聊天服务器: ${this.url}`);
            this.joinRoom();
        });

        this.socket.on('chatMessage', (message) => {
            //console.log(`收到消息: ${message}`);
            console.log('收到消息: ' + message.username + ": "+ message.message + "房间: " + message.currentroom);
        });
    }

    /**
     * 加入房间
     */
    joinRoom() {
        this.socket.emit('joinRoom', { roomName: this.rname, userName: this.userName });
        console.log(`已加入房间: ${this.rname}，用户名: ${this.userName}`);
    }

    /**
     * 发送消息
     * @param {string} message - 要发送的消息
     * @param {string} currentroom - 当前房间名
     */
    sendMessage(message, currentroom) {
        this.socket.emit('chatMessage', { username: this.userName, message, currentroom });
        console.log(`发送消息: ${message}`);
    }
}

// 从命令行参数获取 url、rname 和 userName
const [,, url, rname, userName] = process.argv;

if (!url || !rname || !userName) {
    console.error('请提供聊天服务器的访问地址、房间名和用户名');
    process.exit(1);
}

// 创建 ChatClient 实例并初始化
const chatClient = new ChatClient(url, rname, userName);
chatClient.init();

// 示例：发送一条消息
setTimeout(() => {
    chatClient.sendMessage('你好，世界！', rname);
}, 2000);