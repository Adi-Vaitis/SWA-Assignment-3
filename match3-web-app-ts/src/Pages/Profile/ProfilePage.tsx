import {useEffect, useState} from 'react';
import {Card, Input, Space} from "antd";
import {connect, Provider} from "react-redux";
import {profileMapDispatchToProps, profileMapStateToProps, profileReducer} from "./Profile.state";
import {createStore} from "redux";
import {Token} from "../../Model/token";
import './ProfilePage.css';
import { Button } from 'antd';
const ProfileComponent = ({token, isFetching, user, fetchUser, updateUserProfile}: any) => {

    const [password, setPassword] = useState('');

    useEffect(() => {
        fetchUser(token);
    }, []);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleProfileUpdate = () => {
        const profileUpdates: { password?: string } = {};


        if (password) {
            profileUpdates.password = password;
        }

        updateUserProfile(profileUpdates);

    };


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
                <div>
                    <Input.Password
                        placeholder="Change Password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <Button
                        type="primary"
                        htmlType="button"
                        onClick={handleProfileUpdate}
                    >
                        Change
                    </Button>

                </div>
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