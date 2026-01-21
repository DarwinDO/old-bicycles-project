import { Layout, Menu, Button, Typography, Space, theme } from 'antd';
import { RocketOutlined, UserOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
    const { token } = theme.useToken();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine selected key based on current path
    const getSelectedKey = () => {
        switch (location.pathname) {
            case ROUTES.HOME: return 'home';
            case ROUTES.MARKET: return 'market';
            case ROUTES.SELL: return 'sell';
            case ROUTES.GUIDE: return 'guide';
            default:
                if (location.pathname.startsWith('/bikes/')) return 'market';
                return 'home';
        }
    };

    const menuItems = [
        { key: 'home', label: <Link to={ROUTES.HOME}>Trang chủ</Link> },
        { key: 'market', label: <Link to={ROUTES.MARKET}>Mua xe</Link> },
        { key: 'sell', label: <Link to={ROUTES.SELL}>Bán xe</Link> },
        { key: 'guide', label: <Link to={ROUTES.GUIDE}>Hướng dẫn</Link> },
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px #f0f1f2', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
            <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                <Link to={ROUTES.HOME} style={{ marginRight: '40px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <RocketOutlined style={{ fontSize: '24px', color: token.colorPrimary, marginRight: '8px' }} />
                    <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>BikeExchange</Title>
                </Link>
                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[getSelectedKey()]}
                    items={menuItems}
                    style={{ flex: 1, borderBottom: 'none' }}
                />
                <Space size="middle">
                    <Button type="default" icon={<UserOutlined />} onClick={() => navigate(ROUTES.LOGIN)}>
                        Đăng nhập
                    </Button>
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate(ROUTES.SELL)}>
                        Đăng tin
                    </Button>
                </Space>
            </div>
        </Header>
    );
};

export default AppHeader;
