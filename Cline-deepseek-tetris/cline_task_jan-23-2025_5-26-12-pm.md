**User:**

<task>
用nodejs 写一个网络版的双人对战俄罗斯方块
</task>
<environment_details>
# VSCode Visible Files
(No visible files)

# VSCode Open Tabs
(No open tabs)

# Current Working Directory (/mnt/cline) Files
example.py
p.py
tetris/
</environment_details>

---

**Assistant:**

<thinking>
现在需要更新game.js以处理对手游戏状态的更新。需要：
1. 添加对手游戏画面的渲染逻辑
2. 处理服务器发送的对手更新事件
3. 确保双方游戏状态同步
</thinking>

<replace_in_file>
<path>tetris/public/game.js</path>
<diff>
<<<<<<< SEARCH
const socket = io();

const canvas = document.getElementById('player1');
const context = canvas.getContext('2d');
=======
const socket = io();

// Player 1 canvas
const player1Canvas = document.getElementById

[Response interrupted by a tool use result. Only one tool may be used at a time and should be placed at the end of the message.]

---

**User:**

[replace_in_file for 'tetris/public/game.js'] Result:
The tool execution failed with the following error:
<error>
The SEARCH block:
const socket = io();

const canvas = document.getElementById('player1');
const context = canvas.getContext('2d');
...does not match anything in the file.

This is likely because the SEARCH block content doesn't match exactly with what's in the file, or if you used multiple SEARCH/REPLACE blocks they may not have been in the order they appear in the file.

The file was reverted to its original state:

<file_content path="tetris/public/game.js">
const socket = io();
const canvas1 = document.getElementById('player1');
const canvas2 = document.getElementById('player2');
const nextPieceCanvas = document.getElementById('nextPiece');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const nextCtx = nextPieceCanvas.getContext('2d');
const roomInput = document.getElementById('roomId');
const joinButton = document.getElementById('joinRoom');
const scoreDisplay = document.getElementById('score');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
  null, '#FF0D72', '#0DC2FF', '#0DFF72', 
  '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
  '#666666' // Garbage block color
];

// Tetromino shapes
const TETROMINOES = [
  { // I
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 1
  },
  { // O
    shape: [
      [2, 2],
      [2, 2]
    ],
    color: 2
  },
  { // T
    shape: [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: 3
  },
  { // S
    shape: [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0]
    ],
    color: 4
  },
  { // Z
    shape: [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0]
    ],
    color: 5
  },
  { // J
    shape: [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: 6
  },
  { // L
    shape: [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0]
    ],
    color: 7
  }
];

function createPiece() {
  const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
  const tetromino = TETROMINOES[randomIndex];
  return {
    shape: tetromino.shape,
    color: tetromino.color,
    x: Math.floor(COLS / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0
  };
}

let gameState = {
  grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  currentPiece: null,
  nextPiece: null,
  score: 0,
  gameOver: false
};

let opponentState = {
  grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  currentPiece: null,
  score: 0,
  gameOver: false
};

// Initialize game
function init() {
  canvas1.width = COLS * BLOCK_SIZE;
  canvas1.height = ROWS * BLOCK_SIZE;
  canvas2.width = COLS * BLOCK_SIZE;
  canvas2.height = ROWS * BLOCK_SIZE;
  nextPieceCanvas.width = 4 * BLOCK_SIZE;
  nextPieceCanvas.height = 4 * BLOCK_SIZE;

  document.addEventListener('keydown', handleInput);
  joinButton.addEventListener('click', joinRoom);
  document.getElementById('restartGame').addEventListener('click', restartGame);
}

function restartGame() {
  gameState = createInitialGameState();
  opponentState = {
    grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: null,
    score: 0,
    gameOver: false
  };
  document.getElementById('restartGame').style.display = 'none';
  socket.emit('restartGame');
  startGame();
}

// Handle user input
function handleInput(event) {
  if (!gameState.currentPiece) return;
  
  switch(event.key) {
    case 'ArrowLeft':
      movePiece(-1);
      break;
    case 'ArrowRight':
      movePiece(1);
      break;
    case 'ArrowDown':
      dropPiece();
      break;
    case 'ArrowUp':
      rotatePiece();
      break;
    case ' ': // Space for hard drop
      hardDrop();
      break;
  }
}

function movePiece(dx) {
  gameState.currentPiece.x += dx;
  if (checkCollision(gameState)) {
    gameState.currentPiece.x -= dx;
  } else {
    socket.emit('move', { direction: dx > 0 ? 'right' : 'left' });
  }
}

function rotatePiece() {
  const piece = gameState.currentPiece;
  const originalShape = piece.shape;
  
  // Transpose matrix
  piece.shape = piece.shape[0].map((_, i) => 
    piece.shape.map(row => row[i])
  );
  
  // Reverse each row to get 90 degree rotation
  piece.shape.forEach(row => row.reverse());
  
  // Wall kick
  if (checkCollision(gameState)) {
    // Try moving left/right
    const offsets = [-1, 1, -2, 2];
    for (let offset of offsets) {
      piece.x += offset;
      if (!checkCollision(gameState)) {
        socket.emit('move', { direction: 'rotate', offset });
        return;
      }
      piece.x -= offset;
    }
    
    // Revert rotation if no valid position found
    piece.shape = originalShape;
  } else {
    socket.emit('move', { direction: 'rotate' });
  }
}

function hardDrop() {
  while (!checkCollision(gameState)) {
    gameState.currentPiece.y++;
  }
  gameState.currentPiece.y--;
  lockPiece();
  socket.emit('hardDrop');
}

// Join game room
function joinRoom() {
  const roomId = roomInput.value.trim();
  if (roomId) {
    socket.emit('joinRoom', roomId);
  }
}

// Socket event handlers
socket.on('gameStart', () => {
  startGame();
});

socket.on('opponentMove', (direction) => {
  updateOpponent(direction);
});

// Game logic
function startGame() {
  gameState = createInitialGameState();
  requestAnimationFrame(update);
}

function createInitialGameState() {
  return {
    grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: createPiece(),
    nextPiece: createPiece(),
    score: 0,
    gameOver: false
  };
}

function dropPiece() {
  if (!gameState.currentPiece) return;

  gameState.currentPiece.y++;
  if (checkCollision(gameState)) {
    gameState.currentPiece.y--;
    lockPiece();
  }
}

function checkCollision(state) {
  const { shape, x, y } = state.currentPiece;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        
        if (newY >= ROWS || 
            newX < 0 || 
            newX >= COLS || 
            state.grid[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

function lockPiece() {
  const { shape, x, y, color } = gameState.currentPiece;
  
  // Add piece to grid
  shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        gameState.grid[y + rowIndex][x + colIndex] = color;
      }
    });
  });

  // Check for completed rows
  clearRows();

  // Check for game over
  if (gameState.grid[0].some(cell => cell !== 0)) {
    gameState.gameOver = true;
    return;
  }

  // Spawn new piece
  gameState.currentPiece = gameState.nextPiece;
  gameState.nextPiece = createPiece();
}

function clearRows() {
  let rowsCleared = 0;
  
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (gameState.grid[y][x] === 0) {
        continue outer;
      }
    }
    
    // Remove completed row
    const row = gameState.grid.splice(y, 1)[0].fill(0);
    gameState.grid.unshift(row);
    rowsCleared++;
    y++;
  }

  // Update score and send attack
  if (rowsCleared > 0) {
    gameState.score += rowsCleared * 100;
    scoreDisplay.textContent = gameState.score;
    
    // Calculate attack rows based on number of rows cleared
    let attackRows = 0;
    if (rowsCleared === 4) { // Tetris
      attackRows = 4;
    } else if (rowsCleared === 3) {
      attackRows = 2;
    } else if (rowsCleared === 2) {
      attackRows = 1;
    }
    
    if (attackRows > 0) {
      socket.emit('attack', attackRows);
    }
  }
}

// Handle incoming attacks
socket.on('attack', (rows) => {
  // Shift grid up and add garbage rows
  for (let i = 0; i < rows; i++) {
    gameState.grid.pop(); // Remove bottom row
    gameState.grid.unshift(Array(COLS).fill(8)); // Add garbage row at top
  }
  
  // Check if attack caused game over
  if (gameState.grid[0].some(cell => cell !== 0 && cell !== 8)) {
    gameState.gameOver = true;
    socket.emit('gameOver');
  }
});

// Game loop
let lastTime = 0;
const dropInterval = 1000; // 1 second

function update(time = 0) {
  const deltaTime = time - lastTime;
  
  if (deltaTime > dropInterval) {
    dropPiece();
    lastTime = time;
    socket.emit('update', gameState); // Send game state to server
  }

  if (gameState.gameOver) {
    // Game over animation
    const blink = Math.floor(time / 250) % 2;
    if (blink) {
      ctx1.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    }
    
    ctx1.fillStyle = '#fff';
    ctx1.font = '30px Arial';
    ctx1.textAlign = 'center';
    ctx1.fillText('GAME OVER!', canvas1.width/2, canvas1.height/2);
    
    // Show restart button
    document.getElementById('restartGame').style.display = 'inline-block';
    
    socket.emit('gameOver');
    return;
  }

  draw(ctx1, gameState);
  draw(ctx2, opponentState);
  drawNextPiece();
  requestAnimationFrame(update);
}

// Network handlers
socket.on('updateOpponent', (state) => {
  opponentState = state;
});

socket.on('gameOver', () => {
  alert('Opponent has lost! You win!');
  gameState.gameOver = true;
});

socket.on('startGame', () => {
  startGame();
});

function draw(ctx, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw grid
  state.grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });

  // Draw current piece
  if (state.currentPiece) {
    state.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(
            (state.currentPiece.x + x) * BLOCK_SIZE,
            (state.currentPiece.y + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
  if (gameState.nextPiece) {
    gameState.nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          nextCtx.fillStyle = COLORS[value];
          nextCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
}

// Initialize game
init();

</file_content>

Try again with a more precise SEARCH block.
(If you keep running into this error, you may use the write_to_file tool as a workaround.)
</error>
<environment_details>
# VSCode Visible Files
tetris/public/game.js

# VSCode Open Tabs
tetris/package.json
tetris/server.js
tetris/public/index.html
tetris/public/style.css
tetris/public/game.js

# Actively Running Terminals
## Original command: `cd tetris && npm install && node server.js`
</environment_details>

---

**Assistant:**

<thinking>
由于SEARCH/REPLACE失败，改用write_to_file工具来更新game.js文件。需要：
1. 添加对手游戏画面的渲染逻辑
2. 处理服务器发送的对手更新事件
3. 确保双方游戏状态同步
</thinking>

<write_to_file>
<path>tetris/public/game.js</path>
<content>
const socket = io();
const canvas1 = document.getElementById('player1');
const canvas2 = document.getElementById('player2');
const nextPieceCanvas = document.getElementById('nextPiece');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const nextCtx = nextPieceCanvas.getContext('2d');
const roomInput = document.getElementById('roomId');
const joinButton = document.getElementById('joinRoom');
const scoreDisplay = document.getElementById('score');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
  null, '#FF0D72', '#0DC2FF', '#0DFF72', 
  '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
  '#666666' // Garbage block color
];

// Tetromino shapes
const TETROMINOES = [
  { // I
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 1
  },
  { // O
    shape: [
      [2, 2],
      [2, 2]
    ],
    color: 2
  },
  { // T
    shape: [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: 3
  },
  { // S
    shape: [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0]
    ],
    color: 4
  },
  { // Z
    shape: [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0]
    ],
    color: 5
  },
  { // J
    shape: [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: 6
  },
  { // L
    shape: [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0]
    ],
    color: 7
  }
];

function createPiece() {
  const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
  const tetromino = TETROMINOES[randomIndex];
  return {
    shape: tetromino.shape,
    color: tetromino.color,
    x: Math.floor(COLS / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0
  };
}

let gameState = {
  grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  currentPiece: null,
  nextPiece: null,
  score: 0,
  gameOver: false
};

let opponentState = {
  grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  currentPiece: null,
  score: 0,
  gameOver: false
};

// Initialize game
function init() {
  canvas1.width = COLS * BLOCK_SIZE;
  canvas1.height = ROWS * BLOCK_SIZE;
  canvas2.width = COLS * BLOCK_SIZE;
  canvas2.height = ROWS * BLOCK_SIZE;
  nextPieceCanvas.width = 4 * BLOCK_SIZE;
  nextPieceCanvas.height = 4 * BLOCK_SIZE;

  document.addEventListener('keydown', handleInput);
  joinButton.addEventListener('click', joinRoom);
  document.getElementById('restartGame').addEventListener('click', restartGame);
}

function restartGame() {
  gameState = createInitialGameState();
  opponentState = {
    grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: null,
    score: 0,
    gameOver: false
  };
  document.getElementById('restartGame').style.display = 'none';
  socket.emit('restartGame');
  startGame();
}

// Handle user input
function handleInput(event) {
  if (!gameState.currentPiece) return;
  
  switch(event.key) {
    case 'ArrowLeft':
      movePiece(-1);
      break;
    case 'ArrowRight':
      movePiece(1);
      break;
    case 'ArrowDown':
      dropPiece();
      break;
    case 'ArrowUp':
      rotatePiece();
      break;
    case ' ': // Space for hard drop
      hardDrop();
      break;
  }
}

function movePiece(dx) {
  gameState.currentPiece.x += dx;
  if (checkCollision(gameState)) {
    gameState.currentPiece.x -= dx;
  } else {
    socket.emit('move', { direction: dx > 0 ? 'right' : 'left' });
  }
}

function rotatePiece() {
  const piece = gameState.currentPiece;
  const originalShape = piece.shape;
  
  // Transpose matrix
  piece.shape = piece.shape[0].map((_, i) => 
    piece.shape.map(row => row[i])
  );
  
  // Reverse each row to get 90 degree rotation
  piece.shape.forEach(row => row.reverse());
  
  // Wall kick
  if (checkCollision(gameState)) {
    // Try moving left/right
    const offsets = [-1, 1, -2, 2];
    for (let offset of offsets) {
      piece.x += offset;
      if (!checkCollision(gameState)) {
        socket.emit('move', { direction: 'rotate', offset });
        return;
      }
      piece.x -= offset;
    }
    
    // Revert rotation if no valid position found
    piece.shape = originalShape;
  } else {
    socket.emit('move', { direction: 'rotate' });
  }
}

function hardDrop() {
  while (!checkCollision(gameState)) {
    gameState.currentPiece.y++;
  }
  gameState.currentPiece.y--;
  lockPiece();
  socket.emit('hardDrop');
}

// Join game room
function joinRoom() {
  const roomId = roomInput.value.trim();
  if (roomId) {
    socket.emit('joinRoom', roomId);
  }
}

// Socket event handlers
socket.on('gameStart', () => {
  startGame();
});

socket.on('opponentUpdate', (data) => {
  opponentState = data.gameState;
});

// Game logic
function startGame() {
  gameState = createInitialGameState();
  requestAnimationFrame(update);
}

function createInitialGameState() {
  return {
    grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: createPiece(),
    nextPiece: createPiece(),
    score: 0,
    gameOver: false
  };
}

function dropPiece() {
  if (!gameState.currentPiece) return;

  gameState.currentPiece.y++;
  if (checkCollision(gameState)) {
    gameState.currentPiece.y--;
    lockPiece();
  }
}

function checkCollision(state) {
  const { shape, x, y } = state.currentPiece;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        
        if (newY >= ROWS || 
            newX < 0 || 
            newX >= COLS || 
            state.grid[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

function lockPiece() {
  const { shape, x, y, color } = gameState.currentPiece;
  
  // Add piece to grid
  shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        gameState.grid[y + rowIndex][x + colIndex] = color;
      }
    });
  });

  // Check for completed rows
  clearRows();

  // Check for game over
  if (gameState.grid[0].some(cell => cell !== 0)) {
    gameState.gameOver = true;
    return;
  }

  // Spawn new piece
  gameState.currentPiece = gameState.nextPiece;
  gameState.nextPiece = createPiece();
}

function clearRows() {
  let rowsCleared = 0;
  
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (gameState.grid[y][x] === 0) {
        continue outer;
      }
    }
    
    // Remove completed row
    const row = gameState.grid.splice(y, 1)[0].fill(0);
    gameState.grid.unshift(row);
    rowsCleared++;
    y++;
  }

  // Update score and send attack
  if (rowsCleared > 0) {
    gameState.score += rowsCleared * 100;
    scoreDisplay.textContent = gameState.score;
    
    // Calculate attack rows based on number of rows cleared
    let attackRows = 0;
    if (rowsCleared === 4) { // Tetris
      attackRows = 4;
    } else if (rowsCleared === 3) {
      attackRows = 2;
    } else if (rowsCleared === 2) {
      attackRows = 1;
    }
    
    if (attackRows > 0) {
      socket.emit('attack', attackRows);
    }
  }
}

// Handle incoming attacks
socket.on('attack', (rows) => {
  // Shift grid up and add garbage rows
  for (let i = 0; i < rows; i++) {
    gameState.grid.pop(); // Remove bottom row
    gameState.grid.unshift(Array(COLS).fill(8)); // Add garbage row at top
  }
  
  // Check if attack caused game over
  if (gameState.grid[0].some(cell => cell !== 0 && cell !== 8)) {
    gameState.gameOver = true;
    socket.emit('gameOver');
  }
});

// Game loop
let lastTime = 0;
const dropInterval = 1000; // 1 second

function update(time = 0) {
  const deltaTime = time - lastTime;
  
  if (deltaTime > dropInterval) {
    dropPiece();
    lastTime = time;
    socket.emit('updateGameState', { 
      roomId: roomInput.value.trim(),
      gameState 
    });
  }

  if (gameState.gameOver) {
    // Game over animation
    const blink = Math.floor(time / 250) % 2;
    if (blink) {
      ctx1.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    }
    
    ctx1.fillStyle = '#fff';
    ctx1.font = '30px Arial';
    ctx1.textAlign = 'center';
    ctx1.fillText('GAME OVER!', canvas1.width/2, canvas1.height/2);
    
    // Show restart button
    document.getElementById('restartGame').style.display = 'inline-block';
    
    socket.emit('gameOver');
    return;
  }

  draw(ctx1, gameState);
  draw(ctx2, opponentState);
  drawNextPiece();
  requestAnimationFrame(update);
}

function draw(ctx, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw grid
  state.grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });

  // Draw current piece
  if (state.currentPiece) {
    state.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(
            (state.currentPiece.x + x) * BLOCK_SIZE,
            (state.currentPiece.y + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
  if (gameState.nextPiece) {
    gameState.nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          nextCtx.fillStyle = COLORS[value];
          nextCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
}

// Initialize game
init();
</content>
</write_to_file>

---

**User:**

[write_to_file for 'tetris/public/game.js'] Result:
The content was successfully saved to tetris/public/game.js.

Here is the full, updated content of the file that was saved:

<final_file_content path="tetris/public/game.js">
const socket = io();
const canvas1 = document.getElementById('player1');
const canvas2 = document.getElementById('player2');
const nextPieceCanvas = document.getElementById('nextPiece');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const nextCtx = nextPieceCanvas.getContext('2d');
const roomInput = document.getElementById('roomId');
const joinButton = document.getElementById('joinRoom');
const scoreDisplay = document.getElementById('score');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
  null, '#FF0D72', '#0DC2FF', '#0DFF72', 
  '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
  '#666666' // Garbage block color
];

// Tetromino shapes
const TETROMINOES = [
  { // I
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 1
  },
  { // O
    shape: [
      [2, 2],
      [2, 2]
    ],
    color: 2
  },
  { // T
    shape: [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: 3
  },
  { // S
    shape: [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0]
    ],
    color: 4
  },
  { // Z
    shape: [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0]
    ],
    color: 5
  },
  { // J
    shape: [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: 6
  },
  { // L
    shape: [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0]
    ],
    color: 7
  }
];

function createPiece() {
  const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
  const tetromino = TETROMINOES[randomIndex];
  return {
    shape: tetromino.shape,
    color: tetromino.color,
    x: Math.floor(COLS / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0
  };
}

let gameState = {
  grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  currentPiece: null,
  nextPiece: null,
  score: 0,
  gameOver: false
};

let opponentState = {
  grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
  currentPiece: null,
  score: 0,
  gameOver: false
};

// Initialize game
function init() {
  canvas1.width = COLS * BLOCK_SIZE;
  canvas1.height = ROWS * BLOCK_SIZE;
  canvas2.width = COLS * BLOCK_SIZE;
  canvas2.height = ROWS * BLOCK_SIZE;
  nextPieceCanvas.width = 4 * BLOCK_SIZE;
  nextPieceCanvas.height = 4 * BLOCK_SIZE;

  document.addEventListener('keydown', handleInput);
  joinButton.addEventListener('click', joinRoom);
  document.getElementById('restartGame').addEventListener('click', restartGame);
}

function restartGame() {
  gameState = createInitialGameState();
  opponentState = {
    grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: null,
    score: 0,
    gameOver: false
  };
  document.getElementById('restartGame').style.display = 'none';
  socket.emit('restartGame');
  startGame();
}

// Handle user input
function handleInput(event) {
  if (!gameState.currentPiece) return;
  
  switch(event.key) {
    case 'ArrowLeft':
      movePiece(-1);
      break;
    case 'ArrowRight':
      movePiece(1);
      break;
    case 'ArrowDown':
      dropPiece();
      break;
    case 'ArrowUp':
      rotatePiece();
      break;
    case ' ': // Space for hard drop
      hardDrop();
      break;
  }
}

function movePiece(dx) {
  gameState.currentPiece.x += dx;
  if (checkCollision(gameState)) {
    gameState.currentPiece.x -= dx;
  } else {
    socket.emit('move', { direction: dx > 0 ? 'right' : 'left' });
  }
}

function rotatePiece() {
  const piece = gameState.currentPiece;
  const originalShape = piece.shape;
  
  // Transpose matrix
  piece.shape = piece.shape[0].map((_, i) => 
    piece.shape.map(row => row[i])
  );
  
  // Reverse each row to get 90 degree rotation
  piece.shape.forEach(row => row.reverse());
  
  // Wall kick
  if (checkCollision(gameState)) {
    // Try moving left/right
    const offsets = [-1, 1, -2, 2];
    for (let offset of offsets) {
      piece.x += offset;
      if (!checkCollision(gameState)) {
        socket.emit('move', { direction: 'rotate', offset });
        return;
      }
      piece.x -= offset;
    }
    
    // Revert rotation if no valid position found
    piece.shape = originalShape;
  } else {
    socket.emit('move', { direction: 'rotate' });
  }
}

function hardDrop() {
  while (!checkCollision(gameState)) {
    gameState.currentPiece.y++;
  }
  gameState.currentPiece.y--;
  lockPiece();
  socket.emit('hardDrop');
}

// Join game room
function joinRoom() {
  const roomId = roomInput.value.trim();
  if (roomId) {
    socket.emit('joinRoom', roomId);
  }
}

// Socket event handlers
socket.on('gameStart', () => {
  startGame();
});

socket.on('opponentUpdate', (data) => {
  opponentState = data.gameState;
});

// Game logic
function startGame() {
  gameState = createInitialGameState();
  requestAnimationFrame(update);
}

function createInitialGameState() {
  return {
    grid: Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPiece: createPiece(),
    nextPiece: createPiece(),
    score: 0,
    gameOver: false
  };
}

function dropPiece() {
  if (!gameState.currentPiece) return;

  gameState.currentPiece.y++;
  if (checkCollision(gameState)) {
    gameState.currentPiece.y--;
    lockPiece();
  }
}

function checkCollision(state) {
  const { shape, x, y } = state.currentPiece;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        
        if (newY >= ROWS || 
            newX < 0 || 
            newX >= COLS || 
            state.grid[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

function lockPiece() {
  const { shape, x, y, color } = gameState.currentPiece;
  
  // Add piece to grid
  shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        gameState.grid[y + rowIndex][x + colIndex] = color;
      }
    });
  });

  // Check for completed rows
  clearRows();

  // Check for game over
  if (gameState.grid[0].some(cell => cell !== 0)) {
    gameState.gameOver = true;
    return;
  }

  // Spawn new piece
  gameState.currentPiece = gameState.nextPiece;
  gameState.nextPiece = createPiece();
}

function clearRows() {
  let rowsCleared = 0;
  
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (gameState.grid[y][x] === 0) {
        continue outer;
      }
    }
    
    // Remove completed row
    const row = gameState.grid.splice(y, 1)[0].fill(0);
    gameState.grid.unshift(row);
    rowsCleared++;
    y++;
  }

  // Update score and send attack
  if (rowsCleared > 0) {
    gameState.score += rowsCleared * 100;
    scoreDisplay.textContent = gameState.score;
    
    // Calculate attack rows based on number of rows cleared
    let attackRows = 0;
    if (rowsCleared === 4) { // Tetris
      attackRows = 4;
    } else if (rowsCleared === 3) {
      attackRows = 2;
    } else if (rowsCleared === 2) {
      attackRows = 1;
    }
    
    if (attackRows > 0) {
      socket.emit('attack', attackRows);
    }
  }
}

// Handle incoming attacks
socket.on('attack', (rows) => {
  // Shift grid up and add garbage rows
  for (let i = 0; i < rows; i++) {
    gameState.grid.pop(); // Remove bottom row
    gameState.grid.unshift(Array(COLS).fill(8)); // Add garbage row at top
  }
  
  // Check if attack caused game over
  if (gameState.grid[0].some(cell => cell !== 0 && cell !== 8)) {
    gameState.gameOver = true;
    socket.emit('gameOver');
  }
});

// Game loop
let lastTime = 0;
const dropInterval = 1000; // 1 second

function update(time = 0) {
  const deltaTime = time - lastTime;
  
  if (deltaTime > dropInterval) {
    dropPiece();
    lastTime = time;
    socket.emit('updateGameState', { 
      roomId: roomInput.value.trim(),
      gameState 
    });
  }

  if (gameState.gameOver) {
    // Game over animation
    const blink = Math.floor(time / 250) % 2;
    if (blink) {
      ctx1.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    }
    
    ctx1.fillStyle = '#fff';
    ctx1.font = '30px Arial';
    ctx1.textAlign = 'center';
    ctx1.fillText('GAME OVER!', canvas1.width/2, canvas1.height/2);
    
    // Show restart button
    document.getElementById('restartGame').style.display = 'inline-block';
    
    socket.emit('gameOver');
    return;
  }

  draw(ctx1, gameState);
  draw(ctx2, opponentState);
  drawNextPiece();
  requestAnimationFrame(update);
}

function draw(ctx, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw grid
  state.grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });

  // Draw current piece
  if (state.currentPiece) {
    state.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(
            (state.currentPiece.x + x) * BLOCK_SIZE,
            (state.currentPiece.y + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
  if (gameState.nextPiece) {
    gameState.nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          nextCtx.fillStyle = COLORS[value];
          nextCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
}

// Initialize game
init();

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
tetris/public/game.js

# VSCode Open Tabs
tetris/package.json
tetris/server.js
tetris/public/index.html
tetris/public/style.css
tetris/public/game.js

# Actively Running Terminals
## Original command: `cd tetris && npm install && node server.js`
</environment_details>

---

**Assistant:**

<thinking>
现在需要更新server.js以处理双人游戏逻辑。需要：
1. 添加房间管理功能
2. 处理玩家连接和断开
3. 同步双方游戏状态
4. 处理攻击和游戏结束事件
</thinking>

<replace_in_file>
<path>tetris/server.js</path>
<diff>
<<<<<<< SEARCH
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
=======
const express = require('express');
const http = require('

[Response interrupted by a tool use result. Only one tool may be used at a time and should be placed at the end of the message.]

---

**User:**

[replace_in_file for 'tetris/server.js'] Result:
The tool execution failed with the following error:
<error>
The SEARCH block:
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
...does not match anything in the file.

This is likely because the SEARCH block content doesn't match exactly with what's in the file, or if you used multiple SEARCH/REPLACE blocks they may not have been in the order they appear in the file.

The file was reverted to its original state:

<file_content path="tetris/server.js">
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        players: new Map(),
        gameState: createInitialGameState()
      });
    }

    const room = rooms.get(roomId);
    if (room.players.size >= 2) {
      socket.emit('roomFull');
      return;
    }

    socket.join(roomId);
    room.players.set(socket.id, {
      id: socket.id,
      gameState: createInitialGameState()
    });

    if (room.players.size === 2) {
      io.to(roomId).emit('gameStart');
    }
  });

  socket.on('updateGameState', (data) => {
    const { roomId, gameState } = data;
    const room = rooms.get(roomId);
    if (room) {
      const player = room.players.get(socket.id);
      if (player) {
        player.gameState = gameState;
        socket.to(roomId).emit('opponentUpdate', {
          id: socket.id,
          gameState
        });
      }
    }
  });

  socket.on('hardDrop', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('opponentHardDrop');
    }
  });

  socket.on('restartGame', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.players.forEach(player => {
          player.gameState = createInitialGameState();
        });
        io.to(roomId).emit('gameStart');
      }
    }
  });

  socket.on('gameOver', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('gameOver');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // Clean up disconnected players
    rooms.forEach((room, roomId) => {
      if (room.players.delete(socket.id)) {
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

function createInitialGameState() {
  return {
    grid: Array(20).fill().map(() => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    gameOver: false
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

</file_content>

Try again with a more precise SEARCH block.
(If you keep running into this error, you may use the write_to_file tool as a workaround.)
</error>
<environment_details>
# VSCode Visible Files
tetris/server.js

# VSCode Open Tabs
tetris/package.json
tetris/public/index.html
tetris/public/style.css
tetris/public/game.js
tetris/server.js

# Actively Running Terminals
## Original command: `cd tetris && npm install && node server.js`
</environment_details>

---

**Assistant:**

<thinking>
由于SEARCH/REPLACE失败，改用write_to_file工具来更新server.js文件。需要：
1. 添加房间管理功能
2. 处理玩家连接和断开
3. 同步双方游戏状态
4. 处理攻击和游戏结束事件
</thinking>

<write_to_file>
<path>tetris/server.js</path>
<content>
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        players: new Map(),
        gameState: createInitialGameState()
      });
    }

    const room = rooms.get(roomId);
    if (room.players.size >= 2) {
      socket.emit('roomFull');
      return;
    }

    socket.join(roomId);
    room.players.set(socket.id, {
      id: socket.id,
      gameState: createInitialGameState()
    });

    if (room.players.size === 2) {
      io.to(roomId).emit('gameStart');
    }
  });

  socket.on('updateGameState', (data) => {
    const { roomId, gameState } = data;
    const room = rooms.get(roomId);
    if (room) {
      const player = room.players.get(socket.id);
      if (player) {
        player.gameState = gameState;
        socket.to(roomId).emit('opponentUpdate', {
          id: socket.id,
          gameState
        });
      }
    }
  });

  socket.on('attack', (rows) => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('attack', rows);
    }
  });

  socket.on('hardDrop', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('opponentHardDrop');
    }
  });

  socket.on('restartGame', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.players.forEach(player => {
          player.gameState = createInitialGameState();
        });
        io.to(roomId).emit('gameStart');
      }
    }
  });

  socket.on('gameOver', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('gameOver');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // Clean up disconnected players
    rooms.forEach((room, roomId) => {
      if (room.players.delete(socket.id)) {
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

function createInitialGameState() {
  return {
    grid: Array(20).fill().map(() => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    gameOver: false
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
</content>
</write_to_file>

---

**User:**

[write_to_file for 'tetris/server.js'] Result:
The content was successfully saved to tetris/server.js.

Here is the full, updated content of the file that was saved:

<final_file_content path="tetris/server.js">
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        players: new Map(),
        gameState: createInitialGameState()
      });
    }

    const room = rooms.get(roomId);
    if (room.players.size >= 2) {
      socket.emit('roomFull');
      return;
    }

    socket.join(roomId);
    room.players.set(socket.id, {
      id: socket.id,
      gameState: createInitialGameState()
    });

    if (room.players.size === 2) {
      io.to(roomId).emit('gameStart');
    }
  });

  socket.on('updateGameState', (data) => {
    const { roomId, gameState } = data;
    const room = rooms.get(roomId);
    if (room) {
      const player = room.players.get(socket.id);
      if (player) {
        player.gameState = gameState;
        socket.to(roomId).emit('opponentUpdate', {
          id: socket.id,
          gameState
        });
      }
    }
  });

  socket.on('attack', (rows) => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('attack', rows);
    }
  });

  socket.on('hardDrop', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('opponentHardDrop');
    }
  });

  socket.on('restartGame', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.players.forEach(player => {
          player.gameState = createInitialGameState();
        });
        io.to(roomId).emit('gameStart');
      }
    }
  });

  socket.on('gameOver', () => {
    const roomId = [...socket.rooms][1];
    if (roomId) {
      socket.to(roomId).emit('gameOver');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // Clean up disconnected players
    rooms.forEach((room, roomId) => {
      if (room.players.delete(socket.id)) {
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

function createInitialGameState() {
  return {
    grid: Array(20).fill().map(() => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    gameOver: false
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
tetris/server.js

# VSCode Open Tabs
tetris/package.json
tetris/public/index.html
tetris/public/style.css
tetris/public/game.js
tetris/server.js

# Actively Running Terminals
## Original command: `cd tetris && npm install && node server.js`
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
双人对战俄罗斯方块游戏已完成。主要功能包括：
1. 双人实时对战功能
2. 房间系统支持
3. 游戏状态同步
4. 攻击系统（消除行后向对手发送垃圾行）
5. 游戏结束检测
6. 重新开始功能

可以通过以下命令启动游戏：
1. 打开终端并导航到tetris目录
2. 运行 `npm install` 安装依赖
3. 运行 `node server.js` 启动服务器
4. 在浏览器中打开 http://localhost:3000
5. 两个玩家输入相同的房间号即可开始对战
</result>
<command>cd tetris && npm install && node server.js</command>
</attempt_completion>

