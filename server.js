var express = require("express");
var app = express();
var dotenv = require("dotenv");
var bodyParser = require("body-parser");
var http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose");

dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mongoURL =
  "mongodb+srv://subuser:user@simplecrud.oqj6k.mongodb.net/simple_CRUD?retryWrites=true&w=majority";

if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, __dirname, "index.html"));
  });
}
var Note = mongoose.model("Note", {
  note: String,
});

app.get("/list", (req, res) => {
  Note.find({}, (err, notes) => {
    res.send(notes);
  });
});

app.post("/list", (req, res) => {
  var note = new Note(req.body);
  note.save();
  io.emit("new note", req.body);
  res.sendStatus(200);
});

app.put("/list", (req, res) => {
  var change = Note(req.body);
  Note.findByIdAndUpdate(change._id, change.note, (err, currNote) => {
    currNote.note = change.note;
    currNote.save();
  });
  io.emit("edit note", req.body);
  res.sendStatus(200);
});

app.delete("/list", (req, res) => {
  var remove = Note(req.body);
  Note.findByIdAndDelete(remove._id, (err, readyRemove) => {
    if (err) console.log(err);
  });

  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("connected");
});
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  console.log("connected to db - ", err);
});
server.listen(port, () => {
  console.log(`App is listening on ${port}`);
});
