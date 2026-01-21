import { useState } from 'react';
import {
    Card, Form, Input, Select, InputNumber, Upload, Button,
    Steps, Typography, Row, Col, Breadcrumb, message, Result
} from 'antd';
import {
    PlusOutlined, CameraOutlined, DollarOutlined,
    FileTextOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const categories = [
    { value: 'road', label: 'Road Bike (Xe đua đường trường)' },
    { value: 'mtb', label: 'Mountain Bike (Xe địa hình)' },
    { value: 'touring', label: 'Touring (Xe du lịch)' },
    { value: 'gravel', label: 'Gravel (Xe đa địa hình)' },
    { value: 'city', label: 'City Bike (Xe thành phố)' },
];

const brands = [
    'Giant', 'Trek', 'Specialized', 'Cannondale', 'Canyon',
    'Bianchi', 'Pinarello', 'Scott', 'Cervélo', 'BMC', 'Khác'
];

const conditions = [
    { value: 'new', label: 'Mới 100%' },
    { value: 'like-new', label: 'Như mới (95%+)' },
    { value: 'good', label: 'Tốt (85-95%)' },
    { value: 'used', label: 'Đã qua sử dụng (<85%)' },
];

const frameSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '48', '50', '52', '54', '56', '58', '60'];

const SellBikePage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const steps = [
        { title: 'Hình ảnh', icon: <CameraOutlined /> },
        { title: 'Thông tin', icon: <FileTextOutlined /> },
        { title: 'Giá & Liên hệ', icon: <DollarOutlined /> },
        { title: 'Hoàn thành', icon: <CheckCircleOutlined /> },
    ];

    const handleNext = async () => {
        try {
            if (currentStep === 0) {
                if (fileList.length === 0) {
                    message.warning('Vui lòng tải lên ít nhất 1 hình ảnh');
                    return;
                }
            } else if (currentStep < 2) {
                await form.validateFields();
            }
            setCurrentStep(currentStep + 1);
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            message.loading('Đang đăng tin...', 1);
            setTimeout(() => {
                setIsSubmitted(true);
                setCurrentStep(3);
                message.success('Đăng tin thành công!');
            }, 1500);
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin');
        }
    };

    const uploadButton = (
        <div style={{ padding: '20px' }}>
            <PlusOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>Tải ảnh lên</div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Card bordered={false}>
                        <Title level={4}>Hình ảnh xe đạp</Title>
                        <Paragraph type="secondary">
                            Tải lên ít nhất 1 hình ảnh. Hình ảnh rõ ràng, nhiều góc độ sẽ giúp xe bán nhanh hơn.
                        </Paragraph>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                            beforeUpload={() => false}
                            multiple
                            maxCount={10}
                        >
                            {fileList.length >= 10 ? null : uploadButton}
                        </Upload>
                        <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                            Tối đa 10 hình, định dạng JPG/PNG, kích thước tối đa 5MB/ảnh
                        </Text>
                    </Card>
                );

            case 1:
                return (
                    <Card bordered={false}>
                        <Title level={4}>Thông tin xe đạp</Title>
                        <Form form={form} layout="vertical">
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="title" label="Tiêu đề tin đăng" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                                        <Input placeholder="VD: Giant TCR Advanced Pro 2023 như mới" maxLength={100} showCount />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}>
                                        <Select placeholder="Chọn thương hiệu">
                                            {brands.map(b => <Option key={b} value={b}>{b}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="category" label="Loại xe" rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}>
                                        <Select placeholder="Chọn loại xe">
                                            {categories.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="condition" label="Tình trạng" rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}>
                                        <Select placeholder="Chọn tình trạng">
                                            {conditions.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item name="year" label="Năm sản xuất">
                                        <InputNumber style={{ width: '100%' }} placeholder="VD: 2023" min={2000} max={2026} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item name="frameSize" label="Size khung">
                                        <Select placeholder="Chọn size">
                                            {frameSizes.map(s => <Option key={s} value={s}>{s}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item name="wheelSize" label="Cỡ bánh">
                                        <Select placeholder="Chọn cỡ bánh">
                                            <Option value="700c">700c</Option>
                                            <Option value="650b">650b / 27.5"</Option>
                                            <Option value="29">29"</Option>
                                            <Option value="26">26"</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                                        <TextArea
                                            rows={6}
                                            placeholder="Mô tả chi tiết về xe: groupset, phụ kiện đi kèm, lý do bán, tình trạng thực tế..."
                                            maxLength={2000}
                                            showCount
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                );

            case 2:
                return (
                    <Card bordered={false}>
                        <Title level={4}>Giá bán & Thông tin liên hệ</Title>
                        <Form form={form} layout="vertical">
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="VD: 25000000"
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value?.replace(/,/g, '') as unknown as number}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="originalPrice" label="Giá mua ban đầu (tùy chọn)">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="Để người mua tham khảo"
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value?.replace(/,/g, '') as unknown as number}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="city" label="Thành phố" rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}>
                                        <Select placeholder="Chọn thành phố">
                                            <Option value="hcm">Hồ Chí Minh</Option>
                                            <Option value="hn">Hà Nội</Option>
                                            <Option value="dn">Đà Nẵng</Option>
                                            <Option value="other">Khác</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="district" label="Quận/Huyện">
                                        <Input placeholder="VD: Quận 1" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                                        <Input placeholder="0912345678" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="contactName" label="Tên liên hệ">
                                        <Input placeholder="Tên của bạn" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                );

            case 3:
                return (
                    <Result
                        status="success"
                        title="Đăng tin thành công!"
                        subTitle="Tin đăng của bạn đang được xem xét và sẽ hiển thị trong vài phút."
                        extra={[
                            <Button type="primary" key="view" onClick={() => navigate(ROUTES.PROFILE)}>
                                Xem tin của tôi
                            </Button>,
                            <Button key="new" onClick={() => {
                                setCurrentStep(0);
                                setIsSubmitted(false);
                                setFileList([]);
                                form.resetFields();
                            }}>
                                Đăng tin mới
                            </Button>,
                        ]}
                    />
                );
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <Breadcrumb
                style={{ marginBottom: '24px' }}
                items={[
                    { title: <Link to={ROUTES.HOME}>Trang chủ</Link> },
                    { title: 'Đăng tin bán xe' },
                ]}
            />

            <Title level={2} style={{ marginBottom: '32px' }}>Đăng tin bán xe đạp</Title>

            <Steps current={currentStep} items={steps} style={{ marginBottom: '32px' }} />

            {renderStepContent()}

            {!isSubmitted && (
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    {currentStep > 0 ? (
                        <Button size="large" onClick={handleBack}>Quay lại</Button>
                    ) : (
                        <div />
                    )}
                    {currentStep < 2 ? (
                        <Button type="primary" size="large" onClick={handleNext}>Tiếp tục</Button>
                    ) : currentStep === 2 ? (
                        <Button type="primary" size="large" onClick={handleSubmit}>Đăng tin</Button>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SellBikePage;
