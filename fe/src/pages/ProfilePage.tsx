import {
    Card, Tabs, Typography, Avatar, Button, Row, Col, Tag,
    Empty, Space, Statistic, Divider, List
} from 'antd';
import {
    UserOutlined, EditOutlined, HeartOutlined, SettingOutlined,
    EnvironmentOutlined, CalendarOutlined, SafetyCertificateOutlined,
    EyeOutlined, PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES, buildRoute } from '../constants/routes';

const { Title, Text } = Typography;

// Mock user data
const mockUser = {
    name: 'Nguyễn Văn A',
    email: 'nguyen.a@email.com',
    phone: '0912****89',
    location: 'Hồ Chí Minh',
    memberSince: 'Tháng 3, 2024',
    verified: true,
    stats: {
        listings: 3,
        sold: 5,
        reviews: 12,
        avgRating: 4.8,
    }
};

const mockListings = [
    { id: 1, name: 'Giant TCR Advanced Pro', price: '35,000,000 ₫', status: 'active', views: 234, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400', postedAt: '2 ngày trước' },
    { id: 2, name: 'Specialized Diverge', price: '28,000,000 ₫', status: 'active', views: 156, image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400', postedAt: '5 ngày trước' },
    { id: 3, name: 'Trek Domane SL5', price: '32,000,000 ₫', status: 'sold', views: 421, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400', postedAt: '1 tuần trước' },
];

const mockFavorites = [
    { id: 4, name: 'Canyon Ultimate CF SL', price: '45,000,000 ₫', location: 'Hà Nội', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400' },
    { id: 5, name: 'Cervélo R5', price: '55,000,000 ₫', location: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400' },
];

const ProfilePage = () => {
    const navigate = useNavigate();

    const renderListings = () => (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">{mockListings.length} tin đăng</Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.SELL)}>
                    Đăng tin mới
                </Button>
            </div>

            {mockListings.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={mockListings}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '16px',
                                background: '#fff',
                                marginBottom: '12px',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(buildRoute.bikeDetail(item.id))}
                            actions={[
                                <Button key="edit" type="text" icon={<EditOutlined />}>Sửa</Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                }
                                title={
                                    <Space>
                                        <span>{item.name}</span>
                                        <Tag color={item.status === 'active' ? 'green' : 'default'}>
                                            {item.status === 'active' ? 'Đang hiển thị' : 'Đã bán'}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <div>
                                        <div style={{ color: '#1890ff', fontWeight: 'bold', marginBottom: '4px' }}>{item.price}</div>
                                        <Space style={{ color: '#8c8c8c', fontSize: '13px' }}>
                                            <span><EyeOutlined /> {item.views} lượt xem</span>
                                            <Divider type="vertical" />
                                            <span><CalendarOutlined /> {item.postedAt}</span>
                                        </Space>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="Bạn chưa có tin đăng nào">
                    <Button type="primary" onClick={() => navigate(ROUTES.SELL)}>Đăng tin ngay</Button>
                </Empty>
            )}
        </div>
    );

    const renderFavorites = () => (
        mockFavorites.length > 0 ? (
            <Row gutter={[16, 16]}>
                {mockFavorites.map(item => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                        <Card
                            hoverable
                            onClick={() => navigate(buildRoute.bikeDetail(item.id))}
                            cover={
                                <img
                                    alt={item.name}
                                    src={item.image}
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                            }
                        >
                            <Card.Meta
                                title={item.name}
                                description={
                                    <div>
                                        <div style={{ color: '#1890ff', fontWeight: 'bold' }}>{item.price}</div>
                                        <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '4px' }}>
                                            <EnvironmentOutlined /> {item.location}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        ) : (
            <Empty description="Chưa có xe yêu thích">
                <Button type="primary" onClick={() => navigate(ROUTES.MARKET)}>Khám phá xe</Button>
            </Empty>
        )
    );

    const renderSettings = () => (
        <Card bordered={false}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={5}>Thông tin cá nhân</Title>
                    <Button type="default">Chỉnh sửa thông tin</Button>
                </div>
                <Divider />
                <div>
                    <Title level={5}>Đổi mật khẩu</Title>
                    <Button type="default">Đổi mật khẩu</Button>
                </div>
                <Divider />
                <div>
                    <Title level={5}>Xác thực tài khoản</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                        Xác thực để tăng độ tin cậy với người mua/bán
                    </Text>
                    {mockUser.verified ? (
                        <Tag color="green" icon={<SafetyCertificateOutlined />}>Đã xác thực</Tag>
                    ) : (
                        <Button type="primary">Xác thực ngay</Button>
                    )}
                </div>
                <Divider />
                <div>
                    <Title level={5} style={{ color: '#ff4d4f' }}>Đăng xuất</Title>
                    <Button danger onClick={() => navigate(ROUTES.HOME)}>Đăng xuất</Button>
                </div>
            </Space>
        </Card>
    );

    const tabItems = [
        { key: 'listings', label: <><EditOutlined /> Tin đăng của tôi</>, children: renderListings() },
        { key: 'favorites', label: <><HeartOutlined /> Yêu thích</>, children: renderFavorites() },
        { key: 'settings', label: <><SettingOutlined /> Cài đặt</>, children: renderSettings() },
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
            {/* Profile Header */}
            <Card bordered={false} style={{ marginBottom: '24px' }}>
                <Row gutter={24} align="middle">
                    <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                        <Avatar size={100} icon={<UserOutlined />} />
                    </Col>
                    <Col xs={24} sm={18}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Title level={3} style={{ margin: 0 }}>{mockUser.name}</Title>
                            {mockUser.verified && (
                                <Tag color="green" icon={<SafetyCertificateOutlined />}>Đã xác thực</Tag>
                            )}
                        </div>
                        <Space style={{ color: '#8c8c8c', marginBottom: '16px' }} split={<Divider type="vertical" />}>
                            <span><EnvironmentOutlined /> {mockUser.location}</span>
                            <span><CalendarOutlined /> Thành viên từ {mockUser.memberSince}</span>
                        </Space>
                        <Row gutter={32}>
                            <Col><Statistic title="Đang bán" value={mockUser.stats.listings} /></Col>
                            <Col><Statistic title="Đã bán" value={mockUser.stats.sold} /></Col>
                            <Col><Statistic title="Đánh giá" value={mockUser.stats.avgRating} suffix="⭐" /></Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            {/* Tabs */}
            <Card bordered={false}>
                <Tabs items={tabItems} size="large" />
            </Card>
        </div>
    );
};

export default ProfilePage;
