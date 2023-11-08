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

/**
 * @param 
 */
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
        //check for undefined
        if (this.isIncorectPosition(position)) {
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
        if (this.isIncorectPosition(first) || this.isIncorectPosition(second)) {
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
                // initialises a new board after the swipes of the 2 pieces
                const board: Board<T> = JSON.parse(JSON.stringify(this)) as Board<T>;
                board.tiles[first.row][first.col] = this.tiles[second.row][second.col];
                board.tiles[second.row][second.col] = this.tiles[first.row][first.col];
                if (this.findMatches(board).length <= 0) return false;
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

            const matches = this.findMatches(this);

            this.updateBoardAfterMove(matches)
        }
    }

    findMatches(board: Board<T>): Match<T>[] {
        const matches: Match<T>[] = [];
        // keep track of current match
        // Horizontal moves - left to right
        const match: Match<T> = { matched: undefined, positions: [] };

        for (let i = 0; i < board.height; i++) {
            for (let j = 0; j < board.width - 1; j++) {
                // checking whether the current element's value is the same as the next one
                if (board.tiles[i][j].value === board.tiles[i][j + 1].value) {
                    const lastPositionInMatch = match.positions.length > 0 ? match.positions[match.positions.length - 1] : undefined;

                    const newPosition = { row: i, col: j };
                    const isPositionInMatch = lastPositionInMatch &&
                        lastPositionInMatch.row === newPosition.row &&
                        lastPositionInMatch.col === newPosition.col;

                    if (!isPositionInMatch) {
                        match.positions.push(newPosition);
                    }
                    // set position to the next element
                    match.matched = board.tiles[i][j + 1].value;
                    // push position of the next val
                    match.positions.push({ row: i, col: j + 1 })
                } else {
                    this.HandleMatches(match, matches);
                }
            }
            this.HandleMatches(match, matches);
        }
        // Vertical - from top to bottom
        for (let j = board.width - 1; j >= 0; j--) {
            for (let i = 0; i < board.height - 1; i++) {
                if (board.tiles[i][j].value === board.tiles[i + 1][j].value) {
                    const lastPositionInMatch = match.positions.length > 0 ? match.positions[match.positions.length - 1] : undefined;

                    const newPosition = { row: i, col: j };
                    const isPositionInMatch = lastPositionInMatch &&
                        lastPositionInMatch.row === newPosition.row &&
                        lastPositionInMatch.col === newPosition.col;

                    if (!isPositionInMatch) {
                        match.positions.push(newPosition);
                    }
                    match.matched = board.tiles[i + 1][j].value;
                    match.positions.push({ row: i + 1, col: j })
                } else {
                    this.HandleMatches(match, matches);
                }
            }
            this.HandleMatches(match, matches);
        }
        return matches;
    }

    private HandleMatches(match: Match<T>, matches: Match<T>[]): void {
        if (match.positions.length < 3) {
            // Reset
            match.positions = [];
        } else {
            matches.push({ ...match });
            match.positions = [];
        }
    }

    updateBoardAfterMove(matches: Match<T>[]) {
        const boardCopy = JSON.parse(JSON.stringify(this)) as Board<T>;

        for (const match of matches) {
            if (this.listener) {
                this.listener({ kind: 'Match', match: match })
            }

            for (const position of match.positions) {
                boardCopy.tiles[position.row][position.col] = null;
            }
        }

        for (let i = this.height - 1; i >= 0; i--) {
            for (let j = 0; j < this.width; j++) {
                //check if tile is empty
                if (!boardCopy.tiles[i][j]) {
                    for (let r = i; r > 0; r--) {
                        boardCopy.tiles[i][j] = boardCopy.tiles[r - 1][j];
                        boardCopy.tiles[r - 1][j] = null;
                        // stops at non empty tiles
                        if (boardCopy.tiles[i][j]){
                            break;
                        } 
                    }
                }
            }
        }
        for (let i = this.height - 1; i >= 0; i--) {
            for (let j = 0; j < this.width; j++) {
                if (!boardCopy.tiles[i][j]) {
                    const value = this.generator.next();
                    boardCopy.tiles[i][j] ={ position: { row: i, col: j }, value };
                } 
            }
        }
        this.tiles = boardCopy.tiles;

        if (this.listener) {
            this.listener({ kind: 'Refill' })
        }

        //recursive
        const newMatches = this.findMatches(this);
        if (newMatches.length > 0) {
            this.updateBoardAfterMove(newMatches);
        }
    }



    /**
     * Prevents the player from making incorrect moves
     * Swapping two positions that are outside the board
     * @param position that is to be moved
     * @returns boolean
     */
    isIncorectPosition(position: Position | undefined): boolean {
        if (position === undefined) {
            return true;
        }
        if (position.row >= this.height || position.row < 0) {
            return true;
        }
        if (position.col >= this.width || position.col < 0) {
            return true;
        }
        return false;
    }
}


