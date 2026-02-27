const ROWS = 6, COLS = 7;
let board = [], currentPlayer = 'red', gameOver = false;

function init() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOver = false;
    
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.col = i % COLS;
        cell.onclick = () => play(parseInt(cell.dataset.col));
        boardDiv.appendChild(cell);
    }
}

function play(c) {
    if (gameOver) return;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = currentPlayer;
            draw();
            if (checkWin(r, c)) {
                setTimeout(() => alert(currentPlayer.toUpperCase() + " wint!"), 10);
                gameOver = true;
            } else {
                currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
                const label = document.getElementById('player-label');
                label.innerText = currentPlayer === 'red' ? 'Rood' : 'Geel';
                label.className = currentPlayer;
            }
            return;
        }
    }
}

function draw() {
    const cells = document.querySelectorAll('.cell');
    board.flat().forEach((val, i) => {
        cells[i].className = 'cell' + (val ? ' ' + val : '');
    });
}

function checkWin(r, c) {
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    return directions.some(([dr, dc]) => {
        let count = 1;
        [[1,1], [-1,-1]].forEach(([s]) => {
            let nr = r + dr*s, nc = c + dc*s;
            while(nr>=0 && nr<ROWS && nc>=0 && nc<COLS && board[nr][nc] === currentPlayer) {
                count++; nr += dr*s; nc += dc*s;
            }
        });
        return count >= 4;
    });
}

document.getElementById('reset-btn').onclick = init;
init();