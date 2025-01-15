/**
 * 聊天室类
 */
class ChatRoom {
    constructor(name) {
        this.name = name;
        this.users = [];
    }

    /**
     * 添加用户到聊天室
     * @param {string} username 用户名
     */
    addUser(username) {
        this.users.push(username);
    }

    /**
     * 移除用户
     * @param {string} username 用户名
     */
    removeUser(username) {
        this.users = this.users.filter(user => user !== username);
    }
}

module.exports = ChatRoom; 