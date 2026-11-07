---
title: Cat Chess
date_started: 2023.12.01
date_finished: 2024.04.01
head_count: 1
role: Full-stack
---

# CatChess

_A real-time, browser-based 3D auto battler starring tactical cats._

## Demo

![DEMO_MAIN](https://github.com/wndgur2/CatChess/assets/65120311/127f7c91-6917-416a-accb-38428a96945a)
![DEMO_GAME](https://github.com/user-attachments/assets/c83d8e9c-acf6-47d8-bd14-163b70201edd)

### 개요

CatChess는 브라우저에서 실행되는 실시간 멀티플레이 오토 배틀러입니다. Node.js/Express 백엔드가 매칭, 전투 시뮬레이션, 영속성을 담당하고 Three.js 기반 프론트엔드가 3D 보드와 고양이 모델, 전투 이펙트를 렌더링합니다. WebSocket, MongoDB를 결합해 두 플레이어가 끊김 없이 전략 대결을 펼칠 수 있도록 설계했습니다.

### 라이브 빌드 & 자료

- 최신 버전 플레이: [Cat Chess](https://catchess.sam-lee.cloud/)
- 게임 플레이 영상: [0.2.9 데모](https://www.youtube.com/watch?v=07bcqwNsibg&t=314s)
- UI/UX 기획안: [Figma 보드](https://www.figma.com/file/UTLu1K2qiGxK4XhZFt7q1h/catChess?type=design&node-id=0%3A1&mode=design&t=4keMP4w5z6JixYat-1)
- 로직 다이어그램: [Draw.io 문서](https://drive.google.com/file/d/1AHRsH_nBJkpwJ-txst1yUMQeNCm4xSDl/view?usp=drive_link)

### 주요 특징

- `실시간 PvP`: `server/modules/socket.js`가 WebSocket 통신을 관리해 준비 - 전투 - 결과 - 대기 단계를 두 플레이어가 동일하게 경험합니다.
- `3D 전장 렌더링`: `client/public/javascripts/modules/3D/Painter.js`가 Three.js, OutlineEffect, GLTF 모델을 활용해 직관적인 전장과 이펙트를 구현했습니다.
- `유닛 & 스킬`: `server/modules/unit`과 `server/modules/constants`에 고양이 유닛의 능력치, 스킬, 시너지가 정의되어 있으며 전투 로직은 `Battle.js`에서 처리합니다.
- `계정 & 전적`: `server/routes/auth.js`는 Google OAuth를 통해 토큰을 발급하고, `server/db/schema/User.js`가 승/패 기록과 접속 상태를 MongoDB에 저장합니다.
- `다국어 지원`: `server/app.js`가 브라우저의 `Accept-Language`를 확인해 `lang` 쿠키를 설정하고 Pug 템플릿을 언어별로 렌더링합니다.
- `플레이어 로그`: `client/public/javascripts/main.js`가 브라우저 정보를 수집해 `server/routes/user.js` 및 `server/db/schema/Device.js`에서 QA용 데이터를 축적합니다.

### 기술 스택

- **서버**: Node.js, Express, ws, dotenv, cookie-parser, body-parser
- **클라이언트**: Three.js, GLTF 에셋, 바닐라 JS 기반 UI, Pug 템플릿
- **데이터베이스**: MongoDB + Mongoose(User, Device 스키마)
- **툴링**: Nodemon 스크립트, dotenv 환경 설정, `client/public` 에셋 파이프라인

### PR 프리뷰

PR을 열거나 갱신하면 `.github/workflows/pr-preview.yml`이 Fly.io에 PR 전용 앱을 배포하고 주소를 PR 댓글로 남깁니다. PR을 닫으면 앱을 삭제합니다.

- 저장소 시크릿 `FLY_API_TOKEN`이 필요합니다(`fly tokens create org`). 없으면 배포를 건너뜁니다.
- 프리뷰에는 DB가 없어 게스트 플레이만 가능하고, 로그인과 전적 저장은 동작하지 않습니다.
- Fly.io는 무료 티어가 없습니다. 앱은 유휴 시 자동으로 멈추고, 멈춘 동안에는 디스크 비용만 청구됩니다.

### 아키텍처

```
브라우저 (UI.js, Socket.js, Painter.js)
    ↕  HTTPS + WebSocket (ws)
Express 앱 (server/app.js)
    ↕  게임 루프 (Game.js, Battle.js, BattleField.js)
MongoDB (User, Device 모델)
```

서버가 모든 게임 상태를 판단하고(`Game.js`), 틱 단위 전투를 해결하며(`Battle.js`), 플레이어 리소스를 관리합니다(`Player.js`). 클라이언트는 렌더링과 입력, 다국어 UI에 집중합니다.

### 디렉터리 구조

```
CatChess/
├── client/                          # 프런트엔드 정적 자산과 Pug 뷰
│   ├── public/                      # 브라우저 번들에 포함되는 리소스
│   │   ├── audio/                   # 효과음, 브금 등 오디오 파일
│   │   ├── images/                  # UI 아이콘, 유닛 초상화
│   │   ├── javascripts/             # 클라이언트 사이드 스크립트
│   │   │   ├── main.js              # 페이지 엔트리 스크립트
│   │   │   └── modules/             # 프런트엔드 게임 로직 모듈
│   │   │       ├── 3D/              # Painter, Cat 등 Three.js 렌더러
│   │   │       ├── Battle.js        # 전투 연출 및 라운드 상태
│   │   │       ├── Game.js          # 클라이언트 게임 상태 매니저
│   │   │       ├── Socket.js        # WebSocket 송수신 래퍼
│   │   │       ├── UI.js            # HUD, 로비 등 UI 컨트롤러
│   │   │       ├── User.js          # 사용자 정보 저장/업데이트
│   │   │       └── constants/       # 프런트 고정값, 메시지 키
│   │   ├── models/                  # GLTF 고양이, 보드 모델
│   │   └── stylesheets/             # SCSS/CSS 스타일
│   └── views/                       # Express가 렌더링하는 Pug 템플릿
├── server/                          # Node.js 백엔드 소스
│   ├── app.js                       # Express 설정과 공통 미들웨어
│   ├── bin/                         # HTTP/WebSocket 서버 부트스트랩
│   ├── modules/                     # 게임 루프, 전투, 소켓 도메인 로직
│   │   ├── Game.js                  # 매치 플로우 및 라운드 관리
│   │   ├── Battle.js                # 틱 단위 전투 시뮬레이션
│   │   ├── BattleField.js           # 보드 상태 및 포지션 로직
│   │   ├── Player.js                # 플레이어 자원, 덱, 체력 관리
│   │   ├── Item.js                  # 아이템 부여 및 효과 처리
│   │   ├── socket.js                # WebSocket 이벤트 핸들러 등록
│   │   ├── utils.js                 # 공용 유틸 함수
│   │   ├── unit/                    # 고양이/크립 유닛 클래스 모음
│   │   │   ├── Unit.js              # 기본 유닛 베이스 클래스
│   │   │   ├── SimpleCat.js         # 플레이어 유닛 구현
│   │   │   ├── Creep.js             # PvE 라운드 크립 정의
│   │   │   └── Modifier.js          # 버프/디버프 계산 로직
│   │   └── constants/               # 전투/시너지/스테이지 상수
│   │       ├── SKILLS.js            # 스킬 정의
│   │       ├── SYNERGIES.js         # 시너지 조합
│   │       ├── ITEMS.js             # 아이템 스펙
│   │       └── cats.json            # 고양이 스탯 데이터
│   ├── routes/                      # 인증 및 유저 관련 API 엔드포인트
│   │   ├── auth.js                  # Google OAuth, 세션 관리
│   │   ├── data.js                  # 전투 기록, 통계 제공
│   │   └── user.js                  # 플레이어 정보 갱신, 로그 수집
│   └── db/                          # MongoDB 연결 설정과 스키마
│       ├── mongoDB.js               # Mongoose 커넥션 설정
│       ├── query.js                 # 재사용 가능한 쿼리 함수
│       └── schema/                  # User, Device 등 Mongoose 스키마
├── docs/                            # 기획 문서, 다이어그램 등 참고 자료
├── compressor.sh                    # 에셋 압축 및 최적화 스크립트
├── exclude_list.txt                 # 압축 제외 대상 목록
├── package.json                     # npm 스크립트와 프로젝트 의존성
└── README.md                        # 프로젝트 개요 및 가이드
```
