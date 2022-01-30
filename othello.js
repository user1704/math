class Othello {

    dim = 8;

    _history = [];

    _colorMap = {
        'b': 'Black',
        'w': 'White'
    }

    _startingPos = '8|8|8|3bw3|3wb3|8|8|8 b';

    constructor(config = {}) {
        let fen = (config.fen != undefined ? config.fen : this._startingPos);
        this._board = Othello.fenToBoard(fen);
        this.turn = fen.split(' ')[1];
    }

    static fenToBoard(fen) {
        let f = fen.split(" ")[0];
        var b = [[]];
        var row = 0;
        for (var i = 0; i < f.length; i++) {
            let c = f.charAt(i);
            switch (c) {
                case 'b':
                case 'w':
                    b[row].push(c);
                    break;
                case '|':
                    b.push([]);
                    row++;
                    break;
                default:
                    for (var j = 0; j < parseInt(c); j++) {
                        b[row].push('e');
                    }
            }
        }
        return b;
    }

    getMoves(turn = this.turn) {
        var moves = [];
        for (var row = 0; row < this.dim; row++) {
            for (var col = 0; col < this.dim; col++) {
                let square = this._board[row][col];
                if (square == 'e') {
                    let idxDeltas = [-1, 0, 1];
                    idxDeltas.forEach(rowDelta => {
                        idxDeltas.forEach(colDelta => {
                            var newR = row + rowDelta;
                            var newC = col + colDelta;
                            if (newR >= 0 && newR < this.dim && newC >= 0 && newC < this.dim && !(rowDelta == 0 && colDelta == 0)) {
                                if (this._isValidMove(turn, row, col, rowDelta, colDelta)) {
                                    let obj = { 'row': row, 'col': col };
                                    if (!moves.includes(obj)) {
                                        moves.push(obj);
                                    }
                                }
                            }
                        });
                    });
                }
            }
        }
        return moves;
    }

    move(position) {
        let startFen = this.fen();
        let row = position.row;
        let col = position.col;
        this._setSquare(row, col, this.turn);
        let idxDeltas = [-1, 0, 1];
        idxDeltas.forEach(rowDelta => {
            idxDeltas.forEach(colDelta => {
                var newR = row + rowDelta;
                var newC = col + colDelta;
                var keepFlipping = true;
                var flipList = [];
                while (newR >= 0 && newR < this.dim && newC >= 0 && newC < this.dim && keepFlipping) {
                    let square = this._board[newR][newC];
                    if (square == this.getOppColor()) {
                        flipList.push({ 'row': newR, 'col': newC });
                    } else {
                        keepFlipping = false;
                        if (square == this.turn) {
                            flipList.forEach(sq => this._setSquare(sq.row, sq.col, this.turn));
                        }
                    }
                    newR = newR + rowDelta;
                    newC = newC + colDelta;
                }
            });
        });
        this._history.push({
            "fen": startFen,
            "turn": this.turn,
            "move": { "row": row, "col": col }
        });
        this._switchTurn();
        if (this.getMoves().length == 0) {
            this._switchTurn();
        }
    }

    gameOver() {
        return this.getMoves().length == 0 && this.getMoves(this.getOppColor()).length == 0;
    }

    getBoard() {
        return this._deepCopy(this._board);
    }

    getHistory() {
        return this._deepCopy(this._history);
    }

    undo() {
        if (this._history.length > 0) {
            let lastState = this._history.pop();
            this._board = Othello.fenToBoard(lastState.fen);
            this.turn = lastState.turn;
            return lastState;
        }
        return null;
    }

    fen() {
        var f = '';
        for (var row = 0; row < this.dim; row++) {
            var blankCount = 0;
            for (var col = 0; col < this.dim; col++) {
                let sq = this._board[row][col];
                switch (sq) {
                    case 'e':
                        blankCount++;
                        break;
                    default:
                        if (blankCount > 0) {
                            f += blankCount.toString();
                            blankCount = 0;
                        }
                        f += sq;
                }
            }
            if (blankCount > 0) {
                f += blankCount.toString();
            }
            if (row != this.dim - 1) {
                f += "|";
            }
        }
        return f + ' ' + this.turn;
    }

    reset() {
        this._board = Othello.fenToBoard(this._startingPos);
        this.turn = this._startingPos.split(' ')[1];
        this._history = [];
    }

    getOppColor(turn = this.turn) {
        return (turn == 'b') ? 'w' : 'b';
    }

    getScore(color) {
        var counter = 0;
        for (var row = 0; row < this.dim; row++) {
            for (var col = 0; col < this.dim; col++) {
                if (this._board[row][col] == color) {
                    counter++;
                }
            }
        }
        return counter;
    }

    _isValidMove(turn, row, col, rowDelta, colDelta) {
        var newR = row + rowDelta;
        var newC = col + colDelta;
        var keepChecking = true;
        var oppCount = 0;
        while (newR >= 0 && newR < this.dim && newC >= 0 && newC < this.dim && keepChecking) {
            if (this._board[newR][newC] == this.getOppColor(turn)) {
                oppCount++;
            } else if (this._board[newR][newC] == turn && oppCount > 0) {
                keepChecking = false;
                return true;
            } else {
                keepChecking = false;
            }
            newR = newR + rowDelta;
            newC = newC + colDelta;
        }
        return false;
    }

    _deepCopy(itm) {
        if (Array.isArray(itm)) {
            var newArr = [];
            itm.forEach(subItm => newArr.push(this._deepCopy(subItm)));
            return newArr;
        } else {
            return itm;
        }
    }

    _setSquare(row, col, val) {
        this._board[row][col] = val;
    }

    _switchTurn() {
        this.turn = (this.turn == 'b') ? 'w' : 'b';
    }
}