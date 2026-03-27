---
title: Logical ERD orthogonal connectors và waypoint editability basics
date: 2026-03-26
---

# Logical ERD orthogonal connectors và waypoint editability basics

## Bối cảnh

`LOGICAL-ERD.drawio` trước đó dùng connector style:

- `edgeStyle=entityRelationEdgeStyle`

Kiểu này phù hợp với ERD vì nó đi kèm đầu nối crow's foot khá tự nhiên. Nhưng nhược điểm là khi chỉnh tay trong draw.io, đường nối thường bị auto-route mạnh và khó kéo, uốn ở phần giữa của line.

Với người dùng đang chỉnh layout diagram bằng chuột, cảm giác của nó là:

- dễ chỉnh ở hai đầu line
- khó thêm hoặc kéo waypoint ở đoạn giữa
- các khúc gấp giữa line thường do draw.io tự tính nhiều hơn là do người dùng kiểm soát

## Vấn đề người dùng gặp

Trong `LOGICAL-ERD.drawio`, người dùng muốn line hoạt động giống kiểu connector có thể:

- kéo được ở phần giữa
- bẻ line linh hoạt hơn
- chỉnh waypoint thủ công để né box khác dễ hơn

Nói đơn giản:

- line cũ ưu tiên quan hệ ERD tự động
- line mới cần ưu tiên khả năng chỉnh layout bằng tay

## Thay đổi đã áp dụng

Toàn bộ edge trong `LOGICAL-ERD.drawio` đã được đổi từ:

- `entityRelationEdgeStyle`

sang:

- `orthogonalEdgeStyle`

Những phần vẫn được giữ nguyên:

- `startArrow`
- `endArrow`
- `strokeColor`
- `fontColor`
- `labelBackgroundColor`
- `orthogonalLoop`
- `jettySize`

Điều này có nghĩa là diagram vẫn giữ:

- đầu nối crow's foot
- màu line cũ
- nhãn quan hệ cũ

nhưng cách draw.io xử lý đường đi của line sẽ dễ chỉnh tay hơn.

## Vì sao `orthogonalEdgeStyle` phù hợp hơn ở đây

`orthogonalEdgeStyle` vẫn tạo ra đường nối gấp khúc vuông góc, nên nhìn vẫn hợp với ERD.

Điểm lợi hơn cho chỉnh tay:

- dễ kéo line để né bảng
- waypoint ở giữa dễ thao tác hơn
- phù hợp khi schema lớn dần và số bảng tăng lên

Với logical ERD của dự án này, đó là trade-off hợp lý vì file đã có nhiều bảng transaction, refund, report, payout và audit hơn trước.

## File liên quan

- `old-bicycles-project/LOGICAL-ERD.drawio`

## Ý nghĩa cho người mới

Nếu bạn mới đọc diagram:

- `entityRelationEdgeStyle` là kiểu line ERD thiên về tự động
- `orthogonalEdgeStyle` là kiểu line gấp khúc vuông, dễ chỉnh tay hơn
- `waypoint` là các điểm bẻ ở giữa đường nối mà bạn có thể kéo để đổi lộ trình của line

Nói ngắn gọn:

- logical ERD không đổi nghiệp vụ
- chỉ đổi cách line hoạt động trong draw.io
- mục tiêu là để diagram dễ chỉnh, dễ bảo trì hơn khi schema tiếp tục mở rộng
