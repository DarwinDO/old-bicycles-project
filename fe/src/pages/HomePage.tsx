import React, { useState } from 'react';
import { Layout, Menu, Input, Button, Card, Row, Col, Typography, Space, Badge, Avatar, Divider, theme } from 'antd';
import {
    SearchOutlined,
    EnvironmentOutlined,
    SafetyCertificateOutlined,
    TrophyOutlined,
    TeamOutlined,
    RightOutlined,
    RocketOutlined,
    FacebookOutlined,
    InstagramOutlined,
    YoutubeOutlined,
    UserOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const BikeMarketplace = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const { token } = theme.useToken();

    const featuredBikes = [
        { id: 1, name: 'Giant TCR Advanced Pro', price: '25,000,000 ₫', location: 'Hồ Chí Minh', condition: 'Như mới', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400' },
        { id: 2, name: 'Specialized Tarmac SL6', price: '35,000,000 ₫', location: 'Hà Nội', condition: 'Đã qua sử dụng', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400' },
        { id: 3, name: 'Trek Domane SL5', price: '28,000,000 ₫', location: 'Đà Nẵng', condition: 'Tốt', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400' },
        { id: 4, name: 'Canyon Ultimate CF SL', price: '32,000,000 ₫', location: 'Hồ Chí Minh', condition: 'Như mới', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400' },
    ];

    const categories = [
        { name: 'Xe Đua Đường Trường', count: 156, color: '#e6f7ff' },
        { name: 'Xe Địa Hình MTB', count: 203, color: '#f6ffed' },
        { name: 'Xe Touring', count: 89, color: '#fff7e6' },
        { name: 'Xe Gravel', count: 67, color: '#fff0f6' },
    ];

    return (
        <Layout className="layout" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Header */}
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

            <Content>
                {/* Hero Section */}
                <div style={{ background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #003a8c 100%)`, padding: '80px 24px', textAlign: 'center', color: '#fff' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Title level={1} style={{ color: '#fff', marginBottom: '16px' }}>
                            Nền Tảng Mua Bán Xe Đạp Thể Thao Cũ Uy Tín
                        </Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', maxWidth: '800px', margin: '0 auto 40px' }}>
                            Kết nối người mua và người bán xe đạp thể thao đã qua sử dụng một cách an toàn, minh bạch và chuyên nghiệp
                        </Paragraph>

                        {/* Search Box */}
                        <Card bordered={false} style={{ maxWidth: '900px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '10px' }}>
                            <Input.Group compact size="large">
                                <Input
                                    style={{ width: '50%', textAlign: 'left' }}
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Tìm kiếm xe đạp (thương hiệu, model...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Input
                                    style={{ width: '30%', textAlign: 'left' }}
                                    prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Địa điểm"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                <Button type="primary" size="large" style={{ width: '20%' }} icon={<SearchOutlined />}>
                                    Tìm kiếm
                                </Button>
                            </Input.Group>
                        </Card>
                    </div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
                    {/* Trust Indicators */}
                    <Row gutter={[32, 32]} style={{ margin: '40px 0' }}>
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: 'transparent', boxShadow: 'none' }}>
                                <Avatar size={64} icon={<SafetyCertificateOutlined />} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', marginBottom: '16px' }} />
                                <Title level={4}>Giao Dịch An Toàn</Title>
                                <Text type="secondary">Đảm bảo thông tin minh bạch, xác thực người dùng</Text>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: 'transparent', boxShadow: 'none' }}>
                                <Avatar size={64} icon={<TrophyOutlined />} style={{ backgroundColor: '#f6ffed', color: '#52c41a', marginBottom: '16px' }} />
                                <Title level={4}>Chất Lượng Đảm Bảo</Title>
                                <Text type="secondary">Kiểm định xe đạp kỹ thuật, đánh giá chuyên nghiệp</Text>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{ textAlign: 'center', height: '100%', background: 'transparent', boxShadow: 'none' }}>
                                <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: '#f9f0ff', color: '#722ed1', marginBottom: '16px' }} />
                                <Title level={4}>Cộng Đồng Lớn</Title>
                                <Text type="secondary">Kết nối hàng ngàn người đam mê xe đạp</Text>
                            </Card>
                        </Col>
                    </Row>

                    {/* Featured Bikes */}
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <Title level={2} style={{ margin: 0 }}>Xe Đạp Nổi Bật</Title>
                                <Text type="secondary">Những chiếc xe đạp được quan tâm nhiều nhất</Text>
                            </div>
                            <Button type="link" style={{ fontSize: '16px' }}>Xem tất cả <RightOutlined /></Button>
                        </div>

                        <Row gutter={[24, 24]}>
                            {featuredBikes.map(bike => (
                                <Col xs={24} sm={12} lg={6} key={bike.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                                <img alt={bike.name} src={bike.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <Badge
                                                    count={bike.condition}
                                                    style={{ backgroundColor: '#52c41a' }}
                                                    offset={[-10, 10]}
                                                >
                                                    <span style={{ position: 'absolute', top: 10, right: 10, padding: '4px 12px', background: 'rgba(82, 196, 26, 0.9)', color: '#fff', borderRadius: '15px', fontWeight: 600, fontSize: '12px' }}>
                                                        {bike.condition}
                                                    </span>
                                                </Badge>
                                            </div>
                                        }
                                        bodyStyle={{ padding: '16px' }}
                                    >
                                        <Meta
                                            title={<div style={{ fontSize: '16px', marginBottom: '8px' }}>{bike.name}</div>}
                                            description={
                                                <div>
                                                    <div style={{ color: token.colorPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                                                        {bike.price}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', color: '#8c8c8c' }}>
                                                        <EnvironmentOutlined style={{ marginRight: '4px' }} /> {bike.location}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Categories */}
                    <div style={{ marginBottom: '60px' }}>
                        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Danh Mục Xe Đạp</Title>
                        <Row gutter={[24, 24]}>
                            {categories.map((cat, idx) => (
                                <Col xs={24} sm={12} md={6} key={idx}>
                                    <Card hoverable style={{ background: cat.color, border: 'none', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <Title level={4} style={{ margin: '0 0 8px 0' }}>{cat.name}</Title>
                                        <Text type="secondary" style={{ color: token.colorPrimary, fontWeight: 500 }}>{cat.count} xe đang bán</Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>

                {/* CTA Section */}
                <div style={{ background: `linear-gradient(90deg, #1890ff 0%, #096dd9 100%)`, padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                    <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>Bạn muốn bán xe đạp của mình?</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px' }}>
                        Đăng tin miễn phí, tiếp cận hàng nghìn người mua tiềm năng
                    </Paragraph>
                    <Button type="default" size="large" icon={<RocketOutlined />} style={{ color: '#1890ff', fontWeight: 'bold', height: '50px', padding: '0 40px' }}>
                        Đăng tin bán xe ngay
                    </Button>
                </div>
            </Content>

            {/* Footer */}
            <Footer style={{ background: '#001529', color: '#rgba(255, 255, 255, 0.65)', padding: '60px 0 24px' }}>
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
        </Layout>
    );
};

export default BikeMarketplace;