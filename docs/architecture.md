# Architecture

## Folder structure

```text
DeliveryApp/
├── apps/
│   ├── api/
│   │   ├── scripts/
│   │   └── src/
│   │       ├── config/
│   │       ├── controllers/
│   │       ├── middleware/
│   │       ├── models/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   └── web/
│       └── src/
│           ├── components/
│           ├── context/
│           ├── hooks/
│           ├── lib/
│           ├── pages/
│           └── types/
├── docs/
└── package.json
```

## API routes

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/orders/payment-intent`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `GET /api/orders/admin/all`
- `PATCH /api/orders/:id/status`

## MongoDB collections

### Users

- `name`
- `phone`
- `role`
- `lastOtpCode`
- `otpExpiresAt`
- `createdAt`
- `updatedAt`

### Products

- `name`
- `slug`
- `category`
- `description`
- `price`
- `mrp`
- `unit`
- `imageUrl`
- `badge`
- `stockQty`
- `inStock`
- `featured`
- `createdAt`
- `updatedAt`

### Orders

- `user`
- `items[]`
- `address`
- `subtotal`
- `deliveryFee`
- `total`
- `status`
- `paymentMethod`
- `paymentStatus`
- `assignedRiderName`
- `notes`
- `razorpayOrderId`
- `razorpayPaymentId`
- `createdAt`
- `updatedAt`
