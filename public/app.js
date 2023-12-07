// Move initializeBoard to the global scope
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

  // Check if the DOM is fully loaded
  if (document.readyState === 'loading') {
    // If the DOM is still loading, wait for it to be fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      initializeBoard(board);
    });
    return;
  }

  // Now that the DOM is fully loaded, proceed to find the board container
  const boardContainer = document.getElementById('board');

  if (boardContainer) {
    boardContainer.innerHTML = ''; // Clear previous content

    for (let i = 0; i < parsedBoard.length; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.innerText = parsedBoard[i] || ''; // Use an empty string if null
      boardContainer.appendChild(cell);
    }
  } else {
    console.error("Board container not found.");
  }
}

// Wrap your entire script in a function to avoid global conflicts
function initializeApp() {
  let client;
  let room; // Declare room here

  // Function to navigate to the game page
  function navigateToGamePage() {
    console.log("Navigating to the game page...");
    window.location.replace('game.html'); // Use replace to replace the current history entry
  }

  // Function to create or join a room
  window.createOrJoinRoom = async function () {
    // Disable the button to prevent multiple clicks
    const createJoinButton = document.getElementById('create-join-button');
    createJoinButton.disabled = true;

    if (!room) {
      try {
        // Try to find an available room with the specified ID
        const existingRooms = await client.getAvailableRooms("tic-tac-toe");

        if (existingRooms.length > 0) {
          // Join the first available room
          room = await client.joinById(existingRooms[0].roomId);
          console.log("Joining existing room:", room.roomId);
        } else {
          // Create a new room with ID "tic-tac-toe"
          room = await client.create("tic-tac-toe");
          console.log("Room created successfully", room);
        }

        // Initialize room listeners
        initializeRoomListeners();

        room.onJoin(() => {
          console.log("Client successfully joined the room");
          navigateToGamePage();
        });
      } catch (e) {
        console.error("Error creating/joining room", e);
        // Enable the button after the attempt is finished
        createJoinButton.disabled = false;
      }
    } else {
      console.error("User already in a room.");
      // Enable the button after the check is finished
      createJoinButton.disabled = false;
    }
  }

  // Function to initialize room listeners
  function initializeRoomListeners() {
    // Add your room listener logic here
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
      initializeBoard(state.board);
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
  }

  // Call the initialization function
  client = new Colyseus.Client("ws://localhost:2567");
}

// Call the initialization function
initializeApp();

// Add an event listener to wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
