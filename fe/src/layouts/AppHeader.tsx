import React from 'react';
import { Layout, Menu, Button, Typography, Space, theme } from 'antd';
import { RocketOutlined, UserOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
    const { token } = theme.useToken();

    return (
        <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px #f0f1f2', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
            <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" style={{ marginRight: '40px', display: 'flex', alignItems: 'center' }}>
                    <RocketOutlined style={{ fontSize: '24px', color: token.colorPrimary, marginRight: '8px' }} />
                    <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>BikeExchange</Title>
                </div>
                <Menu
                    theme="light"
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    items={[
                        { key: '1', label: 'Trang chủ' },
                        { key: '2', label: 'Mua xe' },
                        { key: '3', label: 'Bán xe' },
                        { key: '4', label: 'Hướng dẫn' },
                    ]}
                    style={{ flex: 1, borderBottom: 'none' }}
                />
                <Space size="middle">
                    <Button type="default" icon={<UserOutlined />}>Đăng nhập</Button>
                    <Button type="primary" icon={<PlusCircleOutlined />}>Đăng tin</Button>
                </Space>
            </div>
        </Header>
    );
};

export default AppHeader;
