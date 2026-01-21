import { Card, Form, Input, Button, Divider, Typography, Space, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleRegister = async () => {
        message.loading('Đang tạo tài khoản...', 1);
        setTimeout(() => {
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate(ROUTES.LOGIN);
        }, 1000);
    };

    const handleSocialRegister = (provider: string) => {
        message.info(`Đăng ký bằng ${provider} sẽ sớm được hỗ trợ`);
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)'
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    borderRadius: '12px'
                }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={2} style={{ marginBottom: '8px' }}>Tạo tài khoản</Title>
                    <Text type="secondary">Tham gia cộng đồng BikeExchange</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRegister}
                    size="large"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Họ và tên"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Số điện thoại"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Xác nhận mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item
                        name="terms"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Bạn cần đồng ý với điều khoản'))
                            },
                        ]}
                    >
                        <Checkbox>
                            Tôi đồng ý với <Link to="#">Điều khoản sử dụng</Link> và <Link to="#">Chính sách bảo mật</Link>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ height: '48px', fontSize: '16px' }}>
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>

                <Divider plain>
                    <Text type="secondary">hoặc đăng ký bằng</Text>
                </Divider>

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                        block
                        icon={<GoogleOutlined />}
                        onClick={() => handleSocialRegister('Google')}
                        style={{ height: '44px' }}
                    >
                        Đăng ký bằng Google
                    </Button>
                    <Button
                        block
                        icon={<FacebookOutlined />}
                        onClick={() => handleSocialRegister('Facebook')}
                        style={{ height: '44px', background: '#1877F2', color: '#fff', border: 'none' }}
                    >
                        Đăng ký bằng Facebook
                    </Button>
                </Space>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Text type="secondary">Đã có tài khoản? </Text>
                    <Link to={ROUTES.LOGIN} style={{ fontWeight: 500 }}>Đăng nhập</Link>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
