# ERP 데이터 분석 대시보드 & 자동 보고서 — 기능 명세서

## 1. 개요

ERP CSV 데이터를 업로드하거나 샘플 데이터를 불러와 매출 지표를 집계·시각화하고, Gemini AI가 분석 보고서를 생성하는 웹 애플리케이션입니다.

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS |
| 차트 | Recharts |
| DB | SQLite (better-sqlite3) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| PDF | @react-pdf/renderer |
| Word | docx |
| CSV | papaparse |

## 3. 화면 구성

### 3.1 상단 메뉴
- 데이터 입력 (`/data-input`)
- 대시보드 (`/dashboard`)
- 보고서 분석 (`/report`)
- 원본 데이터 (`/raw-data`)

### 3.2 데이터 입력
- **파일 업로드**: 테이블별 4개 Dropzone (주문, 주문항목, 고객, 상품)
  - 드래그앤드롭 지원
  - 클릭하여 파일 선택
  - CSV 헤더 검증, 최대 10MB
- **샘플 데이터 불러오기**: `data/` 폴더 CSV 4개 일괄 적재
- **데이터 상태 패널**: 테이블별 행 수, 갱신 시각
- **전체 초기화**: 모든 데이터 삭제

### 3.3 대시보드
- KPI: 총 매출, 주문 건수, 평균 주문금액, 활성 고객 수
- 차트: 월별 매출, 채널별 매출, 카테고리별 매출, 주문 상태 분포
- 테이블: TOP 10 고객, TOP 10 상품

### 3.4 보고서 분석
- Gemini AI 기반 분석 보고서 생성
- 섹션: 요약, 주요 인사이트, 리스크, 개선 제안
- 집계 표·차트 함께 표시
- PDF / Word(.docx) 다운로드

### 3.5 원본 데이터
- 4개 테이블 탭 전환
- 페이지네이션 (50건/페이지)
- 검색, 필터 (상태/카테고리)

## 4. 데이터 스키마

### sales_orders
`order_no`, `customer_id`, `order_date`, `status`, `channel`, `payment_method`, `total_amount_krw`

### sales_order_items
`order_item_id`, `order_no`, `product_id`, `qty`, `unit_price_krw`, `discount_pct`, `amount_krw`

### customers
`customer_id`, `customer_name`, `customer_type`, `city`, `phone`, `email`, `join_date`, `tier`

### products
`product_id`, `product_name`, `category`, `brand`, `unit_cost_krw`, `unit_price_krw`, `stock_qty`, `status`

## 5. API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/data/status` | 데이터 로드 상태 |
| POST | `/api/data/upload` | CSV 업로드 (formData: file, table) |
| POST | `/api/data/load-sample` | 샘플 데이터 일괄 로드 |
| DELETE | `/api/data/clear` | 전체 데이터 초기화 |
| GET | `/api/data/raw` | 원본 데이터 조회 (table, page, limit, search, filter) |
| GET | `/api/metrics` | 집계 지표 |
| POST | `/api/report/generate` | Gemini AI 보고서 생성 |
| POST | `/api/report/export` | PDF/Word 다운로드 (body: report, metrics, format) |

## 6. 환경 변수

```
GEMINI_API_KEY=your_api_key
```

## 7. 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속
