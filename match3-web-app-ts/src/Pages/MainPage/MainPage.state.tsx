import {Game} from "../../Model/game";
import * as Board from '../../Model/board';
import {Effect, MoveResult} from '../../Model/board';
import {Token} from "../../Model/token";
import {GameService} from "../../Api/game.service";
import {RandomGenerator} from "../../Model/randomGenerator";

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
    FETCH_INITIAL_BOARD_GAME = "FETCH_INITIAL_BOARD_GAME",
    UPDATE_MOVE_ON_BOARD = "UPDATE_MOVE_ON_BOARD",
    UPDATE_GAME = "UPDATE_GAME",
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
                board: {
                    ...action.payload.board
                },
                gameId: action.payload.gameId,
                currentMoveNumber: 0,
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

export const mainPageMapStateToProps = function (state: MainPageState) {
    return {
        game: {
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
}

// functions that displays actions
function fetchInitialBoardGame(dispatch: any, token: Token) {
    dispatch({type: ActionTypes.FETCHING});
    let game: Game;
    GameService.createGame(token).then(
        response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(returnedGame => {
        game = {
            ...returnedGame,
        };
        dispatch({
            type: ActionTypes.FETCH_INITIAL_BOARD_GAME, payload: {
                board: Board.create(RandomGenerator.getInstance(), 2, 5),
                gameId: game.id,
            }
        });
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    }).catch((error: any) => {
        alert('Error: ' + error.message);
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    });
}

// TODO not used for now
function updateMoveOnBoard(dispatch: any, selectedPosition: Board.Position, newPosition: Board.Position, currentState: MainPageState) {
    dispatch({type: ActionTypes.FETCHING});

    try {
        let resultAfterMove: MoveResult<string> = Board.move(RandomGenerator.getInstance(), currentState.board, selectedPosition, newPosition);
        let effectsAfterMove: Effect<string>[] = resultAfterMove.effects;

        if (effectsAfterMove.length > 0) {
            let onlyMatchEffects = effectsAfterMove.filter((effect: Board.Effect<string>) => effect.kind === 'Match');
            let newScore = onlyMatchEffects.length * 10 + currentState.score;

            dispatch({
                type: ActionTypes.UPDATE_MOVE_ON_BOARD, payload: {
                    board: resultAfterMove.board,
                    score: newScore,
                    completed: false,
                }
            });
        }
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    } catch (error: any) {
        alert('Error: ' + error.message);
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    }
}

export const mainPageMapDispatchToProps = function (dispatch: any, token: Token) {
    return {
        fetchInitialBoardGame: () => fetchInitialBoardGame(dispatch, token),
        updateMoveOnBoard: (selectedPosition: Board.Position, newPosition: Board.Position, currentState: MainPageState) => updateMoveOnBoard(dispatch, selectedPosition, newPosition, currentState),
    }
}