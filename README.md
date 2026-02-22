# CIPHER: The Ashford Conspiracy

## 1. Introduction

Escape Room — The Ashford Conspiracy is a browser-based, real-time multiplayer forensic mystery game designed to deliver an immersive digital escape-room experience. Set inside the Ashford Estate, players investigate the murder of Eliza Ashford by solving five interconnected puzzle environments while racing against a shared countdown timer. The platform supports both a narrative-driven single-player mode and a synchronized multiplayer mode where players are assigned distinct investigative roles and responsibilities. Built using React, TypeScript, and Vite on the frontend, along with a Node.js and Socket.IO backend, the system combines storytelling, real-time communication, structured team coordination, and scalable architecture to create a collaborative and replayable investigative experience.

## 2. Problem Statement

Many online multiplayer games fail to successfully combine immersive storytelling with reliable real-time synchronization and structured collaboration. Players want engaging escape-room experiences that are accessible from anywhere, require no installation, and allow seamless teamwork with friends. However, existing solutions often lack proper real-time state management, meaningful role distribution, branching narrative depth, or stable backend architecture. The challenge is to design a browser-based multiplayer game that ensures synchronized gameplay, shared timers, structured puzzle progression, difficulty scaling, fair scoring, and session reliability — while maintaining smooth performance and delivering a compelling narrative-driven experience.

## 3. Working System & Architecture

### System Flow
1. User lands on narrative homepage
2. Unique user ID is generated or retrieved
3. Player selects Single Player or Multiplayer mode

#### Single Player Mode
- Countdown timer begins
- Player progresses sequentially through five forensic puzzle rooms
- Hints available based on difficulty
- Upon completion, score is calculated and leaderboard updated

#### Multiplayer Mode
- User creates a room, joins via code, or enters auto-matchmaking
- Host selects difficulty and starts session
- Backend assigns each player a specific role and puzzle
- Shared timer begins
- Puzzle states and progress sync in real time via Socket.IO
- Chat and optional voice enable coordination
- When puzzles are solved or time expires, backend computes final score and branching ending
- Leaderboard and player stats update instantly

### Architecture Overview

#### Frontend
- React + TypeScript + Vite
- Handles UI rendering, puzzle logic, and state display

#### Backend
- Node.js + Express
- Socket.IO for real-time synchronization
- Event-driven architecture
- In-memory room management

#### Optional Extensions
- Database for persistence
- Match history and analytics tracking

## 4. Features

### Gameplay
- **Five forensic puzzle rooms:**
  - Cipher (Vault Access)
  - Piano (Melody Deduction)
  - Furniture Alignment
  - Clock (Time of Death)
  - Evidence Wall (Final Accusation)
- Inventory and hint system
- Branching narrative endings

### Multiplayer
- Room-based team system
- Auto-matchmaking
- Role-based puzzle assignment
- Shared progress tracker
- Real-time synchronization

### Communication
- In-game chat
- Reaction/emote system
- Optional voice chat

### Difficulty & Scoring
- Easy / Normal / Hard modes
- Time-based scoring
- Difficulty multipliers
- Global leaderboard ranking

### Persistence
- Unique user identity system
- Player statistics tracking
- Match history
- Global leaderboard display

## 5. Unique Selling Propositions (USP)

### 1. True Asymmetric Multiplayer Collaboration
Each player is assigned a specific investigative role and puzzle responsibility, ensuring that no single participant has complete information. This structure enforces genuine teamwork and strategic communication, making multiplayer sessions deeply collaborative rather than parallel solo gameplay.

### 2. Narrative-Driven Branching Outcomes
The game adapts to player decisions. Accusations made, clues missed, and performance directly influence the ending. This creates meaningful consequences and strong replay value, transforming the experience from a simple puzzle game into an interactive investigation.

### 3. Fully Synchronized Real-Time Architecture
A dedicated backend maintains a shared timer, synchronized puzzle states, and real-time player updates. This ensures multiplayer sessions feel unified, responsive, and technically robust.

### 4. Scalable Digital Escape Platform
The modular architecture allows new cases, roles, puzzles, and storylines to be added without redesigning the core system. This positions the project as a scalable digital escape-room platform capable of expanding into episodic content, seasonal events, or premium case releases.

### 5. Monetization & Market Expansion Potential
The platform supports multiple revenue models, including paid expansion cases, corporate team-building packages, competitive ranked modes, and educational adaptations. Its browser-based accessibility and multiplayer infrastructure make it suitable for entertainment, corporate training, and academic environments.

## 6. Implementation

### Game Screens
- **Rooms**: Five interconnected puzzle environments with unique mechanics
- **Waiting Lobby**: Team assembly and role assignment interface
- **Cipher Room**: Cryptographic puzzle solving for vault access

### Visual Documentation

#### All Rooms Overview
![All Rooms](images/all%20rooms.jpeg)

#### Waiting Lobby
![Waiting Lobby](images/waiting%20room.jpeg)

#### Cipher Room
![Cipher Room](images/cipher%20room.jpeg)

#### Clock Game
![Clock Game](images/clock%20game.jpeg)

#### Case Close
![Case Close](images/case%20close.jpeg)

## 7. How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

#### 1. Start the Backend (Server)
The backend handles real-time multiplayer synchronization, global leaderboards, and scoring.

1. Open a new terminal
2. Navigate to the `server` directory:
   ```bash
   cd server
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   *The server will run on **http://localhost:3334***

#### 2. Start the Frontend (Game Client)
The frontend is the main game environment.

1. Open a second terminal window
2. Navigate to the project root directory:
   ```bash
   cd "Escape Room"
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The game will be available at **http://localhost:5173***

### How to Play Multiplayer
1. **Launch both servers** as described above
2. Open the game in your browser
3. On the **Landing Page**, enter your **Agent Codename**
4. Click **"TEAM MISSION"**
5. Click **"CREATE ROOM"**. You will receive a 6-character secure Room Code
6. Share this code with your teammates. They should click **"TEAM MISSION"** -> **"JOIN"** and enter your code
7. Once everyone is in the lobby, the Host can click **"START INVESTIGATION"**

## 8. Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Socket.io, Nanoid
- **State Management**: React Context API (GameContext)
- **Real-time Communication**: WebSocket (Socket.IO)
- **Database**: SQLite (for persistence)

## 9. Contributing
This project is designed as a scalable digital escape-room platform. New cases, puzzles, and storylines can be added by extending the modular architecture.
