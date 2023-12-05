const { Room, Client } = require("colyseus");

class TicTacToeRoom extends Room {
  onInit() {
    this.setState({
      players: {},
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      gameInProgress: false,
      currentPlayer: null,
    });
  }

  onCreate(options) {
    console.log("room created");
    this.onInit();
  }

  onJoin(client) {
    console.log("joined", client.sessionId);
    this.state.players[client.sessionId] = {
      symbol: this.getNextSymbol(),
    };

    if (Object.keys(this.state.players).length === 2) {
      this.broadcast("startGame");
    }

    // Send the initial state to the joining client
    const flatBoard = this.state.board.flat(); // Convert the 2D array to a flat array
    client.send("fullState", {
      board: JSON.stringify(flatBoard),
    });

    // Send the full state to all connected players
    this.sendFullState();
  }

  onMessage(client, message) {
    if (message.action === "makeMove") {
      const { row, col } = message;
      const player = this.state.players[client.sessionId];

      if (this.isValidMove(row, col)) {
        this.state.board[row][col] = player.symbol;
        this.broadcast("updateBoard", { board: this.state.board });
        this.nextTurn();
      }
    }
  }

  onLeave(client) {
    delete this.state.players[client.sessionId];

    // Check if the game is in progress and if the leaving player's move is pending
    if (this.state.gameInProgress && this.state.currentPlayer === client.sessionId) {
      // Skip the leaving player's turn
      this.nextTurn();
    }
  }

  sendFullState() {
    const flatBoard = this.state.board.flat(); // Convert the 2D array to a flat array
    this.broadcast("fullState", {
      board: JSON.stringify(flatBoard),
    });
  }

  getNextSymbol() {
    return Object.keys(this.state.players).length % 2 === 0 ? "X" : "O";
  }

  isValidMove(row, col) {
    return this.state.board[row][col] === null;
  }

  nextTurn() {
    // Switch to the next player's turn
    const playerIds = Object.keys(this.state.players);
    const currentPlayerIndex = playerIds.indexOf(this.state.currentPlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
    this.state.currentPlayer = playerIds[nextPlayerIndex];

    // Notify clients of the next turn
    this.send("nextTurn", { currentPlayer: this.state.currentPlayer });
  }
}

module.exports = TicTacToeRoom;
