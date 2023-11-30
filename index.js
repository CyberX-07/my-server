const { Server } = require("colyseus");
const http = require("http");
const express = require("express");
const cors = require('cors');
const path = require("path");
const { monitor } = require("@colyseus/monitor");

const TicTacToeRoom = require("./rooms/TicTacToeRoom");

const port = process.env.PORT || 2567;
const app = express();

app.use(cors());

// Serve Colyseus.js from the node_modules directory
app.use("/colyseus", express.static(path.join(__dirname, "node_modules/colyseus.js/dist")));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const gameServer = new Server({
  server,
  seatReservationTime: 500,
});

gameServer.define("tic-tac-toe", TicTacToeRoom);

app.use("/colyseus", monitor());

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
