const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 3, scores = { player: 0, cpu: 0 }, gameMode = 'cpu';
let isAnimating = false; // DE GRENDEL

function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('label-opponent').innerText = (mode === 'cpu') ? "CPU" : "Geel";
    init();
}

function showMenu() { document.getElementById('menu-overlay').style.display = 'flex'; }

function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    isAnimating = false; // Reset grendel bij nieuw spel
    
    currentPlayer = Math.random() < 0.5 ? 'red' : 'yellow';
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            cell.onclick = () => play(c);
            boardDiv.appendChild(cell);
        }
    }
    
    createPreviewCells();
    updateStatusLabel();
    draw();

    if (gameMode === 'cpu' && currentPlayer === 'yellow') {
        isAnimating = true; // Vergrendel tijdens computerstart
        setTimeout(makeComputerMove, 1000);
    }
}

function createPreviewCells() {
    let container = document.getElementById('preview-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'preview-container';
        document.getElementById('board').before(container);
    }
    container.innerHTML = '';
    for (let c = 0; c < COLS; c++) {
        const pCell = document.createElement('div');
        pCell.className = 'preview-cell';
        pCell.id = `preview-${c}`;
        container.appendChild(pCell);
    }
}

async function play(c) {
    // STOP als: het spel klaar is, er al een animatie loopt, of de CPU aan de beurt is
    if (gameOver || isAnimating || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;

    activeCol = c;
    if (await makeMove(c, currentPlayer)) {
        if (!gameOver) {
            currentPlayer = (currentPlayer === 'red') ? 'yellow' : 'red';
            updateStatusLabel();
            
            if (gameMode === 'cpu' && currentPlayer === 'yellow') {
                isAnimating = true; // Blijf vergrendeld voor CPU beurt
                setTimeout(makeComputerMove, 800);
            } else {
                isAnimating = false; // Ontgrendel voor volgende speler
            }
        } else {
            isAnimating = false;
        }
    }
}

async function makeMove(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            isAnimating = true; // Grendel gaat dicht
            board[r][c] = player;
            
            const cell = document.getElementById(`cell-${r}-${c}`);
            const token = document.createElement('div');
            token.className = `token ${player}`;
            cell.appendChild(token);

            // Wacht precies 500ms (de tijd van de CSS animatie)
            await new Promise(res => setTimeout(res, 500));

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
    if (gameOver) { isAnimating = false; return; }
    let move = -1;
    for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'yellow')) { move = c; break; }
    if (move === -1) for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'red')) { move = c; break; }
    if (move === -1) {
        let valid = [];
        for (let c = 0; c < COLS; c++) if (!board[0][c]) valid.push(c);
        move = valid[Math.floor(Math.random() * valid.length)];
    }
    
    activeCol = move;
    makeMove(move, 'yellow').then(() => {
        if (!gameOver) {
            currentPlayer = 'red';
            updateStatusLabel();
            isAnimating = false; // Grendel gaat pas nu open!
        }
    });
}

// ... de hulpfuncties canWinNextMove en checkWin blijven hetzelfde ...

function draw() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            cell.innerHTML = ''; 
            if (board[r][c]) {
                const disc = document.createElement('div');
                disc.className = `token ${board[r][c]}`;
                disc.style.animation = 'none'; 
                cell.appendChild(disc);
            }
        }
    }
    updatePreview();
}

function updatePreview() {
    for (let c = 0; c < COLS; c++) {
        const pCell = document.getElementById(`preview-${c}`);
        if (!pCell) continue;
        pCell.className = 'preview-cell';
        if (c === activeCol && !gameOver && !isAnimating) {
            pCell.classList.add(currentPlayer);
        }
    }
}

function updateStatusLabel() {
    const l = document.getElementById('player-label');
    l.innerText = (currentPlayer === 'red') ? "Jij bent aan de beurt" : (gameMode === 'cpu' ? "Computer denkt..." : "Geel is aan de beurt");
    l.className = currentPlayer;
}

window.addEventListener('keydown', (e) => {
    // Toetsenbord ook blokkeren tijdens animatie
    if (gameOver || isAnimating || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
    if (['ArrowLeft', 'a'].includes(e.key)) { activeCol = (activeCol > 0) ? activeCol - 1 : COLS - 1; updatePreview(); }
    if (['ArrowRight', 'd'].includes(e.key)) { activeCol = (activeCol < COLS - 1) ? activeCol + 1 : 0; updatePreview(); }
    if ([' ', 'Enter', 's', 'ArrowDown'].includes(e.key)) { e.preventDefault(); play(activeCol); }
});

document.getElementById('reset-btn').onclick = init;