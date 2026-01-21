import { useState } from 'react';
import {
    Row, Col, Typography, Breadcrumb, Card, Button, Tag, Divider,
    Avatar, Space, Image, Descriptions, message
} from 'antd';
import {
    EnvironmentOutlined, PhoneOutlined, MessageOutlined,
    HeartOutlined, ShareAltOutlined, SafetyCertificateOutlined,
    CalendarOutlined, UserOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import BikeCard from '../components/BikeCard';

const { Title, Text, Paragraph } = Typography;

// Mock data - in real app this would come from API
const mockBike = {
    id: 1,
    name: 'Giant TCR Advanced Pro Disc',
    price: '35,000,000 ₫',
    originalPrice: '65,000,000 ₫',
    location: 'Quận 1, Hồ Chí Minh',
    condition: 'Như mới',
    brand: 'Giant',
    category: 'Road Bike',
    year: 2023,
    frameSize: '54cm (M)',
    wheelSize: '700c',
    groupset: 'Shimano Ultegra R8000',
    material: 'Carbon',
    weight: '7.2 kg',
    description: `Xe đạp đua Giant TCR Advanced Pro Disc, tình trạng như mới, mới sử dụng được 500km.

Thông số kỹ thuật:
- Khung: Advanced-Grade Composite
- Groupset: Shimano Ultegra R8000 11 speed
- Bánh xe: Giant SLR 1 42 Disc
- Phanh: Shimano Ultegra Hydraulic Disc

Lý do bán: Nâng cấp lên xe mới.
Có thể thương lượng cho người mua thiện chí.`,
    images: [
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
        'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800',
    ],
    seller: {
        name: 'Nguyễn Văn A',
        avatar: null,
        phone: '0912****89',
        rating: 4.8,
        listings: 5,
        memberSince: '2024',
        verified: true,
    },
    postedAt: '2 ngày trước',
    views: 234,
};

const relatedBikes = [
    { id: 2, name: 'Specialized Tarmac SL6', price: '28,000,000 ₫', location: 'Hà Nội', condition: 'Đã qua sử dụng', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400', brand: 'Specialized' },
    { id: 3, name: 'Trek Domane SL5', price: '32,000,000 ₫', location: 'Đà Nẵng', condition: 'Như mới', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400', brand: 'Trek' },
    { id: 4, name: 'Canyon Ultimate CF SL', price: '30,000,000 ₫', location: 'Hồ Chí Minh', condition: 'Tốt', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400', brand: 'Canyon' },
];

const BikeDetailPage = () => {
    useParams(); // For future use when fetching real data
    const [selectedImage, setSelectedImage] = useState(0);

    const handleContact = () => {
        message.success('Đã gửi yêu cầu liên hệ đến người bán!');
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Breadcrumb
                style={{ marginBottom: '24px' }}
                items={[
                    { title: <Link to={ROUTES.HOME}>Trang chủ</Link> },
                    { title: <Link to={ROUTES.MARKET}>Mua xe</Link> },
                    { title: mockBike.name },
                ]}
            />

            <Row gutter={[32, 32]}>
                {/* Left: Images */}
                <Col xs={24} lg={14}>
                    <Card bordered={false} style={{ marginBottom: '16px' }}>
                        <Image
                            src={mockBike.images[selectedImage]}
                            alt={mockBike.name}
                            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }}
                            preview={{ src: mockBike.images[selectedImage] }}
                        />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto' }}>
                            {mockBike.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    style={{
                                        width: '80px',
                                        height: '60px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedImage === idx ? '2px solid #1890ff' : '2px solid transparent',
                                        opacity: selectedImage === idx ? 1 : 0.7,
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Description */}
                    <Card title="Mô tả chi tiết" bordered={false}>
                        <Paragraph style={{ whiteSpace: 'pre-line' }}>{mockBike.description}</Paragraph>
                    </Card>
                </Col>

                {/* Right: Info & Actions */}
                <Col xs={24} lg={10}>
                    {/* Price Card */}
                    <Card bordered={false} style={{ marginBottom: '16px' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                                <Tag color="green">{mockBike.condition}</Tag>
                                <Tag color="blue">{mockBike.category}</Tag>
                            </Space>
                            <Title level={3} style={{ margin: '8px 0' }}>{mockBike.name}</Title>
                            <div>
                                <Text delete type="secondary" style={{ fontSize: '16px' }}>{mockBike.originalPrice}</Text>
                            </div>
                            <Title level={2} style={{ color: '#1890ff', margin: '0 0 16px 0' }}>{mockBike.price}</Title>

                            <Space style={{ color: '#8c8c8c' }}>
                                <EnvironmentOutlined /> {mockBike.location}
                                <Divider type="vertical" />
                                <CalendarOutlined /> {mockBike.postedAt}
                            </Space>
                        </Space>

                        <Divider />

                        <Space style={{ width: '100%' }} direction="vertical">
                            <Button type="primary" size="large" block icon={<PhoneOutlined />} onClick={handleContact}>
                                Liên hệ người bán
                            </Button>
                            <Button size="large" block icon={<MessageOutlined />}>
                                Nhắn tin
                            </Button>
                            <Space style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                                <Button type="text" icon={<HeartOutlined />}>Lưu tin</Button>
                                <Button type="text" icon={<ShareAltOutlined />}>Chia sẻ</Button>
                            </Space>
                        </Space>
                    </Card>

                    {/* Seller Card */}
                    <Card bordered={false} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Avatar size={64} icon={<UserOutlined />} />
                            <div style={{ flex: 1 }}>
                                <Space>
                                    <Text strong style={{ fontSize: '16px' }}>{mockBike.seller.name}</Text>
                                    {mockBike.seller.verified && (
                                        <Tag color="green" icon={<SafetyCertificateOutlined />}>Đã xác thực</Tag>
                                    )}
                                </Space>
                                <div style={{ color: '#8c8c8c', marginTop: '4px' }}>
                                    Thành viên từ {mockBike.seller.memberSince} • {mockBike.seller.listings} tin đăng
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Specs Card */}
                    <Card title="Thông số kỹ thuật" bordered={false}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Thương hiệu">{mockBike.brand}</Descriptions.Item>
                            <Descriptions.Item label="Năm sản xuất">{mockBike.year}</Descriptions.Item>
                            <Descriptions.Item label="Size khung">{mockBike.frameSize}</Descriptions.Item>
                            <Descriptions.Item label="Cỡ bánh">{mockBike.wheelSize}</Descriptions.Item>
                            <Descriptions.Item label="Groupset">{mockBike.groupset}</Descriptions.Item>
                            <Descriptions.Item label="Chất liệu">{mockBike.material}</Descriptions.Item>
                            <Descriptions.Item label="Trọng lượng">{mockBike.weight}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            {/* Related Bikes */}
            <div style={{ marginTop: '48px' }}>
                <Title level={3}>Xe đạp tương tự</Title>
                <Row gutter={[24, 24]}>
                    {relatedBikes.map(bike => (
                        <Col xs={24} sm={12} lg={8} key={bike.id}>
                            <BikeCard {...bike} compact />
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default BikeDetailPage;
