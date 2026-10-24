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

| 경로             | 화면           | 설명                             |
| ---------------- | -------------- | -------------------------------- |
| `/`              | 홈             | ReciPick 홈                      |
| `/recipes`       | 레시피 탐색    | 레시피 목록 조회                 |
| `/recipes/:id`   | 레시피 상세    | 선택한 레시피의 상세 정보 조회   |
| `/fridge`        | 내 냉장고      | 보유 식재료 관리                 |
| `/recommend`     | 맞춤 추천      | 보유 식재료 기반 레시피 추천     |
| `/favorites`     | 찜한 레시피    | 즐겨찾기에 저장한 레시피 조회    |
| `/shopping-list` | 장보기 목록    | 부족한 식재료의 장보기 목록 관리 |
| `/recent`        | 최근 본 레시피 | 최근 조회한 레시피 확인          |
| `/mypage`        | 마이페이지     | 사용자 정보와 서비스 설정 확인   |

## 폴더 구조

```text
ReciPick/
├── docs/
│   ├── APP_STRUCTURE.md    # 앱 계층, 라우트, 상태 관리 기준
│   └── DOCUMENTATION.md    # 문서별 역할과 관리 규칙
├── src/
│   ├── assets/             # 이미지와 정적 파일
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── constants/          # 라우트, 저장소 키 등 공통 상수
│   ├── hooks/              # 재사용 가능한 Custom Hook
│   ├── pages/              # 라우트 단위 페이지 컴포넌트
│   ├── styles/             # 전역 토큰, reset, 기본 스타일
│   ├── App.jsx             # 애플리케이션 라우팅
│   └── main.jsx            # 애플리케이션 진입점
├── REACT_CONVENTION.md     # React 개발 컨벤션
├── eslint.config.js        # ESLint 설정
├── index.html              # HTML 진입점
├── package.json            # 패키지 및 스크립트 설정
└── vite.config.js          # Vite 설정
```

## 브랜치 및 PR 흐름

1. 작업 목적과 완료 조건을 적은 GitHub Issue를 먼저 생성합니다.
2. 최신 `develop`에서 `type/<이슈번호>-<작업명>` 형식의 작업 브랜치를 생성합니다.
3. 구현과 검증을 마친 뒤 커밋하고 작업 브랜치를 Push합니다.
4. `develop`을 대상으로 Pull Request를 만들고 본문에 `Close #이슈번호`를 작성합니다.
5. 리뷰와 필수 검사를 통과한 PR을 `develop`에 병합합니다.
6. 배포 가능한 변경 사항이 준비되면 `develop`에서 `main`으로 Pull Request를 생성합니다.

`main`은 배포 가능한 안정 버전, `develop`은 다음 배포를 위한 통합 브랜치로 관리합니다. 기능 브랜치를 `main`에 직접 병합하거나 두 브랜치에 직접 푸시하지 않습니다.

## 개발 컨벤션

컴포넌트 작성, 폴더 구성, 스타일링 및 Git 규칙은 [React 프로젝트 컨벤션](./REACT_CONVENTION.md)을 따릅니다.

앱 계층과 의존 방향은 [애플리케이션 구조](./docs/APP_STRUCTURE.md), 문서별 역할과 갱신 기준은 [문서 관리 규칙](./docs/DOCUMENTATION.md)을 따릅니다.
