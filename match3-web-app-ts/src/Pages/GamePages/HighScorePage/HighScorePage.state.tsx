import {Game} from "../../../Model/game";
import {Token} from "../../../Model/token";
import {GameService} from "../../../Api/game.service";

export interface HighScorePageState {
    isFetching: boolean;
    highScoreGames: Game[];
    userHighScoreGames: Game[];
}

export const defaultHighScorePageState: HighScorePageState = {
    isFetching: false,
    highScoreGames: [],
    userHighScoreGames: [],
}

enum ActionTypes {
    FETCHING = "FETCHING",
    FINISHED_FETCHING = "FINISHED_FETCHING",
    FETCHING_GAMES = "FETCHING_GAMES",
}

export const highScorePageReducer = function (state: HighScorePageState = defaultHighScorePageState, action: any) {
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
        case ActionTypes.FETCHING_GAMES:
            return {
                ...state,
                highScoreGames: action.payload.highScoreGames,
                userHighScoreGames: action.payload.userHighScoreGames,
            }
        default:
            return state;
    }
}

export const highScorePageMapStateToProps = function (state: HighScorePageState) {
    return {
        isFetching: state.isFetching,
        highScoreGames: state.highScoreGames,
        userHighScoreGames: state.userHighScoreGames,
    }
}

function fetchGames(dispatch: any, token: Token) {
    dispatch({type: ActionTypes.FETCHING});

    let highScoreGames: Game[] = [];
    let usersHighScoreGames: Game[] = [];
    GameService.getGames(token).then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then((returnedGames: Game[]) => {
        let sortedGames = [...returnedGames.sort((a: Game, b: Game) => {
            return b.score - a.score;
        })];
        let counterHighScoreGames = 0;
        highScoreGames = [...sortedGames.filter((game: Game) => {
            if(game.completed && counterHighScoreGames < 10) {
                counterHighScoreGames++;
                return game;
            }
        })];
        counterHighScoreGames = 0;
        usersHighScoreGames = [...sortedGames.filter((game: Game) => {
            if(game.completed && game.user === token.userId && counterHighScoreGames < 3) {
                counterHighScoreGames++;
                return game;
            }
        })];
        dispatch({type: ActionTypes.FETCHING_GAMES, payload: {highScoreGames: highScoreGames, userHighScoreGames: usersHighScoreGames}});
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    }).catch((error: any) => {
        alert('Error: ' + error.message);
        dispatch({type: ActionTypes.FINISHED_FETCHING});
    });
}

export const highScorePageMapDispatchToProps = function (dispatch: any, token: Token) {
    return {
        fetchGames: () => fetchGames(dispatch, token),
    }
}