# Vercel 배포 가이드

## 사전 준비

1. GitHub 저장소: https://github.com/KwangHyuni/20260623_report
2. [Vercel](https://vercel.com) 계정 (GitHub 연동)
3. [Google AI Studio](https://aistudio.google.com/apikey)에서 Gemini API 키 발급

---

## 1단계: GitHub에 코드 푸시

로컬에서 최초 1회:

```bash
cd c:\20260623
git init
git remote add origin https://github.com/KwangHyuni/20260623_report.git
git add .
git commit -m "feat: ERP 데이터 분석 대시보드 초기 구축"
git branch -M main
git push -u origin main
```

이후 작업할 때마다:

```bash
git add .
git commit -m "작업 내용 요약"
git push origin main
```

> `.env.local`은 `.gitignore`에 포함되어 있어 API 키는 GitHub에 올라가지 않습니다.

---

## 2단계: Vercel 프로젝트 생성

1. https://vercel.com/new 접속
2. **Import Git Repository** → `KwangHyuni/20260623_report` 선택
3. Framework Preset: **Next.js** (자동 감지)
4. Root Directory: `./` (기본값)
5. Build Command: `npm run build` (기본값)
6. Output Directory: `.next` (기본값)

---

## 3단계: 환경 변수 설정

Vercel 프로젝트 → **Settings** → **Environment Variables**

| 이름 | 값 | 환경 |
|------|-----|------|
| `GEMINI_API_KEY` | 발급받은 Gemini API 키 | Production, Preview, Development |

저장 후 **Redeploy** 실행.

---

## 4단계: 배포 확인

1. Vercel 대시보드에서 **Deployments** 탭 확인
2. 배포 완료 후 `https://<프로젝트명>.vercel.app` 접속
3. **데이터 입력** → **샘플 데이터 불러오기** → 대시보드·보고서 동작 확인

---

## Vercel 배포 시 주의사항

### SQLite 데이터 저장 (중요)

| 환경 | DB 저장 위치 | 데이터 유지 |
|------|-------------|------------|
| 로컬 | `data/erp.db` | 영구 유지 |
| Vercel | `/tmp/erp-db/erp.db` | **인스턴스 재시작 시 초기화될 수 있음** |

Vercel은 서버리스 환경이라 업로드한 ERP 데이터가 **배포·재시작 후 사라질 수 있습니다.**

**운영 권장:**
- 데모/시연: 샘플 데이터 불러오기로 사용
- 실제 운영: Turso, Neon, Supabase 등 외부 DB로 마이그레이션 검토

### better-sqlite3

`next.config.ts`에 `serverExternalPackages: ["better-sqlite3"]` 설정 완료. Vercel Node.js 런타임에서 네이티브 모듈 빌드가 지원됩니다.

### API 키

- Vercel 환경 변수에만 저장
- GitHub·클라이언트 코드에 포함 금지

---

## 자동 배포 (CI/CD)

`main` 브랜치에 `git push`하면 Vercel이 **자동으로 재배포**합니다.

```
로컬 수정 → git push → Vercel 자동 빌드·배포 (약 1~3분)
```

---

## 문제 해결

| 증상 | 해결 |
|------|------|
| 빌드 실패 (better-sqlite3) | Node.js 20.x 사용, `serverExternalPackages` 확인 |
| 보고서 생성 실패 | `GEMINI_API_KEY` 환경 변수 확인 |
| 데이터가 사라짐 | Vercel 서버리스 특성 — 샘플 데이터 재로드 또는 외부 DB 사용 |
| 500 오류 | Vercel → Deployments → Functions 로그 확인 |

---

## 로컬 vs Vercel 비교

| 항목 | 로컬 (`npm run dev`) | Vercel |
|------|---------------------|--------|
| URL | http://localhost:3000 | https://xxx.vercel.app |
| DB | 영구 저장 | 임시 저장 (/tmp) |
| API 키 | `.env.local` | Vercel 환경 변수 |
| 배포 | 수동 실행 | git push 시 자동 |
