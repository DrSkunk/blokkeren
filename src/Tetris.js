import React, { Component } from 'react';
import styled from 'styled-components';
// Source https://codeincomplete.com/posts/javascript-tetris/

//'#EFE807'
const blockColor = '#EFE807';

const i = { blocks: [0x0f00, 0x2222, 0x00f0, 0x4444], color: blockColor };
const j = { blocks: [0x44c0, 0x8e00, 0x6440, 0x0e20], color: blockColor };
const l = { blocks: [0x4460, 0x0e80, 0xc440, 0x2e00], color: blockColor };
const o = { blocks: [0xcc00, 0xcc00, 0xcc00, 0xcc00], color: blockColor };
const s = { blocks: [0x06c0, 0x8c40, 0x6c00, 0x4620], color: blockColor };
const t = { blocks: [0x0e40, 0x4c40, 0x4e00, 0x4640], color: blockColor };
const z = { blocks: [0x0c60, 0x4c80, 0xc600, 0x2640], color: blockColor };

const KEY = { ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
const DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3, MIN: 0, MAX: 3 };

const Coart = styled.div`
  display: grid;
  width: 200px;
  padding-left: 100px;
  grid-template-rows: repeat(18, auto);
  grid-auto-flow: column;
`;
const Tile = styled.div`
  border: 1px solid black;
  width: 20px;
  height: 20px;
`;
const NextBlock = styled.div`
  display: grid;
  padding-left: 120px;
  width: 80px;
  grid-template-rows: repeat(6, auto);
  grid-auto-flow: column;
`;

export default class Tetris extends Component {
  courtWidth = 10;
  courtHeight = 18;

  constructor(props) {
    super(props);
    this.state.current = this.randomPiece();
    this.state.next = this.randomPiece();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keydown', this.onKeyUp, false);
  }

  initCourt = () => {
    const court = [];
    for (let i = 0; i < this.courtWidth; i++) {
      const line = Array.apply(null, Array(this.courtHeight)).map(() => null);
      court.push(line);
    }
    return court;
  };

  state = {
    blocks: this.initCourt(), // 2 dimensional array (nx*ny) representing tetris court - either empty block or occupied by a 'piece'
    playing: 0, // true|false - game is in progress
    current: {}, // the current piece
    next: {}, // the next piece
    pieces: [
      i,
      i,
      i,
      i,
      j,
      j,
      j,
      j,
      l,
      l,
      l,
      l,
      o,
      o,
      o,
      o,
      s,
      s,
      s,
      s,
      t,
      t,
      t,
      t,
      z,
      z,
      z,
      z,
    ],
    //score: 0, // the current score
    rows: 0, // number of completed rows in the current game
    rowsPlayerOne: 0,
    rowsPlayerTwo: 0,
    // step:0 // how long before current piece drops by 1 row
    remainingBlocks: 0, // how many blocks can you play
    isPlayerOne: true,
  };

  randomPiece = () => {
    //console.log('randomPiece');
    const { pieces } = this.state;
    let type;
    if (pieces.length === 0) {
      const newPieces = [
        i,
        i,
        i,
        i,
        j,
        j,
        j,
        j,
        l,
        l,
        l,
        l,
        o,
        o,
        o,
        o,
        s,
        s,
        s,
        s,
        t,
        t,
        t,
        t,
        z,
        z,
        z,
        z,
      ];
      this.setState({
        pieces: newPieces,
      });
      type = newPieces.splice(
        Math.floor(Math.random() * pieces.length - 1),
        1
      )[0]; // remove a single piece
    } else {
      type = pieces.splice(Math.floor(Math.random() * pieces.length - 1), 1)[0]; // remove a single piece
    }
    return { type: type, dir: DIR.UP, x: 2, y: 0 };
  };

  setCurrentPiece = (piece) => {
    // console.log('setCurrentPiece');
    this.setState({ current: piece || this.randomPiece() });
  };
  setNextPiece = (piece) => {
    // console.log('setNextPiece');
    this.setState({ next: piece || this.randomPiece() });
  };

  play = () => {
    // console.log('STARTING GAME');
    this.setState({ playing: true });
    this.gameTimer = setInterval(this.drop, 1000);
  };

  stop = () => {
    // console.log('STOPPING GAME');
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    this.setState({ playing: false });
  };

  onKeyDown = (ev) => {
    // console.log('ONKEYDOWN');
    // console.log(this.state.playing);
    if (this.state.playing) {
      switch (ev.keyCode) {
        case KEY.LEFT:
          this.keyLeftPressed = true;
          this.move(DIR.LEFT);
          break;
        case KEY.RIGHT:
          this.keyLeftPressed = true;
          this.move(DIR.RIGHT);
          break;
        case KEY.UP:
          this.keyUpPressed = true;
          this.rotate();
          break;
        case KEY.DOWN:
          // console.log('this.keydownPressed', this.keydownPressed);
          if (!this.keydownPressed) {
            this.keydownPressed = true;
            this.drop();
          }

          break;
        // case KEY.ESC:
        //   lose();
        // break;
        default:
          break;
      }
    }
  };

  onKeyUp = (ev) => {
    switch (ev.keyCode) {
      case KEY.LEFT:
        this.keyLeftPressed = false;
        break;
      case KEY.RIGHT:
        this.keyLeftPressed = false;
        break;
      case KEY.UP:
        this.keyUpPressed = false;
        break;
      case KEY.DOWN:
        this.keydownPressed = false;
        break;
      default:
        break;
    }
  };
  rotate = () => {
    const { current } = this.state;
    const newDir = current.dir === DIR.MAX ? DIR.MIN : current.dir + 1;
    if (this.unoccupied(current.type, current.x, current.y, newDir)) {
      this.setState((state) => ({
        current: { ...state.current, dir: newDir },
      }));
    }
  };
  drop = () => {
    //console.log('dropblock');
    if (!this.move(DIR.DOWN)) {
      let remainingBlocks = 0;
      this.setState((state) => {
        remainingBlocks = Math.max(0, state.remainingBlocks - 1);
        return {
          remainingBlocks,
        };
      });
      this.dropPiece();
      this.removeLines();
      this.setCurrentPiece(this.state.next);
      this.setNextPiece(this.randomPiece());
      const { current } = this.state;
      if (
        this.occupied(current.type, current.x, current.y, current.dir) ||
        remainingBlocks === 0
      ) {
        this.stop();
      }
    }
  };

  removeLines = () => {
    let x;
    let y;
    let complete;
    let n = 0;

    for (y = this.courtHeight; y > 0; --y) {
      complete = true;
      for (x = 0; x < this.courtWidth; ++x) {
        if (!this.getBlock(x, y)) {
          complete = false;
        }
      }
      if (complete) {
        this.removeLine(y);
        y = y + 1; // recheck same line
        n++;
      }
    }
    if (n > 0) {
      this.setState((state) => {
        if (state.isPlayerOne) {
          return { rowsPlayerOne: state.rowsPlayerOne + n };
        } else {
          return { rowsPlayerTwo: state.rowsPlayerTwo + n };
        }
      });
    }
  };

  removeLine = (n) => {
    let x;
    let y;
    this.setState((state) => {
      const copiedBlocks = JSON.parse(JSON.stringify(state.blocks));
      for (y = n; y >= 0; y--) {
        for (x = 0; x < this.courtWidth; ++x) {
          // this.setBlockRow(y, y === 0 ? null : this.getBlock(x, y - 1));
          copiedBlocks[x][y] = y === 0 ? null : this.getBlock(x, y - 1);
        }
      }
      return { blocks: copiedBlocks };
    });
  };

  move = (dir) => {
    //console.log('move', dir);
    const { current } = this.state;
    let { x, y } = current;
    switch (dir) {
      case DIR.RIGHT:
        x = x + 1;
        break;
      case DIR.LEFT:
        x = x - 1;
        break;
      case DIR.DOWN:
        y = y + 1;
        break;
      default:
        break;
    }
    if (this.unoccupied(current.type, x, y, current.dir)) {
      this.setState({ current: { ...current, x, y } });
      return true;
    } else {
      return false;
    }
  };

  occupied = (type, x, y, dir) => {
    //console.log('occupied', type, x, y, dir);
    let result = false;
    this.eachBlock(type, x, y, dir, (x, y) => {
      if (
        x < 0 ||
        x >= this.courtWidth ||
        y < 0 ||
        y >= this.courtHeight ||
        this.getBlock(x, y)
      )
        result = true;
    });
    //console.log('OCCUPIED RESULT', result);
    return result;
  };
  unoccupied = (type, x, y, dir) => {
    //console.log('unoccupied', type, x, y, dir);
    return !this.occupied(type, x, y, dir);
  };

  eachBlock = (type, x, y, dir, fn) => {
    //console.log('eachBlock', type, x, y, dir, fn);
    let bit,
      // result,
      row = 0,
      col = 0,
      blocks = type.blocks[dir];
    for (bit = 0x8000; bit > 0; bit = bit >> 1) {
      if (blocks & bit) {
        fn(x + col, y + row);
      }
      if (++col === 4) {
        col = 0;
        ++row;
      }
    }
  };

  getBlock = (x, y) => {
    //console.log('getBlock', x, y);
    const { blocks } = this.state;
    return blocks[x][y];
    // return blocks && blocks[x] ? blocks[x][y] : null;
  };

  dropPiece = () => {
    //console.log('droppiece');

    const { current } = this.state;
    this.eachBlock(current.type, current.x, current.y, current.dir, (x, y) => {
      this.setBlock(x, y, current.type);
    });
  };

  setBlock = (x, y, type) => {
    //console.log('setBlock', x, y, type);
    // const { blocks } = this.state;
    // blocks[x] = blocks[x] || [];
    // blocks[x][y] = type;
    this.setState((state) => {
      const copiedBlocks = JSON.parse(JSON.stringify(state.blocks));
      copiedBlocks[x][y] = type;
      return { blocks: copiedBlocks };
    });
  };

  renderNext = () => {
    const { next } = this.state;
    const { type, x, y, dir } = next;
    //console.log('RENDERNEXT');
    const blocks = [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
    ];
    //console.log(blocks);
    this.eachBlock(type, x, y, dir, (x, y) => {
      // console.log(x, y, type);
      blocks[x][y] = 'X';
    });
    //console.log('------------------');
    return (
      <NextBlock>
        {blocks.flat().map((block, i) => {
          //console.log(block);
          return (
            <Tile
              key={i}
              style={
                block === null
                  ? { border: '0px' }
                  : { backgroundColor: blockColor }
              }
            />
          );
        })}
      </NextBlock>
    );
  };

  renderCourt = () => {
    const { blocks, current } = this.state;
    const copiedBlocks = JSON.parse(JSON.stringify(blocks));
    if (current) {
      const { type, x, y, dir } = current;
      this.eachBlock(type, x, y, dir, (x, y) => {
        copiedBlocks[x][y] = type;
      });
    }
    return (
      <Coart>
        {copiedBlocks.flat().map((tile, i) => {
          return (
            <Tile
              key={tile + i}
              style={
                tile === null
                  ? { backgroundColor: '#535353' }
                  : { backgroundColor: tile.color }
              }
            >
              {/* {i} */}
            </Tile>
          );
        })}
      </Coart>
    );
  };

  addBlocks = (n) => {
    this.setState((state) => {
      return { remainingBlocks: state.remainingBlocks + n };
    });
  };

  render() {
    const nextBlock = this.renderNext();
    const court = this.renderCourt();
    console.log('render');
    const {
      playing,
      isPlayerOne,
      rowsPlayerOne,
      rowsPlayerTwo,
      remainingBlocks,
    } = this.state;
    return (
      <div style={{ width: 400 }} tabIndex="0">
        <div>Huidige speler: {isPlayerOne ? '1' : '2'}</div>
        <div>Score speler 1: {rowsPlayerOne * 50}</div>
        <div>Score speler 2: {rowsPlayerTwo * 50}</div>
        <div>Resterende blokken: {remainingBlocks}</div>
        {nextBlock}
        {court}
        <button onClick={this.play} disabled={playing || remainingBlocks === 0}>
          Start
        </button>
        <button onClick={this.stop} disabled={!playing}>
          Stop
        </button>
        <div>
          <div>
            <button onClick={() => this.addBlocks(1)}>Geef 1 blok</button>
          </div>
          <div>
            <button onClick={() => this.addBlocks(2)}>Geef 2 blokken</button>
          </div>
          <div>
            <button onClick={() => this.addBlocks(3)}>Geef 3 blokken</button>
          </div>
          <div>
            <button onClick={() => this.addBlocks(4)}>Geef 4 blokken</button>
          </div>
          <div>
            <button onClick={() => this.addBlocks(5)}>Geef 5 blokken</button>
          </div>
          <div>
            <button
              onClick={() => {
                this.setState((state) => ({ isPlayerOne: !state.isPlayerOne }));
              }}
            >
              Wissel speler
            </button>
          </div>
        </div>
        {/* <pre>Current: {JSON.stringify(this.state.current, null, 2)}</pre>
        <pre>Next:{JSON.stringify(this.state.next, null, 2)}</pre> */}
      </div>
    );
  }
}
