import {Breadcrumb, Layout, Menu, theme} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import {Footer} from "antd/lib/layout/layout";
import React from "react";
import {Outlet} from "react-router-dom";

export const LayoutComponent = () => {
    const {
        token: {colorBgContainer},
    } = theme.useToken();

    return (
        <Layout className="layout">
            <Header style={{display: 'flex', alignItems: 'center'}}>
                <div className="demo-logo"/>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    items={new Array(15).fill(null).map((_, index) => {
                        const key = index + 1;
                        return {
                            key,
                            label: `nav ${key}`,
                        };
                    })}
                />
            </Header>
            <Content style={{padding: '0 50px'}}>
                <Breadcrumb style={{margin: '16px 0'}}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>List</Breadcrumb.Item>
                    <Breadcrumb.Item>App</Breadcrumb.Item>
                </Breadcrumb>
                <div className="site-layout-content" style={{background: colorBgContainer}}>
                    <main>
                        <Outlet/>
                    </main>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Ant Design ©2023 Created by Ant UED</Footer>
        </Layout>
    );
}