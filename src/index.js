import React, { Component } from "react";
import ReactDOM from "react-dom";
import Utils from "./utils";
import "./index.css";

const SquareState = {
  NORMAL: 0, // 普通状态
  SHOWED: 1, // 显示状态（被点开）
  FLAGED: 2, // 插旗
  DOUBT: 3 // 疑问
};

// 周围8格的坐标
const around8Pos = [
  { col: -1, row: -1 },
  { col: 0, row: -1 },
  { col: 1, row: -1 },
  { col: -1, row: 0 },
  { col: 1, row: 0 },
  { col: -1, row: 1 },
  { col: 0, row: 1 },
  { col: 1, row: 1 }
];

// 周围4格的坐标
const around4Pos = [
  { col: 0, row: -1 },
  { col: -1, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 }
];

function Square(props) {
  const mineNum = parseInt(props.message.mineNum, 10);
  const currState = props.message.state;
  let displayContent = "";

  switch (currState) {
    case SquareState.NORMAL:
      displayContent = "";
      break;
    case SquareState.SHOWED:
      displayContent = mineNum.toString();
      break;
    case SquareState.FLAGED:
      displayContent = "O";
      break;
    case SquareState.DOUBT:
      displayContent = "?";
      break;
    default:
      displayContent = "";
      break;
  }

  return (
    <button
      className="square"
      onClick={props.onLeftClick}
      onContextMenu={props.onRightClick}
    >
      {displayContent}
    </button>
  );
}

function Board(props) {
  const width = props.width;
  const height = props.height;
  const boardState = props.boardState;

  const board = [];
  for (let i = 0; i < height; i++) {
    let row = [];
    for (let j = 0; j < width; j++) {
      row.push(
        <Square
          key={j}
          message={boardState[i][j]}
          onLeftClick={event => props.onLeftClick(event, i, j)}
          onRightClick={event => props.onRightClick(event, i, j)}
        />
      );
    }
    board.push(
      <div key={i} className="board-row">
        {row}
      </div>
    );
  }

  return board;
}

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: props.width,
      height: props.height,
      mineNum: props.mineNum,
      boardState: this.buildBoard(props.width, props.height, props.mineNum)
    };

    this.onLeftClick = this.onLeftClick.bind(this);
    this.onRightClick = this.onRightClick.bind(this);
  }

  /**
   * 构建棋盘
   * @param {number} width 棋盘宽度
   * @param {number} height 棋盘高度
   * @param {number} totalMineNum 地雷数
   */
  buildBoard(width, height, totalMineNum) {
    // 最多雷数
    const maxMineNum = width * height;
    // 雷的位置数组
    const minePositions = Utils.generateRandomNumGroup(
      totalMineNum,
      0,
      maxMineNum - 1
    );

    // 初始化棋盘状态
    const boardState = [];
    for (let i = 0; i < height; i++) {
      const boardRow = [];
      for (let j = 0; j < width; j++) {
        boardRow.push({
          mineNum: 0,
          state: SquareState.NORMAL
        });
      }
      boardState.push(boardRow);
    }

    // 给有雷的位置赋值
    minePositions.forEach(eachMinePos => {
      boardState[parseInt(eachMinePos / width, 10)][
        eachMinePos % width
      ].mineNum = -1;
    });

    // 计算每格周围的雷数
    this.calSquareAroundMineNum(width, height, boardState);

    // console.log(boardState);
    return boardState;
  }

  /**
   * 计算每格周围的雷数
   * @param {number} width 棋盘宽度
   * @param {number} height 棋盘高度
   * @param {Array} boardState 棋盘状态
   */
  calSquareAroundMineNum(width, height, boardState) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (boardState[i][j].mineNum !== -1) {
          let mineNum = 0;
          for (let k = 0; k < around8Pos.length; k++) {
            if (
              i + around8Pos[k].row >= 0 &&
              i + around8Pos[k].row < height &&
              j + around8Pos[k].col >= 0 &&
              j + around8Pos[k].col < width
            ) {
              if (
                boardState[i + around8Pos[k].row][j + around8Pos[k].col]
                  .mineNum === -1
              ) {
                mineNum++;
              }
            }
          }
          boardState[i][j].mineNum = mineNum;
        }
      }
    }
    console.log(boardState);
  }

  /**
   * 鼠标左击事件响应
   * @param {Object} event 点击事件
   * @param {number} col 点击的列坐标
   * @param {number} row 点击的行坐标
   */
  onLeftClick(event, col, row) {
    event.preventDefault();

    // 挖开格子
    const boardState = this.state.boardState;
    if (boardState[col][row].state !== SquareState.NORMAL) {
      return;
    }
    if (boardState[col][row].mineNum === -1) {
      alert("Boom!!!!!");
    }
    this.digSquare(boardState, col, row);

    this.setState({
      boardState: boardState
    });
  }

  digSquare(boardState, col, row) {
    boardState[col][row].state = SquareState.SHOWED;

    // 只有此格不是地雷且周围没有地雷才会扩散
    if (boardState[col][row].mineNum === 0) {
      for (let k = 0; k < around4Pos.length; k++) {
        if (
          row + around4Pos[k].row >= 0 &&
          row + around4Pos[k].row < this.state.height &&
          col + around4Pos[k].col >= 0 &&
          col + around4Pos[k].col < this.state.width
        ) {
          if (
            boardState[col + around4Pos[k].col][row + around4Pos[k].row].state ===
            SquareState.NORMAL
          ) {
            this.digSquare(
              boardState,
              col + around4Pos[k].col,
              row + around4Pos[k].row
            );
          }
        }
      }
    }
  }

  /**
   *
   * @param {Object} event 点击事件
   * @param {number} col 点击的列坐标
   * @param {number} row 点击的行坐标
   */
  onRightClick(event, col, row) {
    event.preventDefault();
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board
            width={this.state.width}
            height={this.state.height}
            boardState={this.state.boardState}
            onLeftClick={this.onLeftClick}
            onRightClick={this.onRightClick}
          />
        </div>
      </div>
    );
  }
}

Game.defaultProps = {
  width: 10,
  height: 10,
  mineNum: 20
};

//============================================
ReactDOM.render(<Game />, document.getElementById("root"));
