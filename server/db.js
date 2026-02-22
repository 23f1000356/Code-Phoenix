import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'gamedata.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database storage structure
let gameDB = {
  users: {},
  gameSessions: {},
  puzzleEvents: {},
  chatMessages: {},
  leaderboard: {}
};

// Load existing data
function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      gameDB = JSON.parse(data);
      console.log('✅ Database loaded from file');
    }
  } catch (err) {
    console.warn('⚠️ Could not load database, starting fresh:', err.message);
  }
}

// Save data to file
function saveDB() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(gameDB, null, 2));
  } catch (err) {
    console.error('❌ Error saving database:', err);
  }
}

// Initialize database
export function initializeDatabase() {
  loadDB();
  console.log('✅ Database initialized successfully');
}

// User operations
export const userOps = {
  getOrCreate: (userId, username) => {
    try {
      if (gameDB.users[userId]) {
        return gameDB.users[userId];
      }

      gameDB.users[userId] = {
        id: userId,
        username,
        createdAt: new Date().toISOString(),
        lastPlayed: null,
        totalGames: 0,
        totalWins: 0,
        totalScore: 0,
        totalHintsUsed: 0,
        bestTime: null,
        bestScore: null,
        matchHistory: []
      };

      saveDB();
      return gameDB.users[userId];
    } catch (err) {
      console.error('Error in getOrCreate:', err);
      return null;
    }
  },

  updateStats: (userId, score, timeTaken, hintsUsed, success) => {
    try {
      const user = gameDB.users[userId];
      if (!user) return;

      user.totalGames += 1;
      if (success) user.totalWins += 1;
      user.totalScore += score;
      user.totalHintsUsed += hintsUsed;
      user.lastPlayed = new Date().toISOString();

      if (!user.bestTime || timeTaken < user.bestTime) {
        user.bestTime = timeTaken;
      }
      if (!user.bestScore || score > user.bestScore) {
        user.bestScore = score;
      }

      user.matchHistory.push({
        score,
        timeTaken,
        success,
        date: new Date().toISOString()
      });

      saveDB();
    } catch (err) {
      console.error('Error in updateStats:', err);
    }
  },

  getStats: (userId) => {
    try {
      return gameDB.users[userId] || null;
    } catch (err) {
      console.error('Error in getStats:', err);
      return null;
    }
  }
};

// Game session operations
export const gameOps = {
  create: (roomCode, hostId, difficulty, mode = 'multiplayer') => {
    try {
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      gameDB.gameSessions[gameId] = {
        id: gameId,
        roomCode,
        hostId,
        difficulty,
        mode, // 'solo' or 'multiplayer'
        createdAt: new Date().toISOString(),
        startedAt: null,
        endedAt: null,
        duration: null,
        status: 'waiting',
        success: false,
        finalScore: 0,
        participants: []
      };
      saveDB();
      return gameId;
    } catch (err) {
      console.error('Error in gameOps.create:', err);
      return null;
    }
  },

  start: (gameId) => {
    try {
      if (gameDB.gameSessions[gameId]) {
        gameDB.gameSessions[gameId].startedAt = new Date().toISOString();
        gameDB.gameSessions[gameId].status = 'playing';
        saveDB();
      }
    } catch (err) {
      console.error('Error in gameOps.start:', err);
    }
  },

  finish: (gameId, success, score, durationSeconds) => {
    try {
      if (gameDB.gameSessions[gameId]) {
        gameDB.gameSessions[gameId].endedAt = new Date().toISOString();
        gameDB.gameSessions[gameId].status = 'finished';
        gameDB.gameSessions[gameId].success = success;
        gameDB.gameSessions[gameId].finalScore = score;
        gameDB.gameSessions[gameId].duration = durationSeconds;
        saveDB();
      }
    } catch (err) {
      console.error('Error in gameOps.finish:', err);
    }
  },

  addParticipant: (gameId, userId, role, puzzle) => {
    try {
      if (gameDB.gameSessions[gameId]) {
        gameDB.gameSessions[gameId].participants.push({
          userId,
          role,
          puzzle,
          completedAt: null
        });
        saveDB();
      }
    } catch (err) {
      console.error('Error in gameOps.addParticipant:', err);
    }
  },

  getGameStats: (gameId) => {
    try {
      return gameDB.gameSessions[gameId] || null;
    } catch (err) {
      console.error('Error in gameOps.getGameStats:', err);
      return null;
    }
  }
};

// Puzzle event tracking
export const puzzleOps = {
  trackEvent: (gameId, userId, puzzleName, eventType, timeSeconds, hintsUsed, wrongAttempts) => {
    try {
      if (!gameDB.puzzleEvents[gameId]) {
        gameDB.puzzleEvents[gameId] = [];
      }

      gameDB.puzzleEvents[gameId].push({
        userId,
        puzzleName,
        eventType,
        timeSeconds,
        hintsUsed,
        wrongAttempts,
        timestamp: new Date().toISOString()
      });

      saveDB();
    } catch (err) {
      console.error('Error in puzzleOps.trackEvent:', err);
    }
  },

  updatePuzzleStats: (userId, puzzleName, isComplete, timeSeconds, hintsUsed, wrongAttempts) => {
    try {
      const user = gameDB.users[userId];
      if (user) {
        if (!user.puzzleStats) {
          user.puzzleStats = {};
        }

        if (!user.puzzleStats[puzzleName]) {
          user.puzzleStats[puzzleName] = {
            timesAttempted: 0,
            timesCompleted: 0,
            totalTime: 0,
            totalHints: 0,
            totalWrongAttempts: 0
          };
        }

        user.puzzleStats[puzzleName].timesAttempted += 1;
        if (isComplete) user.puzzleStats[puzzleName].timesCompleted += 1;
        user.puzzleStats[puzzleName].totalTime += timeSeconds;
        user.puzzleStats[puzzleName].totalHints += hintsUsed;
        user.puzzleStats[puzzleName].totalWrongAttempts += wrongAttempts;

        saveDB();
      }
    } catch (err) {
      console.error('Error in puzzleOps.updatePuzzleStats:', err);
    }
  },

  getPuzzleStats: (userId) => {
    try {
      const user = gameDB.users[userId];
      return user && user.puzzleStats ? user.puzzleStats : {};
    } catch (err) {
      console.error('Error in puzzleOps.getPuzzleStats:', err);
      return {};
    }
  }
};

// Leaderboard operations
export const leaderboardOps = {
  getTopScores: (limit = 20) => {
    try {
      const users = Object.values(gameDB.users)
        .filter(u => u.totalGames > 0)
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        .slice(0, limit)
        .map((u, idx) => ({
          rank: idx + 1,
          id: u.id,
          username: u.username,
          score: u.totalScore,
          wins: u.totalWins,
          bestTime: u.bestTime,
          gamesPlayed: u.totalGames
        }));

      return users;
    } catch (err) {
      console.error('Error in leaderboardOps.getTopScores:', err);
      return [];
    }
  },

  getRecentGames: (limit = 20) => {
    try {
      const games = Object.values(gameDB.gameSessions)
        .filter(g => g.status === 'finished')
        .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
        .slice(0, limit)
        .map(g => ({
          id: g.id,
          roomCode: g.roomCode,
          username: gameDB.users[g.hostId]?.username || 'Unknown',
          finalScore: g.finalScore,
          duration: g.duration,
          success: g.success,
          endedAt: g.endedAt,
          formattedTime: g.duration ? `${Math.floor(g.duration / 60)}:${(g.duration % 60).toString().padStart(2, '0')}` : '--:--'
        }));

      return games;
    } catch (err) {
      console.error('Error in leaderboardOps.getRecentGames:', err);
      return [];
    }
  },

  getUserStats: (userId) => {
    try {
      const user = gameDB.users[userId];
      if (!user) return null;

      const recentGames = Object.values(gameDB.gameSessions)
        .filter(g => g.participants.some(p => p.userId === userId) && g.status === 'finished')
        .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
        .slice(0, 10)
        .map(g => ({
          score: g.finalScore,
          time: g.duration,
          success: g.success,
          date: g.endedAt,
          formattedTime: g.duration ? `${Math.floor(g.duration / 60)}:${(g.duration % 60).toString().padStart(2, '0')}` : '--:--'
        }));

      const avgTime = user.totalWins > 0 && recentGames.length > 0
        ? Math.floor(recentGames.filter(g => g.success).reduce((sum, g) => sum + (g.time || 0), 0) / Math.max(user.totalWins, 1))
        : 0;

      return {
        ...user,
        matchHistory: recentGames,
        avgTime,
        bestTime: user.bestTime || 0,
        bestScore: user.bestScore || 0
      };
    } catch (err) {
      console.error('Error in leaderboardOps.getUserStats:', err);
      return null;
    }
  }
};

// Chat operations
export const chatOps = {
  saveMessage: (gameId, userId, username, message) => {
    try {
      if (!gameDB.chatMessages[gameId]) {
        gameDB.chatMessages[gameId] = [];
      }

      gameDB.chatMessages[gameId].push({
        userId,
        username,
        message,
        timestamp: new Date().toISOString()
      });

      saveDB();
    } catch (err) {
      console.error('Error in chatOps.saveMessage:', err);
    }
  },

  getGameChat: (gameId) => {
    try {
      return gameDB.chatMessages[gameId] || [];
    } catch (err) {
      console.error('Error in chatOps.getGameChat:', err);
      return [];
    }
  }
};

// Analytics operations
export const analyticsOps = {
  getGameAnalytics: (gameId) => {
    try {
      const game = gameDB.gameSessions[gameId];
      const events = gameDB.puzzleEvents[gameId] || [];

      if (!game) return null;

      return {
        game,
        events,
        participants: game.participants,
        overallStats: {
          totalEventsLogged: events.length,
          distinctPuzzles: [...new Set(events.map(e => e.puzzleName))].length,
          totalHintsUsed: events.reduce((sum, e) => sum + e.hintsUsed, 0),
          totalWrongAttempts: events.reduce((sum, e) => sum + e.wrongAttempts, 0)
        }
      };
    } catch (err) {
      console.error('Error in analyticsOps.getGameAnalytics:', err);
      return null;
    }
  },

  getUserAnalytics: (userId) => {
    try {
      const stats = leaderboardOps.getUserStats(userId);
      const puzzleStats = puzzleOps.getPuzzleStats(userId);

      if (!stats) return null;

      const successRate = stats.totalGames > 0
        ? Math.round((stats.totalWins / stats.totalGames) * 100)
        : 0;

      return {
        profile: stats,
        puzzlePerformance: puzzleStats,
        successRate,
        avgTimePerGame: stats.avgTime,
        lastPlayed: stats.lastPlayed
      };
    } catch (err) {
      console.error('Error in analyticsOps.getUserAnalytics:', err);
      return null;
    }
  }
};

export default gameDB;
