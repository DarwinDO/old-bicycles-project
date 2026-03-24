import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import GuidePage from './GuidePage'

describe('GuidePage', () => {
  it('routes the support CTA directly to the assistant page', () => {
    render(
      <MemoryRouter>
        <GuidePage />
      </MemoryRouter>,
    )

    const assistantLink = screen.getByRole('link', { name: /Mở Trợ lý/i })
    expect(assistantLink).toHaveAttribute('href', '/assistant')
    expect(screen.queryByRole('button', { name: /Chat với hỗ trợ/i })).not.toBeInTheDocument()
  })
})
