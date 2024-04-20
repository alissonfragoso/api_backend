const mysql = require('mysql');

const pool = mysql.createPool({
    "user": "alisson",
    "password": "alisson748090",
    "database": "alisson_papelaria",
    "host": "mysql-alisson.alwaysdata.net",
    "port": 3306
});

exports.pool = pool;
