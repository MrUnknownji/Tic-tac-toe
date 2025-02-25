import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";
import { createMatch } from "../../src/api";
import CustomDropdown from "../common/CustomDropdown";

const WIN_POSITIONS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["1", "4", "7"],
  ["2", "5", "8"],
  ["3", "6", "9"],
  ["1", "5", "9"],
  ["3", "5", "7"],
];

// Smart AI implementation using minimax algorithm
const getSmartBotMove = (positions: { [key: string]: string }) => {
  // Create a board representation for the minimax algorithm
  const board = Array(9).fill(null);
  for (let i = 1; i <= 9; i++) {
    board[i-1] = positions[i.toString()] || "";
  }
  
  // Find the best move using minimax
  const bestMove = findBestMove(board);
  return (bestMove + 1).toString(); // Convert back to 1-9 position
};

// Minimax algorithm implementation
const minimax = (board: string[], depth: number, isMaximizing: boolean): number => {
  // Check for terminal states
  const winner = checkWinner(board);
  if (winner === "X") return -10 + depth; // Human wins
  if (winner === "O") return 10 - depth; // Bot wins
  if (isBoardFull(board)) return 0; // Draw
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      // Check if cell is empty
      if (!board[i]) {
        board[i] = "O"; // Bot's move
        const score = minimax(board, depth + 1, false);
        board[i] = ""; // Undo move
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      // Check if cell is empty
      if (!board[i]) {
        board[i] = "X"; // Human's move
        const score = minimax(board, depth + 1, true);
        board[i] = ""; // Undo move
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

// Find the best move for the AI
const findBestMove = (board: string[]): number => {
  let bestScore = -Infinity;
  let bestMove = -1;
  
  for (let i = 0; i < 9; i++) {
    // Check if cell is empty
    if (!board[i]) {
      board[i] = "O"; // Bot's move
      const score = minimax(board, 0, false);
      board[i] = ""; // Undo move
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  
  return bestMove;
};

// Helper function to check for a winner
const checkWinner = (board: string[]): string | null => {
  for (const [a, b, c] of WIN_POSITIONS.map(pos => pos.map(p => parseInt(p) - 1))) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

// Helper function to check if the board is full
const isBoardFull = (board: string[]): boolean => {
  return !board.includes("");
};

const Game = ({ username, userId }: { username: string; userId: string }) => {
  // Game state
  const [positions, setPositions] = useState<{ [key: string]: "X" | "O" | "" }>({});
  const [currentPlayer, setCurrentPlayer] = useState<"user" | "bot">("user");
  const [winner, setWinner] = useState<"user" | "bot" | "draw" | null>(null);
  const [gameMessage, setGameMessage] = useState("");
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [lastMove, setLastMove] = useState<string | null>(null);
  
  // Game settings
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [firstMove, setFirstMove] = useState<"user" | "bot">("user");
  
  // Game flow state
  const [gameState, setGameState] = useState<"setup" | "playing" | "finished">("setup");
  
  const navigate = useNavigate();
  const gameRef = useRef<HTMLDivElement>(null);

  // Start the game with the selected first player
  const startGame = () => {
    setGameState("playing");
    setCurrentPlayer(firstMove);
    
    // If AI goes first, trigger its move
    if (firstMove === "bot") {
      // We'll let the useEffect handle the AI move
    }
  };

  // Reset the game completely
  const resetGame = () => {
    setPositions({});
    setCurrentPlayer("user");
    setWinner(null);
    setWinningLine(null);
    setGameMessage("");
    setLastMove(null);
    setGameState("setup");
  };

  // Play again with the same settings
  const playAgain = () => {
    setPositions({});
    setCurrentPlayer(firstMove);
    setWinner(null);
    setWinningLine(null);
    setGameMessage("");
    setLastMove(null);
    setGameState("playing");
  };

  // Update game state when there's a winner
  useEffect(() => {
    if (winner) {
      setGameState("finished");
      const result = winner === "draw" ? "draw" : winner === "user" ? "win" : "loss";
      createMatch(userId, result)
        .then(() => {
          setTimeout(() => {
            setGameMessage(`${result.charAt(0).toUpperCase() + result.slice(1)}! Game saved.`);
          }, 500);
        })
        .catch((error) => console.log("Error adding result: ", error));
    }
  }, [winner, userId]);

  // Bot's turn
  useEffect(() => {
    if (currentPlayer === "bot" && gameState === "playing" && !winner) {
      const timer = setTimeout(() => {
        let botPosition;
        
        if (difficulty === "easy") {
          // Easy: 30% random, 70% smart
          botPosition = Math.random() < 0.3 
            ? getRandomBotMove(positions) 
            : getSmartBotMove(positions);
        } else if (difficulty === "medium") {
          // Medium: 10% random, 90% smart
          botPosition = Math.random() < 0.1 
            ? getRandomBotMove(positions) 
            : getSmartBotMove(positions);
        } else {
          // Hard: Always smart
          botPosition = getSmartBotMove(positions);
        }
        
        makeMove(botPosition);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, positions, difficulty, gameState]);

  const checkWinner = (currentPositions: { [key: string]: "X" | "O" | "" }) => {
    const playerPositions = Object.keys(currentPositions).filter(
      (key) => currentPositions[key] === (currentPlayer === "user" ? "X" : "O")
    );
    
    for (let i = 0; i < WIN_POSITIONS.length; i++) {
      const winPos = WIN_POSITIONS[i];
      if (winPos.every((p) => playerPositions.includes(p))) {
        setWinner(currentPlayer);
        setWinningLine(winPos.map(Number));
        return;
      }
    }
    
    if (Object.keys(currentPositions).length === 9) {
      setWinner("draw");
    } else {
      setCurrentPlayer(currentPlayer === "user" ? "bot" : "user");
    }
  };

  const makeMove = (position: string) => {
    if (positions[position] || winner) return;
    
    const newPositions: { [key: string]: "X" | "O" | "" } = {
      ...positions,
      [position]: currentPlayer === "user" ? "X" : "O",
    };
    
    setPositions(newPositions);
    setLastMove(position);
    checkWinner(newPositions);
  };

  const handleClick = (position: string) => {
    if (currentPlayer === "user") {
      makeMove(position);
    }
  };

  // Get a random valid move for the bot
  const getRandomBotMove = (currentPositions: { [key: string]: string }) => {
    const availablePositions = Array.from({ length: 9 }, (_, i) => (i + 1).toString())
      .filter((pos) => !currentPositions[pos]);
    
    return availablePositions[Math.floor(Math.random() * availablePositions.length)];
  };

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" }
  ];

  const firstMoveOptions = [
    { value: "user", label: "You First" },
    { value: "bot", label: "AI First" }
  ];

  return (
    <div className="game" ref={gameRef}>
      <div className="game-header">
        <button 
          className="back-button" 
          onClick={() => navigate("/home")}
          disabled={gameState === "playing" && !winner}
        >
          Back
        </button>
        <h2>Tic Tac Toe</h2>
      </div>
      
      <div className="game-settings">
        <div className="setting-group">
          <label>Difficulty:</label>
          <CustomDropdown 
            options={difficultyOptions}
            value={difficulty}
            onChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}
            placeholder="Select difficulty"
            disabled={gameState !== "setup"}
          />
        </div>
        
        <div className="setting-group">
          <label>First Move:</label>
          <CustomDropdown 
            options={firstMoveOptions}
            value={firstMove}
            onChange={(value) => {
              setFirstMove(value as "user" | "bot");
            }}
            placeholder="Who goes first"
            disabled={gameState !== "setup"}
          />
        </div>
      </div>
      
      <div className="players-container">
        <div className={`user-div ${currentPlayer === "user" ? "active-player" : ""}`}>
          <div className="circle"></div>
          <span className="user-txt">{username ?? "user"}</span>
        </div>
        <div className={`bot-div ${currentPlayer === "bot" ? "active-player" : ""}`}>
          <div className="circle"></div>
          <span className="bot-txt">AI Bot</span>
        </div>
      </div>
      
      <div className={`game-grid-container ${gameState === "setup" ? "disabled" : ""}`}>
        {winningLine && (
          <div 
            className={`winning-line ${winningLine[0] % 3 === winningLine[1] % 3 ? 'vertical' : 'horizontal'}`}
            style={{
              ...(winningLine[0] % 3 === winningLine[1] % 3 ? {
                top: '5%',
                left: `${(winningLine[0] - 1) % 3 * 33.33 + 16.5}%`,
                transform: 'rotate(0deg)'
              } : 
              winningLine[0] === 1 && winningLine[2] === 9 ? {
                top: '50%',
                left: '5%',
                transform: 'rotate(45deg)'
              } : 
              winningLine[0] === 3 && winningLine[2] === 7 ? {
                top: '50%',
                left: '5%',
                transform: 'rotate(-45deg)'
              } : 
              {
                top: `${33.33 * Math.floor((winningLine[0] - 1) / 3) + 16.5}%`,
                left: '5%',
                transform: 'rotate(0deg)'
              })
            }}
          />
        )}
        
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          <span
            key={num}
            className={`grid-span ${lastMove === String(num) ? 'pulse' : ''} ${positions[String(num)] ? 'filled' : ''}`}
            onClick={() => handleClick(String(num))}
          >
            {positions[String(num)]}
          </span>
        ))}
      </div>
      
      {gameMessage && <div className="game-message">{gameMessage}</div>}
      
      <div className="game-controls">
        {gameState === "setup" && (
          <button className="play-button" onClick={startGame}>
            Start Game
          </button>
        )}
        
        {gameState === "finished" && (
          <button className="play-again-button" onClick={playAgain}>
            Play Again
          </button>
        )}
        
        {gameState !== "setup" && (
          <button className="reset-button" onClick={resetGame}>
            New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Game;
