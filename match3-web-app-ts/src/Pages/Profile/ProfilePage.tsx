import {useEffect} from 'react';
import {Card, Space} from "antd";
import {connect, Provider} from "react-redux";
import {profileMapDispatchToProps, profileMapStateToProps, profileReducer} from "./Profile.state";
import {createStore} from "redux";
import {Token} from "../../Model/token";
import './ProfilePage.css';
const ProfileComponent = ({token, isFetching, user, fetchUser}: any) => {

    useEffect(() => {
        fetchUser((token as Token).userId);
    }, [])

    const showUserInformation = () => {
        return (
            <>
                {user && (
                    <Card title="Profile" style={{width: 300, height: 400}}>
                        <p>Username: {user.username}</p>
                        <p>Admin: {user.admin ? 'Yes' : 'No'}</p>
                    </Card>)}
                {!user && (
                    <div>User could not be found, you need to login again.</div>
                    )}
            </>
        )
    }
    return (
        <Space className="profile-container" direction="vertical" size={30}>
                {isFetching ? (
                    <div>Loading...</div>) : showUserInformation()}
        </Space>
    )
}

const ReduxProfilePageContainer = connect(profileMapStateToProps, profileMapDispatchToProps)(ProfileComponent);
const store = createStore(profileReducer);

export const ProfilePage = ({token}: any) => {
    return (
        <Provider store={store}>
            <ReduxProfilePageContainer token={token} userId={token.userId}/>
        </Provider>
    )
}