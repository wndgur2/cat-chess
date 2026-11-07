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

- `실시간 PvP`: `src/net/socket.js`가 WebSocket 통신을 관리해 준비 - 전투 - 결과 - 대기 단계를 두 플레이어가 동일하게 경험합니다.
- `3D 전장 렌더링`: `client/javascripts/view/3D/Painter.js`가 Three.js, OutlineEffect, GLTF 모델을 활용해 직관적인 전장과 이펙트를 구현했습니다.
- `유닛 & 스킬`: `src/game/unit`과 `src/game/constants`에 고양이 유닛의 능력치, 스킬, 시너지가 정의되어 있으며 전투 로직은 `Battle.js`에서 처리합니다.
- `계정 & 전적`: `src/routes/auth.js`는 Google OAuth를 통해 토큰을 발급하고, `src/db/schema/User.js`가 승/패 기록과 접속 상태를 MongoDB에 저장합니다.
- `다국어 지원`: `src/app.js`가 브라우저의 `Accept-Language`를 확인해 `lang` 쿠키를 설정하고 Pug 템플릿을 언어별로 렌더링합니다.
- `플레이어 로그`: `client/javascripts/main.js`가 브라우저 정보를 수집해 `src/routes/user.js` 및 `src/db/schema/Device.js`에서 QA용 데이터를 축적합니다.

### 기술 스택

- **서버**: Node.js, Express, ws, dotenv, cookie-parser, body-parser
- **클라이언트**: Three.js, GLTF 에셋, 바닐라 JS 기반 UI, Pug 템플릿
- **데이터베이스**: MongoDB + Mongoose(User, Device 스키마)
- **툴링**: Nodemon 스크립트, dotenv 환경 설정, `client/public` 에셋 파이프라인

### 아키텍처

```
브라우저 (controller → view / state → net)
    ↕  HTTPS + WebSocket (ws), 메시지 규약은 shared/protocol.js
Express 앱 (src/app.js) + WebSocket (src/net)
    ↕  게임 규칙 (src/game: Game.js, Battle.js, BattleField.js, Player.js)
MongoDB (User, Device 모델)
```

서버가 모든 게임 상태를 판단하고(`Game.js`), 틱 단위 전투를 해결하며(`Battle.js`), 플레이어 리소스를 관리합니다(`Player.js`). 클라이언트는 렌더링과 입력, 다국어 UI에 집중합니다.

#### 의존성 규칙

import는 아래 방향으로만 합니다. 역방향이 필요하면 상위 계층에서 콜백을 넘깁니다.

- **클라이언트**: `main` → `controller` → `view` → `state` → `net` → `constants`, `utils`
  - `state`는 DOM과 Three.js를 모릅니다. 서버 메시지를 상태와 화면에 연결하는 곳은 `controller/messageHandlers.js` 하나입니다.
- **서버**: `bin` → `net` → `game` → `constants`
  - `game`은 `ws`를 모르고, `Connection`의 `send(type, data)`만 사용합니다.
- **공용**: 메시지 타입과 게임 상태 값은 `shared/protocol.js`에만 정의합니다.

### 디렉터리 구조

```
CatChess/
├── shared/
│   └── protocol.js                  # 서버-클라이언트 메시지 타입, 게임 상태
├── client/
│   ├── javascripts/                 # 브라우저 소스 (esbuild로 번들)
│   │   ├── main.js                  # 엔트리, 모듈 조립
│   │   ├── controller/
│   │   │   └── messageHandlers.js   # 서버 메시지 → 상태 변경 + 화면 갱신
│   │   ├── view/
│   │   │   ├── UI.js                # 로비, 모달, 입력 이벤트
│   │   │   ├── Hud.js               # 게임 중 DOM (골드, 상점, 인벤토리 등)
│   │   │   ├── UnitInfoPanel.js     # 유닛 정보 패널
│   │   │   ├── Synergy.js           # 시너지 배지와 설명
│   │   │   ├── User.js              # 로그인, 전적 표시
│   │   │   ├── Popup.js, Sound.js, itemView.js, inventoryDrag.js
│   │   │   └── 3D/
│   │   │       ├── Painter.js       # Three.js 씬, 메시 생성, 포인터 입력
│   │   │       ├── UnitView.js      # 유닛 체력바, 이동, 공격 연출
│   │   │       ├── coords.js, Cat.js, Part.js
│   │   │       └── effects/         # 타격 이펙트, 오브젝트 풀
│   │   ├── state/                   # Game, Player, Battle, Unit, Item (데이터)
│   │   ├── net/
│   │   │   └── Socket.js            # WebSocket 연결과 전송
│   │   ├── constants/               # UI 상수, 다국어 텍스트, 3D 좌표
│   │   └── utils.js                 # 쿠키, 번역 텍스트
│   ├── public/                      # 정적 자산 (audio, images, models, stylesheets, 빌드 결과)
│   └── views/                       # Express가 렌더링하는 Pug 템플릿
├── src/                             # Node.js 백엔드 소스
│   ├── app.js                       # Express 설정과 공통 미들웨어
│   ├── bin/www                      # HTTP/WebSocket 서버 부트스트랩
│   ├── net/
│   │   ├── socket.js                # WebSocket 수신, 메시지 → 게임 호출
│   │   └── Connection.js            # 게임 계층이 쓰는 전송 인터페이스
│   ├── game/
│   │   ├── Game.js                  # 매치 플로우 및 라운드 관리
│   │   ├── Battle.js                # 틱 단위 전투 시뮬레이션
│   │   ├── BattleField.js           # 보드 상태 및 포지션 로직
│   │   ├── Player.js                # 플레이어 자원, 덱, 체력 관리
│   │   ├── playerRegistry.js        # 접속 중인 플레이어 목록
│   │   ├── Item.js                  # 아이템 부여 및 효과 처리
│   │   ├── unit/                    # Unit, SimpleCat, Creep, Modifier
│   │   └── constants/               # 스킬, 시너지, 아이템, 라운드, 유닛 데이터
│   ├── routes/
│   │   ├── auth.js                  # Google OAuth
│   │   ├── data.js                  # 언어별 유닛 데이터 제공
│   │   └── user.js                  # 전적, 접속 로그
│   └── db/                          # Mongoose 연결과 User, Device 스키마
├── build.js                         # esbuild 서버/클라이언트 번들
├── compressor.sh                    # 프로젝트 백업 압축 스크립트
├── exclude_list.txt                 # 압축 제외 대상 목록
├── package.json                     # npm 스크립트와 프로젝트 의존성
└── README.md                        # 프로젝트 개요 및 가이드
```
