class OthelloBoard {

    colorMap = {
        "b": "Black",
        "w": "White"
    }

    constructor(othello, config = {}) {
        this.othello = othello;
        this.lastBoard = this.othello.getBoard();
        this.boardId = "#" + (config.boardId != undefined ? config.boardId : "board");
        this.infoId = "#" + (config.infoId != undefined ? config.infoId : "info");
        this.boardVar = (config.boardVar != undefined ? config.boardVar : "board");
        this.displayMoves = (config.displayMoves != undefined ? config.displayMoves : "both");
        this.onBlackMove = (config.onBlackMove != undefined ? (config.onBlackMove) : function () { });
        this.onWhiteMove = (config.onWhiteMove != undefined ? (config.onWhiteMove) : function () { });
        this.onGameOver = (config.onGameOver != undefined ? (config.onGameOver) : function () { });
        this.updateDisplay();
        if (this.othello.turn == "b") {
            this.onBlackMove();
        } else {
            this.onWhiteMove();
        }

    }

    updateDisplay() {
        let showOptions = (this.displayMoves == this.othello.turn || this.displayMoves == "both");
        let boardChanges = this._getChanges().map(sq => this._getId(sq));
        let history = this.othello.getHistory();
        var tableStr = "";
        for (var row = 0; row < this.othello.dim; row++) {
            tableStr += "<tr>";
            for (var col = 0; col < this.othello.dim; col++) {
                let id = this._getId({ "row": row, "col": col });
                var cls = this.othello.getBoard()[row][col];
                if (showOptions && this.othello.getMoves().map(
                    o => this._getId(o)).includes(id)) {
                    cls = "o";
                }
                var bg = "mediumseagreen";
                if (history.length > 0 && this._getId(history[history.length - 1]) == id) {
                    bg = "#cc99ff";
                } else if (boardChanges.includes(id)) {
                    bg = "pink";
                }
                tableStr += '<td bgcolor="' + bg + '"><button class=" piece ' + cls + '" id="' + id +
                    '" onclick="' + this.boardVar + '.move({row:' + row + ",col:" + col + '})">' + '' + '</button></td>';
            }
            tableStr += "</tr>";
        }
        $(this.boardId).html(tableStr);

        var infoStr = "";
        let bCount = this.othello.getScore("b");
        let wCount = this.othello.getScore("w");
        if (this.othello.gameOver()) {
            infoStr += "Game Over - ";
            if (bCount > wCount) {
                infoStr += "Black Wins!";
            } else if (bCount < wCount) {
                infoStr += "White Wins!";
            } else {
                infoStr += "It's a Tie!";
            }
        } else {
            infoStr += "Turn: " + this.colorMap[this.othello.turn];
        }
        infoStr += "<br/>Score: ( B: " + bCount + " | W: " + wCount + " )";
        $(this.infoId).html(infoStr);
        resize();
    }

    move(position) {
        this.othello.move(position);
        this.updateDisplay();
        if (!this.othello.gameOver() && this.othello.turn == "b" && this.onBlackMove != undefined) {
            this.onBlackMove();
        } else if (!this.othello.gameOver() && this.othello.turn == "w" && this.onBlackMove != undefined) {
            this.onWhiteMove();
        } else if (this.othello.gameOver()) {
            this.onGameOver();
        }
        new Audio("othello-board-js/move.mp3").play();
    }

    reset() {
        this.othello.reset();
        this.lastBoard = this.othello.getBoard();
        this.updateDisplay();
        this.onBlackMove();
    }

    _getChanges() {
        var changes = [];
        for (var row = 0; row < this.othello.dim; row++) {
            for (var col = 0; col < this.othello.dim; col++) {
                let lastSquare = this.lastBoard[row][col];
                let curSquare = this.othello.getBoard()[row][col];
                if (lastSquare != curSquare) {
                    changes.push({ "row": row, "col": col })
                }
            }
        }
        this.lastBoard = this.othello.getBoard();
        return changes;
    }

    _getId(obj) {
        return obj.row + "-" + obj.col;
    }

    _setSquare(row, col, val) {
        $("#" + this._getId({ "row": row, "col": col })).attr("class", val);
    }
}

function resize() {
    var gameArea = document.getElementById("board-area");
    var newWidth = window.innerWidth * 0.9;
    var newHeight = window.innerHeight * 0.65;
    var newDim = newWidth;
    if (newWidth / newHeight > 1) {
        newDim = newHeight;
    }
    gameArea.style.height = newDim + "px";
    gameArea.style.width = newDim + "px";
    let boardElement = document.getElementById("board");
    let tds = boardElement.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        tds[i].style.width = newDim / 8 + "px";
        tds[i].style.height = newDim / 8 + "px";
    }
}
