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
- 모바일: 햄버거 메뉴로 동일 항목 제공

### 3.2 데이터 입력
- **파일 업로드**: 테이블별 4개 Dropzone (주문, 주문항목, 고객, 상품)
  - 드래그앤드롭 지원
  - 클릭하여 파일 선택
  - 업로드 후에도 파일 변경(재업로드) 가능
  - CSV 헤더 검증, 최대 10MB
  - UTF-8 BOM 포함 CSV 지원
  - 마지막 빈 행(FieldMismatch) 허용
- **샘플 데이터 불러오기**: `data/` 폴더 CSV 4개 일괄 적재
- **데이터 상태 패널**: 테이블별 행 수, 갱신 시각
- **테이블별 삭제**: 개별 테이블 데이터만 삭제 (`DELETE /api/data/clear?table=...`)
- **전체 초기화**: 모든 데이터 삭제
- **보고서 연동**: 업로드·샘플 로드·삭제 시 `ReportContext`의 보고서 내용 초기화

### 3.3 대시보드

#### 요약 바 (SummaryBar)
- 상품·고객·주문 건수 표시

#### KPI (12종)
| KPI | 설명 |
|-----|------|
| 유효매출 | 취소·반품 제외 주문항목 금액 합계 |
| 매출원가 | 유효 주문항목 수량 × 상품 원가 |
| 매출총이익 | 유효매출 − 매출원가 |
| 매출총이익률 | 매출총이익 ÷ 유효매출 |
| 평균 주문금액 | 취소·반품 제외 주문의 평균 `total_amount_krw` |
| 판매수량 | 유효 주문항목 수량 합계 |
| 취소율 / 반품율 | 전체 주문 대비 해당 상태 비율 |
| 활성 고객 | 유효 주문이 1건 이상인 고객 수 |
| 재고 위험 | 판매중 상품 중 재고 50개 미만 건수 |
| 단종 상품 | 상태가 단종인 상품 건수 |
| 총거래액 | 전체 주문(취소·반품 포함) 금액 합계 |

- 분석 기간: 주문일자 최소~최대 범위 표시
- 금액 KPI는 `formatKRW`로 `₩1,234,567` 형식 표시
- KPI 카드 상단 accent 라인: 지표별 아이콘 색과 동일 (`topLineColor`)

#### KPI 상태 등급 (`lib/kpi-thresholds.ts`)

매출총이익률·취소율·반품율·재고 위험·단종 상품 5개 KPI에 **정상 / 주의 / 심각 / 위험** 4단계 판정을 적용합니다.

| 지표 | 정상 | 주의 | 심각 | 위험 |
|------|------|------|------|------|
| 매출총이익률 | ≥ 30% | 20% ~ 30% | 10% ~ 20% | < 10% |
| 취소율 | ≤ 3% | 3% ~ 5% | 5% ~ 10% | > 10% |
| 반품율 | ≤ 2% | 2% ~ 5% | 5% ~ 8% | > 8% |
| 재고 위험 | 0건 | 1건 이상, 전체 상품 5% 이하 | 5% ~ 15% | > 15% |
| 단종 상품 | 0건 | 1건 이상, 전체 상품 5% 이하 | 5% ~ 15% | > 15% |

- 재고 위험·단종 상품은 전체 상품 수 대비 **비율**로 판정
- 카드 UI: 상태 뱃지, 단계별 상단 라인·아이콘 색상 (녹→노→주→빨)
- **심각**: 주황 배경(`bg-orange-50`), **위험**: 빨강 배경(`bg-red-50`)
- 카드 하단에 판정 기준 문구 표시

#### 차트
- **월별 매출 추이**: 라인 차트 (취소·반품 제외)
- **채널별 매출**: 막대 그래프 (딥블루 파스텔 다색)
- **카테고리별 매출**: 막대 그래프
- **결제 수단별 매출**: 반원 부채꼴 파이 차트, 금액+비율 라벨
- **고객 등급별 매출**: 막대 그래프
- **주문 상태 분포**: 반원 부채꼴 파이 차트 (전체 주문 기준)
- **브랜드별 매출 TOP 10**: 막대 그래프
- **지역별 매출 TOP 10**: 막대 그래프 (고객 도시 기준)
- 각 차트 카드에 집계 기준(footnote) 표시

#### 테이블
- **재고 위험 목록**: 재고 50개 미만 판매중 상품 (재고 낮은 순)
- **TOP 10 고객**: 유효 주문 매출 합계
- **TOP 10 상품**: 유효 주문항목 매출 합계
- 공통 `PastelTable` 스타일 (딥블루 헤더, WCAG 대비)

### 3.4 보고서 분석
- Gemini AI 기반 분석 보고서 생성
- 섹션: 요약, 주요 인사이트, 리스크, 개선 제안
- 집계 표·차트 함께 표시
- PDF / Word(.docx) 다운로드
- **상태 유지**: `ReportContext`로 메뉴 이동 시 생성된 보고서·지표 유지
- **초기화**: 데이터 입력(업로드/샘플/삭제) 시 보고서 내용 초기화

### 3.5 원본 데이터
- 4개 테이블 탭 전환 (주문, 주문항목, 고객, 상품)
- 페이지네이션 (50건/페이지)
- 검색 (300ms 디바운스)
- 필터: 주문 상태 / 상품 카테고리
- 컬럼 헤더 클릭 정렬 (`sortBy`, `sortDir`)
- 컬럼명 한글 표시 (`getColumnLabel`, `COLUMN_LABELS`)
- 원화 금액 컬럼 `₩1,234,567` 형식 (`formatRawCellValue`)
  - 대상: `total_amount_krw`, `unit_price_krw`, `unit_cost_krw`, `amount_krw`
  - 금액 컬럼 우측 정렬 + `tabular-nums`

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
| DELETE | `/api/data/clear?table={table}` | 테이블별 데이터 삭제 (`orders`, `order_items`, `customers`, `products`) |
| GET | `/api/data/raw` | 원본 데이터 조회 (table, page, limit, search, filter, sortBy, sortDir) |
| GET | `/api/metrics` | 집계 지표 |
| POST | `/api/report/generate` | Gemini AI 보고서 생성 |
| POST | `/api/report/export` | PDF/Word 다운로드 (body: report, metrics, format) |

## 6. 표시 형식 (`lib/utils.ts`)

| 함수 | 용도 | 예시 |
|------|------|------|
| `formatKRW` | 원화 통화 | `₩1,250,000` |
| `formatNumber` | 천 단위 구분 숫자 | `1,250` |
| `formatPercent` | 백분율 | `12.5%` |
| `formatRawCellValue` | 원본 데이터 셀 (금액 컬럼 자동 변환) | `₩1,250,000` |

## 7. KPI 상태 판정 (`lib/kpi-thresholds.ts`)

| 함수 | 대상 |
|------|------|
| `evaluateGrossProfitRate` | 매출총이익률 |
| `evaluateCancelRate` | 취소율 |
| `evaluateReturnRate` | 반품율 |
| `evaluateInventoryRisk` | 재고 위험 (건수, 전체 상품 수) |
| `evaluateDiscontinued` | 단종 상품 (건수, 전체 상품 수) |

임계값 상수: `GROSS_PROFIT_RATE_THRESHOLDS`, `CANCEL_RATE_THRESHOLDS`, `RETURN_RATE_THRESHOLDS`, `INVENTORY_RISK_RATIO_THRESHOLDS`, `DISCONTINUED_RATIO_THRESHOLDS`

## 8. 환경 변수

```
GEMINI_API_KEY=your_api_key
```

## 9. 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 10. 배포·저장소

- Vercel 배포: SQLite는 `/tmp` 경로 사용 (휘발성). 자세한 내용은 `DEPLOY.md` 참고
- GitHub 저장소 관리: `GITHUB.md` 참고
