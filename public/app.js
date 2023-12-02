// Initialize socket outside the function scope
let client = new Colyseus.Client("ws://localhost:2567");
let room;

function createOrJoinRoom() {
    // Try to join an existing room first
    client.joinOrCreate("tic-tac-toe").then(joinedRoom => {
        console.log("Room joined successfully", joinedRoom);
        room = joinedRoom;

        room.onStateChange.once(() => {
            // Room has been created or joined, and initial state has been received
            console.log("Room state received:", room.state);
        });
    }).catch(() => {
        // If joining fails, create a new room
        client.create("tic-tac-toe").then(createdRoom => {
            console.log("Room created successfully", createdRoom);
            room = createdRoom;

            room.onStateChange.once(() => {
                // Room has been created, and initial state has been received
                console.log("Room state received:", room.state);
            });
        }).catch(e => {
            console.error("Room creation error", e);
            // Handle room creation error
        });
    });
}

// Call initColyseus when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = [];

    function makeMove(index) {
        console.log('Attempting to make a move...');

        if (room) {
            const row = Math.floor(index / 3);
            const col = index % 3;

            room.send({ action: 'makeMove', row, col });
        } else {
            console.error('Room not ready. Unable to send the move.');
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
});
