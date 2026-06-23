# 작업 이력 (CHANGELOG)

## 2026-06-23

### 초기 구축
- Next.js 15 + TypeScript 프로젝트 생성
- SQLite 기반 ERP 데이터 저장소 구현
- 상단 네비게이션 레이아웃 (데이터 입력, 대시보드, 보고서 분석, 원본 데이터)
- 데이터 입력 페이지
  - 테이블별 CSV Dropzone (드래그앤드롭 + 클릭 선택)
  - 샘플 데이터 불러오기 기능
  - 데이터 상태 패널 및 전체 초기화
- 집계 API 및 대시보드 초안 (KPI, 차트, TOP 10)
- 원본 데이터 테이블 뷰 (페이지네이션, 검색, 필터)
- Gemini AI 보고서 생성 연동
- PDF / Word(.docx) 다운로드 기능
- 기능 명세서(SPEC.md) 및 작업 이력(CHANGELOG.md) 작성

### UI 개선
- Dropzone 업로드 후에도 파일 변경(재업로드) 가능하도록 개선
- 테이블별 개별 데이터 삭제 기능 추가 (`DELETE /api/data/clear?table=...`)
- 모바일 햄버거 네비게이션 메뉴 추가
- 공통 로딩 스피너 컴포넌트 적용
- 원본 데이터 검색 디바운스(300ms) 및 컬럼 정렬 UI 추가
- 파이 차트 라벨 겹침 방지(Legend 사용)
- Tailwind `primary-400` 색상 추가
- 보고서 분석 내용 메뉴 이동 시 유지(`ReportContext`), 데이터 입력(업로드/샘플/삭제) 시 초기화
- Vercel 배포 호환 (`/tmp` DB 경로), DEPLOY.md·GITHUB.md 문서 추가

### 대시보드 KPI·차트 개편
- KPI 12종: 유효매출, 매출원가, 매출총이익, 매출총이익률, 평균 주문금액, 판매수량, 취소율, 반품율, 활성 고객, 재고 위험, 단종 상품, 총거래액
- 상단 요약 바(SummaryBar): 상품·고객·주문 건수
- 차트: 월별 매출, 채널·카테고리·고객등급·브랜드·지역별 매출, 결제수단·주문상태 부채꼴 파이
- 재고 위험 목록, TOP 10 고객/상품 테이블
- 그래프별 집계 기준(footnote) 표시
- UTF-8 BOM이 포함된 CSV 파일 파싱 오류 수정
- CSV 마지막 빈 행(FieldMismatch) 허용 처리
- Gemini 모델 `gemini-2.5-flash`로 업데이트

### UI·스타일
- 딥블루 파스텔 차트 팔레트 (`lib/chart-colors.ts`)
- 막대 그래프: 항목별 파스텔 다색 (`pastelChartColor`)
- 부채꼴 파이 차트: 결제수단·주문상태 (`fanPastelColor`, 반원형 180°~0°)
- 결제수단 부채꼴: 금액 + 비율 라벨 (`FanPieAmountLabel`)
- 공통 테이블 컴포넌트 `PastelTable` (딥블루 헤더, WCAG 대비: `bg-gray-200`, `text-[#172554]`)
- 원본 데이터 컬럼 헤더 영문 → 한글 (`COLUMN_LABELS`, `getColumnLabel`)

### 데이터 표시 형식
- 원화 금액 통일: `formatKRW` → `₩1,234,567` (천 단위 구분, 소수 없음)
- 적용 범위: 대시보드 KPI·차트 툴팁·테이블, 보고서 PDF/Word, 원본 데이터 금액 컬럼
- 원본 데이터: `formatRawCellValue` + `KRW_COLUMNS` (`total_amount_krw`, `unit_price_krw`, `unit_cost_krw`, `amount_krw`)
- 금액 컬럼 우측 정렬 및 `tabular-nums` 적용

### 문서
- SPEC.md: KPI 12종, 차트·테이블 상세, API(테이블별 삭제·정렬), 표시 형식, ReportContext 반영
- CHANGELOG.md: UI·스타일, 데이터 표시 형식 항목 추가

### KPI 상태 등급·카드 UI
- `lib/kpi-thresholds.ts`: 매출총이익률·취소율·반품율·재고 위험·단종 상품 4단계 판정 (정상/주의/심각/위험)
- KPI 카드: 상태 뱃지, 단계별 상단 라인·아이콘 색상
- KPI 카드 상단 accent 라인 (지표별 고정 색상)
- 심각/위험 단계: 카드 배경색 강조 (주황/빨강)
- SPEC.md·CHANGELOG.md 갱신

### KPI 카드 숫자·레이아웃
- `AutoFitText` 컴포넌트: 숫자만 영역 초과 시 자동 축소
- 카드 높이 통일, 숫자 하단 기준 정렬
- Tailwind `content`에 `lib/**` 추가 — 심각(주황) 배경색 CSS 빌드 누락 수정
- SPEC.md·CHANGELOG.md 갱신
