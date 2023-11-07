import {useEffect} from 'react';
import {Card, Space} from "antd";
import {connect, Provider} from "react-redux";
import {profileMapDispatchToProps, profileMapStateToProps, profileReducer} from "./Profile.state";
import {createStore} from "redux";
import {Token} from "../../Model/token";

const ProfileComponent = ({token, isFetching, user, fetchUser}: any) => {

    useEffect(() => {
        fetchUser((token as Token).userId);
    }, [])

    return (
        <Space direction="vertical" size={30}>
            {isFetching ? (
                <div>Loading...</div>) :
                <Card title="Profile" extra={<a href="#">More</a>} style={{ width: 300, height: 400 }}>
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
            </Card>}
        </Space>
    )
}

const ReduxProfilePageContainer = connect(profileMapStateToProps, profileMapDispatchToProps)(ProfileComponent);
const store = createStore(profileReducer);

export const ProfilePage = ({token} : any) => {

    console.log(token);
    return (
        <Provider store={store}>
            <ReduxProfilePageContainer token={token}  userId={token.userId}/>
        </Provider>
    )
}