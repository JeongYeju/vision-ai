# 서울 2070: 두 개의 미래

서울의 도시 문제를 세 명의 서로 다른 시선으로 발견하고, 두 미래를
비교한 뒤 협동 식물을 완성하는 풀스크린 인터랙티브 전시 데모입니다.

## 주요 기능

- 1.5초 시선 체류형 선택과 클릭 대체 입력
- 세 명의 관람객 역할 전환과 역할별 단서 발견
- 미래 A/B 비주얼 밸런스 게임
- 선택 일치·불일치 분기
- 한 문장 입력과 추천 문장 칩
- 미래 C 해금과 식물 성장 애니메이션
- 개인별 기여 확인, 다시 보기, 재선택, 초기화
- 1440×900 데스크톱 우선 및 모바일 반응형 화면

로그인, 데이터베이스, 외부 API 없이 브라우저의 프론트엔드 상태만으로
작동합니다.

## 기술 구성

- Next.js 16
- React 19
- TypeScript
- CSS 애니메이션

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 여세요.

## 빌드 및 실행

```bash
npm run build
npm run start
```

## 테스트

```bash
npm test
```

## 주요 파일

- `app/page.tsx`: 전체 게임 상태와 인터랙션
- `app/globals.css`: 전시 화면, 반응형 레이아웃, 애니메이션
- `app/layout.tsx`: 한국어 문서 및 사이트 메타데이터
- `public/seoul-plant.jpg`: 성북구 처마 포식 덩굴 대표 비주얼

## GitHub 공개 저장소로 올리기

1. GitHub에서 새 저장소를 만듭니다.
2. 저장소 공개 범위를 `Public`으로 선택합니다.
3. 이 폴더의 전체 파일을 저장소에 업로드합니다.

명령줄을 사용하는 경우:

```bash
git init
git add .
git commit -m "Initial public release"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git push -u origin main
```

특정 GitHub 저장소 주소가 들어 있지 않으며, 배포 ID·인증 정보·환경
변수·비밀키도 포함되어 있지 않습니다.

> 이 저장소에는 별도의 오픈소스 라이선스가 포함되어 있지 않습니다.
> 외부인의 복제·수정·배포를 허용하려면 목적에 맞는 라이선스를 추가하세요.
