import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatNotificationRelativeTime } from './notification-time'

describe('formatNotificationRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats recent past timestamps as relative text', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-25T06:14:00Z'))

    expect(formatNotificationRelativeTime('2026-03-25T06:10:00Z')).toBe('4 phút trước')
  })

  it('does not label future timestamps as vừa xong', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-25T06:14:00Z'))

    const formatted = formatNotificationRelativeTime('2026-03-25T11:54:00Z')

    expect(formatted).not.toBe('Vừa xong')
    expect(formatted).toContain('25/03/2026')
  })

  it('returns a fallback label for invalid timestamps', () => {
    expect(formatNotificationRelativeTime('not-a-date')).toBe('Không rõ thời gian')
  })
})
