// Initialize socket outside the function scope
let client = new Colyseus.Client("ws://localhost:2567");
let room;
function initColyseus() {
    client.joinOrCreate("tic-tac-toe", {}).then(room => {
        console.log("joined successfully", room);
        room=room;
      }).catch(e => {
        console.error("join error", e);
      });

    /*socket.onOpen = () => {
        console.log('WebSocket connection opened.');
        // Call the function to create or join a room once the connection is open
        createOrJoinRoom();
    };

    socket.onClose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
    };

    socket.onError = (error) => {
        console.error('WebSocket encountered an error:', error);
    };

    socket.onMessage = (event) => {
        if (typeof event.data === 'string') {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'updateBoard') {
                    updateBoard(data.board);
                } else if (data.type === 'roomJoined') {
                    roomCode = data.roomCode;
                    roomCodeElement.textContent = `Room Code: ${roomCode}`;
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    };*/
}

function createOrJoinRoom() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'joinOrCreateRoom' }));
    } else {
        console.error('Socket not ready. Please check your WebSocket setup.');
    }
}

// Call initColyseus when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const roomCodeElement = document.getElementById('room-code');
    const cells = [];
    let roomCode = null;

    function makeMove(index) {
        console.log('Attempting to make a move...');

        if (socket && socket.readyState === WebSocket.OPEN) {
            const row = Math.floor(index / 3);
            const col = index % 3;

            socket.send(JSON.stringify({ action: 'makeMove', row, col }));
        } else {
            console.error('Socket not ready. Unable to send the move.');
        }
    }

    function updateBoard(newBoard) {
        newBoard.forEach((value, index) => {
            cells[index].innerText = value || '';
        });
    }

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cells.push(cell);
        board.appendChild(cell);

        cell.addEventListener('click', () => makeMove(i));
    }

    // Start by initializing Colyseus
    initColyseus();
});
