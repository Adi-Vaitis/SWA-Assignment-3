import {Game} from "../../Model/game";
import * as Board from '../../Model/board';
import {Token} from "../../Model/token";

export interface MainPageState {
    isFetching: boolean;
    score: number,
    gameId: number | undefined,
    maxMoveNumber: number,
    currentMoveNumber: number,
    completed: boolean;
    board: Board.Board<string>,
    games: Game[];
}

export const defaultMainPageState: MainPageState = {
    isFetching: false,
    score: 0,
    currentMoveNumber: 0,
    maxMoveNumber: 40,
    gameId: undefined,
    completed: false,
    // @ts-ignore
    board: undefined,
    games: [],
}

enum ActionTypes {
    FETCHING = "FETCHING",
    FINISHED_FETCHING = "FINISHED_FETCHING",
    FETCH_INITIAL_BOARD_GAME = "GAME_REQUEST",
    UPDATE_MOVE_ON_BOARD = "UPDATE_MOVE_ON_BOARD",
    FETCH_PREVIOUS_GAME = "FETCH_PREVIOUS_GAME",
    UPDATE_USERS_GAMES = "UPDATE_USERS_GAMES",
}

export const mainPageReducer = function (state: MainPageState = defaultMainPageState, action: any) {
    switch (action.type) {
        case ActionTypes.FETCHING:
            return {
                ...state,
                isFetching: true,
            }
        case ActionTypes.FINISHED_FETCHING:
            return {
                ...state,
                isFetching: false,
            }
        case ActionTypes.FETCH_INITIAL_BOARD_GAME:
            return {
                ...state,
                board: action.payload.board,
                gameId: action.payload.gameId,
            };
        case ActionTypes.UPDATE_MOVE_ON_BOARD:
            return {
                ...state,
                board: action.payload.board,
                score: action.payload.score,
                currentMoveNumber: state.currentMoveNumber++,
                completed: action.payload.completed,
            };
        case ActionTypes.FETCH_PREVIOUS_GAME:
            return {
                ...state,
                gameId: action.payload.gameId,
                board: action.payload.board,
                score: action.payload.score,
                completed: action.payload.completed,
                currentMoveNumber: action.payload.currentMoveNumber,
            };
        case ActionTypes.UPDATE_USERS_GAMES:
            return {
                ...state,
                games: action.payload.games,
            }
        default:
            return state;
    }
}

const mainPageMapStateToProps = function (state: MainPageState) {
    return {
        isFetching: state.isFetching,
        board: state.board,
        score: state.score,
        gameId: state.gameId,
        completed: state.completed,
        currentMoveNumber: state.currentMoveNumber,
        maxMoveNumber: state.maxMoveNumber,
        games: state.games,
    }
}

// functions that displays actions
function fetchInitialBoardGame(token: Token) {

}

export const mainPageMapDispatchToProps = function (dispatch: any) {
    return {
        fetchInitialBoardGame: (token: Token) => fetchInitialBoardGame(token),
    }
}