import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const config = {
    boardSize: 9,
    winningLines: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ],
};

const Square = (props) => (
    <button
        className={`square ${props.isHighlighted ? "red" : ""}`}
        onClick={props.onClick}
    >
        {props.value}
    </button>
);

class Board extends React.Component {
    renderSquare(index) {
        const isHighlighted = !!(this.props.winnerLine && this.props.winnerLine.includes(index));
        return (
            <Square
                value={this.props.squares[index]}
                key={index}
                isHighlighted={isHighlighted}
                onClick={() => this.props.onClick(index)}
            />
        );
    }

    renderRow(squaresCount, rowIndex) {
        const squares = Array(squaresCount).fill(null).map((val, index) => {
            return this.renderSquare(rowIndex * squaresCount + index);
        });
        return (
            <div key={rowIndex} className="board-row">
                {squares}
            </div>
        );
    }

    buildDeck(width, height) {
        return Array(height).fill(null).map((_, rowIndex) => this.renderRow(width, rowIndex));
    }

    render() {
        return this.buildDeck(3, 3);
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(config.boardSize).fill(null),
                stepCoords: Array(2).fill(null),
            }],
            xIsNext: true,
            stepNumber: 0,
            stepSort: "ASC",
        };
    }

    handleStep(squareIndex) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = [...current.squares];
        const stepCoords = [...current.stepCoords];

        if (this.state.winner || squares[squareIndex]) return;

        squares[squareIndex] = this.state.xIsNext ? "X" : "O";
        stepCoords[0] = Math.floor(squareIndex / 3);
        stepCoords[1] = Math.floor(squareIndex % 3);
        this.setState({
            history: history.concat([{squares, stepCoords}]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
        this.calculateWinner(squares);
    }

    handleToggleSort() {
        this.setState({
            stepSort: this.getOppositeSort(this.state.stepSort),
        });
    }

    jumpTo(stepNumber) {
        const { history } = this.state;
        this.setState({
            stepNumber,
            xIsNext: stepNumber % 2 === 0,
        })

        this.calculateWinner(history[stepNumber].squares);
    }

    getOppositeSort(currentSort) {
        return currentSort === "ASC" ? "DESC" : "ASC";
    }


    calculateWinner(squares) {
        const lines = config.winningLines;
        let winner;
        let winnerLine;

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];

            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                winner = squares[a];
                winnerLine = [a, b, c]
                break;
            }
        }


        this.setState({
            winner,
            winnerLine,
        });

        return null;
    }

    render() {
        const { history, winner, winnerLine } = this.state;
        const current = history[this.state.stepNumber];
        const isSortAsc = this.state.stepSort === "ASC";
        let status = winner
            ? `Winner: ${winner}`
            : `Next player: ${this.state.xIsNext ? "X" : "O"}`;

        if (this.state.stepNumber === config.boardSize) {
            status = "It is a draw!";
        }

        const movesHistory = isSortAsc ? history : [...history].reverse();
        const moves = movesHistory.map(({stepCoords}, move) => {
            const sortedMove = isSortAsc ? move : movesHistory.length - move - 1;
            const description =  (isSortAsc && move > 0) || (!isSortAsc && move < movesHistory.length - 1)
                ? `Go to move #${sortedMove}: col ${stepCoords[1] + 1} row ${stepCoords[0] + 1}`
                : "Go to game start";

            return (
                <div key={sortedMove}>
                    <button
                        onClick={() => this.jumpTo(sortedMove)}
                        className={this.state.stepNumber === sortedMove ? "bold" : null}
                    >{description}</button>
                </div>
            )
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winnerLine={winnerLine}
                        onClick={i => this.handleStep(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button
                        onClick={() => this.handleToggleSort()}
                    >Change steps order to {this.getOppositeSort(this.state.stepSort)}</button>
                    {moves}
                </div>
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game/>);
