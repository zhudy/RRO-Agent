/**
 * 用户类
 */
class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    /**
     * 注册用户
     * @param {Array} userList 用户列表
     * @returns {boolean} 注册是否成功
     */
    static register(userList) {
        // 检查用户名是否已存在
        const existingUser = userList.find(user => user.username === this.username);
        if (existingUser) {
            return false; // 用户名已存在
        }
        userList.push(new User(this.username, this.password));
        return true; // 注册成功
    }

    /**
     * 登录用户
     * @param {Array} userList 用户列表
     * @returns {boolean} 登录是否成功
     */
    static login(userList) {
        const user = userList.find(user => user.username === this.username && user.password === this.password);
        return user !== undefined; // 登录成功返回 true
    }
}

module.exports = User; 