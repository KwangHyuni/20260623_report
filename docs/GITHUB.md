# GitHub 저장소 연동

**저장소:** https://github.com/KwangHyuni/20260623_report

## 작업 후 업데이트 절차

코드·문서 변경이 완료되면 아래 순서로 GitHub에 반영합니다.

```bash
cd c:\20260623
git status
git add .
git commit -m "변경 내용을 한 줄로 요약"
git push origin main
```

## 커밋에 포함하지 않는 파일

- `.env.local` — Gemini API 키 (민감 정보)
- `data/erp.db` — 로컬 SQLite DB
- `node_modules/`, `.next/`

## 커밋 메시지 예시

```
feat: 보고서 Context로 메뉴 이동 시 내용 유지
fix: CSV BOM 파싱 오류 수정
docs: Vercel 배포 가이드 추가
```

## Vercel 자동 배포

`main` 브랜치에 push하면 Vercel이 연결되어 있을 경우 **자동 재배포**됩니다.

자세한 배포 방법: [docs/DEPLOY.md](DEPLOY.md)
