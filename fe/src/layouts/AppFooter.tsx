import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { RocketOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text } = Typography;

const AppFooter = () => {
    return (
        <Footer style={{ background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '60px 0 24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={24} md={6}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', color: '#fff' }}>
                            <RocketOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>BikeExchange</span>
                        </div>
                        <Text style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Nền tảng mua bán xe đạp thể thao cũ uy tín và chuyên nghiệp nhất Việt Nam
                        </Text>
                    </Col>
                    <Col xs={24} md={6}>
                        <Title level={5} style={{ color: '#fff', marginBottom: '24px' }}>Về chúng tôi</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Giới thiệu</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Liên hệ</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Tuyển dụng</Text>
                        </Space>
                    </Col>
                    <Col xs={24} md={6}>
                        <Title level={5} style={{ color: '#fff', marginBottom: '24px' }}>Hỗ trợ</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Hướng dẫn mua bán</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Chính sách bảo mật</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Điều khoản sử dụng</Text>
                        </Space>
                    </Col>
                    <Col xs={24} md={6}>
                        <Title level={5} style={{ color: '#fff', marginBottom: '24px' }}>Liên hệ</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Email: support@bikeexchange.vn</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Hotline: 1900 xxxx</Text>
                            <Space size="large" style={{ marginTop: '16px' }}>
                                <FacebookOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }} />
                                <InstagramOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }} />
                                <YoutubeOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }} />
                            </Space>
                        </Space>
                    </Col>
                </Row>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
                    BikeExchange ©2026 Created by Antigravity
                </div>
            </div>
        </Footer>
    );
};

export default AppFooter;
