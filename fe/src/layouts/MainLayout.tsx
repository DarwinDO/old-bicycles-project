import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const { Content } = Layout;

const MainLayout = () => {
    return (
        <Layout className="layout" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <AppHeader />
            <Content>
                <Outlet />
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default MainLayout;
