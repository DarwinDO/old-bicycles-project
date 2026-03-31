import { describe, expect, it } from 'vitest'
import {
  PASSWORD_POLICY_GUIDANCE,
  PASSWORD_POLICY_MIN_LENGTH,
  getPasswordPolicyChecks,
} from './password-policy'

describe('getPasswordPolicyChecks', () => {
  it('accepts passwords that match the backend policy', () => {
    expect(getPasswordPolicyChecks('Password1')).toEqual({
      hasMinimumLength: true,
      hasUppercase: true,
      hasNumber: true,
      isValid: true,
    })
  })

  it('rejects passwords without an uppercase letter', () => {
    expect(getPasswordPolicyChecks('password1')).toMatchObject({
      hasUppercase: false,
      isValid: false,
    })
  })

  it('rejects passwords without a digit', () => {
    expect(getPasswordPolicyChecks('Password')).toMatchObject({
      hasNumber: false,
      isValid: false,
    })
  })

  it('rejects passwords shorter than the minimum length', () => {
    expect(getPasswordPolicyChecks('Pass1')).toMatchObject({
      hasMinimumLength: false,
      isValid: false,
    })
  })
})

describe('PASSWORD_POLICY_GUIDANCE', () => {
  it('explains the same requirement enforced by the backend', () => {
    expect(PASSWORD_POLICY_GUIDANCE).toContain(PASSWORD_POLICY_MIN_LENGTH.toString())
    expect(PASSWORD_POLICY_GUIDANCE).toContain('chữ hoa')
    expect(PASSWORD_POLICY_GUIDANCE).toContain('chữ số')
  })
})
