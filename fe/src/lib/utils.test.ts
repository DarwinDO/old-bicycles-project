import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
    it('should merge class names', () => {
        const result = cn('px-4', 'py-2');
        expect(result).toBe('px-4 py-2');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('base', isActive && 'active');
        expect(result).toBe('base active');
    });

    it('should filter out falsy values', () => {
        const result = cn('base', false && 'hidden', undefined, null);
        expect(result).toBe('base');
    });

    it('should merge conflicting Tailwind classes', () => {
        const result = cn('px-4', 'px-6');
        expect(result).toBe('px-6');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });
});
