const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 3, scores = { player: 0, cpu: 0 }, gameMode = 'cpu';

function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('label-opponent').innerText = (mode === 'cpu') ? "CPU" : "Geel";
    init();
}

function showMenu() { document.getElementById('menu-overlay').style.display = 'flex'; }
function resetScores() {
    scores = { player: 0, cpu: 0 };
    document.getElementById('score-player').innerText = "0";
    document.getElementById('score-cpu').innerText = "0";
}

async function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    
    // LOTING: Wie begint?
    currentPlayer = Math.random() < 0.5 ? 'red' : 'yellow';
    
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.col = i % COLS;
        cell.onclick = () => play(parseInt(cell.dataset.col));
        boardDiv.appendChild(cell);
    }
    
    updateStatusLabel();
    draw();

    // Als de computer begint
    if (gameMode === 'cpu' && currentPlayer === 'yellow') {
        await new Promise(res => setTimeout(res, 800));
        makeComputerMove();
    }
}

function play(c) {
    if (gameOver || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
    if (makeMove(c, currentPlayer)) {
        if (!gameOver) {
            currentPlayer = (currentPlayer === 'red') ? 'yellow' : 'red';
            updateStatusLabel();
            if (gameMode === 'cpu' && currentPlayer === 'yellow') {
                setTimeout(makeComputerMove, 600);
            }
        }
    }
}

function makeMove(c, player) {
    // Klassieke zwaartekracht: zoek onderste rij
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = player;
            draw();
            if (checkWin(r, c)) {
                gameOver = true;
                if(player === 'red') scores.player++; else scores.cpu++;
                document.getElementById('score-player').innerText = scores.player;
                document.getElementById('score-cpu').innerText = scores.cpu;
                setTimeout(() => alert((player === 'red' ? "Rood" : "Geel") + " wint!"), 50);
            }
            return true;
        }
    }
    return false;
}

function makeComputerMove() {
    if (gameOver) return;
    let move = -1;
    // Slimme zet: win of blokkeer
    for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'yellow')) { move = c; break; }
    if (move === -1) for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'red')) { move = c; break; }
    if (move === -1) {
        let valid = [];
        for (let c = 0; c < COLS; c++) if (!board[0][c]) valid.push(c);
        move = valid.includes(3) ? 3 : valid[Math.floor(Math.random() * valid.length)];
    }
    makeMove(move, 'yellow');
    if (!gameOver) { currentPlayer = 'red'; updateStatusLabel(); }
}

function canWinNextMove(c, p) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = p; let w = checkWin(r, c); board[r][c] = null; return w;
        }
    }
    return false;
}

function checkWin(r, c) {
    const p = board[r][c], d = [[0,1],[1,0],[1,1],[1,-1]];
    return d.some(([dr, dc]) => {
        let count = 1;
        [[1,1],[-1,-1]].forEach(([s]) => {
            let nr = r + dr*s, nc = c + dc*s;
            while(nr>=0 && nr<ROWS && nc>=0 && nc<COLS && board[nr][nc] === p) {
                count++; nr += dr*s; nc += dc*s;
            }
        });
        return count >= 4;
    });
}

function draw() {
    const cells = document.querySelectorAll('.cell');
    board.flat().forEach((val, i) => {
        const c = i % COLS;
        cells[i].className = 'cell' + (val ? ' ' + val : '') + (c === activeCol ? ' active-column' : '');
    });
}

function updateStatusLabel() {
    const l = document.getElementById('player-label');
    if (gameMode === 'cpu') {
        l.innerText = (currentPlayer === 'red') ? "Jij bent aan de beurt" : "Computer denkt na...";
    } else {
        l.innerText = (currentPlayer === 'red') ? "Rood is aan de beurt" : "Geel is aan de beurt";
    }
    l.className = currentPlayer;
}

window.addEventListener('keydown', (e) => {
    if (gameOver || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
    if (['ArrowLeft', 'a'].includes(e.key)) { activeCol = (activeCol > 0) ? activeCol - 1 : COLS - 1; draw(); }
    if (['ArrowRight', 'd'].includes(e.key)) { activeCol = (activeCol < COLS - 1) ? activeCol + 1 : 0; draw(); }
    if ([' ', 'Enter', 's', 'ArrowDown'].includes(e.key)) { e.preventDefault(); play(activeCol); }
});

document.getElementById('reset-btn').onclick = init;