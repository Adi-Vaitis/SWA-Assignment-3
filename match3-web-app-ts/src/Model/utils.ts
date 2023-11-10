import * as Board from "./board";

export function positionExistsInBoard(
    board: Board.Board<any>,
    p: Board.Position
): boolean {
    return (
        p.row >= 0 && p.row < board.height && p.col >= 0 && p.col < board.width
    );
}

export function positionsAreInTheSameColumnOrRow(
    p1: Board.Position,
    p2: Board.Position
): boolean {
    return p1.row === p2.row || p1.col === p2.col;
}

export function swapPieces<T>(
    board: T[][],
    p1: Board.Position,
    p2: Board.Position
): T[][] {
    const newBoard = board.map((row) => [...row]);
    const temp = newBoard[p1.row][p1.col];
    newBoard[p1.row][p1.col] = newBoard[p2.row][p2.col];
    newBoard[p2.row][p2.col] = temp;
    return newBoard;
}

export function constructIndexOfDesiredPosition(
    board: Board.Board<any>,
    p: Board.Position
): number {
    return p.row * board.width + p.col;
}

export function matchesExist<T>(
    board: Board.Board<T>,
    p1: Board.Position,
    p2: Board.Position
): boolean {
    return (
        hasMatch(board, p1) ||
        hasMatch(board, p2) ||
        hasMatchAfterSwap(board, p1, p2)
    );
}

function hasMatch<T>(board: Board.Board<T>, p: Board.Position): boolean {
    const piece = board.board[p.row][p.col];
    return (
        checkHorizontalMatch(board, p, piece).length >= 3 ||
        checkVerticalMatch(board, p, piece).length >= 3
    );
}

function hasMatchAfterSwap<T>(
    board: Board.Board<T>,
    p1: Board.Position,
    p2: Board.Position
): boolean {
    const tempBoard = { ...board };
    const tempPieces = swapPieces([...board.board], p1, p2);
    tempBoard.board = tempPieces;
    return hasMatch(tempBoard, p1) || hasMatch(tempBoard, p2);
}

export function checkHorizontalMatch<T>(
    board: Board.Board<T>,
    p: Board.Position,
    piece: T
): Board.Position[] {
    const { row, col } = p;
    let count = 1;
    let left = col - 1;
    let right = col + 1;
    let horizontalMatches = [p];

    while (left >= 0 && board.board[row][left] === piece) {
        count++;
        horizontalMatches.push({ row, col: left });
        left--;
    }

    while (right < board.width && board.board[row][right] === piece) {
        count++;
        horizontalMatches.push({ row, col: right });
        right++;
    }

    return horizontalMatches;
}

export function checkVerticalMatch<T>(
    board: Board.Board<T>,
    p: Board.Position,
    piece: T
): Board.Position[] {
    const { row, col } = p;
    let count = 1;
    let up = row - 1;
    let down = row + 1;
    let verticalMatches = [p];

    while (up >= 0 && board.board[up][col] === piece) {
        count++;
        verticalMatches.push({ row: up, col });
        up--;
    }

    while (down < board.height && board.board[down][col] === piece) {
        count++;
        verticalMatches.push({ row: down, col });
        down++;
    }

    return verticalMatches;
}

export function constructEffectsForPosition<T>(
    board: Board.Board<T>,
    p: Board.Position
): Board.Effect<T>[] {
    let effects: Board.Effect<T>[] = [];
    let piece = Board.piece(board, p);
    let pieceMatchesHorizontally = checkHorizontalMatch(board, p, piece);
    let pieceMatchesVertically = checkVerticalMatch(board, p, piece);

    if (pieceMatchesHorizontally.length >= 3) {
        pieceMatchesHorizontally.sort((a, b) => a.row - b.row);
        effects.push({
            kind: "Match",
            match: { matched: piece, positions: pieceMatchesHorizontally },
        });
    }
    if (pieceMatchesVertically.length >= 3) {
        pieceMatchesVertically.sort((a, b) => a.row - b.row);
        effects.push({
            kind: "Match",
            match: { matched: piece, positions: pieceMatchesVertically },
        });
    }

    return effects;
}

export function effectsAreEqual<T>(
    e1: Board.Effect<T>,
    e2: Board.Effect<T>
): boolean {
    if (
        e1.match === undefined ||
        e2.match === undefined ||
        e2.board === undefined ||
        e1.board === undefined
    )
        return false;
    return e1.kind === e2.kind && e1.board === e2.board && e1.match === e2.match;
}

export function createBoardWithUndefinedMatched<T>(
    generator: Board.Generator<T>,
    board: Board.Board<T>,
    matchedPositions: Board.Position[]
): Board.Board<T> {
    const newBoard: T[][] = [];

    for (let row = 0; row < board.height; row++) {
        const newRow: T | undefined[] = [];
        for (let col = 0; col < board.width; col++) {
            const currentPosition: Board.Position = { row, col };
            const currentPiece = Board.piece(board, currentPosition);

            if (
                matchedPositions.some((matchedPos) =>
                    arePositionsEqual(matchedPos, currentPosition)
                )
            ) {
                newRow.push(undefined);
            } else {
                // @ts-ignore
                newRow.push(currentPiece);
            }
        }
        // @ts-ignore
        newBoard.push(newRow);
    }

    return { ...board, board: newBoard };
}

export function arePositionsEqual(
    pos1: Board.Position,
    pos2: Board.Position
): boolean {
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

export function refillBoard<T>(
    generator: Board.Generator<T>,
    board: Board.Board<T>,
    matchedPositions: Board.Position[]
): Board.Board<T> {
    let boardWithUndefinedMatched = createBoardWithUndefinedMatched(generator, board, matchedPositions);

    let sortedBoard = sortBoard(boardWithUndefinedMatched);
    let refilledBoard = regenerateUndefinedTiles(sortedBoard);
    return refilledBoard;
}

function sortBoard<T>(board: Board.Board<T>): Board.Board<T> {
    const numRows = board.board.length;
    const numCols = board.width;

    const sortedColumns: (T | undefined)[][] = [];

    for (let col = 0; col < numCols; col++) {
        const column: (T | undefined)[] = [];
        for (let row = 0; row < numRows; row++) {
            column.push(board.board[row][col]);
        }

        const sortedColumn = sortColumns(column);

        sortedColumns.push(sortedColumn);
    }

    const sortedArray: (T | undefined)[][] = [];
    for (let row = 0; row < numRows; row++) {
        sortedArray.push([]);
        for (let col = 0; col < numCols; col++) {
            sortedArray[row].push(sortedColumns[col][row]);
        }
    }

    return {
        ...board,
        // @ts-ignore
        board: sortedArray,
    };
}

function sortColumns<T>(arr: (T | undefined)[]): (T | undefined)[] {
    const nullValues: (T | null)[] = [];
    const stringValues: T[] = [];

    for (const item of arr) {
        if (item === undefined) {
            // @ts-ignore
            nullValues.push(undefined);
        } else {
            stringValues.push(item);
        }
    }

    stringValues.sort((a, b) => arr.indexOf(a) - arr.indexOf(b));

    const sortedArray = nullValues.concat(stringValues);

    // @ts-ignore
    return sortedArray;
}

export function regenerateUndefinedTiles<T>(
    boardWithUndefined: Board.Board<T>,
): Board.Board<T> {
    const regeneratedBoard: T[][] = [];

    for (let row = 0; row < boardWithUndefined.height; row++) {
        const newRow: T[] = [];
        for (let col = 0; col < boardWithUndefined.width; col++) {
            if (boardWithUndefined.board[row][col] === undefined) {
                newRow.push(boardWithUndefined.generator.next());
            }
            else {
                newRow.push(boardWithUndefined.board[row][col]);
            }
        }
        regeneratedBoard.push(newRow);
    }

    return { ...boardWithUndefined, board: regeneratedBoard };
}