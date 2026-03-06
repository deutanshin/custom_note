# 📝 Memo Custom — 개인 스케줄 메모 웹앱

> 스케줄 관리 + 세부사항 메모를 제공하는 개인용 웹 애플리케이션입니다.

## 🏗️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Express 5 + TypeScript + Prisma ORM |
| **Database** | PostgreSQL 15 |
| **Infra** | Docker + Docker Compose + Nginx |

---

## 📁 프로젝트 구조

```
memo_custom/
├── docker-compose.yml       # 전체 서비스 오케스트레이션
├── backend/
│   ├── Dockerfile
│   ├── prisma/schema.prisma # DB 스키마
│   └── src/                 # Express API 서버
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx 프록시 설정
│   └── src/                 # React 앱
└── README.md
```

---

## 🚀 배포 PC에서 실행하기 (Docker)

### 사전 준비

배포 PC에 아래 두 가지가 설치되어 있어야 합니다:

- **Docker** (>= 20.x) — [설치 가이드](https://docs.docker.com/get-docker/)
- **Docker Compose** (>= 2.x) — Docker Desktop에 포함되어 있음

설치 확인:
```bash
docker --version
docker compose version
```

---

### Step 1. 레포지토리 클론

```bash
git clone https://github.com/<your-username>/memo_custom.git
cd memo_custom
```

---

### Step 2. (선택) 환경 변수 수정

`docker-compose.yml` 파일을 열어 아래 값들을 원하는 대로 수정할 수 있습니다:

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `POSTGRES_USER` | `memo_user` | DB 사용자명 |
| `POSTGRES_PASSWORD` | `memo_password` | DB 비밀번호 |
| `POSTGRES_DB` | `memo_custom` | DB 이름 |
| `JWT_SECRET` | `change-this-to-...` | **⚠️ 반드시 변경 권장** |
| Frontend 포트 | `80:80` | 웹 접속 포트 |

> ⚠️ **보안 주의**: `JWT_SECRET`은 반드시 랜덤한 안전한 문자열로 변경하세요.
>
> 예시: `openssl rand -base64 32` 로 생성

---

### Step 3. Docker 빌드 & 실행

```bash
docker compose up -d --build
```

이 명령어 하나로:
1. ✅ PostgreSQL 데이터베이스 컨테이너 실행
2. ✅ 백엔드 TypeScript 빌드 + Prisma 마이그레이션 자동 실행
3. ✅ 프론트엔드 빌드 + Nginx로 정적 파일 서빙
4. ✅ API 프록시 연결 (`/api/*` → 백엔드)

---

### Step 4. 접속

브라우저에서 접속:

```
http://localhost
```

> 포트를 변경한 경우: `http://localhost:<변경한_포트>`

---

## 🔧 관리 명령어

### 로그 확인
```bash
# 전체 로그
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### 서비스 중지
```bash
docker compose down
```

### 서비스 중지 + DB 데이터 삭제
```bash
docker compose down -v
```

### 재빌드 (코드 변경 후)
```bash
docker compose up -d --build
```

---

## 🛠️ 로컬 개발 모드 (Docker 없이)

로컬에서 개발할 때는 Docker 대신 직접 실행할 수 있습니다.

### 1. DB 실행 (Docker로 DB만)
```bash
docker compose up -d db
```

### 2. 백엔드 실행
```bash
cd backend
npm install

# .env 파일 생성
echo 'PORT=4000' > .env
echo 'DATABASE_URL="postgresql://memo_user:memo_password@localhost:5432/memo_custom?schema=public"' >> .env
echo 'JWT_SECRET="dev-secret-key"' >> .env

# DB 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

프론트엔드: `http://localhost:22222`  
백엔드 API: `http://localhost:4000`

---

## 📋 주요 기능

- 🔐 **회원가입 / 로그인** (JWT 인증)
- 📋 **스케줄 관리** — 리스트 뷰 / 칸반 보드 뷰
- 🔀 **드래그 & 드롭** — 보드 뷰에서 상태 변경
- 📝 **세부사항 메모** — 스케줄별 상세 메모 작성 (사이드바)
- 🔃 **정렬 기능** — 시작일 / 마감일 기준 정렬
- 🗑️ **삭제 기능** — 리스트 뷰 & 보드 뷰 모두 지원
- ✅ **완료 처리** — 완료 항목 자동 하단 정렬 + 시각적 구분
- 💾 **자동 저장** — 세부사항 메모 자동 저장 (debounce)

---

## 🐛 트러블슈팅

### Docker 빌드 실패 시
```bash
# 캐시 없이 재빌드
docker compose build --no-cache
docker compose up -d
```

### DB 연결 오류 시
```bash
# DB 컨테이너 상태 확인
docker compose ps
docker compose logs db
```

### 포트 충돌 시
`docker-compose.yml`에서 포트 번호를 변경하세요:
```yaml
ports:
  - "8080:80"     # 프론트엔드를 8080으로 변경
  - "4001:4000"   # 백엔드를 4001로 변경
```
