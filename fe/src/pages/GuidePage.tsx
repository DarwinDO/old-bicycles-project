import { Typography, Card, Row, Col, Collapse, Breadcrumb, Divider, Space } from 'antd';
import {
    ShoppingCartOutlined, DollarOutlined, SafetyCertificateOutlined,
    QuestionCircleOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const { Title, Text, Paragraph } = Typography;

const buyingGuide = [
    {
        title: 'Tìm kiếm xe phù hợp',
        content: 'Sử dụng bộ lọc để tìm xe theo loại, thương hiệu, giá, và địa điểm. Xem xét kỹ các thông số kỹ thuật và hình ảnh.',
    },
    {
        title: 'Liên hệ người bán',
        content: 'Nhấn nút "Liên hệ" để gọi điện hoặc nhắn tin cho người bán. Hỏi thêm về tình trạng xe, lý do bán, và các phụ kiện đi kèm.',
    },
    {
        title: 'Kiểm tra xe trực tiếp',
        content: 'Hẹn gặp người bán ở nơi công cộng. Kiểm tra khung, groupset, bánh xe, và thử xe trước khi quyết định.',
    },
    {
        title: 'Thương lượng và hoàn tất',
        content: 'Thương lượng giá hợp lý. Yêu cầu hóa đơn gốc hoặc giấy tờ liên quan nếu có. Thanh toán an toàn.',
    },
];

const sellingGuide = [
    {
        title: 'Chuẩn bị xe đạp',
        content: 'Vệ sinh xe sạch sẽ, kiểm tra và sửa chữa các lỗi nhỏ nếu có. Xe đẹp sẽ bán được giá tốt hơn.',
    },
    {
        title: 'Chụp ảnh chất lượng',
        content: 'Chụp nhiều góc: tổng thể, groupset, bánh xe, khung, các chi tiết quan trọng. Chụp ngoài trời với ánh sáng tốt.',
    },
    {
        title: 'Viết mô tả chi tiết',
        content: 'Liệt kê đầy đủ thông số, tình trạng thực tế, phụ kiện đi kèm, lý do bán. Trung thực để tạo niềm tin.',
    },
    {
        title: 'Định giá hợp lý',
        content: 'Tham khảo giá các xe tương tự trên thị trường. Giá quá cao sẽ khó bán, giá quá thấp sẽ thiệt thòi.',
    },
];

const faqItems = [
    {
        key: '1',
        label: 'Làm sao để biết xe đạp có đúng size với mình?',
        children: 'Size khung phụ thuộc vào chiều cao của bạn. Thông thường: XS/S (155-170cm), M (170-180cm), L/XL (180cm+). Tốt nhất nên thử xe trực tiếp.',
    },
    {
        key: '2',
        label: 'Nên kiểm tra gì khi mua xe đạp cũ?',
        children: 'Kiểm tra khung (nứt, móp), groupset (sang số, phanh), bánh xe (mòn, đảo), ổ trục, ghi đông, yên. Thử đạp 5-10 phút để cảm nhận.',
    },
    {
        key: '3',
        label: 'Giá xe đạp cũ nên giảm bao nhiêu so với giá mới?',
        children: 'Thông thường: Như mới (80-90% giá gốc), Tốt (60-80%), Đã qua sử dụng (40-60%). Phụ thuộc vào thương hiệu và tình trạng thực tế.',
    },
    {
        key: '4',
        label: 'Làm sao để tránh bị lừa khi mua xe?',
        children: 'Gặp mặt trực tiếp, kiểm tra xe kỹ, yêu cầu giấy tờ/hóa đơn gốc, tránh chuyển khoản trước khi nhận xe, giao dịch ở nơi công cộng.',
    },
    {
        key: '5',
        label: 'Tôi cần đăng ký tài khoản để đăng tin không?',
        children: 'Có, bạn cần đăng ký tài khoản miễn phí để đăng tin bán xe. Việc này giúp bảo vệ cả người mua và người bán.',
    },
    {
        key: '6',
        label: 'Chi phí đăng tin là bao nhiêu?',
        children: 'Hiện tại đăng tin hoàn toàn miễn phí! Chúng tôi có các gói nâng cấp tin đăng để tăng hiển thị nếu bạn muốn bán nhanh hơn.',
    },
];

const safetyTips = [
    'Luôn gặp mặt ở nơi công cộng, đông người',
    'Không chuyển khoản trước khi nhận xe',
    'Kiểm tra kỹ xe trước khi thanh toán',
    'Yêu cầu xem CMND/CCCD của người bán',
    'Giữ lại tin nhắn/lịch sử giao dịch',
    'Báo cáo ngay nếu phát hiện lừa đảo',
];

const GuidePage = () => {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
            <Breadcrumb
                style={{ marginBottom: '24px' }}
                items={[
                    { title: <Link to={ROUTES.HOME}>Trang chủ</Link> },
                    { title: 'Hướng dẫn' },
                ]}
            />

            <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Hướng dẫn sử dụng</Title>

            {/* Buying Guide */}
            <Card
                bordered={false}
                style={{ marginBottom: '32px' }}
                title={<><ShoppingCartOutlined style={{ marginRight: '8px', color: '#52c41a' }} />Hướng dẫn mua xe</>}
            >
                <Row gutter={[24, 24]}>
                    {buyingGuide.map((step, idx) => (
                        <Col xs={24} sm={12} lg={6} key={idx}>
                            <Card size="small" style={{ height: '100%', background: '#f6ffed', border: 'none' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: '#52c41a', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', marginBottom: '12px'
                                }}>
                                    {idx + 1}
                                </div>
                                <Title level={5} style={{ marginBottom: '8px' }}>{step.title}</Title>
                                <Text type="secondary">{step.content}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Selling Guide */}
            <Card
                bordered={false}
                style={{ marginBottom: '32px' }}
                title={<><DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />Hướng dẫn bán xe</>}
            >
                <Row gutter={[24, 24]}>
                    {sellingGuide.map((step, idx) => (
                        <Col xs={24} sm={12} lg={6} key={idx}>
                            <Card size="small" style={{ height: '100%', background: '#e6f7ff', border: 'none' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: '#1890ff', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', marginBottom: '12px'
                                }}>
                                    {idx + 1}
                                </div>
                                <Title level={5} style={{ marginBottom: '8px' }}>{step.title}</Title>
                                <Text type="secondary">{step.content}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Safety Tips */}
            <Card
                bordered={false}
                style={{ marginBottom: '32px' }}
                title={<><SafetyCertificateOutlined style={{ marginRight: '8px', color: '#faad14' }} />Mẹo an toàn giao dịch</>}
            >
                <Row gutter={[16, 16]}>
                    {safetyTips.map((tip, idx) => (
                        <Col xs={24} sm={12} key={idx}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#fffbe6', borderRadius: '8px' }}>
                                <SafetyCertificateOutlined style={{ color: '#faad14', fontSize: '18px', marginTop: '2px' }} />
                                <Text>{tip}</Text>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* FAQ */}
            <Card
                bordered={false}
                style={{ marginBottom: '32px' }}
                title={<><QuestionCircleOutlined style={{ marginRight: '8px', color: '#722ed1' }} />Câu hỏi thường gặp</>}
            >
                <Collapse
                    items={faqItems}
                    bordered={false}
                    expandIconPosition="end"
                />
            </Card>

            {/* Contact */}
            <Card bordered={false} style={{ textAlign: 'center', background: '#f5f5f5' }}>
                <Title level={4}>Cần hỗ trợ thêm?</Title>
                <Paragraph type="secondary">Liên hệ với chúng tôi qua các kênh sau:</Paragraph>
                <Space size="large">
                    <Space>
                        <PhoneOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                        <Text strong>1900 xxxx</Text>
                    </Space>
                    <Divider type="vertical" />
                    <Space>
                        <MailOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                        <Text strong>support@bikeexchange.vn</Text>
                    </Space>
                </Space>
            </Card>
        </div>
    );
};

export default GuidePage;
