const { Room, Client } = require("colyseus");

class TicTacToeRoom extends Room {
    onInit(options) {
        // Initialize room settings
        this.setState({
            players: {},
            board: [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ]
        });
    }

    onJoin(client) {
        // Handle player joining the room
        this.state.players[client.sessionId] = {
            symbol: this.getNextSymbol()
        };
    }

    onMessage(client, message) {
        // Handle player's moves
        if (message.action === "makeMove") {
            const { row, col } = message;
            const player = this.state.players[client.sessionId];
    
            if (this.isValidMove(row, col)) {
                this.state.board[row][col] = player.symbol;
                this.broadcast("updateBoard", this.state.board);
            }
        }
    }    

    onLeave(client) {
        // Handle player leaving the room
        delete this.state.players[client.sessionId];
    }

    onDispose() {
        // Cleanup when the room is disposed
    }

    getNextSymbol() {
        // Alternate between X and O
        return Object.keys(this.state.players).length % 2 === 0 ? "X" : "O";
    }

    isValidMove(row, col) {
        // Check if the move is valid
        return this.state.board[row][col] === null;
    }
}

module.exports = TicTacToeRoom;
