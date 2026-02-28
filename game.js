const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 3, scores = { player: 0, cpu: 0 }, gameMode = 'cpu';
let isAnimating = false; 

function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('label-opponent').innerText = (mode === 'cpu') ? "CPU" : "Geel";
    init();
}

function showMenu() { document.getElementById('menu-overlay').style.display = 'flex'; }

async function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    isAnimating = false; 
    
    // Kies willekeurige starter
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

    // Als geel (CPU) begint, trigger move
    if (gameMode === 'cpu' && currentPlayer === 'yellow') {
        isAnimating = true;
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
    // 1. Check of we mogen zetten
    if (gameOver || isAnimating) return;
    if (gameMode === 'cpu' && currentPlayer === 'yellow') return;

    // 2. Doe de zet
    const success = await makeMove(c, currentPlayer);
    
    // 3. Wissel beurt als zet gelukt is en spel niet klaar is
    if (success && !gameOver) {
        currentPlayer = (currentPlayer === 'red') ? 'yellow' : 'red';
        updateStatusLabel();
        
        if (gameMode === 'cpu' && currentPlayer === 'yellow') {
            setTimeout(makeComputerMove, 400);
        } else {
            isAnimating = false; // Menselijke beurt: nu mag er weer geklikt worden
        }
    } else if (!success) {
        isAnimating = false; // Kolom vol, klik opnieuw
    }
}

async function makeMove(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            isAnimating = true; // LOCK
            board[r][c] = player;
            
            const cell = document.getElementById(`cell-${r}-${c}`);
            const token = document.createElement('div');
            token.className = `token ${player}`;
            cell.appendChild(token);

            // Wacht op animatie
            await new Promise(res => setTimeout(res, 500));

            // Fixeer het fiche op het bord
            draw(); 

            // Win check
            if (checkWin(r, c)) {
                gameOver = true;
                if(player === 'red') scores.player++; else scores.cpu++;
                document.getElementById('score-player').innerText = scores.player;
                document.getElementById('score-cpu').innerText = scores.cpu;
                updateStatusLabel();
                setTimeout(() => {
                    alert((player === 'red' ? "Rood" : "Geel") + " wint!");
                    isAnimating = false;
                }, 100);
                return true;
            }
            
            // Bord vol check
            if (board.flat().every(cell => cell !== null)) {
                gameOver = true;
                setTimeout(() => {
                    alert("Gelijkspel!");
                    isAnimating = false;
                }, 100);
                return true;
            }

            return true; // Zet gelukt
        }
    }
    return false; // Kolom vol
}

async function makeComputerMove() {
    if (gameOver) return;
    
    let move = -1;
    // AI Logica
    for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'yellow')) { move = c; break; }
    if (move === -1) for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'red')) { move = c; break; }
    if (move === -1) {
        let valid = [];
        for (let c = 0; c < COLS; c++) if (!board[0][c]) valid.push(c);
        if (valid.length === 0) return;
        move = valid[Math.floor(Math.random() * valid.length)];
    }
    
    activeCol = move;
    const success = await makeMove(move, 'yellow');
    
    if (success && !gameOver) {
        currentPlayer = 'red';
        updateStatusLabel();
        isAnimating = false; // OPEN LOCK
    }
}

function canWinNextMove(c, p) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = p; 
            let w = checkWin(r, c); 
            board[r][c] = null; 
            return w;
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
            if (!cell) continue;
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
    if (gameOver) {
        l.innerText = "Spel afgelopen!";
        l.className = "";
        return;
    }
    if (gameMode === 'cpu') {
        l.innerText = (currentPlayer === 'red') ? "Jij bent aan de beurt" : "Computer denkt na...";
    } else {
        l.innerText = (currentPlayer === 'red') ? "Rood aan de beurt" : "Geel aan de beurt";
    }
    l.className = currentPlayer;
}

window.addEventListener('keydown', (e) => {
    if (gameOver || isAnimating) return;
    if (gameMode === 'cpu' && currentPlayer === 'yellow') return;

    if (['ArrowLeft', 'a'].includes(e.key)) { activeCol = (activeCol > 0) ? activeCol - 1 : COLS - 1; updatePreview(); }
    if (['ArrowRight', 'd'].includes(e.key)) { activeCol = (activeCol < COLS - 1) ? activeCol + 1 : 0; updatePreview(); }
    if ([' ', 'Enter', 's', 'ArrowDown'].includes(e.key)) { e.preventDefault(); play(activeCol); }
});

document.getElementById('reset-btn').onclick = init;