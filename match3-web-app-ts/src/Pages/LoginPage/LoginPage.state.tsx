import {User} from "../../Model/user";
import {LoginService} from "../../Services/login.service";
import {Token} from "../../Model/token";

export interface LoginPage {
    isFetching: boolean;
}

export const defaultLoginPage: LoginPage = {
    isFetching: false,
}

export enum ActionTypes {
    LOGIN_REQUEST = "LOGIN_REQUEST",
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILURE = "LOGIN_FAILURE",
}

export const loginPageReducer = function (state: LoginPage = defaultLoginPage, action: any) {
    switch (action.type) {
        case ActionTypes.LOGIN_REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case ActionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                isFetching: false,
            };
        case ActionTypes.LOGIN_FAILURE:
            return {
                ...state,
                isFetching: false,
            };
        default:
            return state;
    }
}

export const mapStateToProps = function (state: LoginPage) {
    return {
        isFetching: state.isFetching
    }
}

export const fetchLogin = (dispatch: any, user: User) => {
    const loginService = new LoginService();
    dispatch({type: ActionTypes.LOGIN_REQUEST});
    return loginService.login(user)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((returnedLoggedInUser: Token) => {
            alert('User has been logged in successfully!');
            dispatch({type: ActionTypes.LOGIN_SUCCESS, payload: returnedLoggedInUser});
            // save token
            localStorage.setItem('token', JSON.stringify(returnedLoggedInUser));
            window.location.href = '/mainPage';
        })
        .catch(error => {
            alert('Error: ' + error.message);
            dispatch({type: ActionTypes.LOGIN_FAILURE});
        });
}

export const mapDispatchToProps = (dispatch: any) => {
    return {
        fetchLogin: (user: User) => fetchLogin(dispatch, user)
    }
}