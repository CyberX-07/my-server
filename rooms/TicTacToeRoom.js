const { Room, Client } = require("colyseus");

class TicTacToeRoom extends Room {
    onInit() {
        this.setState({
            players: {},
            board: [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ],
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
            this.broadcast('startGame');
        }
    }

    onMessage(client, message) {
        if (message.action === 'makeMove') {
            const { row, col } = message;
            const player = this.state.players[client.sessionId];

            if (this.isValidMove(row, col)) {
                this.state.board[row][col] = player.symbol;
                this.broadcast('updateBoard', { board: this.state.board });
            }
        }
    }

    onLeave(client) {
        delete this.state.players[client.sessionId];
    }

    getNextSymbol() {
        return Object.keys(this.state.players).length % 2 === 0 ? 'X' : 'O';
    }

    isValidMove(row, col) {
        return this.state.board[row][col] === null;
    }
}

module.exports = TicTacToeRoom;
