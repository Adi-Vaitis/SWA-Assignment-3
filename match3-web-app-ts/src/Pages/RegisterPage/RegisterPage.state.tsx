// redux setup
import {User} from "../../Model/user";
import {UserService} from "../../Api/user.service";

export interface RegisterStateModel {
    isFetching: boolean;
}

export const defaultRegisterPage: RegisterStateModel = {
    isFetching: false,
}

enum ActionTypes {
    REGISTER_REQUEST = "REGISTER_REQUEST",
    REGISTER_SUCCESS = "REGISTER_SUCCESS",
    REGISTER_FAILURE = "REGISTER_FAILURE",
}

export const registerPageReducer = function (state: RegisterStateModel = defaultRegisterPage, action: any) {
    switch (action.type) {
        case ActionTypes.REGISTER_REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case ActionTypes.REGISTER_SUCCESS:
            return {
                ...state,
                isFetching: false,
            };
        case ActionTypes.REGISTER_FAILURE:
            return {
                ...state,
                isFetching: false,
            };
        default:
            return state;
    }
}

export const mapStateToProps = function (state: RegisterStateModel) {
    return {
        isFetching: state.isFetching
    }
}

const fetchRegister = (dispatch: any, user: User) => {
    dispatch({type: ActionTypes.REGISTER_REQUEST});
    return UserService.register(user)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(returnedRegisteredUser => {
            alert('User has been registered successfully!');
            dispatch({type: ActionTypes.REGISTER_SUCCESS, payload: returnedRegisteredUser});
            window.location.href = '/';
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
            dispatch({type: ActionTypes.REGISTER_FAILURE});
        });
};

export const mapDispatchToProps = function (dispatch: any) {
    return {
        register: (user: User) => fetchRegister(dispatch, user)
    }
};