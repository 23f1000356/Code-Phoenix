import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import cors from 'cors';
import { initializeDatabase, userOps, gameOps, puzzleOps, leaderboardOps, chatOps, analyticsOps } from './db.js';

const HTTP_PORT = 3334;
const SOCKET_PORT = 3334;

// Initialize database on startup
initializeDatabase();

// Create HTTP server with CORS support
const httpServer = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Basic health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }

  // Get leaderboard - top scores
  if (req.url === '/api/leaderboard/top' && req.method === 'GET') {
    const topScores = leaderboardOps.getTopScores(20);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ leaderboard: topScores }));
    return;
  }

  // Get leaderboard - recent games
  if (req.url === '/api/leaderboard/recent' && req.method === 'GET') {
    const recentGames = leaderboardOps.getRecentGames(20);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ leaderboard: recentGames }));
    return;
  }

  // Get user stats
  if (req.url.startsWith('/api/user/') && req.method === 'GET') {
    const userId = req.url.split('/').pop();
    const stats = leaderboardOps.getUserStats(userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ stats: stats || {} }));
    return;
  }

  // Get game analytics
  if (req.url.startsWith('/api/analytics/game/') && req.method === 'GET') {
    const gameId = req.url.split('/').pop();
    const analytics = analyticsOps.getGameAnalytics(gameId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ analytics: analytics || {} }));
    return;
  }

  // Get user analytics
  if (req.url.startsWith('/api/analytics/user/') && req.method === 'GET') {
    const userId = req.url.split('/').pop();
    const analytics = analyticsOps.getUserAnalytics(userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ analytics: analytics || {} }));
    return;
  }

  // Create solo game session
  if (req.url === '/api/game/solo/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { userId, username, difficulty } = JSON.parse(body);
        userOps.getOrCreate(userId, username);
        const gameId = gameOps.create('solo', userId, difficulty, 'solo');
        gameOps.start(gameId);
        gameOps.addParticipant(gameId, userId, 'Operator', 'all');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ gameId, status: 'created' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Complete solo game session
  if (req.url === '/api/game/solo/complete' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { gameId, userId, score, timeTaken, hintsUsed, success } = JSON.parse(body);
        gameOps.finish(gameId, success, score, timeTaken);
        userOps.updateStats(userId, score, timeTaken, hintsUsed, success);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'completed', score, success }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game state management
const rooms = new Map(); // roomCode -> roomData
const players = new Map(); // socketId -> playerData
const userSessions = new Map(); // userId -> userData

// Generate room code with only uppercase and numbers
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Room data structure
const createRoom = (hostName, hostId, difficulty = 'normal') => {
  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    hostId,
    difficulty,
    players: [],
    gameState: {
      currentRoom: 'menu',
      timeRemaining: 600, // 10 minutes
      hintsRemaining: 3,
      solvedPuzzles: [],
      inventory: []
    },
    status: 'waiting', // waiting, playing, finished
    createdAt: new Date(),
    startTime: null,
    endTime: null
  };
  
  // Add host as first player
  room.players.push({
    id: hostId,
    name: hostName,
    socketId: hostId,
    ready: false,
    role: null,
    puzzle: null,
    isHost: true,
    joinedAt: new Date()
  });
  
  rooms.set(roomCode, room);
  console.log(`Room created: ${roomCode} by ${hostName} (${hostId})`);
  return room;
};

// Validate room code (case-insensitive)
const isValidRoomCode = (code) => {
  const normalized = code.toUpperCase().trim();
  return /^[A-Z0-9]{6}$/.test(normalized) && rooms.has(normalized);
};

// Get room by code
const getRoom = (roomCode) => {
  return rooms.get(roomCode);
};

// Add player to room
const addPlayerToRoom = (roomCode, playerName, playerId, socketId) => {
  const room = getRoom(roomCode);
  if (!room) return null;
  
  if (room.players.length >= 4) {
    throw new Error('Room is full');
  }
  
  if (room.players.find(p => p.id === playerId)) {
    throw new Error('Player already in room');
  }
  
  const player = {
    id: playerId,
    name: playerName,
    socketId,
    ready: false,
    role: null,
    puzzle: null,
    isHost: false,
    joinedAt: new Date()
  };
  
  room.players.push(player);
  console.log(`Player ${playerName} joined room ${roomCode}`);
  return player;
};

// Remove player from room
const removePlayerFromRoom = (roomCode, playerId) => {
  const room = getRoom(roomCode);
  if (!room) return false;
  
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return false;
  
  const player = room.players[playerIndex];
  room.players.splice(playerIndex, 1);
  
  // If host leaves, assign new host
  if (player.isHost && room.players.length > 0) {
    room.players[0].isHost = true;
    room.hostId = room.players[0].id;
  }
  
  // Delete room if empty
  if (room.players.length === 0) {
    rooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted (empty)`);
  }
  
  console.log(`Player ${player.name} left room ${roomCode}`);
  return true;
};

// Assign roles and puzzles to players
const assignRoles = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  const roles = ['Investigator', 'Analyst', 'Technician', 'Observer'];
  const puzzles = ['mirror', 'piano', 'furniture', 'clock'];
  
  // Shuffle assignments
  const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
  const shuffledPuzzles = [...puzzles].sort(() => Math.random() - 0.5);
  
  room.players.forEach((player, index) => {
    player.role = shuffledRoles[index % shuffledRoles.length];
    player.puzzle = shuffledPuzzles[index % shuffledPuzzles.length];
    player.ready = true;
  });
  
  room.status = 'playing';
  room.startTime = new Date();
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Store basic player info
  players.set(socket.id, {
    socketId: socket.id,
    connectedAt: new Date(),
    currentRoom: null
  });
  
  // Create room
  socket.on('create_room', ({ hostName, userId, difficulty }) => {
    try {
      // Ensure user exists in database
      userOps.getOrCreate(userId, hostName);
      
      const room = createRoom(hostName, socket.id, difficulty);
      const player = players.get(socket.id);
      if (player) {
        player.currentRoom = room.code;
        player.userId = userId;
      }
      
      // Create game session in database
      const gameId = gameOps.create(room.code, userId, difficulty);
      room.gameId = gameId;
      
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code });
      
      console.log(`Room ${room.code} created by ${hostName} (Game: ${gameId})`);
    } catch (error) {
      console.error('Error in create_room:', error);
      socket.emit('error', error.message);
    }
  });
  
  // Join room
  socket.on('join_room', ({ roomCode, playerName, userId }) => {
    try {
      const normalizedCode = roomCode.toUpperCase().trim();
      if (!isValidRoomCode(normalizedCode)) {
        socket.emit('error', 'Invalid room code');
        return;
      }
      
      const player = addPlayerToRoom(normalizedCode, playerName, userId, socket.id);
      if (!player) {
        socket.emit('error', 'Failed to join room');
        return;
      }
      
      const playerData = players.get(socket.id);
      if (playerData) {
        playerData.currentRoom = normalizedCode;
        playerData.userId = userId;
      }
      
      socket.join(normalizedCode);
      socket.emit('room_joined');
      
      // Notify all players in room
      const room = getRoom(normalizedCode);
      io.to(normalizedCode).emit('player_list_updated', room.players);
      
      console.log(`${playerName} joined room ${normalizedCode}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  // Leave room
  socket.on('disconnect_from_room', ({ roomCode }) => {
    const player = players.get(socket.id);
    if (player && player.currentRoom) {
      removePlayerFromRoom(player.currentRoom, socket.id);
      socket.leave(player.currentRoom);
      
      const room = getRoom(player.currentRoom);
      if (room) {
        io.to(player.currentRoom).emit('player_list_updated', room.players);
      }
      
      player.currentRoom = null;
    }
  });
  
  // Start game
  socket.on('player_ready', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (player) {
      player.ready = true;
    }
    
    // Broadcast updated player list to all in room
    io.to(roomCode).emit('player_list_updated', room.players);
    
    // Check if all players are ready
    if (room.players.every(p => p.ready) && room.players.length >= 1) {
      assignRoles(roomCode);
      
      // Record game start in database
      if (room.gameId) {
        gameOps.start(room.gameId);
        room.players.forEach(p => {
          gameOps.addParticipant(room.gameId, p.id, p.role, p.puzzle);
        });
      }
      
      // Start game for all players
      io.to(roomCode).emit('game_started', {
        timeRemaining: room.gameState.timeRemaining,
        difficulty: room.difficulty,
        assignments: room.players.map(p => ({
          id: p.id,
          role: p.role,
          puzzle: p.puzzle
        }))
      });
      
      // Start timer
      const timerInterval = setInterval(() => {
        const currentRoom = getRoom(roomCode);
        if (!currentRoom) {
          clearInterval(timerInterval);
          return;
        }
        
        currentRoom.gameState.timeRemaining--;
        
        if (currentRoom.gameState.timeRemaining <= 0) {
          clearInterval(timerInterval);
          currentRoom.status = 'finished';
          currentRoom.endTime = new Date();
          
          // Record game finish in database
          if (currentRoom.gameId) {
            const duration = Math.floor((currentRoom.endTime - currentRoom.startTime) / 1000);
            gameOps.finish(currentRoom.gameId, false, 0, duration);
          }
          
          io.to(roomCode).emit('game_finished', {
            success: false,
            score: 0,
            formattedTime: '10:00',
            leaderboard: []
          });
        } else {
          io.to(roomCode).emit('timer_update', currentRoom.gameState.timeRemaining);
        }
      }, 1000);
    }
  });
  
  // Puzzle solved
  socket.on('puzzle_solved', ({ roomCode, puzzleName }) => {
    const room = getRoom(roomCode);
    const playerData = players.get(socket.id);
    if (!room || !playerData) return;
    
    if (!room.gameState.solvedPuzzles.includes(puzzleName)) {
      room.gameState.solvedPuzzles.push(puzzleName);
      
      // Track puzzle event in database
      if (room.gameId) {
        puzzleOps.trackEvent(room.gameId, playerData.userId, puzzleName, 'solved');
        puzzleOps.updatePuzzleStats(playerData.userId, puzzleName, true, 0, 0, 0);
      }
      
      // Check win condition
      if (room.gameState.solvedPuzzles.length >= 5) {
        room.status = 'finished';
        room.endTime = new Date();
        
        const timeTaken = 600 - room.gameState.timeRemaining;
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;
        const finalScore = Math.max(1000 - timeTaken * 2, 100);
        
        // Record game finish & update user stats
        if (room.gameId) {
          const duration = Math.floor((room.endTime - room.startTime) / 1000);
          gameOps.finish(room.gameId, true, finalScore, duration);
          
          // Update stats for all players
          room.players.forEach(p => {
            if (playerData.userId) {
              userOps.updateStats(playerData.userId, finalScore, timeTaken, room.gameState.hintsRemaining, true);
            }
          });
        }
        
        io.to(roomCode).emit('game_finished', {
          success: true,
          score: finalScore,
          formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          leaderboard: room.players.map(p => ({
            name: p.name,
            score: finalScore,
            time: timeTaken
          }))
        });
      }
      
      // Broadcast puzzle completion
      io.to(roomCode).emit('puzzle_solved_broadcast', { puzzleName });
    }
  });
  
  // Chat functionality
  socket.on('send_chat', ({ roomCode, message }) => {
    const player = players.get(socket.id);
    const room = getRoom(roomCode);
    
    if (player && room) {
      const roomPlayer = room.players.find(p => p.socketId === socket.id);
      if (roomPlayer) {
        const chatMessage = {
          senderId: socket.id,
          senderName: roomPlayer.name,
          text: message,
          timestamp: Date.now()
        };
        
        // Save chat to database
        if (room.gameId) {
          chatOps.saveMessage(room.gameId, player.userId, roomPlayer.name, message);
        }
        
        io.to(roomCode).emit('chat_received', chatMessage);
      }
    }
  });

  // Track hint usage
  socket.on('hint_used', ({ roomCode }) => {
    const player = players.get(socket.id);
    const room = getRoom(roomCode);
    
    if (player && room && room.gameId) {
      puzzleOps.trackEvent(room.gameId, player.userId, 'unknown', 'hint_used', 0, 1, 0);
    }
  });

  // Track incorrect guess
  socket.on('incorrect_guess', ({ roomCode }) => {
    const player = players.get(socket.id);
    const room = getRoom(roomCode);
    
    if (player && room && room.gameId) {
      puzzleOps.trackEvent(room.gameId, player.userId, 'unknown', 'incorrect_guess', 0, 0, 1);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    const player = players.get(socket.id);
    if (player && player.currentRoom) {
      removePlayerFromRoom(player.currentRoom, socket.id);
      
      const room = getRoom(player.currentRoom);
      if (room) {
        io.to(player.currentRoom).emit('player_list_updated', room.players);
      }
    }
    
    players.delete(socket.id);
  });
});

// Start server
httpServer.listen(SOCKET_PORT, () => {
  console.log(`🚀 Escape Room Server running on port ${SOCKET_PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🏥 Health check: http://localhost:${SOCKET_PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
