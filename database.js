import sqlite3 from 'sqlite3'; // 确保使用 import 语法

const db = new sqlite3.Database('db.sqlite', (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('成功连接到数据库');
        // 创建用户表和消息表（如果不存在）
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('创建用户表失败:', err.message);
            }else{
                /* 添加默认用户 */
                db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin')
                `, (err) => {
                    if (err) {
                        console.error('添加默认用户失败:', err.message);
                    }
                });
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            owner TEXT,
            users TEXT
        )`, (err) => {
            if (err) {
                console.error('创建房间表失败:', err.message);
            } else {
                // 添加默认房间
                db.run(`INSERT INTO rooms (name, owner) VALUES ('public', 'admin')`, (err) => {
                    if (err) {
                        console.error('添加默认房间失败:', err.message);
                    }
                });
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            message TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('创建消息表失败:', err.message);
            }
        });
    };
});

/**
 * 获取用户列表
 * @returns {Promise<Array>} 用户列表
 */
export const getUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * 添加用户
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<void>}
 */
export const addUser = (username, password) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); // 返回新插入用户的 ID
            }
        });
    });
};

/**
 * 添加消息
 * @param {number} userId - 用户 ID
 * @param {string} message - 消息内容
 * @returns {Promise<void>}
 */
export const addMessage = (userId, message) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO messages (userId, message) VALUES (?, ?)', [userId, message], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); // 返回新插入消息的 ID
            }
        });
    });
};

// 其他数据库操作...