import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function NotFoundPage() {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <h1 className="not-found-code">404</h1>
                <h2 className="not-found-title">Không tìm thấy trang</h2>
                <p className="not-found-description">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                </p>
                <Link to={ROUTES.HOME} className="not-found-button">
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
