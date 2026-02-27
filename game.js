const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 0, scores = { player: 0, cpu: 0 }, gameMode = 'cpu';

// Zoek de startGame functie en vervang deze:
function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('label-opponent').innerText = (mode === 'cpu') ? "CPU" : "Geel";
    resetScores();
    init(); // Dit zet het bord klaar en bepaalt de startspeler
}

// Zoek de init functie en vervang deze:
async function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    
    // Bepaal willekeurig wie begint: 'red' of 'yellow'
    currentPlayer = Math.random() < 0.5 ? 'red' : 'yellow';
    
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
    
    draw();

    // Als de computer (yellow) is geloot om te beginnen:
    if (gameMode === 'cpu' && currentPlayer === 'yellow') {
        document.getElementById('player-label').innerText = "Computer begint...";
        await new Promise(res => setTimeout(res, 1000)); // Even wachten voor de beleving
        makeComputerMove();
    }
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
    draw();
}

async function play(c) {
    if (gameOver || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
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

function makeMove(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = player;
            draw();
            if (checkWin(r, c)) {
                gameOver = true;
                if(player === 'red') scores.player++; else scores.cpu++;
                document.getElementById('score-player').innerText = scores.player;
                document.getElementById('score-cpu').innerText = scores.cpu;
                setTimeout(() => alert(player.toUpperCase() + " wint!"), 50);
            }
            return true;
        }
    }
    return false;
}

function makeComputerMove() {
    if (gameOver) return;
    let move = -1;
    for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'yellow')) { move = c; break; }
    if (move === -1) for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'red')) { move = c; break; }
    if (move === -1) {
        const v = []; for (let c=0; c<COLS; c++) if (!board[0][c]) v.push(c);
        move = v.includes(3) ? 3 : v[Math.floor(Math.random()*v.length)];
    }
    makeMove(move, 'yellow');
    if (!gameOver) { currentPlayer = 'red'; updateStatusLabel(); }
}

function canWinNextMove(c, p) {
    for (let r = ROWS-1; r>=0; r--) {
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
    if (cells.length === 0) return;
    board.flat().forEach((val, i) => {
        const c = i % COLS;
        cells[i].className = 'cell' + (val ? ' ' + val : '') + (c === activeCol ? ' active-column' : '');
    });
}

function updateStatusLabel() {
    const l = document.getElementById('player-label');
    if (gameMode === 'cpu') l.innerText = (currentPlayer === 'red') ? "Jij" : "Computer...";
    else l.innerText = (currentPlayer === 'red') ? "Speler 1" : "Speler 2";
    l.className = currentPlayer;
}

window.addEventListener('keydown', (e) => {
    if (gameOver || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) { activeCol = (activeCol > 0) ? activeCol - 1 : COLS - 1; draw(); }
    else if (['ArrowRight', 'd', 'D'].includes(e.key)) { activeCol = (activeCol < COLS - 1) ? activeCol + 1 : 0; draw(); }
    else if ([' ', 'Enter', 's', 'S'].includes(e.key)) { e.preventDefault(); play(activeCol); }
});

document.getElementById('reset-btn').onclick = init;
// Direct laden bij opstarten
window.onload = () => { document.getElementById('player-label').innerText = "Kies een modus"; };