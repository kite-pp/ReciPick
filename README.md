# ReciPick

ReciPick은 보유한 식재료를 바탕으로 레시피를 탐색하고 추천받을 수 있는 React 웹 애플리케이션입니다. 냉장고 재료 관리, 맞춤 레시피 추천, 레시피 상세 조회, 즐겨찾기 기능을 제공합니다.

## 기술 스택

- React 19
- React Router 7
- Vite 8
- ESLint 10
- Prettier
- pnpm

## 요구 환경

- Node.js 24.x
- pnpm 12.4.1

프로젝트에서 지정한 버전과 동일한 환경을 사용해 주세요.

## 시작하기

```bash
pnpm install
pnpm dev
```

개발 서버가 실행되면 터미널에 표시된 로컬 주소로 접속합니다.

## 명령어

| 명령어              | 설명                         |
| ------------------- | ---------------------------- |
| `pnpm install`      | 의존성 설치                  |
| `pnpm dev`          | 개발 서버 실행               |
| `pnpm build`        | 프로덕션 빌드 생성           |
| `pnpm lint`         | ESLint 검사                  |
| `pnpm format`       | Prettier로 코드 포맷 적용    |
| `pnpm format:check` | Prettier 포맷 준수 여부 검사 |

## 라우트

| 경로           | 화면        | 설명                           |
| -------------- | ----------- | ------------------------------ |
| `/`            | 홈          | ReciPick 홈                    |
| `/recipes`     | 레시피 탐색 | 레시피 목록 조회               |
| `/recipes/:id` | 레시피 상세 | 선택한 레시피의 상세 정보 조회 |
| `/fridge`      | 내 냉장고   | 보유 식재료 관리               |
| `/recommend`   | 맞춤 추천   | 보유 식재료 기반 레시피 추천   |
| `/favorites`   | 찜한 레시피 | 즐겨찾기에 저장한 레시피 조회  |

## 폴더 구조

```text
ReciPick/
├── src/
│   ├── pages/              # 라우트 단위 페이지 컴포넌트
│   ├── App.jsx             # 애플리케이션 라우팅
│   ├── index.css           # 전역 스타일
│   └── main.jsx            # 애플리케이션 진입점
├── REACT_CONVENTION.md     # React 개발 컨벤션
├── eslint.config.js        # ESLint 설정
├── index.html              # HTML 진입점
├── package.json            # 패키지 및 스크립트 설정
└── vite.config.js          # Vite 설정
```

## 브랜치 및 PR 흐름

1. 최신 `develop` 브랜치에서 작업 브랜치를 생성합니다.
2. 기능은 `feature/<작업명>`, 수정은 `fix/<작업명>`, 설정 작업은 `chore/<작업명>` 형식의 브랜치를 사용합니다.
3. 작업 브랜치에서 구현과 검증을 마친 뒤 `develop` 브랜치를 대상으로 Pull Request를 생성합니다.
4. 리뷰와 필수 검사를 통과한 PR을 `develop`에 병합합니다.
5. 배포 가능한 변경 사항이 준비되면 `develop`에서 `main`으로 Pull Request를 생성합니다.

`main`은 배포 가능한 안정 버전, `develop`은 다음 배포를 위한 통합 브랜치로 관리합니다. 기능 브랜치를 `main`에 직접 병합하거나 두 브랜치에 직접 푸시하지 않습니다.

## 개발 컨벤션

컴포넌트 작성, 폴더 구성, 스타일링 및 Git 규칙은 [React 프로젝트 컨벤션](./REACT_CONVENTION.md)을 따릅니다.
