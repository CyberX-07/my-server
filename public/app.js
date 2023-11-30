document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = [];
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5; // You can adjust the maximum number of reconnection attempts

    // Function to initialize WebSocket connection
    function initWebSocket() {
        socket = new WebSocket('ws://localhost:2567', 'colyseus');

        socket.addEventListener('open', () => {
            console.log('WebSocket connection opened.');
            reconnectAttempts = 0; // Reset reconnection attempts on successful connection
        });

        socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
        
            if (event.code === 4002) {
                // Special handling for code 4002, indicating a specific closure reason
                console.log('Attempting to reconnect immediately...');
                initWebSocket();
            } else if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
                // Implement logic for reconnection if necessary
                reconnectAttempts++;
                console.log(`Attempting to reconnect (Attempt ${reconnectAttempts})...`);
                setTimeout(() => {
                    initWebSocket();
                }, 3000); // Reconnect after 3 seconds
            } else {
                console.log('Maximum reconnection attempts reached or intentional closure.');
            }
        });        
        socket.addEventListener('error', (error) => {
            console.error('WebSocket encountered an error:', error);
        });

        socket.addEventListener('message', (event) => {
            if (typeof event.data === 'string') {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'updateBoard') {
                        updateBoard(data.board);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    // Handle non-JSON messages gracefully
                    handleNonJSONMessage(event.data);
                }
            } else if (event.data instanceof Blob) {
                // Handle Blob data as needed
                handleBlobData(event.data);
            }
        });
    }

    // Function to handle making a move
    function makeMove(index) {
        console.log('Attempting to make a move...');
        console.log('WebSocket readyState:', socket.readyState);

        // Check if the WebSocket is in the OPEN or CONNECTING state before sending a message
        if (socket.readyState === WebSocket.OPEN) {
            // Send the move to the server
            const message = {
                type: 'makeMove',
                index: index,
            };

            socket.send(JSON.stringify(message));
        } else if (socket.readyState === WebSocket.CONNECTING) {
            console.log('WebSocket is still connecting. Wait for the connection to open.');
        } else {
            console.error('WebSocket is not in the OPEN state. Unable to send the move.');
        }
    }

    // Function to update the board UI
    function updateBoard(newBoard) {
        // Update the UI based on the new board state
        newBoard.forEach((value, index) => {
            cells[index].innerText = value || ''; // Display X or O
        });
    }

    // Function to handle Blob data
    function handleBlobData(blob) {
        // Handle Blob data as needed
        console.log('Received binary data. Blob content:', blob);

        // You may choose to process the Blob data here
    }

    // Function to handle non-JSON messages
    function handleNonJSONMessage(data) {
        // Handle non-JSON messages as needed
        console.log('Received non-JSON message:', data);

        // For example, you could check if the data is a Blob and handle it accordingly
        if (data instanceof Blob) {
            // Handle Blob data as needed
            console.log('Received Blob data:', data);
        }
    }

    // Initialize the board
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cells.push(cell);
        board.appendChild(cell);

        // Add click event listener to each cell
        cell.addEventListener('click', () => makeMove(i));
    }

    // Initialize WebSocket connection
    initWebSocket();
});
