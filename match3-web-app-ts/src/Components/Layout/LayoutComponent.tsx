import {Layout, Menu, theme} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import {HomeOutlined, UserOutlined, LogoutOutlined} from '@ant-design/icons';
import React, {useState} from "react";
import {Outlet} from "react-router-dom";
import {MenuProps} from "antd/lib";

export const LayoutComponent = ({token}: any) => {
    const [current, setCurrent] = useState('home');

    const navigationItems: MenuProps['items'] = [
        {
            key: 'home',
            icon: React.createElement(HomeOutlined),
            label: 'Home',
        },
        {
            key: 'profile',
            icon: React.createElement(UserOutlined),
            label: 'Profile',
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

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        if (e.key === 'logout') {
            localStorage.removeItem('token');
            window.location.reload();
        }
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
                        items={navigationItems}
                    />
                </Sider>}
                <Layout style={{padding: '24px'}}>
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