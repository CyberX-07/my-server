document.addEventListener('DOMContentLoaded', () => {
  const createJoinButton = document.getElementById('create-join-button');

  if (createJoinButton) {
    createJoinButton.addEventListener('click', createOrJoinRoom);
  } else {
    console.error("Button not found. Make sure the 'create-join-button' ID is assigned to the button.");
  }
});

let client = new Colyseus.Client("ws://localhost:2567");
let room;

// Function to create or join a room
async function createOrJoinRoom() {
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

      // Wait for the client to successfully join the room
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

// Function to navigate to the game page
function navigateToGamePage() {
  console.log("Navigating to the game page...");
  showWaitingMessage("Waiting for player Y to join...");
  window.location.href = 'game.html';
}

// Function to show a waiting message
function showWaitingMessage(message) {
  console.log("Waiting message:", message);
}

// Function to hide the waiting message
function hideWaitingMessage() {
  console.log("Waiting message hidden.");
}

// Function to update the game board UI
function updateBoard(board) {
  // Implement logic to update the UI based on the board state
}

// Function called when both players have joined
function onBothPlayersJoined() {
  // Hide the waiting message and start the game
  hideWaitingMessage();
  startGame();
}

// Function to initialize room listeners
function initializeRoomListeners() {
  // Add listener for room state changes
  room.onStateChange((state) => {
    // Check if both players have joined
    if (state.players.length === 2) {
      console.log("Both players joined, starting the game");
      onBothPlayersJoined();
    }

    // Check if the board exists in the state
    if (state.board) {
      // Add listener for board changes
      state.board.onChange = (value, key) => {
        console.log("Board change:", value, key);
        updateBoard(state.board);
      };
    }
  });

  // Register handler for "fullState" message
  room.onMessage("fullState", (fullState) => {
    // Process the full state received from the server
    console.log("Full state received:", fullState);
  });
}

// Rest of the code...
