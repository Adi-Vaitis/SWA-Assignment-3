import * as Board from './board';

export interface Game {
    id: number,
    user: number,
    score: number,
    completed: boolean,
    currentMoveNumber: number,
    board: Board.Board<string>,
}