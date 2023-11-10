import {Layout, Menu, theme} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import {HomeOutlined, LogoutOutlined, UserOutlined, PlayCircleOutlined} from '@ant-design/icons';
import React, {useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {MenuProps} from "antd/lib";
import {handleMenuRouting} from "../../constants";

export const LayoutComponent = ({token}: any) => {
    const [current, setCurrent] = useState('mainPage');

    const navigationItems: MenuProps['items'] = [
        {
            key: 'mainPage',
            icon: React.createElement(HomeOutlined),
            label: 'Home',
        },
        {
            key: 'profile',
            icon: React.createElement(UserOutlined),
            label: 'Profile',
        },
        {
            key: 'highScore',
            icon: React.createElement(PlayCircleOutlined),
            label: 'High Score Games',
        },
        {
            key: 'logout',
            icon: React.createElement(LogoutOutlined),
            label: 'Logout',
        }
    ];

    const {
        token: {colorBgContainer},
    } = theme.useToken();

    const navigate = useNavigate();

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        handleMenuRouting(e.key, navigate);
    };

    return (
        <Layout>
            <Header style={{display: 'flex', alignItems: 'center'}}>
            </Header>
            <Layout>
                {token && <Sider width={200} style={{background: colorBgContainer}}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        style={{height: '100%', borderRight: 0}}
                        onClick={onClick}
                        selectedKeys={[current]}
                        selectable={true}
                        items={navigationItems}
                    />
                </Sider>}
                <Layout style={{padding: '24px', height: '89vh'}}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                        }}
                    >
                        <main>
                            <Outlet/>
                        </main>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}