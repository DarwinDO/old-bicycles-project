import { expect, test } from '@playwright/test'

function apiResponse(result: unknown, message = 'OK', code = 200) {
  return {
    code,
    message,
    result,
  }
}

test.describe('buyer report flow', () => {
  test('user can submit a product report with evidence and see it in my reports', async ({ page }) => {
    const productId = 'product-1'
    const sellerId = 'seller-1'
    const reportId = 'report-1'
    const uploadedFileName = 'listing-proof.jpg'
    const uploadedFileUrl = 'https://cdn.example.com/report-proof.jpg'
    let capturedReportBody = ''
    let capturedReportContentType = ''
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    const createdReports = [
      {
        id: reportId,
        reporterId: 'buyer-1',
        reporterName: 'Nguyen Buyer',
        targetId: productId,
        targetType: 'PRODUCT',
        reason: 'fake',
        description: 'Ảnh xe không đúng thực tế',
        evidenceFiles: [
          {
            id: 'file-1',
            fileUrl: uploadedFileUrl,
            fileName: uploadedFileName,
            contentType: 'image/jpeg',
            sortOrder: 0,
          },
        ],
        status: 'pending',
        adminNote: null,
        processedById: null,
        processedByName: null,
        createdAt: '2026-03-26T08:00:00Z',
        processedAt: null,
      },
    ]

    await page.addInitScript(() => {
      window.localStorage.setItem('authToken', 'playwright-token')
    })

    await page.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const { pathname } = url

      if (!pathname.startsWith('/api/')) {
        await route.continue()
        return
      }

      if (pathname === '/api/auth/me') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            apiResponse({
              id: 'buyer-1',
              email: 'buyer@test.dev',
              firstName: 'Nguyen',
              lastName: 'Buyer',
              role: 'buyer',
              status: 'active',
              isVerified: true,
            }),
          ),
        })
        return
      }

      if (pathname === `/api/products/${productId}`) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            apiResponse({
              id: productId,
              title: 'Trek Domane AL 4',
              description: 'Road bike for report E2E',
              price: 20000000,
              status: 'active',
              createdAt: '2026-03-25T08:00:00Z',
              seller: {
                id: sellerId,
                firstName: 'Road',
                lastName: 'Seller',
              },
              images: [],
              isVerified: true,
              lockedForTransaction: false,
              categoryId: null,
            }),
          ),
        })
        return
      }

      if (pathname === `/api/inspections/product/${productId}`) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse(null)),
        })
        return
      }

      if (pathname === `/api/users/${sellerId}/reviews`) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            apiResponse({
              content: [],
              totalPages: 0,
              totalElements: 0,
              first: true,
              last: true,
              size: 5,
              number: 0,
              sort: { empty: true, sorted: false, unsorted: true },
              pageable: {
                pageNumber: 0,
                pageSize: 5,
                offset: 0,
                paged: true,
                unpaged: false,
                sort: { empty: true, sorted: false, unsorted: true },
              },
              numberOfElements: 0,
              empty: true,
            }),
          ),
        })
        return
      }

      if (pathname === '/api/wishlist') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse([])),
        })
        return
      }

      if (pathname === '/api/notifications/me/unread-count') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse(0)),
        })
        return
      }

      if (pathname === '/api/reports' && request.method() === 'POST') {
        capturedReportContentType = (await request.headerValue('content-type')) ?? ''
        capturedReportBody = request.postData() ?? ''

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse(createdReports[0], 'Report submitted successfully')),
        })
        return
      }

      if (pathname === '/api/reports/me') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            apiResponse({
              content: createdReports,
              totalPages: 1,
              totalElements: createdReports.length,
              first: true,
              last: true,
              size: 10,
              number: 0,
              sort: { empty: false, sorted: true, unsorted: false },
              pageable: {
                pageNumber: 0,
                pageSize: 10,
                offset: 0,
                paged: true,
                unpaged: false,
                sort: { empty: false, sorted: true, unsorted: false },
              },
              numberOfElements: createdReports.length,
              empty: createdReports.length === 0,
            }),
          ),
        })
        return
      }

      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(apiResponse(null, `Unhandled mocked API path: ${pathname}`, 404)),
      })
    })

    await page.goto(`/bikes/${productId}`)
    await page.waitForTimeout(1000)

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([])
    expect(
      consoleErrors.filter((message) => !message.includes('ERR_CONNECTION_REFUSED')),
    ).toEqual([])

    await expect(page.getByRole('heading', { name: 'Trek Domane AL 4' })).toBeVisible()

    await page.getByRole('button', { name: 'Báo cáo tin đăng này' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Hàng giả hoặc hàng nhái' }).click()
    await page.getByLabel('Mô tả thêm').fill('Ảnh xe không đúng thực tế')
    await page.getByLabel('Ảnh bằng chứng').setInputFiles({
      name: uploadedFileName,
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image'),
    })

    await page.getByRole('button', { name: 'Gửi báo cáo' }).click()

    await expect(page.getByText('Báo cáo đã được gửi. Admin sẽ xem xét sớm.')).toBeVisible()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    expect(capturedReportContentType).toContain('multipart/form-data')
    expect(capturedReportBody).toContain('name="targetId"')
    expect(capturedReportBody).toContain(productId)
    expect(capturedReportBody).toContain('name="reason"')
    expect(capturedReportBody).toContain('fake')
    expect(capturedReportBody).toContain(`filename="${uploadedFileName}"`)

    await page.goto('/my-reports')

    await expect(page.getByRole('heading', { name: 'Báo cáo của tôi' })).toBeVisible()
    await expect(page.getByText('Ảnh bạn đã gửi')).toBeVisible()
    await expect(page.getByText(uploadedFileName)).toBeVisible()
    await expect(page.getByRole('link', { name: uploadedFileName })).toHaveAttribute('href', uploadedFileUrl)
  })
})
