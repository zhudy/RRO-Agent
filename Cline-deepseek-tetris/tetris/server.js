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
