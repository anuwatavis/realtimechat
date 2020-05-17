const express = require("express");
const server = require("http").createServer();
const io = require("socket.io")(server);
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const con = require("./config/mySQL");
const multer = require("multer");
const upload = multer();
//----app setup
app.use(cors());
app.set("view engine", "pug");
app.enable("trust proxy");
app.use(bodyParser.urlencoded({ extended: true }));
//---- for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

//connect with mysql database
con.connect(function (err) {
  if (err) throw err;
  console.log("database  connected");
});

app.get("/message", (req, res) => {
  let sql = `select message, userName from message inner join users on message.userId = users.userId order by created desc;`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/user/:id", (req, res) => {
  let userId = req.params.id;
  let sql = `select userName, aliasName from users where userId = "${userId}"`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/login", async (req, res) => {
  let { name, password } = req.body;
  console.log("name", name);
  let sql = `select userName, password, userId, aliasName from users where userName = "${name}"`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      if (result[0].password == password) {
        res.send({ name: result[0].userName, aliasName: result[0].aliasName, userId: result[0].userId });
      } else {
        res.send({ err: "password incorrect" });
      }
    } else {
      res.send({ err: "not member" });
    }
  });
});

app.post("/message", (req, res) => {
  let data = req.body;
  let sql = `insert into message (userId, message, created) values(${data.userId}, "${data.message}", now())`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ created: true });
  });
});

io.on("connection", function (socket) {
  socket.on("emit", function (data) {
    socket.broadcast.emit("message", { ...data });
  });
});

app.listen(5050, () => {
  console.log("server listening on 5050");
});

server.listen(8080, function (err) {
  if (err) throw err;
  console.log("socket io is listening to port 8080");
});
