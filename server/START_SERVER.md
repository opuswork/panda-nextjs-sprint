# 백엔드 서버 실행 가이드

## 🚀 서버 실행 방법

### 1단계: 의존성 설치 (처음 한 번만)
```bash
cd server
npm install
```

### 2단계: 환경 변수 설정
`server` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
DATABASE_URL="postgresql://사용자명:비밀번호@localhost:5432/데이터베이스명?schema=public"
PORT=3000
```

**예시:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
PORT=3000
```

### 3단계: Prisma 설정
```bash
cd server

# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션 (스키마 적용)
npx prisma migrate dev --name init

# 또는 기존 DB가 있다면
npx prisma db push
```

### 4단계: 서버 실행
```bash
npm run dev
```

서버가 성공적으로 실행되면 다음 메시지가 표시됩니다:
```
서버가 http://localhost:3000 에서 실행 중입니다.
```

## ✅ 확인 방법

브라우저에서 다음 URL을 열어보세요:
- http://localhost:3000/products

JSON 형식의 상품 데이터가 표시되면 성공입니다!

## 🔧 문제 해결

### "Cannot find module '@prisma/client'"
```bash
cd server
npm install
npx prisma generate
```

### "P1001: Can't reach database server"
- `.env` 파일의 `DATABASE_URL`이 올바른지 확인
- PostgreSQL 서버가 실행 중인지 확인

### "Port 3000 is already in use"
- 다른 프로그램이 포트 3000을 사용 중입니다
- `.env` 파일에서 `PORT=3001`로 변경하거나
- 사용 중인 프로세스를 종료하세요

