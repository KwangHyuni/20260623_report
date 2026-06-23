# ERP 데이터 분석 대시보드 & 자동 보고서

ERP CSV 데이터를 업로드하거나 샘플 데이터를 불러와 매출을 분석하고, Gemini AI가 자동으로 보고서를 작성하는 웹 애플리케이션입니다.

**GitHub:** https://github.com/KwangHyuni/20260623_report

## 기능

- **데이터 입력**: CSV 드래그앤드롭/클릭 업로드, 샘플 데이터 일괄 로드
- **대시보드**: KPI, 월별/채널별/카테고리별 차트, TOP 10
- **보고서 분석**: Gemini AI 기반 분석 보고서, PDF/Word 다운로드 (메뉴 이동 시 유지)
- **원본 데이터**: 테이블별 데이터 조회 (페이지네이션, 검색, 정렬)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY 설정
npm run dev
```

http://localhost:3000 에서 확인

## Vercel 배포

1. GitHub 저장소에 코드 push
2. [Vercel](https://vercel.com/new)에서 `KwangHyuni/20260623_report` Import
3. 환경 변수 `GEMINI_API_KEY` 설정
4. Deploy

상세 가이드: [docs/DEPLOY.md](docs/DEPLOY.md)

## 문서

- [기능 명세서](docs/SPEC.md)
- [작업 이력](docs/CHANGELOG.md)
- [GitHub 연동](docs/GITHUB.md)
- [Vercel 배포](docs/DEPLOY.md)

## 기술 스택

Next.js 15 · TypeScript · Tailwind CSS · SQLite · Recharts · Gemini AI
