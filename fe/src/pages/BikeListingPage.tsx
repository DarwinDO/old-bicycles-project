import React, { useState } from 'react';
import { Row, Col, Card, Input, Select, Slider, Checkbox, Typography, Pagination, Tag, Button, Breadcrumb, Space, Divider } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

const BikeListingPage = () => {
    // Mock Data
    const bikes = Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        name: `Xe Đạp Thể Thao Sample ${i + 1}`,
        price: `${(20 + i * 1.5).toFixed(1)}00,000 ₫`,
        location: i % 2 === 0 ? 'Hồ Chí Minh' : 'Hà Nội',
        condition: i % 3 === 0 ? 'Như mới' : 'Đã qua sử dụng',
        brand: ['Giant', 'Trek', 'Specialized', 'Cannondale'][i % 4],
        category: ['Road', 'MTB', 'Touring'][i % 3],
        image: `https://images.unsplash.com/photo-${['1576435728678-68d0fbf94e91', '1571333250630-f0230c320b6d', '1485965120184-e220f721d03e'][i % 3]}?w=400`
    }));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Breadcrumb style={{ marginBottom: '24px' }} items={[
                { title: 'Trang chủ' },
                { title: 'Mua xe' }
            ]} />

            <Row gutter={32}>
                {/* Filters Sidebar */}
                <Col xs={24} md={6}>
                    <Card title={<><FilterOutlined /> Bộ lọc</>} style={{ marginBottom: '24px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <Text strong>Danh mục</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <Checkbox value="road">Road Bike</Checkbox>
                                    <Checkbox value="mtb">Mountain Bike</Checkbox>
                                    <Checkbox value="touring">Touring</Checkbox>
                                    <Checkbox value="gravel">Gravel</Checkbox>
                                </Checkbox.Group>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <Text strong>Khoảng giá</Text>
                            <Slider range defaultValue={[0, 100]} tooltip={{ formatter: (value) => `${value}M` }} style={{ marginTop: '16px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <Text type="secondary">0đ</Text>
                                <Text type="secondary">100tr+</Text>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <Text strong>Thương hiệu</Text>
                            <Select placeholder="Chọn thương hiệu" style={{ width: '100%', marginTop: '8px' }} mode="multiple">
                                <Option value="giant">Giant</Option>
                                <Option value="trek">Trek</Option>
                                <Option value="specialized">Specialized</Option>
                                <Option value="cannondale">Cannondale</Option>
                            </Select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <Text strong>Tình trạng</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <Checkbox value="new">Mới 100%</Checkbox>
                                    <Checkbox value="like-new">Như mới</Checkbox>
                                    <Checkbox value="used">Đã qua sử dụng</Checkbox>
                                </Checkbox.Group>
                            </div>
                        </div>

                        <Button type="primary" block>Áp dụng</Button>
                    </Card>
                </Col>

                {/* Listing Content */}
                <Col xs={24} md={18}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <Title level={3} style={{ margin: 0 }}>Tất cả xe đạp</Title>

                        <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm xe..." style={{ maxWidth: '300px' }} />
                            <Select defaultValue="newest" style={{ width: 150 }}>
                                <Option value="newest">Mới nhất</Option>
                                <Option value="price-asc">Giá tăng dần</Option>
                                <Option value="price-desc">Giá giảm dần</Option>
                            </Select>
                        </div>
                    </div>

                    <Row gutter={[24, 24]}>
                        {bikes.map(bike => (
                            <Col xs={24} sm={12} lg={8} key={bike.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                            <img alt={bike.name} src={bike.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <Tag color={bike.condition === 'Như mới' ? 'green' : 'blue'} style={{ position: 'absolute', top: 10, right: 10 }}>
                                                {bike.condition}
                                            </Tag>
                                        </div>
                                    }
                                >
                                    <Meta
                                        title={<div style={{ fontSize: '15px' }}>{bike.name}</div>}
                                        description={
                                            <div>
                                                <div style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold', margin: '4px 0' }}>
                                                    {bike.price}
                                                </div>
                                                <Space direction="horizontal" split={<Divider type="vertical" />} style={{ fontSize: '12px' }}>
                                                    <Text type="secondary">{bike.brand}</Text>
                                                    <Text type="secondary">{bike.location}</Text>
                                                </Space>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <Pagination defaultCurrent={1} total={50} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default BikeListingPage;
