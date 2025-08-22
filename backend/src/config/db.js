const {Pool} = require("pg");

const pool = new Pool({
    user: "pos_user",
    host: "localhost",
    database: "pos_db",
    password: "pos_pass",
    port: 5432
})

module.exports = pool;