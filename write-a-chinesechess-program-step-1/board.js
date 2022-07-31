"use strict";

// �Ծֽ��
var RESULT_UNKNOWN = 0;	// δ֪���������ڽ����У�δ��ʤ����
var RESULT_WIN = 1;		// Ӯ��Ҳ���ǵ������ˣ�
var RESULT_DRAW = 2;	// ����
var RESULT_LOSS = 3;	// �䣨Ҳ���ǵ���Ӯ�ˣ�

var BOARD_WIDTH = 577;
var BOARD_HEIGHT = 577;
var SQUARE_SIZE = 80;
var SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 7) >> 1;
var SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 7) >> 1;
var THINKING_SIZE = 32;
var THINKING_LEFT = (BOARD_WIDTH - THINKING_SIZE) >> 1;
var THINKING_TOP = (BOARD_HEIGHT - THINKING_SIZE) >> 1;
var PIECE_NAME = [
  "oo", null, null, null, null, null, null, null,
  "rk", "ra", "rb", "rn", "rr", "rc", "rp", null,
  "bk", "ba", "bb", "bn", "br", "bc", "bp", null,
];

// ���Ӿ���������߿�ľ���
function SQ_X(sq) {
  return SQUARE_LEFT + (FILE_X(sq) - 4) * SQUARE_SIZE;
}

// ���Ӿ��������ϱ߿�ľ���
function SQ_Y(sq) {
  return SQUARE_TOP + (RANK_Y(sq) - 4) * SQUARE_SIZE;
}

// Board����ĳ�ʼ�����룬λ��index.html��
function Board(container, images) {
  this.images = images;	// ͼƬ·��
  this.imgSquares = [];	// img���飬��Ӧ�����ϵ�90��λ������
  this.pos = new Position();
  this.pos.fromFen("rcnkncr/p1ppp1p/7/7/7/P1PPP1P/RCNKNCR w - - 0 1");	// ����FEN����ʼ�����
  this.sqSelected = 0;	// ��ǰѡ�����ӵ�λ�ã����Ϊ0����ʾ��ǰû�����ӱ�ѡ�У�
  this.mvLast = 0;		// ��һ���߷�
  this.search = null;	// Search�����ʵ��
  this.busy = false;	// false��ʾ����״̬��true��ʾ��æ״̬����æ״̬����Ӧ�û������

  var style = container.style;
  style.position = "relative";
  style.width = BOARD_WIDTH + "px";
  style.height = BOARD_HEIGHT + "px";
  style.background = "url(" + images + "board.jpg)";
  var this_ = this;
  for (var sq = 0; sq < 256; sq ++) {
    // �����������̵�256����
  
    // 1.�жϸõ��Ƿ�λ����ʵ����
    if (!IN_BOARD(sq)) {
      this.imgSquares.push(null);
      continue;
    }
	
	// 2.�����ϵ�90������ÿ�����򶼻ᶨ��һ����Ӧ��img��ǩ
    var img = document.createElement("img");
    var style = img.style;
    style.position = "absolute";
    style.left = SQ_X(sq);
    style.top = SQ_Y(sq);
    style.width = SQUARE_SIZE;
    style.height = SQUARE_SIZE;
    style.zIndex = 0;
	
	// 3.ÿ���������򶼻�󶨵���¼�������sq_��ʾ�˾����������򡣣������õ��ˡ��հ�����֪ʶ�ɣ�
    img.onmousedown = function(sq_) {
      return function() {
        this_.clickSquare(sq_);
      }
    } (sq);

	// 4.������õ�img��ǩ׷�ӵ�html��
    container.appendChild(img);
	
	// 5.��img��ǩ�洢��imgSquares�����У���������Ը�������в��������磬��ʾ��ͬ������ͼƬ��
	this.imgSquares.push(img);
  }
  
  // ����˼���е�ͼƬ��Ҳ����thinking.gif��
  this.thinking = document.createElement("img");
  this.thinking.src = images + "thinking.gif";
  style = this.thinking.style;
  style.visibility = "hidden";
  style.position = "absolute";
  style.left = THINKING_LEFT + "px";
  style.top = THINKING_TOP + "px";
  container.appendChild(this.thinking);

  // ��ʾ����ͼƬ
  this.flushBoard();
}

// ���������㷨
Board.prototype.setSearch = function() {
  this.search = new Search(this.pos);
}

// ����õ������壬����true�����򣬷���false
Board.prototype.computerMove = function() {
  return this.pos.sdPlayer == this.computer;
}

// �ж��ⲽ���Ƿ�Ϸ�������Ϸ�����ִ���ⲽ��
Board.prototype.addMove = function(mv) {
  // �ж��ⲽ���Ƿ�Ϸ�
  if (!this.pos.legalMove(mv)) {
    return;
  }
  
  // ִ���ⲽ��
  if (!this.pos.makeMove(mv)) {
    return;
  }
  
  this.postAddMove(mv);
}

Board.prototype.postAddMove = function(mv) {
  // �����һ����ѡ�з���
  if (this.mvLast > 0) {
    this.drawSquare(SRC(this.mvLast), false);
    this.drawSquare(DST(this.mvLast), false);
  }
  
  // ��ʾ��һ�������ѡ�з���
  this.drawSquare(SRC(mv), true);
  this.drawSquare(DST(mv), true);
  
  this.sqSelected = 0;
  this.mvLast = mv;

  // �ж���Ϸ�Ƿ����
  if (this.pos.isMate()) {	// ������ߣ�ʵ���Ͼ��Ǳ�������
    this.result = computerMove ? RESULT_LOSS : RESULT_WIN;
	this.postMate(computerMove);
  }
  
  // �ж��Ƿ���ֳ���
  var vlRep = this.pos.repStatus(3);
  if (vlRep > 0) {
    vlRep = this.pos.repValue(vlRep);
    if (vlRep > -WIN_VALUE && vlRep < WIN_VALUE) {
      this.result = RESULT_DRAW;
      alertDelay("˫���������ͣ������ˣ�");
    } else if (computerMove == (vlRep < 0)) {
      this.result = RESULT_LOSS;
      alertDelay("�����������벻Ҫ���٣�");
    } else {
      this.result = RESULT_WIN;
      alertDelay("����������ף����ȡ��ʤ����");
    }
    this.busy = false;
    return;
  }
}

// ������һ����
Board.prototype.response = function() {
  this.thinking.style.visibility = "visible";			// ��ʾ����˼���е�ͼƬ
  var this_ = this;
  this.busy = true;
  setTimeout(function() {
    this_.addMove(board.search.searchMain(LIMIT_DEPTH,LIMIT_TIME));		// ���������㷨���һ���壬��ִ���ⲽ��
    this_.thinking.style.visibility = "hidden";			// ���ص���˼���е�ͼƬ
  }, 0);
  this.busy = false;
  this.flushBoard();	
}

// ������̵���Ӧ������������̣����ӻ��߿�λ�ã����ͻ���øú�����sq_�ǵ����λ��
Board.prototype.clickSquare = function(sq) {
  if (this.busy) {
    return;
  }
  var pc = this.pos.squares[sq];	// ���������
  if ((pc & SIDE_TAG(this.pos.sdPlayer)) != 0) {
    // ����˼������ӣ�ֱ��ѡ�и���
	
	if (this.mvLast != 0) {
      this.drawSquare(SRC(this.mvLast), false);
      this.drawSquare(DST(this.mvLast), false);
    }
    if (this.sqSelected) {
      this.drawSquare(this.sqSelected, false);
    }
    this.drawSquare(sq, true);
    this.sqSelected = sq;
  } else if (this.sqSelected > 0) {
    // ����Ĳ��Ǽ������ӣ��Է����ӻ������ӵ�λ�ã���������ѡ����(һ�����Լ�����)����ôִ������߷�
    this.addMove(MOVE(this.sqSelected, sq));
  }
}

// ��ʾsqλ�õ�����ͼƬ�������λ��û���ӣ�����ʾһ��͸����ͼƬ�����selectedΪtrue����Ҫ��ʾ����ѡ��ʱ�ı߿�
Board.prototype.drawSquare = function(sq, selected) {
  var img = this.imgSquares[sq];
  img.src = this.images + PIECE_NAME[this.pos.squares[sq]] + ".gif";
  img.style.backgroundImage = selected ? "url(" + this.images + "oos.gif)" : "";
}

// ������ʾ�����ϵ�����
Board.prototype.flushBoard = function() {
  for (var sq = 0; sq < 256; sq ++) {
    if (IN_BOARD(sq)) {
      this.drawSquare(sq);
    }
  }
}

// ������¿�ʼ
Board.prototype.restart = function(fen) {
  if (this.busy) {			// ��������˼���У�����Ӧ�κε���¼�
    return;
  }

  this.pos.fromFen(fen);	// �����û�ѡ��ľ������¿�ʼ
  this.flushBoard();		// ������ʾ����
}

// ����
Board.prototype.retract = function() {
  if (this.busy) {
    return;
  }
  this.result = RESULT_UNKNOWN;

  // ����߷����鲻Ϊ�գ���ô�ͳ���һ����
  if (this.pos.mvList.length > 1) {
    this.pos.undoMakeMove();
  }
  
  this.flushBoard();	// ������ʾ����
}
