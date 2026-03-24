import { describe, expect, it } from 'vitest'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/currency-input'

describe('currency-input', () => {
  it('formats raw digits using Vietnamese thousand separators', () => {
    expect(formatCurrencyInput('2500000')).toBe('2.500.000')
    expect(formatCurrencyInput(3600000)).toBe('3.600.000')
  })

  it('ignores non-digit characters when formatting and parsing', () => {
    expect(formatCurrencyInput('25.000.000 đ')).toBe('25.000.000')
    expect(parseCurrencyInput('25.000.000 đ')).toBe(25000000)
  })

  it('returns null when parsing empty input', () => {
    expect(parseCurrencyInput('')).toBeNull()
    expect(parseCurrencyInput(null)).toBeNull()
  })
})
