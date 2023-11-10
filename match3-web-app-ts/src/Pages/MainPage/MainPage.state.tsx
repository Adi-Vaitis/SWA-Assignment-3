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
    movedItems: boolean;
    notFoundMatches: boolean;
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
    movedItems: false,
    notFoundMatches: false,
}

enum ActionTypes {
    FETCHING = "FETCHING",
    FINISHED_FETCHING = "FINISHED_FETCHING",
    FETCH_INITIAL_BOARD_GAME = "FETCH_INITIAL_BOARD_GAME",
    UPDATE_MOVE_ON_BOARD = "UPDATE_MOVE_ON_BOARD",
    FETCH_PREVIOUS_GAME = "FETCH_PREVIOUS_GAME",
    UPDATE_USERS_GAMES = "UPDATE_USERS_GAMES",
    FOUND_MOVE_ITEMS = "FOUND_MOVE_ITEMS",
    RESET_FOUND_MOVE_ITEMS = "RESET_FOUND_MOVE_ITEMS",
    NOT_FOUND_MATCHES = "NOT_FOUND_MATCHES",
    RESET_NOT_FOUND_MATCHES = "RESET_NOT_FOUND_MATCHES",
    INCREMENT_CURRENT_MOVE_NUMBER = "INCREMENT_CURRENT_MOVE_NUMBER",
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
        case ActionTypes.FOUND_MOVE_ITEMS:
            return {
                ...state,
                movedItems: true,
            }
        case ActionTypes.RESET_FOUND_MOVE_ITEMS:
            return {
                ...state,
                movedItems: false,
            }
        case ActionTypes.UPDATE_USERS_GAMES:
            return {
                ...state,
                games: action.payload.games,
            }
        case ActionTypes.INCREMENT_CURRENT_MOVE_NUMBER:
            return {
                ...state,
                currentMoveNumber: state.currentMoveNumber + 1,
            }
        case ActionTypes.NOT_FOUND_MATCHES:
            return {
                ...state,
                notFoundMatches: true,
            }
        case ActionTypes.RESET_NOT_FOUND_MATCHES:
            return {
                ...state,
                notFoundMatches: false,
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
            movedItems: state.movedItems,
            notFoundMatches: state.notFoundMatches,
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
                board: Board.create(RandomGenerator.getInstance(), 5, 5),
                gameId: game.id,
            }
        });
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    }).catch((error: any) => {
        console.error('Error: ' + error.message);
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    });
}

function updateMoveOnBoard(dispatch: any, token: Token, selectedPosition: Board.Position, newPosition: Board.Position, currentState: MainPageState) {
    dispatch({type: ActionTypes.FETCHING});

    try {
        let resultAfterMove: MoveResult<string> = Board.move(RandomGenerator.getInstance(), currentState.board, selectedPosition, newPosition);
        let effectsAfterMove: Effect<string>[] = resultAfterMove.effects;

        dispatch({type: ActionTypes.INCREMENT_CURRENT_MOVE_NUMBER});
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
        else {
            dispatch({type: ActionTypes.NOT_FOUND_MATCHES});
            dispatch({type: ActionTypes.RESET_NOT_FOUND_MATCHES});
        }
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    } catch (error: any) {
        alert('Error: ' + error.message);
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    }
}

function updateGame(dispatch: any, token: Token, currentState: MainPageState) {
    dispatch({type: ActionTypes.FETCHING});

    dispatch({type: ActionTypes.FOUND_MOVE_ITEMS});
    GameService.updateGame(token, currentState.gameId, mapToGame(currentState)).then(
        response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            dispatch({type: ActionTypes.FINISHED_FETCHING});
            dispatch({type: ActionTypes.RESET_FOUND_MOVE_ITEMS});
        }).catch((error: any) => {
        alert('Error: ' + error.message);
        dispatch({type: ActionTypes.FINISHED_FETCHING});
        dispatch({type: ActionTypes.RESET_FOUND_MOVE_ITEMS});
    });
}

function mapToGame(state: MainPageState): Game {
    return {
        id: -1,
        user: -1,
        board: state.board,
        score: state.score,
        completed: state.completed,
        currentMoveNumber: state.currentMoveNumber,
    } satisfies Game;
}

export const mainPageMapDispatchToProps = function (dispatch: any, token: Token) {
    return {
        fetchInitialBoardGame: () => fetchInitialBoardGame(dispatch, token),
        updateMoveOnBoard: (selectedPosition: Board.Position, newPosition: Board.Position, currentState: MainPageState) => updateMoveOnBoard(dispatch, token, selectedPosition, newPosition, currentState),
        updateGame: (currentState: MainPageState) => updateGame(dispatch, token, currentState),
    }
}