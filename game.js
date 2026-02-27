const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;
let activeCol = 0, scores = { player: 0, cpu: 0 };

function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    currentPlayer = 'red';
    document.getElementById('player-label').innerText = "Jij (Rood)";
    document.getElementById('player-label').className = "red";
    
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
    if (gameOver || currentPlayer === 'yellow') return;
    if (makeMove(c, 'red')) {
        if (!gameOver) {
            currentPlayer = 'yellow';
            document.getElementById('player-label').innerText = "Computer denkt...";
            document.getElementById('player-label').className = "yellow";
            await new Promise(res => setTimeout(res, 600));
            makeComputerMove();
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
                if(player === 'red') {
                    scores.player++;
                    document.getElementById('score-player').innerText = scores.player;
                    setTimeout(() => alert("Jij wint!"), 10);
                } else {
                    scores.cpu++;
                    document.getElementById('score-cpu').innerText = scores.cpu;
                    setTimeout(() => alert("Computer wint!"), 10);
                }
                return true;
            }
            return true;
        }
    }
    return false;
}

function makeComputerMove() {
    if (gameOver) return;
    let move = -1;
    // Win of blokkeer logica
    for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'yellow')) { move = c; break; }
    if (move === -1) for (let c = 0; c < COLS; c++) if (canWinNextMove(c, 'red')) { move = c; break; }
    if (move === -1) {
        const valid = [];
        for (let c = 0; c < COLS; c++) if (!board[0][c]) valid.push(c);
        move = valid.includes(3) ? 3 : valid[Math.floor(Math.random() * valid.length)];
    }
    makeMove(move, 'yellow');
    if (!gameOver) {
        currentPlayer = 'red';
        document.getElementById('player-label').innerText = "Jij (Rood)";
        document.getElementById('player-label').className = "red";
    }
}

function canWinNextMove(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = player;
            let win = checkWin(r, c);
            board[r][c] = null;
            return win;
        }
    }
    return false;
}

function checkWin(r, c) {
    const p = board[r][c], dirs = [[0,1],[1,0],[1,1],[1,-1]];
    return dirs.some(([dr, dc]) => {
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

function updateCursor() { draw(); }

window.addEventListener('keydown', (e) => {
    if (gameOver || currentPlayer === 'yellow') return;
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        activeCol = (activeCol > 0) ? activeCol - 1 : COLS - 1;
        updateCursor();
    } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        activeCol = (activeCol < COLS - 1) ? activeCol + 1 : 0;
        updateCursor();
    } else if ([' ', 'Enter', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        play(activeCol);
    }
});

document.getElementById('reset-btn').onclick = init;
init();