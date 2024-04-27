const mysql = require('mysql');
require('dotenv').config()
const pool = mysql.createPool({
    "user": process.env.USER,
    "password": process.env.PASSWORD,
    "database": process.env.DATABASE,
    "host": process.env.HOST,
    "port": process.env.PORT_MYSQL,
});

exports.pool = pool;


