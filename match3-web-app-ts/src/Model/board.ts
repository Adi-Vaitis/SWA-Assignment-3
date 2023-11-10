import {
    checkHorizontalMatch,
    checkVerticalMatch,
    constructEffectsForPosition,
    constructIndexOfDesiredPosition,
    matchesExist,
    positionExistsInBoard,
    positionsAreInTheSameColumnOrRow,
    refillBoard,
    swapPieces,
} from "./utils";

export type Generator<T> = { next: () => T };

export type Position = {
    row: number;
    col: number;
};

export type Match<T> = {
    matched: T;
    positions: Position[];
};

export type Board<T> = {
    generator: Generator<T>;
    width: number;
    height: number;
    board: T[][];
};

export type BoardEvent<T> = {
    kind: "Match" | "Refill";
    match?: Match<T>;
};

export type Effect<T> = {
    kind: "Match" | "Refill";
    match?: Match<T | undefined>;
    board?: Board<T>;
};

export type MoveResult<T> = {
    board: Board<T>;
    effects: Effect<T>[];
};

export function positions(board: Board<any>): Position[] {
    let positions: Position[] = [];
    for (let row = 0; row < board.height; row++) {
        for (let col = 0; col < board.width; col++) {
            positions.push({ row, col });
        }
    }
    return positions;
}

export function create<T>(
    generator: Generator<T>,
    width: number,
    height: number
): Board<T> {
    const board: T[][] = [];

    for (let row = 0; row < height; row++) {
        const newRow: T[] = [];
        for (let col = 0; col < width; col++) {
            newRow.push(generator.next());
        }
        board.push(newRow);
    }

    return {
        generator,
        width,
        height,
        board,
    };
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
    if (positionExistsInBoard(board, p)) {
        const index = constructIndexOfDesiredPosition(board, p);
        return board.board.flat()[index];
    } else {
        return undefined;
    }
}

export function canMove<T>(
    board: Board<T>,
    first: Position,
    second: Position
): boolean {
    if (positionsAreInTheSameColumnOrRow(first, second)) {
        const piece1 = piece(board, first);
        const piece2 = piece(board, second);

        if (piece1 !== undefined && piece2 !== undefined) {
            const tempBoard: Board<T> = { ...board };
            const tempPieces = tempBoard.board.flat();
            const index1 = constructIndexOfDesiredPosition(board, first);
            const index2 = constructIndexOfDesiredPosition(board, second);

            const temp = tempPieces[index1];
            tempPieces[index1] = tempPieces[index2];
            tempPieces[index2] = temp;

            if (matchesExist(tempBoard, first, second)) {
                return true;
            }
        }
    }

    return false;
}

export function move<T>(
    generator: Generator<T>,
    board: Board<T>,
    first: Position,
    second: Position
    // @ts-ignore
): MoveResult<T> {
    if (!canMove(board, first, second)) {
        return { board, effects: [] };
    }

    let newBoard = {
        ...board,
        board: swapPieces([...board.board], first, second),
    };

    const effects: Effect<T>[] = [];
    let matchesExists = matchesExist(newBoard, first, second);
    if (matchesExists) {
        let newEffects: Effect<T>[] = [
            ...constructEffectsForPosition(newBoard, first),
            ...constructEffectsForPosition(newBoard, second),
        ];
        effects.push(...newEffects);

        let positionsMatched: Position[] = [
            ...newEffects
                .filter(
                    (effect) => effect.board !== undefined || effect.match !== undefined
                )
                .map((effect) => {
                    if (effect.match !== undefined) {
                        return effect.match.positions;
                    } else {
                        return [];
                    }
                })
                .flat(),
        ];
        newBoard = {
            ...newBoard,
            board: refillBoard(generator, newBoard, positionsMatched).board,
        };
        effects.push({ kind: "Refill" });
        let moveResultBeforeCascading = { board: newBoard, effects: effects };
        let moveResultAfterCascading = handleCascadingMatches(
            moveResultBeforeCascading
        );
        return {
            board: moveResultAfterCascading.board,
            effects: moveResultAfterCascading.effects,
        };
    }
}

function handleCascadingMatches<T>(moveResult: MoveResult<T>): MoveResult<T> {
    let initialMoveResult = moveResult;
    if (moveResult.board.generator === undefined) {
        return moveResult;
    }
    for (let row = 0; row < moveResult.board.height; row++) {
        let rowMatch = checkHorizontalMatch(
            moveResult.board,
            { row: row, col: 0 },
            piece(moveResult.board, { row: row, col: 0 })
        );

        if (rowMatch.length >= 3) {
            let pieceMatched = piece(moveResult.board, rowMatch[0]);
            moveResult = {
                ...moveResult,
                effects: [
                    ...moveResult.effects,
                    {
                        kind: "Match",
                        match: {
                            matched: pieceMatched,
                            positions: rowMatch,
                        },
                    },
                ],
            };
            moveResult = {
                effects: [
                    ...moveResult.effects,
                    {
                        kind: "Refill",
                    },
                ],
                board: refillBoard(
                    moveResult.board.generator,
                    moveResult.board,
                    rowMatch
                ),
            };
        } else {
            for (let col = 0; col < moveResult.board.width; col++) {
                let colMatch = checkVerticalMatch(
                    moveResult.board,
                    { row: 0, col: col },
                    piece(moveResult.board, { row: 0, col: col })
                );
                if (colMatch.length >= 3) {
                    let pieceMatched = piece(moveResult.board, colMatch[0]);
                    moveResult = {
                        ...moveResult,
                        effects: [
                            ...moveResult.effects,
                            {
                                kind: "Match",
                                match: {
                                    matched: pieceMatched,
                                    positions: colMatch,
                                },
                            },
                        ],
                    };
                    moveResult = {
                        effects: [
                            ...moveResult.effects,
                            {
                                kind: "Refill",
                            },
                        ],
                        board: refillBoard(
                            moveResult.board.generator,
                            moveResult.board,
                            colMatch
                        ),
                    };
                }
            }
        }
    }
    if (initialMoveResult === moveResult) {
        handleCascadingMatches(moveResult);
    }
    return moveResult;
}
