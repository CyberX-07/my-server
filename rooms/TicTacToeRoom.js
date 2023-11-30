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
            roomCode: Math.random().toString(36).substring(7).toUpperCase() // Generate a random room code
        });
    }
    onCreate(options){
        console.log("room created")
        this.onInit()
    }
    onJoin(client) {
        console.log("joined",client.sessionId)
        /*this.state.players[client.sessionId] = {
            symbol: this.getNextSymbol()
        };
        if (Object.keys(this.state.players).length === 2) {
            this.broadcast('roomCreated', { roomCode: this.state.roomCode });
        }*/
    }

    onMessage(client, message) {
        if (message.action === 'joinOrCreateRoom') {
            // Use joinOrCreate to automatically join the existing room or create a new one
            const joinOrCreate = this.matchMaker.joinOrCreate('tic-tac-toe', { roomCode: this.state.roomCode });
            client.send('roomJoined', { roomCode: this.state.roomCode });
        } else if (message.action === 'makeMove') {
            const { row, col } = message;
            const player = this.state.players[client.sessionId];

            if (this.isValidMove(row, col)) {
                this.state.board[row][col] = player.symbol;
                this.broadcast('updateBoard', { board: this.state.board });
            }
        } else if (message.action === 'createRoom') {
            // The room is created when a user clicks "Create Room"
            // It will automatically broadcast the room code to all clients
            this.broadcast('roomCreated', { roomCode: this.state.roomCode });
        } else if (message.action === 'joinRoom') {
            // A user is attempting to join a room with the provided code
            // You might want to implement room code validation here
            const roomToJoin = message.code.toUpperCase();
            const availableRooms = Object.values(this.matchMaker.handlers['tic-tac-toe']);
            const targetRoom = availableRooms.find(room => room.roomCode === roomToJoin);

            if (targetRoom) {
                this.broadcast('roomJoined', { roomCode: roomToJoin });
            } else {
                // Handle invalid room code
                // You may want to send an error message to the client
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
