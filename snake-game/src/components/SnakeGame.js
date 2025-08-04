import React, { useState, useEffect, useCallback } from 'react';

const SnakeGame = () => {
  // Much smaller, more reasonable grid size
  const GRID_SIZE = 12;
  const INITIAL_SNAKE = [{ x: 6, y: 6 }];
  const INITIAL_FOOD = { x: 3, y: 3 };
  const INITIAL_DIRECTION = { x: 0, y: -1 };

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(250);

  // Generate random food position
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  // Check collision with walls or self
  const checkCollision = useCallback((head) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

        if (checkCollision(head)) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setScore(prevScore => {
            const newScore = prevScore + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
            }
            return newScore;
          });
          setFood(generateFood());
          setSpeed(prevSpeed => Math.max(120, prevSpeed - 5));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, direction, food, checkCollision, generateFood, speed, highScore]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      e.preventDefault();
      
      if (!gameStarted && !gameOver) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          setGameStarted(true);
        }
      }

      if (gameStarted && !gameOver) {
        switch (e.key) {
          case 'ArrowUp':
            setDirection(prev => prev.y === 0 ? { x: 0, y: -1 } : prev);
            break;
          case 'ArrowDown':
            setDirection(prev => prev.y === 0 ? { x: 0, y: 1 } : prev);
            break;
          case 'ArrowLeft':
            setDirection(prev => prev.x === 0 ? { x: -1, y: 0 } : prev);
            break;
          case 'ArrowRight':
            setDirection(prev => prev.x === 0 ? { x: 1, y: 0 } : prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setSpeed(250);
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const getStatusMessage = () => {
    if (gameOver) return "💀 Game Over! Click restart to play again";
    if (!gameStarted) return "🎮 Press any arrow key or click start!";
    return "🐍 Gobble up those juicy apples!";
  };

  const getStatusColor = () => {
    if (gameOver) return "from-red-500 to-pink-500";
    if (!gameStarted) return "from-purple-500 to-indigo-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/20">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🐍 Snake
          </h1>
          <div className="text-sm text-gray-600 font-medium">
            Classic arcade fun!
          </div>
        </div>

        {/* Score & High Score */}
        <div className="flex justify-between items-center mb-4 gap-3">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl border-2 border-blue-200 flex-1">
            <div className="text-xs text-purple-600 font-bold">SCORE</div>
            <div className="text-lg font-black text-purple-800">{score}</div>
          </div>
          <div className="bg-gradient-to-r from-pink-100 to-red-100 px-4 py-2 rounded-xl border-2 border-pink-200 flex-1">
            <div className="text-xs text-red-600 font-bold">BEST</div>
            <div className="text-lg font-black text-red-800">{highScore}</div>
          </div>
        </div>

        {/* Status */}
        <div className={`bg-gradient-to-r ${getStatusColor()} text-white text-center py-3 px-4 rounded-xl mb-4 shadow-lg`}>
          <div className="font-bold text-sm">
            {getStatusMessage()}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl mb-4 shadow-inner">
          <div className="grid grid-cols-12 gap-1 aspect-square">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-sm transition-all duration-100
                    ${isFood ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50' :
                      isHead ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30' :
                      isSnake ? 'bg-gradient-to-br from-green-300 to-green-500' :
                      'bg-gradient-to-br from-gray-600 to-gray-700'}
                    ${isFood ? 'animate-pulse' : ''}
                    ${isHead ? 'scale-110' : ''}
                  `}
                />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={resetGame}
            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            🔄 Restart
          </button>
          {!gameStarted && !gameOver && (
            <button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              🚀 Start
            </button>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 mb-4 sm:hidden">
          <div></div>
          <button
            onTouchStart={() => !gameOver && setDirection(prev => prev.y === 0 ? { x: 0, y: -1 } : prev)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-2xl active:bg-gray-400 transition-colors"
          >
            ⬆️
          </button>
          <div></div>
          <button
            onTouchStart={() => !gameOver && setDirection(prev => prev.x === 0 ? { x: -1, y: 0 } : prev)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-2xl active:bg-gray-400 transition-colors"
          >
            ⬅️
          </button>
          <button
            onTouchStart={() => !gameOver && setDirection(prev => prev.y === 0 ? { x: 0, y: 1 } : prev)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-2xl active:bg-gray-400 transition-colors"
          >
            ⬇️
          </button>
          <button
            onTouchStart={() => !gameOver && setDirection(prev => prev.x === 0 ? { x: 1, y: 0 } : prev)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-2xl active:bg-gray-400 transition-colors"
          >
            ➡️
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
          <div className="text-center space-y-1">
            <div className="text-sm font-bold text-gray-700">
              🎯 How to Play
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              Use arrow keys (or touch buttons on mobile) to guide your snake. 
              Eat the red apples to grow longer and increase your score!
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SnakeGame;