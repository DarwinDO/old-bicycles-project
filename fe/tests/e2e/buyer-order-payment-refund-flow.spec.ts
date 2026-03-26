import { expect, test } from '@playwright/test'

function apiResponse(result: unknown, message = 'OK', code = 200) {
  return {
    code,
    message,
    result,
  }
}

function buildProduct(productId: string, sellerId: string) {
  return {
    id: productId,
    title: 'Trek Domane AL 4',
    description: 'Road bike for buyer order/payment/refund flow',
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
  }
}

function buildOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    productId: 'product-1',
    productTitle: 'Trek Domane AL 4',
    buyerId: 'buyer-1',
    buyerName: 'Nguyen Buyer',
    sellerId: 'seller-1',
    sellerName: 'Road Seller',
    totalAmount: 20000000,
    depositAmount: 4000000,
    requiredUpfrontAmount: 4000000,
    paidAmount: 0,
    remainingAmount: 16000000,
    serviceFee: 400000,
    feeBaseAmount: 20000000,
    platformFeeRate: 0.02,
    platformFeeTotal: 400000,
    buyerFeeAmount: 200000,
    sellerFeeAmount: 200000,
    buyerChargeAmount: 4200000,
    sellerGrossPayoutAmount: 4000000,
    sellerNetPayoutAmount: 3800000,
    platformFeeStatus: 'pending',
    platformFeeRecognizedAt: null,
    platformFeeReversedAt: null,
    paymentOption: 'partial',
    status: 'pending',
    fundingStatus: 'awaiting_payment',
    paymentMethod: 'transfer',
    buyerReviewSubmitted: false,
    sellerHandoverEvidence: null,
    buyerReceiptEvidence: null,
    acceptedAt: '2026-03-25T08:05:00Z',
    paymentDeadline: '2099-03-25T10:00:00Z',
    cancelReason: null,
    cancelledAt: null,
    createdAt: '2026-03-25T08:00:00Z',
    updatedAt: '2026-03-25T08:05:00Z',
    ...overrides,
  }
}

function buildPaymentRequest(orderId: string) {
  return {
    paymentId: 'payment-1',
    orderId,
    gateway: 'sepay',
    phase: 'upfront',
    status: 'pending',
    amount: 4200000,
    protectedAmount: 4000000,
    buyerFeeAmount: 200000,
    gatewayOrderCode: 'OB-ORDER-1',
    checkoutUrl: null,
    qrCodeUrl: 'https://cdn.example.com/qr-order-1.png',
    transferContent: 'OB-ORDER-1',
    bankBin: '970423',
    bankAccountNumber: '00000645722',
    bankAccountName: 'OLD BICYCLE SYSTEM',
    mockMode: true,
    instructions: 'Transfer by VietQR',
    expiresAt: '2099-03-25T10:00:00Z',
  }
}

test.describe('buyer order, payment, and refund flow', () => {
  test('buyer can create an order, get payment instructions, refresh into held state, and submit a refund with evidence', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1800 })

    const productId = 'product-1'
    const sellerId = 'seller-1'
    const uploadedRefundFileName = 'refund-proof.jpg'
    const pageErrors: string[] = []
    const consoleErrors: string[] = []
    let capturedOrderRequestBody = ''
    let capturedRefundRequestBody = ''
    let capturedRefundContentType = ''

    let storedOrder = buildOrder()

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    await page.addInitScript(() => {
      window.localStorage.setItem('authToken', 'playwright-token')
    })

    await page.route('**/*', async (route) => {
      const request = route.request()
      const pathname = new URL(request.url()).pathname

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
          body: JSON.stringify(apiResponse(buildProduct(productId, sellerId))),
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

      if (pathname === '/api/orders' && request.method() === 'POST') {
        capturedOrderRequestBody = request.postData() ?? ''
        storedOrder = buildOrder()

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse(storedOrder, 'Order created successfully')),
        })
        return
      }

      if (pathname === '/api/orders/me') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse([storedOrder])),
        })
        return
      }

      if (pathname === `/api/payments/orders/${storedOrder.id}/request` && request.method() === 'POST') {
        storedOrder = buildOrder({
          status: 'deposited',
          fundingStatus: 'held',
          paidAmount: 4000000,
          remainingAmount: 16000000,
          updatedAt: '2026-03-25T08:30:00Z',
        })

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse(buildPaymentRequest(storedOrder.id), 'Payment request created successfully')),
        })
        return
      }

      if (pathname === '/api/payout-profiles/me') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponse(null)),
        })
        return
      }

      if (pathname === `/api/orders/${storedOrder.id}/refunds` && request.method() === 'POST') {
        capturedRefundContentType = (await request.headerValue('content-type')) ?? ''
        capturedRefundRequestBody = request.postData() ?? ''
        storedOrder = buildOrder({
          status: 'deposited',
          fundingStatus: 'refund_pending',
          paidAmount: 4000000,
          remainingAmount: 16000000,
          updatedAt: '2026-03-25T08:45:00Z',
        })

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            apiResponse({
              id: 'refund-1',
              orderId: storedOrder.id,
              amount: 4200000,
              reason: 'Xe không giống mô tả',
              evidenceNote: 'Ảnh mở thùng và vết trầy',
              status: 'pending',
              createdAt: '2026-03-25T08:40:00Z',
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

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([])
    expect(
      consoleErrors.filter((message) => !message.includes('ERR_CONNECTION_REFUSED')),
    ).toEqual([])

    await expect(page.getByRole('heading', { name: 'Trek Domane AL 4' })).toBeVisible()

    await page.getByRole('button', { name: 'Tạo yêu cầu mua' }).click()
    const orderDialog = page.getByRole('dialog', { name: 'Tạo yêu cầu mua xe' })
    await expect(orderDialog).toBeVisible()

    await orderDialog.getByLabel('Số tiền ứng trước').fill('4.000.000')
    await orderDialog.getByRole('button', { name: /^Tạo yêu cầu mua$/ }).click()

    await expect(page).toHaveURL(/\/profile\?tab=orders/)
    await expect(page.getByRole('heading', { name: 'Đơn mua của tôi' })).toBeVisible()
    await expect(page.getByText('Đơn mua đã được tạo. Sau khi người bán chấp nhận đơn, bạn mới có thể lấy mã QR hoặc thông tin chuyển khoản ở mục Đơn mua.')).toBeVisible()
    expect(capturedOrderRequestBody).toContain('"productId":"product-1"')
    expect(capturedOrderRequestBody).toContain('"paymentOption":"partial"')
    expect(capturedOrderRequestBody).toContain('"upfrontAmount":4000000')

    await page.getByRole('button', { name: 'Lấy thông tin thanh toán' }).click()

    await expect(page.getByRole('heading', { name: 'Hướng dẫn thanh toán' })).toBeVisible()
    await expect(page.locator('body')).toContainText('4.200.000')
    await expect(page.locator('body')).toContainText('4.000.000')
    await expect(page.locator('body')).toContainText('200.000')

    await page.getByRole('button', { name: 'Kiểm tra lại trạng thái' }).click()
    await expect(page.getByRole('button', { name: 'Yêu cầu hoàn tiền' })).toBeVisible()

    await page.getByRole('button', { name: 'Yêu cầu hoàn tiền' }).click()
    const refundDialog = page.getByRole('dialog', { name: 'Yêu cầu hoàn tiền' })
    await expect(refundDialog).toBeVisible()

    await refundDialog.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Xe không giống mô tả' }).click()
    await refundDialog.getByLabel('Ghi chú mô tả').fill('Ảnh mở thùng và vết trầy')
    await refundDialog.getByLabel('Ảnh bằng chứng').setInputFiles({
      name: uploadedRefundFileName,
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-refund-image'),
    })

    await refundDialog.getByRole('button', { name: 'Gửi yêu cầu hoàn tiền' }).click()

    await expect(page.getByRole('button', { name: 'Đã gửi yêu cầu hoàn tiền' })).toBeDisabled()
    expect(capturedRefundContentType).toContain('multipart/form-data')
    expect(capturedRefundRequestBody).toContain('name="amount"')
    expect(capturedRefundRequestBody).toContain('4200000')
    expect(capturedRefundRequestBody).toContain('name="reason"')
    expect(capturedRefundRequestBody).toContain('Xe không giống mô tả')
    expect(capturedRefundRequestBody).toContain(`filename="${uploadedRefundFileName}"`)
  })
})
