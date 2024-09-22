const INITIAL_BOARD_SIZE = 20;
let boardSize = INITIAL_BOARD_SIZE;
let board = createBoard(boardSize);
let ageBoard = createBoard(boardSize);
let interval;
let isRunning = false;
const themeFiles = ['Lavender', 'LightBlue', 'AliceBlue', 'MintCream', 'LightGreen', 'Orange', 'PaleVioletRed', 'PeachPuff', 'MediumPurple', 'Gainsboro', 'SeaGreen'];

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['theme'], function(result) {
        if (result.theme) {
            document.getElementById('themeSelector').value = result.theme;
            document.body.style.backgroundColor = result.theme;
        }
    });
    populateThemeSelector();
    drawBoard();
    addEventListeners();
});

function addEventListeners() {
    document.getElementById('toggleButton').addEventListener('click', toggleGame);
    document.getElementById('clearButton').addEventListener('click', clearBoard);
    document.getElementById('randomButton').addEventListener('click', randomizeBoard);
    document.getElementById('nextButton').addEventListener('click', performNextGeneration);
    document.getElementById('themeSelector').addEventListener('change', changeTheme);
}

function createBoard(size) {
    return Array.from({ length: size }, () => Array(size).fill(0));
}

function drawBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 15px)`;
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 15px)`;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            updateCellClass(cell, i, j);
            cell.addEventListener('click', () => toggleCellState(i, j, cell));
            gameBoard.appendChild(cell);
        }
    }
}

function toggleCellState(i, j, cell) {
    board[i][j] = board[i][j] ? 0 : 1;
    if (board[i][j]) {
        ageBoard[i][j] = 1;
    } else {
        ageBoard[i][j] = 0;
    }
    updateCellClass(cell, i, j);
}

function updateCellClass(cell, i, j) {
    cell.className = 'cell';
    if (board[i][j]) {
        cell.classList.add('alive');
        const age = ageBoard[i][j];
        if (age > 2 && age < 5) {
            cell.classList.add('young');
        } else if (age >= 5 && age < 10) {
            cell.classList.add('old');
        } else if (age >= 10) {
            cell.classList.add('veteran');
        }
    }
}

function toggleGame() {
    isRunning = !isRunning;
    if (isRunning) {
        interval = setInterval(() => {
            performNextGeneration();
            updateBoard();
        }, 100);
        document.getElementById('toggleButton').textContent = 'Pause';
    } else {
        clearInterval(interval);
        document.getElementById('toggleButton').textContent = 'Start';
    }
}

function clearBoard() {
    board = createBoard(boardSize);
    ageBoard = createBoard(boardSize);
    drawBoard();
}

function randomizeBoard() {
    board = createBoard(boardSize).map(row => row.map(() => (Math.random() > 0.7 ? 1 : 0)));
    ageBoard = createBoard(boardSize);
    drawBoard();
}

function performNextGeneration() {
    const newBoard = createBoard(boardSize);
    const newAgeBoard = createBoard(boardSize);

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const aliveNeighbors = countAliveNeighbors(i, j);
            if (board[i][j]) {
                newBoard[i][j] = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
                newAgeBoard[i][j] = newBoard[i][j] ? ageBoard[i][j] + 1 : 0;
            } else {
                newBoard[i][j] = aliveNeighbors === 3 ? 1 : 0;
                newAgeBoard[i][j] = newBoard[i][j] ? 1 : 0;
            }
        }
    }

    board = newBoard;
    ageBoard = newAgeBoard;
    updateBoard();
}

function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = cells[i * boardSize + j];
            updateCellClass(cell, i, j);
        }
    }
}

function countAliveNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = x + i;
            const ny = y + j;
            if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                count += board[nx][ny];
            }
        }
    }
    return count;
}

function populateThemeSelector() {
    const themeSelector = document.getElementById('themeSelector');
    themeFiles.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        themeSelector.appendChild(option);
    });
}

function changeTheme() {
    const themeSelector = document.getElementById('themeSelector');
    const themeColor = themeSelector.value;
    document.body.style.backgroundColor = themeColor;

    // Save the theme preference
    chrome.storage.sync.set({theme: themeColor}, function() {
        console.log('Theme saved');
    });
}