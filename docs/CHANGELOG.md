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
- 테이블별 개별 데이터 삭제 기능 추가
- 모바일 햄버거 네비게이션 메뉴 추가
- 공통 로딩 스피너 컴포넌트 적용
- 원본 데이터 검색 디바운스(300ms) 및 컬럼 정렬 UI 추가
- 파이 차트 라벨 겹침 방지(Legend 사용)
- Tailwind `primary-400` 색상 추가
- 보고서 분석 내용 메뉴 이동 시 유지, 데이터 입력(업로드/샘플/삭제) 시 초기화
- Vercel 배포 호환 (`/tmp` DB 경로), DEPLOY.md·GITHUB.md 문서 추가
- UTF-8 BOM이 포함된 CSV 파일 파싱 오류 수정
- CSV 마지막 빈 행(FieldMismatch) 허용 처리
- Gemini 모델 `gemini-2.5-flash`로 업데이트
