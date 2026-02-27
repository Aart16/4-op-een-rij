const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 0, scores = { player: 0, cpu: 0 };
let gameMode = 'cpu'; // 'cpu' of 'pvp'

function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('label-opponent').innerText = (mode === 'cpu') ? "Computer" : "Geel";
    resetScores();
    init();
}

function showMenu() {
    document.getElementById('menu-overlay').style.display = 'flex';
}

function resetScores() {
    scores = { player: 0, cpu: 0 };
    document.getElementById('score-player').innerText = "0";
    document.getElementById('score-cpu').innerText = "0";
}

function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    currentPlayer = 'red';
    updateStatusLabel();
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.onclick = () => play(c);
            boardDiv.appendChild(cell);
        }
    }
    updateCursor();
}

async function play(c) {
    if (gameOver) return;
    
    // Blokkeer input als de computer aan de beurt is
    if (gameMode === 'cpu' && currentPlayer === 'yellow') return;

    if (makeMove(c, currentPlayer)) {
        if (!gameOver) {
            currentPlayer = (currentPlayer === 'red') ? 'yellow' : 'red';
            updateStatusLabel();

            if (gameMode === 'cpu' && currentPlayer === 'yellow') {
                await new Promise(res => setTimeout(res, 600));
                makeComputerMove();
            }
        }
    }
}

function updateStatusLabel() {
    const label = document.getElementById('player-label');
    if (gameMode === 'cpu') {
        label.innerText = (currentPlayer === 'red') ? "Jij (Rood)" : "Computer denkt...";
    } else {
        label.innerText = (currentPlayer === 'red') ? "Speler 1 (Rood)" : "Speler 2 (Geel)";
    }
    label.className = currentPlayer;
}

// ... de rest van de functies (makeMove, checkWin, makeComputerMove, etc.) blijven hetzelfde als in de vorige stap ...
// Zorg dat je makeMove aanpast om de juiste score bij te werken:

function makeMove(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = player;
            draw();
            if (checkWin(r, c)) {
                gameOver = true;
                if(player === 'red') {
                    scores.player++;
                    document.getElementById('score-player').innerText = scores.player;
                } else {
                    scores.cpu++;
                    document.getElementById('score-cpu').innerText = scores.cpu;
                }
                setTimeout(() => alert(player.toUpperCase() + " WINT!"), 10);
                return true;
            }
            return true;
        }
    }
    return false;
}

// Voeg de keydown en draw functies toe zoals eerder
document.getElementById('reset-btn').onclick = init;
// init() roepen we nu niet direct aan, dat doet startGame()