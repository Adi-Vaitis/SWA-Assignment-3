import {findMatches, positionExistsOnBoard, handleCascadeEffect} from "./utils";

export type Generator<T> = { next: () => T }

export type Position = {
    row: number,
    col: number
}

export type Piece<T> = {
    position: Position;
    value: T;
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = {
    kind: `Match` | `Refill`,
    match?: Match<T>
};

export type BoardListener<T> = (e: BoardEvent<T>) => any

export class Board<T> {
    width: number;
    height: number;
    listener: BoardListener<T>;
    generator: Generator<T>;
    tiles: Piece<T>[][];

    constructor(generator: Generator<T>, columns: number, rows: number) {
        this.width = columns;
        this.height = rows;
        this.generator = generator;
        this.tiles = this.initializeBoard();
    }

    private initializeBoard(): Piece<T>[][] {
        const grid: Piece<T>[][] = [];

        for (let row = 0; row < this.height; row++) {
            const rowArray: Piece<T>[] = [];
            for (let col = 0; col < this.width; col++) {
                const value = this.generator.next();
                rowArray.push({ position: { row, col }, value });
            }
            grid.push(rowArray);
        }

        return grid;
    }

    addListener(listener: BoardListener<T>) {
        this.listener = listener;
    }

    piece(position: Position): T | undefined {
        if (positionExistsOnBoard(this, position)) {
            return undefined;
        }
        const piece = this.tiles[position.row][position.col];
        return piece ? piece.value : undefined;
    }

    positions(): Position[] {
        const positions: Position[] = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                positions.push({ row, col });
            }
        }
        return positions;
    }

    canMove(first: Position, second: Position): boolean {
        if (positionExistsOnBoard(this, first) || positionExistsOnBoard(this, second)) {
            return false;
        }

        if (first.col === second.col && first.row == second.row) {
            return false;
        }

        if (!(first.col === second.col || first.row === second.row)) {
            return false;
        }

        if (this.piece(second) && this.piece(first)) {
            if (first.col === second.col || first.row === second.row) {
                const board: Board<T> = JSON.parse(JSON.stringify(this)) as Board<T>;
                board.tiles[first.row][first.col] = this.tiles[second.row][second.col];
                board.tiles[second.row][second.col] = this.tiles[first.row][first.col];
                if (findMatches(board).length <= 0) return false;
            }
        }
        return true;
    }

    move(first: Position, second: Position) {
        if (this.canMove(first, second)) {
            const firstPiece = this.tiles[first.row][first.col];
            const secondPiece = this.tiles[second.row][second.col];

            this.tiles[first.row][first.col] = secondPiece;
            this.tiles[second.row][second.col] = firstPiece;

            const matches = findMatches(this);

            handleCascadeEffect(this, matches)
        }
    }
}