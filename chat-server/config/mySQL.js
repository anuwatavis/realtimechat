const mysql = require("mysql");
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "thutools",
  database: "chat",
});

module.exports = con;
