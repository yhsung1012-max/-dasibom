# 다시 봄 (Re:Spring)

치매 어르신과 가족을 위한 AI 케어 앱. 서버(`server.ts`, Express)가 Gemini를 호출하고, 화면(`src/App.tsx`, React)이 서버 API를 사용해요.

## 내 컴퓨터에서 실행
1. `.env.example` 을 `.env` 로 복사하고 `GEMINI_API_KEY` 에 키를 넣어요.
2. `npm install`
3. `npm run dev` → http://localhost:3000

## Render 배포 (무료 Web Service)
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment: `GEMINI_API_KEY` = 새로 만든 키 (코드에 직접 적지 마세요)

## 참고
- 키가 없거나 AI가 2.2초 안에 답하지 못하면, 서버에 미리 써둔 대본 답변이 나와요.
- 프로필 사진은 `public/na_hanhee_profile.svg` 입니다. 실제 사진으로 바꾸려면 같은 폴더에 넣고 `src/App.tsx` 의 `naHanheeProfile` 경로를 고치세요.
