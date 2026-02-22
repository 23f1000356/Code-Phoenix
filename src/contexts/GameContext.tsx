import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import type { GameState, InventoryItem, RoomName } from '../types/game';
import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';

export interface Player {
    id: string;
    name: string;
    puzzle: string;
    ready: boolean;
    role?: string | null;
    isHost?: boolean;
}

interface Reaction {
    senderId: string;
    type: string;
    timestamp: number;
}

interface GameContextValue {
    gameState: GameState;
    startGame: () => void;
    changeRoom: (room: RoomName) => void;
    solvePuzzle: (puzzleId: string) => void;
    addToInventory: (item: InventoryItem) => void;
    consumeHint: () => boolean;
    trackHintUsed: () => void;
    trackIncorrectGuess: () => void;
    // Multiplayer specific
    isMultiplayer: boolean;
    teamCode: string | null;
    gameId: string | null;
    players: Player[];
    myId: string;
    userId: string;
    username: string;
    updateUsername: (name: string) => void;
    showBriefing: boolean;
    setShowBriefing: (show: boolean) => void;
    userStats: any;
    leaderboardDetailed: any[];
    getLeaderboard: (category: string) => void;
    refreshStats: () => void;
    createTeam: (name: string, difficulty?: string) => Promise<string>;
    joinTeam: (code: string, name: string) => Promise<boolean>;
    joinMatchmaking: (name: string) => void;
    leaveTeam: () => void;
    sendChat: (msg: string) => void;
    chatMessages: Array<{ senderId: string, senderName: string, text: string, timestamp: number }>;
    leaderboard: any[];
    error: string | null;

    // Advanced features
    difficulty: string;
    myRole: string | null;
    sendReaction: (type: string) => void;
    reactions: Reaction[];
    setDecision: (key: string, value: string) => void;

    // End Game
    gameCompleted: boolean;
    gameResult: any;
    setGameCompleted: (completed: boolean) => void;

    // Socket instance
    socket: Socket | null;
}

const GameContext = createContext<GameContextValue | null>(null);

const ROOM_TIME_LIMIT = 600; // 10 minutes per game
const SERVER_URL = `http://${window.location.hostname}:3334`;

const INITIAL_STATE: GameState = {
    currentRoom: 'menu',
    timeRemaining: ROOM_TIME_LIMIT,
    hintsRemaining: 3,
    inventory: [],
    solvedPuzzles: [],
};

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [timerActive, setTimerActive] = useState(false);

    // Multiplayer states
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [teamCode, setTeamCode] = useState<string | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const [myId, setMyId] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('normal');
    const [reactions, setReactions] = useState<any[]>([]);
    const myRole = players.find(p => p.id === myId)?.role || null;

    const [showBriefing, setShowBriefing] = useState(false);
    const [userStats, setUserStats] = useState<any>(null);
    const [leaderboardDetailed, setLeaderboardDetailed] = useState<any[]>([]);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [gameResult, setGameResult] = useState<any>(null);
    const [userId] = useState<string>(() => {
        const saved = localStorage.getItem('cipher_userId');
        if (saved) return saved;
        const newId = nanoid(10);
        localStorage.setItem('cipher_userId', newId);
        return newId;
    });
    const [username, setUsername] = useState<string>(() => {
        return localStorage.getItem('cipher_username') || '';
    });

    const updateUsername = (name: string) => {
        setUsername(name);
        localStorage.setItem('cipher_username', name);
    };

    // Disconnect cleanup
    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    // Local Timer Fallback / UI smoothing
    useEffect(() => {
        if (!timerActive || gameState.timeRemaining <= 0 || isMultiplayer) return;

        const interval = setInterval(() => {
            setGameState((prev) => ({ ...prev, timeRemaining: Math.max(0, prev.timeRemaining - 1) }));
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive, gameState.timeRemaining, isMultiplayer]);

    const initSocket = () => {
        if (!socketRef.current) {
            console.log("Connecting to server:", SERVER_URL);
            socketRef.current = io(SERVER_URL, {
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            socketRef.current.on('connect', () => {
                console.log("Socket connected:", socketRef.current?.id);
                setMyId(socketRef.current?.id || '');
                setError(null);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error("Socket connection error:", err);
                setError(`Server unreachable at ${SERVER_URL}. Ensure backend is running.`);
                setIsMultiplayer(false);
            });

            socketRef.current.on('player_list_updated', (updatedPlayers: Player[]) => {
                setPlayers(updatedPlayers);
            });

            socketRef.current.on('game_started', ({ timeRemaining, difficulty, assignments }) => {
                const me = assignments.find((a: any) => a.id === socketRef.current?.id);
                const startRoom = me ? me.puzzle : 'mirror';
                if (difficulty) setDifficulty(difficulty);
                setGameState(prev => ({
                    ...prev,
                    currentRoom: startRoom as RoomName,
                    timeRemaining
                }));
                // Update players list eagerly to show roles
                setPlayers(prev => prev.map(p => {
                    const assign = assignments.find((a: any) => a.id === p.id);
                    return assign ? { ...p, role: assign.role, puzzle: assign.puzzle } : p;
                }));
                setTimerActive(true);
                setShowBriefing(true);
            });

            socketRef.current.on('timer_update', (time) => {
                setGameState(prev => ({ ...prev, timeRemaining: time }));
            });

            socketRef.current.on('chat_received', (msg) => {
                setChatMessages(prev => [...prev, msg]);
            });

            socketRef.current.on('puzzle_solved_broadcast', ({ puzzleName }) => {
                setGameState(prev => {
                    if (prev.solvedPuzzles.includes(puzzleName)) return prev;
                    return { ...prev, solvedPuzzles: [...prev.solvedPuzzles, puzzleName] };
                });
            });

            socketRef.current.on('game_finished', (matchData) => {
                setTimerActive(false);
                setLeaderboard(matchData.leaderboard);
                setGameResult({
                    success: matchData.success,
                    score: matchData.score,
                    time: matchData.formattedTime,
                    leaderboard: matchData.leaderboard,
                    isMultiplayer: true
                });
                setGameCompleted(true);
                refreshStats();
            });

            socketRef.current.on('error', (errMsg: string) => {
                setError(errMsg);
            });
        }
        return socketRef.current;
    };

    const startGame = () => {
        const socket = socketRef.current;
        if (socket && teamCode) {
            socket.emit('player_ready', { roomCode: teamCode });
        } else {
            // Set game room immediately for solo mode
            setGameState({ ...INITIAL_STATE, currentRoom: 'mirror' as RoomName });
            setTimerActive(true);
            
            // Create solo game session in background
            fetch(`${SERVER_URL}/api/game/solo/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username, difficulty: 'normal' })
            })
            .then(res => res.json())
            .then(data => {
                if (data.gameId) {
                    setGameId(data.gameId);
                }
            })
            .catch(err => console.error('Error creating solo game:', err));
        }
    };

    const changeRoom = (room: RoomName) => {
        setGameState((prev) => ({ ...prev, currentRoom: room }));
    };

    const solvePuzzle = (puzzleId: string) => {
        setGameState((prev) => {
            if (prev.solvedPuzzles.includes(puzzleId)) return prev;
            const newSolved = [...prev.solvedPuzzles, puzzleId];

            if (!isMultiplayer && newSolved.length === 5) {
                setTimerActive(false);
                const timeTaken = ROOM_TIME_LIMIT - prev.timeRemaining;
                const score = Math.max(1000 - timeTaken * 2, 100);
                const minutes = Math.floor(timeTaken / 60);
                const seconds = timeTaken % 60;
                const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Set end game result
                setGameResult({
                    success: true,
                    score,
                    time: formattedTime,
                    timeTaken,
                    leaderboard: [],
                    isMultiplayer: false
                });
                setGameCompleted(true);
                
                // Report solo game completion to server
                if (gameId) {
                    fetch(`${SERVER_URL}/api/game/solo/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            gameId,
                            userId,
                            score,
                            timeTaken,
                            hintsUsed: 3 - prev.hintsRemaining,
                            success: true
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Solo game recorded:', data);
                        refreshStats(); // Update leaderboard
                    })
                    .catch(err => console.error('Error reporting game completion:', err));
                }
            }

            return { ...prev, solvedPuzzles: newSolved };
        });

        if (isMultiplayer && teamCode) {
            socketRef.current?.emit('puzzle_solved', { roomCode: teamCode, puzzleName: puzzleId });
        }
    };

    const addToInventory = (item: InventoryItem) => {
        setGameState((prev) => {
            if (prev.inventory.some(i => i.id === item.id)) return prev;
            return { ...prev, inventory: [...prev.inventory, item] };
        });
    };

    const consumeHint = () => {
        let used = false;
        setGameState((prev) => {
            if (prev.hintsRemaining <= 0) return prev;
            used = true;
            return { ...prev, hintsRemaining: prev.hintsRemaining - 1 };
        });
        if (used) trackHintUsed();
        return used;
    };

    // Multiplayer functions
    const createTeam = async (name: string, diff: string = 'normal'): Promise<string> => {
        setError(null);
        console.log(`[ACTION] Initializing room creation for: ${name} diff: ${diff}`);
        return new Promise((resolve, reject) => {
            const socket = initSocket();

            const timeout = setTimeout(() => {
                console.error("[ERROR] Room creation timed out after 15s. Socket state:", socket.connected ? 'connected' : 'disconnected');
                reject(new Error("Room creation timed out. Please check if backend is running on port 3334 and refresh."));
            }, 15000);

            console.log("[SOCKET] Emitting create_room...");
            socket.emit('create_room', { hostName: name, userId, difficulty: diff });

            socket.once('room_created', ({ roomCode }) => {
                console.log("[SOCKET] Received room_created:", roomCode);
                clearTimeout(timeout);
                console.log("Room created:", roomCode);
                setIsMultiplayer(true);
                setTeamCode(roomCode);
                setDifficulty(diff);
                resolve(roomCode);
            });

            socket.once('connect_error', () => {
                clearTimeout(timeout);
                reject(new Error("Could not connect to the mission server."));
            });
        });
    };

    const joinTeam = async (code: string, name: string): Promise<boolean> => {
        setError(null);
        const cleanCode = code.toUpperCase().trim();
        return new Promise((resolve, reject) => {
            const socket = initSocket();

            const timeout = setTimeout(() => {
                reject(new Error("Join operation timed out."));
            }, 8000);

            socket.emit('join_room', { roomCode: cleanCode, playerName: name, userId });

            socket.once('room_joined', () => {
                clearTimeout(timeout);
                setIsMultiplayer(true);
                setTeamCode(cleanCode);
                resolve(true);
            });

            socket.once('error', (msg) => {
                clearTimeout(timeout);
                setError(msg);
                resolve(false);
            });
        });
    };

    const leaveTeam = () => {
        if (socketRef.current && teamCode) {
            socketRef.current.emit('disconnect_from_room', { roomCode: teamCode });
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setIsMultiplayer(false);
        setTeamCode(null);
        setGameId(null);
        setPlayers([]);
        setChatMessages([]);
        setReactions([]);
        setGameState(INITIAL_STATE);
        setTimerActive(false);
        setDifficulty('normal');
    };

    const joinMatchmaking = (name: string) => {
        const socket = initSocket();
        socket.emit('join_matchmaking', { userId, playerName: name });
        setError("Searching for Operatives...");
    };

    const sendReaction = (type: string) => {
        if (socketRef.current && teamCode) {
            socketRef.current.emit('send_reaction', { roomCode: teamCode, type });
        }
    };

    const setDecision = (key: string, value: string) => {
        if (socketRef.current && teamCode) {
            socketRef.current.emit('set_decision', { roomCode: teamCode, key, value });
        }
    };

    const sendChat = (message: string) => {
        if (socketRef.current && teamCode) {
            socketRef.current.emit('send_chat', { roomCode: teamCode, message });
        }
    };

    const getLeaderboard = (category: string) => {
        const socket = initSocket();
        const endpoint = category === 'recent' ? '/api/leaderboard/recent' : '/api/leaderboard/top';
        
        fetch(`http://${window.location.hostname}:3334${endpoint}`)
            .then(res => res.json())
            .then(data => {
                setLeaderboardDetailed(data.leaderboard || []);
            })
            .catch(err => {
                console.error('Error fetching leaderboard:', err);
                setLeaderboardDetailed([]);
            });
    };

    const refreshStats = () => {
        if (userId) {
            // Fetch user stats from API
            fetch(`http://${window.location.hostname}:3334/api/user/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUserStats(data.stats || null);
                })
                .catch(err => {
                    console.error('Error fetching user stats:', err);
                });
            
            // Fetch leaderboard
            getLeaderboard('score');
        }
    };

    const trackIncorrectGuess = () => {
        if (socketRef.current && teamCode) {
            socketRef.current.emit('incorrect_guess', { roomCode: teamCode });
        }
    };

    const trackHintUsed = () => {
        if (socketRef.current && teamCode) {
            socketRef.current.emit('hint_used', { roomCode: teamCode });
        }
    };

    return (
        <GameContext.Provider value={{
            gameState, startGame, changeRoom, solvePuzzle, addToInventory, consumeHint,
            isMultiplayer, teamCode, gameId, players, myId, createTeam, joinTeam, leaveTeam,
            sendChat, chatMessages, leaderboard, error,
            userId, username, updateUsername, showBriefing, setShowBriefing,
            userStats, leaderboardDetailed, getLeaderboard, refreshStats,
            trackIncorrectGuess, trackHintUsed,
            joinMatchmaking, difficulty, myRole, sendReaction, reactions, setDecision,
            gameCompleted, gameResult, setGameCompleted,
            socket: socketRef.current
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
    return ctx;
}
