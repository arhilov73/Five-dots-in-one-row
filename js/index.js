// Mini-project 4: Five dots in one row


class App {
    constructor(id, rows, cols) {
        this._gameover = false;
        
        this._field = document.getElementById(id);
        this._players = ['player1', 'player2'];
        this._currentPlayer = 0;
        this._dots = new Dots();
        this._win = new Win(this._field);
        
        this._drawField(rows, cols, this._field);
        this._run();
    }

    _run() {
        this._field.addEventListener('click', () => {
        const targ = event.target;
        
        if (targ.closest('td:not(.player)') && !this._gameover) {        
            const row = Number(targ.dataset.row);
            const col = Number(targ.dataset.col);;
            const dot = new Dot(targ, row, col, this._players[this._currentPlayer], this._dots);
            this._dots.add(dot, row, col);
            console.log(dot);
            this._setTurn();
            
            let winLine = this._win.checkWin(dot);
            if (winLine) {
                this._gameover = true;
                this._win.initWin(winLine);
            }
        }        
        });
    }

    _setTurn() { 
        let cur = this._currentPlayer;
        
        if (cur == this._players.length - 1) {
            this._currentPlayer = 0;
        } else {
            this._currentPlayer++;
        }
    }

    _drawField(rows, cols, parent) {
        const table = document.createElement('table');
        
        for (let i = 0; i < rows; i++) {
            const tr = document.createElement('tr');
        
            for (let j = 0; j < cols; j++) {
                const td = document.createElement('td');
                td.dataset.row = i;
                td.dataset.col = j;
                tr.appendChild(td);
            }
            table.appendChild(tr)
        }
        parent.appendChild(table);
    }
}

class Win {
    constructor(field) {
        this._field = field;
    }

    initWin(winLine) {
        const winner = winLine[0].player;
        this._notifyWinnerCells(winLine);
        this._notifyAboutWin(winner);
    }

    _notifyAboutWin(winner) {
        const modal = document.createElement('div');
        const message = document.createElement('p');
        const newGameBtn = document.createElement('button');
        this._field.appendChild(modal);
        modal.appendChild(message);
        modal.appendChild(newGameBtn);
        
        modal.classList.add('win-notification');
        message.innerHTML = `Winner is - ${winner}`;
        message.classList.add(winner);
        newGameBtn.innerHTML = 'New game';
        
        newGameBtn.addEventListener('click', () => {
            this._field.innerHTML = '';      
            initGame = new App(id, rows, cols);
        });
    }

    checkWin(dot) {
        const directions = [
            {deltaRow: 0, deltaCol: -1},
            {deltaRow: -1, deltaCol: -1},
            {deltaRow: -1, deltaCol: 0},
            {deltaRow: -1, deltaCol: 1}
        ];
        
        for (let i = 0; i < directions.length; i++) {
            const line = this._checkLine(dot, directions[i].deltaRow, directions[i].deltaCol);
        
            if (line.length >= 5) {
                return line;
            }
        }
    }

    _notifyWinnerCells(winLine) {
        winLine.forEach(dot => {
            dot.becomeWinner();
        });
    }  

    _checkLine(dot, deltaRow, deltaCol) {
        const dir1 = this._checkDir(dot, deltaRow, deltaCol);
        const dir2 = this._checkDir(dot, -deltaRow, -deltaCol);
        return [].concat(dir1, [dot], dir2);
    }

    _checkDir(dot, deltaRow, deltaCol) {
        const result = [];
        let neighbour = dot;
        
        while (true) {
            neighbour = neighbour.getNeighbour(deltaRow, deltaCol);
        
            if (neighbour) {
                result.push(neighbour);
            } else {
                return result;
            }
        }
    }
}

class Dot {
    constructor(elem, row, col, player, dots) {
        this._elem = elem;
        this._row = row;
        this._col = col;
        this._player = player;
        this._dots = dots;
        this._neighbours = {};
        
        this._searchForNeighbours();
        this._notifyNeighbours();
        this._expose();
    }

    get player() {
        return this._player;
    }  
    becomeWinner() {
        this._elem.classList.add('winner');
    }
    getNeighbour(deltaRow, deltaCol) {
        if (this._neighbours[deltaRow] !== undefined) {
            return this._neighbours[deltaRow][deltaCol];
        } else {
            return undefined;
        }    
    }

    addNeighbour(dot) {
        const deltaRow = dot.row - this._row;
        const deltaCol = dot.col - this._col;

        if (this._neighbours[deltaRow] === undefined) {
            this._neighbours[deltaRow] = {};
        }
        this._neighbours[deltaRow][deltaCol] = dot;
    }

    _notifyNeighbours() {
        for (let keyRow in this._neighbours) {
            for (let keyCol in this._neighbours[keyRow]) {
                this._neighbours[keyRow][keyCol].addNeighbour(this);
            }
        }
    }

    _considerNeighbours(deltaRow, deltaCol) {
        let neighbour = this._dots.get(this._row + deltaRow, this._col + deltaCol);

        if (neighbour !== undefined && neighbour._belongsTo(this._player)) {
            this.addNeighbour(neighbour);
        }
    }

    _searchForNeighbours() {
        this._considerNeighbours(-1, -1);
        this._considerNeighbours(-1, 0);
        this._considerNeighbours(-1, 1);
        this._considerNeighbours(1, -1);
        this._considerNeighbours(1, 0);
        this._considerNeighbours(1, 1);
        this._considerNeighbours(0, -1);
        this._considerNeighbours(0, 1);
    }
        
    _belongsTo(player) {
        return this._player == player;
    }

    _expose() {
        this._elem.classList.add('player');
        this._elem.classList.add(this._player);
    }

    get row() {
        return this._row;
    }
    get col() {
        return this._col;
    }
}

class Dots {
    constructor() {
        this._dots = {};
    }

    add(dot, row, col) {
        if (this._dots[row] === undefined) {
            this._dots[row] = {};
        }
        this._dots[row][col] = dot;
    }
    get(row, col) {
        if (this._dots[row] && this._dots[row][col]) {
            return this._dots[row][col];
        } else {
            return undefined;
        }
    }
}

let id = 'field';
let rows = 15;
let cols = 15;
let initGame = new App(id, rows, cols);
