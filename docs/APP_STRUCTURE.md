# 애플리케이션 구조

ReciPick은 라우트 페이지, 재사용 UI, 상태/데이터 로직을 분리하는 단순한 계층 구조를 사용합니다.

## 디렉터리 책임

```text
src/
├── assets/       이미지와 정적 파일
├── components/   여러 화면에서 재사용하는 UI
├── constants/    라우트, 저장소 키 등 변경되지 않는 값
├── contexts/     여러 라우트가 공유하는 상태
├── data/         JavaScript Mock Data
├── hooks/        React 상태와 생명주기를 재사용하는 Hook
├── pages/        Router에 직접 연결되는 화면
├── styles/       전역 디자인 토큰, reset, 기본 요소 스타일
├── utils/        React에 의존하지 않는 계산·변환 함수
├── App.jsx       라우트 조합
└── main.jsx      브라우저 진입점과 전역 Provider
```

`contexts`, `data`, `utils`는 해당 책임의 실제 코드가 생길 때 추가합니다. 빈 폴더를 유지하기 위한 파일은 만들지 않습니다.

## 의존 방향

```text
main.jsx → App.jsx → pages → components
                       ↓          ↓
             contexts/hooks → constants/data/utils
```

- `pages`는 화면을 조합하고 라우트 단위 상태를 관리합니다.
- `components`는 특정 라우트에 의존하지 않는 Props 기반 UI를 우선합니다.
- `hooks`는 UI를 반환하지 않습니다.
- `utils`와 `constants`는 React에 의존하지 않습니다.
- 하위 계층이 `pages`를 import하지 않습니다.

## 라우팅

- 모든 경로 상수는 `src/constants/routes.js`에서 관리합니다.
- `App.jsx`는 라우트 선언과 공통 Layout 조합만 담당합니다.
- 페이지 파일은 `src/pages/*Page.jsx` 형식을 사용합니다.
- 공통 Header, Footer, 본문 영역은 `src/components/common/Layout.jsx`에서 제공합니다.

## 상태 관리

1. 화면 한 곳에서만 쓰는 값은 지역 State를 사용합니다.
2. 여러 컴포넌트가 같은 로직을 반복하면 Custom Hook으로 분리합니다.
3. 서로 다른 라우트가 같은 값을 읽고 수정하면 Context API를 사용합니다.
4. 새로고침 후 유지할 값은 `useLocalStorage`와 `STORAGE_KEYS`를 사용합니다.

Context를 추가하기 전에 Props 전달로 충분한지 먼저 확인합니다.

## 스타일

- `src/styles/global.css`: CSS 변수, reset, 기본 HTML 요소
- `*.module.css`: 컴포넌트와 페이지에 한정된 스타일
- 전역 선택자와 컴포넌트 선택자를 한 파일에 섞지 않습니다.

## 새 기능 추가 순서

1. 필요한 라우트와 상태 범위를 정합니다.
2. `pages`에서 화면 단위를 생성합니다.
3. 반복되는 UI를 `components`로 분리합니다.
4. 공유 로직을 `hooks` 또는 `utils`로 이동합니다.
5. 경로와 저장 Key는 `constants`에 추가합니다.
6. README 라우트 또는 이 문서의 구조가 달라지면 같은 PR에서 갱신합니다.
