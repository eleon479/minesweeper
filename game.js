const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;
const BOARD_MINES = 10;

const GameState = {
    pending: 'pending',
    active: 'active',
    won: 'won',
    lost: 'lost'
};

var app = new Vue({
    el: '#app',
    data: {
        gameState: GameState.pending,
        activeGame: false,
        unmarkedMines: null,
        startTime: null,
        time: 0,
        board: [],
        clearCellsRemaining: null
    },
    created: function() {
        this.unmarkedMines = 99;
        this.restartBoard();
        this.restartTime();
        setInterval(this.updateTime, 1000);
    },
    methods: {
        createEmptyBoard: function(w, h) {
            let nboard = [];
            let cellId = 0;

            // setup empty board
            for (let r = 0; r < h; r++) {
                nboard.push([]);
                for (let c = 0; c < w; c++) {

                    let ncell = {
                        marked: false,
                        removed: false,
                        mine: false,
                        surrounding: 0,
                        row: r,
                        column: c,
                        id: cellId
                    };

                    cellId++;
                    nboard[r].push(ncell);
                }
            }

            return nboard;
        },
        fillBoardWithMines: function(initCell, w, h, m) {
            let nboard = this.board;

            // randomly distribute mines
            let mr = m;
            while (mr > 0) {
                let row = Math.floor(Math.random() * Math.floor(BOARD_HEIGHT));
                let col = Math.floor(Math.random() * Math.floor(BOARD_WIDTH));

                if (nboard[row][col].mine === false && (row !== initCell.row || col !== initCell.column)) {
                    nboard[row][col].mine = true;
                    mr--;
                }
            }

            // calculate surroundings
            console.log('calculating surrounding: ');

            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) {
                    let result = 0;
                    let surroundingCoordinates = [
                        {nc: c - 1, nr: r - 1}, // top left
                        {nc: c, nr: r - 1}, // top
                        {nc: c + 1, nr: r - 1}, // top right
                        {nc: c + 1, nr: r}, // right
                        {nc: c + 1, nr: r + 1}, // bottom right
                        {nc: c, nr: r + 1}, // bottom
                        {nc: c - 1, nr: r + 1}, // bottom left
                        {nc: c - 1, nr: r} // left
                    ];

                    for (const neighbor of surroundingCoordinates) {
                        if (neighbor.nc >= 0 && neighbor.nc < w && neighbor.nr >= 0 && neighbor.nr < h) {
                            if (nboard[neighbor.nr][neighbor.nc].mine) {
                                result++;
                            }
                        }
                    }
                    
                    // console.log(`${r},${c}: ${result}`);
                    nboard[r][c].surrounding = result;
                }
            }
            console.log('done calculating surrounding mines!');
            this.clearCellsRemaining = BOARD_WIDTH * BOARD_HEIGHT - BOARD_MINES;
            
            console.log('removing initial cell...');
            nboard[initCell.row][initCell.column].removed = true;
            this.clearCellsRemaining--;

            // check if any of its neighbors have 0 surrounding cells
            let surroundingCoordinates = [
                {nc: initCell.column - 1, nr: initCell.row - 1}, // top left
                {nc: initCell.column, nr: initCell.row - 1}, // top
                {nc: initCell.column + 1, nr: initCell.row - 1}, // top right
                {nc: initCell.column + 1, nr: initCell.row}, // right
                {nc: initCell.column + 1, nr: initCell.row + 1}, // bottom right
                {nc: initCell.column, nr: initCell.row + 1}, // bottom
                {nc: initCell.column - 1, nr: initCell.row + 1}, // bottom left
                {nc: initCell.column - 1, nr: initCell.row} // left
            ];

            for (const neighbor of surroundingCoordinates) {
                if (neighbor.nc >= 0 && neighbor.nc < BOARD_WIDTH && neighbor.nr >= 0 && neighbor.nr < BOARD_HEIGHT) {
                    let neighborCell = nboard[neighbor.nr][neighbor.nc];
                    if (neighborCell.surrounding <= 1 && neighborCell.removed === false && neighborCell.mine === false) {
                        nboard[neighbor.nr][neighbor.nc].removed = true;
                        this.clearCellsRemaining--;
                    }
                }
            }

            console.log('setting game board');
            this.board = nboard;
        },
        restartTime: function() {
            let s = new Date();
            this.startTime = 0;
            this.time = 0;

            if (this.activeGame) {
                this.startTime = s.getTime();
            }
        },
        restartBoard: function() {
            this.board = this.createEmptyBoard(BOARD_WIDTH, BOARD_HEIGHT);
        },
        handleRestartClick: function() {
            console.log('(restart) click');
            this.activeGame = false;
            this.gameState = GameState.pending;
            this.clearCellsRemaining = 0;
            this.unmarkedMines = 99;
            this.restartBoard();
            this.restartTime();
        },
        handleCellClick: function(cell) {
            console.log(`(row, col) click: (${cell.row}, ${cell.column})`);
            console.log(`active game: ${this.activeGame}`);
            console.log(`game state: ${this.gameState}`);

            if (this.gameState  === GameState.pending) {
                this.startGame(cell);
            } else if (this.gameState === GameState.won) {
                alert('Game already won!');
            } else if (this.gameState === GameState.lost) {
                alert('Game already lost, you stinky loser...');
            } else if (this.gameState === GameState.active) {
                // game is active
                if (!cell.mine) {
                    // safely cleared a cell!
                    cell.removed = true;
                    this.clearCellsRemaining--;
                    console.log('clear cells remaining: ', this.clearCellsRemaining);

                    // check if any of its neighbors have 0 surrounding cells
                    let surroundingCoordinates = [
                        {nc: cell.column - 1, nr: cell.row - 1}, // top left
                        {nc: cell.column, nr: cell.row - 1}, // top
                        {nc: cell.column + 1, nr: cell.row - 1}, // top right
                        {nc: cell.column + 1, nr: cell.row}, // right
                        {nc: cell.column + 1, nr: cell.row + 1}, // bottom right
                        {nc: cell.column, nr: cell.row + 1}, // bottom
                        {nc: cell.column - 1, nr: cell.row + 1}, // bottom left
                        {nc: cell.column - 1, nr: cell.row} // left
                    ];

                    for (const neighbor of surroundingCoordinates) {
                        if (neighbor.nc >= 0 && neighbor.nc < BOARD_WIDTH && neighbor.nr >= 0 && neighbor.nr < BOARD_HEIGHT) {
                            let neighborCell = this.board[neighbor.nr][neighbor.nc];
                            if (neighborCell.surrounding <= 0 && neighborCell.removed === false && neighborCell.mine === false) {
                                this.board[neighbor.nr][neighbor.nc].removed = true;
                                this.clearCellsRemaining--;
                            }
                        }
                    }

                    if (this.clearCellsRemaining === 0) {
                        this.gameState = GameState.won;
                        this.activeGame = false;
                    }
                } else {
                    // stepped on a mine :(
                    this.activeGame = false;
                    this.gameState = GameState.lost;
                }
            } else {
                console.info('Invalid game state??', this.gameState, this.activeGame);
            }

            console.log(`cell click results - active game: ${this.activeGame} - game state: ${this.gameState}`);
        },
        handleCellRightClick: function(cell) {
            console.log('right click detected!');
            if (this.gameState === GameState.active) {
                cell.marked = !cell.marked;
            }
        },
        startGame: function(cell) {
            this.fillBoardWithMines(cell, BOARD_WIDTH, BOARD_HEIGHT, BOARD_MINES);
            this.activeGame = true;
            this.gameState = GameState.active;
            this.restartTime();
        },
        updateTime: function() {
            if (this.activeGame) {
                let d = new Date();
                this.time = Math.round((d.getTime() - this.startTime) / 1000);
            }
        },
        digitalFormat: function(num) {
            let s = num.toString();

            if (num < 10)
                return '00' + s;
            else if (num < 100)
                return '0' + s;
            else if (num < 1000)
                return s;
            else
                return '999';
        },
        formattedMine(cell) {
            
            if (cell.removed) {
                if (cell.mine) {
                    return 'X';
                }

                if (cell.surrounding > 0) {
                    return cell.surrounding;
                } else {
                    return ' ';
                }
            }
            
            if (cell.mine) {
                return '?';
            } else {
                
            }
        },
    },
    computed: {
        formattedUnmarkedMines() {
            return this.digitalFormat(this.unmarkedMines);
        },
        formattedTime() {
            return this.digitalFormat(this.time);
        }
    },
});

window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);