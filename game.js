const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 3, scores = { player: 0, cpu: 0 }, gameMode = 'Geel';
let isAnimating = false;

function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('label-opponent').innerText = (mode === 'Geel') ? "Geel" : "Geel";
    init();
}

function showMenu() { document.getElementById('menu-overlay').style.display = 'flex'; }
function resetScores() {
    scores = { player: 0, cpu: 0 };
    document.getElementById('score-player').innerText = "0";
    document.getElementById('score-Computer').innerText = "0";
}

function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    
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
        setTimeout(makeComputerMove, 1000);
    }
}

function createPreviewCells() {
    const container = document.getElementById('preview-container') || document.createElement('div');
    container.id = 'preview-container';
    container.innerHTML = '';
    for (let c = 0; c < COLS; c++) {
        const pCell = document.createElement('div');
        pCell.className = 'preview-cell';
        pCell.id = `preview-${c}`;
        container.appendChild(pCell);
    }
    if (!document.getElementById('preview-container')) {
        document.getElementById('board').before(container);
    }
}

function updatePreview() {
    for (let c = 0; c < COLS; c++) {
        const pCell = document.getElementById(`preview-${c}`);
        pCell.className = 'preview-cell';
        if (c === activeCol && !gameOver && (gameMode !== 'cpu' || currentPlayer === 'red')) {
            pCell.classList.add(currentPlayer);
        }
    }
}

async function play(c) {
    // Voeg 'isAnimating' toe aan de check
    if (gameOver || isAnimating || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
    
    activeCol = c;
    isAnimating = true; // Vergrendel input

    if (await makeMove(c, currentPlayer)) {
        if (!gameOver) {
            currentPlayer = (currentPlayer === 'red') ? 'yellow' : 'red';
            updateStatusLabel();
            updatePreview();
            
            if (gameMode === 'cpu' && currentPlayer === 'yellow') {
                setTimeout(makeComputerMove, 800);
            } else {
                isAnimating = false; // Ontgrendel voor de tweede speler
            }
        } else {
            isAnimating = false;
        }
    } else {
        isAnimating = false; // Ontgrendel als de kolom vol was
    }
}

async function makeMove(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = player;
            
            // Animatie: plaats een tijdelijke 'token' in de cel
            const cell = document.getElementById(`cell-${r}-${c}`);
            const token = document.createElement('div');
            token.className = `token ${player}`;
            
            // Bereken de afstand voor de animatie (optioneel voor variabele snelheid)
            // Hier gebruiken we de standaard CSS animatie
            cell.appendChild(token);

            // Wacht tot de animatie klaar is voor de win-check
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
    if (gameOver) return;
    let move = -1;
    for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'yellow')) { move = c; break; }
    if (move === -1) for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'red')) { move = c; break; }
    if (move === -1) {
        let valid = [];
        for (let c = 0; c < COLS; c++) if (!board[0][c]) valid.push(c);
        move = valid.includes(3) ? 3 : valid[Math.floor(Math.random() * valid.length)];
    }
    activeCol = move;
    makeMove(move, 'yellow').then((success) => {
        if (success && !gameOver) {
            currentPlayer = 'red';
            updateStatusLabel();
            updatePreview();
        }
    });
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
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            cell.innerHTML = ''; // Verwijder animatie tokens
            if (board[r][c]) {
                const disc = document.createElement('div');
                disc.className = `token ${board[r][c]}`;
                disc.style.animation = 'none'; // Geen animatie voor bestaande fiches
                cell.appendChild(disc);
            }
        }
    }
    updatePreview();
}

function updateStatusLabel() {
    const l = document.getElementById('player-label');
    l.innerText = (currentPlayer === 'red') ? "Jij bent aan de beurt" : (gameMode === 'cpu' ? "Computer denkt..." : "Geel is aan de beurt");
    l.className = currentPlayer;
}

window.addEventListener('keydown', (e) => {
    if (gameOver || (gameMode === 'cpu' && currentPlayer === 'yellow')) return;
    if (['ArrowLeft', 'a'].includes(e.key)) { activeCol = (activeCol > 0) ? activeCol - 1 : COLS - 1; updatePreview(); }
    if (['ArrowRight', 'd'].includes(e.key)) { activeCol = (activeCol < COLS - 1) ? activeCol + 1 : 0; updatePreview(); }
    if ([' ', 'Enter', 's', 'ArrowDown'].includes(e.key)) { e.preventDefault(); play(activeCol); }
});

document.getElementById('reset-btn').onclick = init;