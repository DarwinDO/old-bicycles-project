import { Card, Form, Input, Button, Divider, Typography, Space, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleLogin = async () => {
        message.loading('Đang đăng nhập...', 1);
        // Simulate API call
        setTimeout(() => {
            message.success('Đăng nhập thành công!');
            navigate(ROUTES.HOME);
        }, 1000);
    };

    const handleSocialLogin = (provider: string) => {
        message.info(`Đăng nhập bằng ${provider} sẽ sớm được hỗ trợ`);
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
                    maxWidth: '420px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    borderRadius: '12px'
                }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={2} style={{ marginBottom: '8px' }}>Đăng nhập</Title>
                    <Text type="secondary">Chào mừng bạn trở lại BikeExchange</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                            </Form.Item>
                            <Link to="#" style={{ color: '#1890ff' }}>Quên mật khẩu?</Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ height: '48px', fontSize: '16px' }}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <Divider plain>
                    <Text type="secondary">hoặc đăng nhập bằng</Text>
                </Divider>

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                        block
                        icon={<GoogleOutlined />}
                        onClick={() => handleSocialLogin('Google')}
                        style={{ height: '44px' }}
                    >
                        Đăng nhập bằng Google
                    </Button>
                    <Button
                        block
                        icon={<FacebookOutlined />}
                        onClick={() => handleSocialLogin('Facebook')}
                        style={{ height: '44px', background: '#1877F2', color: '#fff', border: 'none' }}
                    >
                        Đăng nhập bằng Facebook
                    </Button>
                </Space>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Text type="secondary">Chưa có tài khoản? </Text>
                    <Link to={ROUTES.REGISTER} style={{ fontWeight: 500 }}>Đăng ký ngay</Link>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
