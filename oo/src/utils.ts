import {Board, Match, Piece, Position} from "./board";

export function findMatches<T>(board: Board<T>): Match<T>[] {
    const matches: Match<T>[] = [];
    const match: Match<T> = { matched: undefined, positions: [] };

    for (let i = 0; i < board.height; i++) {
        for (let j = 0; j < board.width - 1; j++) {
            if (board.tiles[i][j].value === board.tiles[i][j + 1].value) {
                const lastPositionInMatch = match.positions.length > 0 ? match.positions[match.positions.length - 1] : undefined;

                const newPosition = { row: i, col: j };
                const isPositionInMatch = lastPositionInMatch &&
                    lastPositionInMatch.row === newPosition.row &&
                    lastPositionInMatch.col === newPosition.col;

                if (!isPositionInMatch) {
                    match.positions.push(newPosition);
                }
                match.matched = board.tiles[i][j + 1].value;
                match.positions.push({ row: i, col: j + 1 })
            } else {
                handleMatches(match, matches);
            }
        }
        handleMatches(match, matches);
    }
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
                handleMatches(match, matches);
            }
        }
        handleMatches(match, matches);
    }
    return matches;
}

export function handleMatches<T>(match: Match<T>, matches: Match<T>[]): void {
    if (match.positions.length < 3) {
    match.positions = [];
} else {
    matches.push({ ...match });
    match.positions = [];
}
}

export function handleCascadeEffect<T>(board: Board<T>, matches: Match<T>[]) {
    const boardCopy = JSON.parse(JSON.stringify(board)) as Board<T>;

    for (const match of matches) {
        if (board.listener) {
            board.listener({ kind: 'Match', match: match })
        }

        for (const position of match.positions) {
            boardCopy.tiles[position.row][position.col] = null;
        }
    }

    for (let i = board.height - 1; i >= 0; i--) {
        for (let j = 0; j < board.width; j++) {
            if (!boardCopy.tiles[i][j]) {
                for (let r = i; r > 0; r--) {
                    boardCopy.tiles[i][j] = boardCopy.tiles[r - 1][j];
                    boardCopy.tiles[r - 1][j] = null;
                    if (boardCopy.tiles[i][j]){
                        break;
                    }
                }
            }
        }
    }
    for (let i = board.height - 1; i >= 0; i--) {
        for (let j = 0; j < board.width; j++) {
            if (!boardCopy.tiles[i][j]) {
                const value = board.generator.next();
                boardCopy.tiles[i][j] ={ position: { row: i, col: j }, value };
            }
        }
    }
    board.tiles = boardCopy.tiles;

    if (board.listener) {
        board.listener({ kind: 'Refill' })
    }

    const newMatches = findMatches(board);
    if (newMatches.length > 0) {
        handleCascadeEffect(board, newMatches);
    }
}

export function positionExistsOnBoard<T>(board: Board<T>, position: Position | undefined): boolean {
    if (position === undefined) {
        return true;
    }
    if (position.row >= board.height || position.row < 0) {
        return true;
    }
    if (position.col >= board.width || position.col < 0) {
        return true;
    }
    return false;
}