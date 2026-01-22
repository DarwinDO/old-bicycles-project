import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
    it('should render "Chờ duyệt" for pending status', () => {
        render(<StatusBadge status="pending" />);
        expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
    });

    it('should render "Hoạt động" for active status', () => {
        render(<StatusBadge status="active" />);
        expect(screen.getByText('Hoạt động')).toBeInTheDocument();
    });

    it('should render "Bị khóa" for banned status', () => {
        render(<StatusBadge status="banned" />);
        expect(screen.getByText('Bị khóa')).toBeInTheDocument();
    });

    it('should render "Đã bán" for sold status', () => {
        render(<StatusBadge status="sold" />);
        expect(screen.getByText('Đã bán')).toBeInTheDocument();
    });

    it('should render "Đã kiểm định" for verified status', () => {
        render(<StatusBadge status="verified" />);
        expect(screen.getByText('Đã kiểm định')).toBeInTheDocument();
    });
});
