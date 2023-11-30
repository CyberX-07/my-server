const { Server } = require("colyseus");
const http = require("http");
const express = require("express");
const cors = require('cors');

const path = require("path");
const { monitor } = require("@colyseus/monitor");

const TicTacToeRoom = require("./rooms/TicTacToeRoom");

const port = process.env.PORT || 2567;

// Create an Express app
const app = express();

// Enable CORS
app.use(cors());

// Create an HTTP server
const server = http.createServer(app);

// Create a Colyseus server with custom seat reservation time (e.g., 10 seconds)
const gameServer = new Server({
  server,
  seatReservationTime: 500, // Set to an appropriate value in seconds
});

// Register TicTacToeRoom
gameServer.define("tic-tac-toe", TicTacToeRoom);

// Monitor
app.use("/colyseus", monitor());

app.use(express.static(path.join(__dirname, "public")));

// Start the server
gameServer.listen(port);
console.log(`Listening on http://localhost:${port}`);
