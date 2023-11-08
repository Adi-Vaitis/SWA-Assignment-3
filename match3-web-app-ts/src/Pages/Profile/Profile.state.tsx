import {User} from "../../Model/user";
import {UserService} from "../../Services/user.service";
import {Token} from "../../Model/token";

export interface ProfileStateModel {
    isFetching: boolean;
    user: User | null;
}

export const defaultProfilePage: ProfileStateModel = {
    isFetching: false,
    user: null,
}

enum ActionTypes {
    USER_REQUEST = "USER_REQUEST",
    USER_SUCCESS = "USER_SUCCESS",
    USER_FAILURE = "USER_FAILURE",
}

export const profileReducer = function (state: ProfileStateModel = defaultProfilePage, action: any) {
    switch (action.type) {
        case ActionTypes.USER_REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case ActionTypes.USER_SUCCESS:
            return {
                ...state,
                isFetching: false,
                user: action.payload,
            };
        case ActionTypes.USER_FAILURE:
            return {
                ...state,
                isFetching: false,
            };
        default:
            return state;
    }
}

export const profileMapStateToProps = function (state: ProfileStateModel) {
    return {
        isFetching: state.isFetching,
        user: state.user,
    }
}

const fetchUser = (dispatch: any, token: Token) => {
    dispatch({type: ActionTypes.USER_REQUEST});
    UserService.getUser(token).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then((returnedUser: User) => {
            dispatch({type: ActionTypes.USER_SUCCESS, payload: returnedUser});
        })
        .catch((error: Error) => {
            dispatch({type: ActionTypes.USER_FAILURE});
        });
}

export const profileMapDispatchToProps = (dispatch: any, token: Token) => {
    return {
        fetchUser: () => fetchUser(dispatch, token),
    }
}