// webrtc-server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();
app.use(cors());
require("dotenv").config();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api/", routes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
require("./webSocket/main")(io);

server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
