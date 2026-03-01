# 키즈공간 API 설계서

## 1. API 설계 원칙

### 1.1 기본 규칙

- **Base URL**: `/api` (Next.js App Router Route Handlers)
- **인증**: NextAuth.js Session 기반, Authorization 헤더 (JWT)
- **요청/응답 형식**: JSON
- **에러 응답**: 통일된 에러 포맷
- **페이지네이션**: cursor 기반 또는 offset 기반
- **버전 관리**: URL에 포함하지 않음 (단일 버전)

### 1.2 공통 응답 형식

#### 성공 응답

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
  };
}
```

#### 에러 응답

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

#### HTTP 상태 코드

| 코드 | 의미 | 사용 |
|------|------|------|
| 200 | OK | 조회, 수정 성공 |
| 201 | Created | 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 유효성 검증 실패 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 데이터 |
| 422 | Unprocessable Entity | 비즈니스 규칙 위반 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

---

## 2. 인증 API

### POST /api/auth/register

회원가입

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "홍길동",
  "nickname": "길동맘",
  "phone": "010-1234-5678",
  "agreeTerms": true,
  "agreePrivacy": true,
  "agreeMarketing": false
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "nickname": "길동맘",
    "role": "USER",
    "grade": "BRONZE"
  }
}
```

**에러:**
- 409: 이미 가입된 이메일/닉네임
- 400: 유효성 검증 실패

---

### POST /api/auth/login

로그인 (NextAuth.js credentials provider)

### POST /api/auth/logout

로그아웃

### POST /api/auth/forgot-password

비밀번호 찾기 (이메일 발송)

### POST /api/auth/reset-password

비밀번호 재설정

### GET /api/auth/check-email?email=

이메일 중복 확인

### GET /api/auth/check-nickname?nickname=

닉네임 중복 확인

---

## 3. 사용자 API

### GET /api/users/me

내 프로필 조회 (인증 필요)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "홍길동",
    "nickname": "길동맘",
    "phone": "010-1234-5678",
    "profileImage": "https://...",
    "role": "USER",
    "grade": "GOLD",
    "points": 3500,
    "children": [
      {
        "id": "clyyy...",
        "name": "하준",
        "birthDate": "2023-06-15",
        "gender": "MALE"
      }
    ],
    "createdAt": "2026-01-15T00:00:00Z"
  }
}
```

### PATCH /api/users/me

프로필 수정

### DELETE /api/users/me

회원 탈퇴

### POST /api/users/me/children

자녀 정보 추가

### PATCH /api/users/me/children/[childId]

자녀 정보 수정

### DELETE /api/users/me/children/[childId]

자녀 정보 삭제

---

## 4. 배송지 API

### GET /api/users/me/addresses

배송지 목록 조회

### POST /api/users/me/addresses

배송지 추가

### PATCH /api/users/me/addresses/[addressId]

배송지 수정

### DELETE /api/users/me/addresses/[addressId]

배송지 삭제

### PATCH /api/users/me/addresses/[addressId]/default

기본 배송지 설정

---

## 5. 상품 API

### GET /api/products

상품 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지 당 개수 |
| category | string | - | 카테고리 slug |
| brand | string | - | 브랜드 slug (복수: 콤마 구분) |
| minPrice | number | - | 최소 가격 |
| maxPrice | number | - | 최대 가격 |
| ageGroup | string | - | 연령대 |
| sort | string | "recommended" | 정렬 기준 |
| freeShipping | boolean | - | 무료배송 필터 |
| onSale | boolean | - | 할인 상품 필터 |
| q | string | - | 검색 키워드 |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "교육완구 블록세트",
      "slug": "educational-block-set",
      "price": 35000,
      "salePrice": 25000,
      "thumbnail": "https://...",
      "brandName": "브랜드A",
      "categoryName": "교육완구",
      "avgRating": 4.5,
      "reviewCount": 128,
      "ageGroup": "AGE_3_5",
      "isFeatured": true,
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "hasNext": true
  }
}
```

---

### GET /api/products/[productId]

상품 상세 조회

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "교육완구 블록세트",
    "slug": "educational-block-set",
    "description": "<p>상세 설명 HTML...</p>",
    "price": 35000,
    "salePrice": 25000,
    "category": {
      "id": "clcat...",
      "name": "교육완구",
      "slug": "educational-toys",
      "parent": {
        "id": "clpar...",
        "name": "장난감",
        "slug": "toys"
      }
    },
    "brand": {
      "id": "clbrd...",
      "name": "브랜드A",
      "logo": "https://..."
    },
    "ageGroup": "AGE_3_5",
    "images": [
      { "url": "https://...", "alt": "메인 이미지" },
      { "url": "https://...", "alt": "상세 이미지 1" }
    ],
    "options": [
      { "id": "clopt1", "name": "빨강", "additionalPrice": 0, "stock": 15 },
      { "id": "clopt2", "name": "파랑", "additionalPrice": 0, "stock": 0 },
      { "id": "clopt3", "name": "초록", "additionalPrice": 2000, "stock": 8 }
    ],
    "avgRating": 4.5,
    "reviewCount": 128,
    "salesCount": 534,
    "stock": 23,
    "maxQuantity": 10,
    "shippingFee": 0,
    "isFeatured": true,
    "createdAt": "2026-02-01T00:00:00Z"
  }
}
```

---

### GET /api/products/[productId]/reviews

상품 리뷰 목록

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | |
| limit | number | 10 | |
| sort | string | "latest" | latest, highest, lowest |
| photoOnly | boolean | false | 포토 리뷰만 |

### POST /api/products/[productId]/reviews

리뷰 작성 (인증 필요, 구매 확정 필요)

### PATCH /api/products/[productId]/reviews/[reviewId]

리뷰 수정

### DELETE /api/products/[productId]/reviews/[reviewId]

리뷰 삭제

---

### GET /api/products/search/suggestions?q=

검색 자동완성

**Response (200):**

```json
{
  "success": true,
  "data": {
    "suggestions": ["블록세트", "블록 장난감", "블록 레고"],
    "popular": ["유모차", "이유식", "기저귀"]
  }
}
```

---

## 6. 카테고리 API

### GET /api/categories

전체 카테고리 트리 조회

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clcat1",
      "name": "의류",
      "slug": "clothing",
      "image": "https://...",
      "children": [
        { "id": "clcat1a", "name": "상의", "slug": "tops", "children": [] },
        { "id": "clcat1b", "name": "하의", "slug": "bottoms", "children": [] }
      ]
    },
    {
      "id": "clcat2",
      "name": "장난감",
      "slug": "toys",
      "children": []
    }
  ]
}
```

---

## 7. 장바구니 API

### GET /api/cart

장바구니 조회 (인증 필요)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clcart1",
        "product": {
          "id": "clprod1",
          "name": "교육완구 블록세트",
          "thumbnail": "https://...",
          "price": 35000,
          "salePrice": 25000,
          "status": "ACTIVE"
        },
        "option": {
          "id": "clopt1",
          "name": "빨강",
          "additionalPrice": 0,
          "stock": 15
        },
        "quantity": 2
      }
    ],
    "summary": {
      "totalItems": 3,
      "totalAmount": 75000,
      "discountAmount": 10000,
      "shippingFee": 0,
      "finalAmount": 65000
    }
  }
}
```

### POST /api/cart

장바구니 추가

**Request Body:**

```json
{
  "productId": "clprod1",
  "optionId": "clopt1",
  "quantity": 2
}
```

### PATCH /api/cart/[cartItemId]

장바구니 아이템 수정 (수량, 옵션 변경)

### DELETE /api/cart/[cartItemId]

장바구니 아이템 삭제

### DELETE /api/cart

장바구니 비우기 (선택 삭제)

**Request Body:**

```json
{
  "itemIds": ["clcart1", "clcart2"]
}
```

---

## 8. 주문 API

### POST /api/orders

주문 생성

**Request Body:**

```json
{
  "items": [
    { "cartItemId": "clcart1" },
    { "cartItemId": "clcart2" }
  ],
  "addressId": "claddr1",
  "shippingMemo": "문 앞에 놔주세요",
  "couponId": "clcoup1",
  "pointUsed": 1000,
  "paymentMethod": "CARD"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "orderId": "clorder1",
    "orderNumber": "KS20260301-00001",
    "finalAmount": 64000,
    "paymentInfo": {
      "paymentKey": "toss_xxx",
      "orderId": "KS20260301-00001",
      "amount": 64000
    }
  }
}
```

### POST /api/orders/[orderId]/confirm-payment

결제 확인 (PG사 콜백 후)

### GET /api/orders

내 주문 목록 (인증 필요)

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | |
| limit | number | 10 | |
| status | string | - | 주문 상태 필터 |
| startDate | string | - | 시작일 (YYYY-MM-DD) |
| endDate | string | - | 종료일 |

### GET /api/orders/[orderId]

주문 상세 조회

### POST /api/orders/[orderId]/cancel

주문 취소

**Request Body:**

```json
{
  "reason": "단순 변심"
}
```

### POST /api/orders/[orderId]/return

반품 신청

### POST /api/orders/[orderId]/exchange

교환 신청

### POST /api/orders/[orderId]/confirm

구매 확정

---

## 9. 위시리스트 API

### GET /api/wishlist

위시리스트 조회 (인증 필요)

### POST /api/wishlist

위시리스트 추가

### DELETE /api/wishlist/[productId]

위시리스트 제거

---

## 10. 커뮤니티 API

### GET /api/posts

게시글 목록 조회

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | |
| limit | number | 20 | |
| board | string | - | 게시판 slug |
| sort | string | "latest" | latest, popular, views |
| q | string | - | 검색 키워드 |

### GET /api/posts/[postId]

게시글 상세 조회

### POST /api/posts

게시글 작성 (인증 필요)

**Request Body:**

```json
{
  "boardSlug": "parenting-tips",
  "title": "이가 나기 시작할 때 꼭 알아야 할 것들",
  "content": "<p>안녕하세요. 저희 아이가 5개월이 되면서...</p>",
  "tags": ["이앓이", "육아팁", "5개월아기"],
  "linkedProductId": null
}
```

### PATCH /api/posts/[postId]

게시글 수정

### DELETE /api/posts/[postId]

게시글 삭제

### POST /api/posts/[postId]/like

게시글 좋아요 토글

### POST /api/posts/[postId]/bookmark

게시글 북마크 토글

### POST /api/posts/[postId]/report

게시글 신고

---

## 11. 댓글 API

### GET /api/posts/[postId]/comments

댓글 목록 조회

### POST /api/posts/[postId]/comments

댓글 작성 (인증 필요)

**Request Body:**

```json
{
  "content": "좋은 정보 감사합니다!",
  "parentId": null
}
```

### PATCH /api/posts/[postId]/comments/[commentId]

댓글 수정

### DELETE /api/posts/[postId]/comments/[commentId]

댓글 삭제

### POST /api/posts/[postId]/comments/[commentId]/like

댓글 좋아요 토글

### POST /api/posts/[postId]/comments/[commentId]/accept

댓글 채택 (Q&A, 글 작성자만)

---

## 12. 알림 API

### GET /api/notifications

알림 목록 (인증 필요)

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | |
| limit | number | 20 | |
| unreadOnly | boolean | false | 읽지 않은 것만 |

### PATCH /api/notifications/[notificationId]/read

알림 읽음 처리

### PATCH /api/notifications/read-all

전체 읽음 처리

### DELETE /api/notifications/[notificationId]

알림 삭제

---

## 13. 쿠폰/포인트 API

### GET /api/users/me/coupons

내 쿠폰 목록

### GET /api/users/me/coupons/available?orderAmount=

사용 가능 쿠폰 목록 (주문 금액 기준)

### GET /api/users/me/points

포인트 잔액 및 이력

---

## 14. 기획전/배너 API

### GET /api/exhibitions

기획전 목록

### GET /api/exhibitions/[exhibitionId]

기획전 상세 (포함 상품 목록)

### GET /api/banners?position=

배너 목록 (위치별)

---

## 15. 공지/FAQ API

### GET /api/notices

공지사항 목록

### GET /api/notices/[noticeId]

공지사항 상세

### GET /api/faq

FAQ 목록 (카테고리별)

---

## 16. 관리자 API

모든 관리자 API는 `/api/admin` 접두사를 사용하며, ADMIN 이상 역할이 필요하다.

### 16.1 대시보드

### GET /api/admin/dashboard

대시보드 통계

**Response (200):**

```json
{
  "success": true,
  "data": {
    "today": {
      "revenue": 1200000,
      "revenueChange": 12.5,
      "newOrders": 24,
      "newUsers": 15,
      "newPosts": 32
    },
    "pendingActions": {
      "cancelRequests": 3,
      "returnRequests": 2,
      "reports": 5
    },
    "recentOrders": [],
    "topProducts": []
  }
}
```

### 16.2 상품 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | /api/admin/products | 상품 목록 (관리용) |
| POST | /api/admin/products | 상품 등록 |
| GET | /api/admin/products/[id] | 상품 상세 |
| PATCH | /api/admin/products/[id] | 상품 수정 |
| DELETE | /api/admin/products/[id] | 상품 삭제 |
| PATCH | /api/admin/products/[id]/status | 상품 상태 변경 |

### 16.3 주문 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | /api/admin/orders | 주문 목록 |
| GET | /api/admin/orders/[id] | 주문 상세 |
| PATCH | /api/admin/orders/[id]/status | 주문 상태 변경 |
| PATCH | /api/admin/orders/[id]/tracking | 운송장 입력 |

### 16.4 회원 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | /api/admin/users | 회원 목록 |
| GET | /api/admin/users/[id] | 회원 상세 |
| PATCH | /api/admin/users/[id]/grade | 등급 변경 |
| PATCH | /api/admin/users/[id]/status | 상태 변경 (정지/복원) |

### 16.5 게시글/리뷰 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | /api/admin/posts | 게시글 목록 |
| DELETE | /api/admin/posts/[id] | 게시글 삭제 |
| PATCH | /api/admin/posts/[id]/blind | 블라인드 처리 |
| GET | /api/admin/reviews | 리뷰 목록 |
| PATCH | /api/admin/reviews/[id]/status | 리뷰 상태 변경 |

### 16.6 카테고리/브랜드 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| POST | /api/admin/categories | 카테고리 생성 |
| PATCH | /api/admin/categories/[id] | 카테고리 수정 |
| DELETE | /api/admin/categories/[id] | 카테고리 삭제 |
| PATCH | /api/admin/categories/reorder | 순서 변경 |
| POST | /api/admin/brands | 브랜드 생성 |
| PATCH | /api/admin/brands/[id] | 브랜드 수정 |

### 16.7 쿠폰/기획전/배너 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| POST | /api/admin/coupons | 쿠폰 생성 |
| POST | /api/admin/coupons/issue | 쿠폰 발급 (대상 지정) |
| POST | /api/admin/exhibitions | 기획전 생성 |
| PATCH | /api/admin/exhibitions/[id] | 기획전 수정 |
| POST | /api/admin/banners | 배너 생성 |
| PATCH | /api/admin/banners/[id] | 배너 수정 |
| DELETE | /api/admin/banners/[id] | 배너 삭제 |

### 16.8 통계

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | /api/admin/analytics/revenue | 매출 통계 |
| GET | /api/admin/analytics/users | 회원 통계 |
| GET | /api/admin/analytics/products | 상품 통계 |
| GET | /api/admin/analytics/traffic | 트래픽 통계 |

---

## 17. 이미지 업로드 API

### POST /api/upload

이미지 업로드 (Presigned URL 방식)

**Request Body:**

```json
{
  "fileName": "review-photo.jpg",
  "fileType": "image/jpeg",
  "category": "review"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "fileUrl": "https://cdn.kidsspace.com/review/xxx.jpg"
  }
}
```

**카테고리별 제한:**

| 카테고리 | 최대 크기 | 허용 형식 |
|----------|-----------|-----------|
| profile | 5MB | JPG, PNG, WebP |
| product | 10MB | JPG, PNG, WebP |
| review | 10MB | JPG, PNG, WebP |
| post | 10MB | JPG, PNG, WebP, GIF |
| banner | 5MB | JPG, PNG, WebP |

---

## 18. Rate Limiting

| API 그룹 | 제한 | 기준 |
|----------|------|------|
| 인증 (로그인) | 5회/분 | IP |
| 인증 (가입) | 3회/시간 | IP |
| 일반 조회 | 100회/분 | IP |
| 인증된 쓰기 | 30회/분 | 사용자 |
| 검색 | 30회/분 | IP |
| 이미지 업로드 | 20회/분 | 사용자 |
| 관리자 | 200회/분 | 사용자 |
