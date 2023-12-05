// game.js
let client = new Colyseus.Client("ws://localhost:2567");
let room;

function initializeGame() {
  // Join the room or create a new one
  client.joinOrCreate("tic-tac-toe").then(joinedRoom => {
    console.log("Room joined successfully", joinedRoom);
    room = joinedRoom;

    room.onStateChange.once(() => {
      console.log("Room state received:", room.state);
      initializeBoard(room.state.board);
      setupEventListeners();
    });

    room.onMessage('updateBoard', (state) => {
      console.log("Board updated:", state);
      updateBoard(state.board);
    });

    room.onMessage('fullState', (state) => {
      console.log("Full state received:", state);
      initializeBoard(state.board); // Fix: No need for JSON.parse here
    });

    room.onMessage('startGame', () => {
      console.log("Game started!");
      room.state.gameInProgress = true;
      room.state.currentPlayer = Object.keys(room.state.players)[0]; // Start with the first player
      room.send("nextTurn", { currentPlayer: room.state.currentPlayer });
    });

    room.onMessage('nextTurn', (state) => {
      console.log("Next turn:", state);
      // Update UI or perform any necessary actions for the next turn
    });
  }).catch(e => {
    console.error("Error joining room", e);
  });
}

function initializeBoard(board) {
    console.log("Received board state:", board);
  
    let parsedBoard;
  
    try {
      // Parse the string as JSON directly
      parsedBoard = JSON.parse(board);
    } catch (error) {
      console.error("Error parsing board state:", error);
      return;
    }
  
    const boardContainer = document.getElementById('board');
  
    if (boardContainer) {
      boardContainer.innerHTML = ''; // Clear previous content
  
      for (let i = 0; i < parsedBoard.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.innerText = parsedBoard[i] || ''; // Use empty string if null
        boardContainer.appendChild(cell);
      }
    } else {
      console.error("Board container not found.");
    }
  }

function updateBoard(board) {
  const parsedBoard = JSON.parse(board);

  const boardContainer = document.getElementById('board');
  const cells = boardContainer.getElementsByClassName('cell');

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      cells[index].innerText = parsedBoard[row][col] || ''; // Use empty string if null
    }
  }
}

function setupEventListeners() {
  const boardContainer = document.getElementById('board');
  boardContainer.addEventListener('click', handleCellClick);
}

function handleCellClick(event) {
  const cell = event.target;
  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);

  // Send a message to the server when a cell is clicked
  room.send('makeMove', { action: 'makeMove', row, col });
}
