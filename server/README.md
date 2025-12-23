# 백엔드 서버 설정 가이드

## 1. 의존성 설치

```bash
cd server
npm install
```

## 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 데이터베이스 연결 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일을 열어서 `DATABASE_URL`을 실제 데이터베이스 연결 정보로 수정하세요:

```
DATABASE_URL="postgresql://사용자명:비밀번호@localhost:5432/데이터베이스명?schema=public"
```

예시:
- PostgreSQL: `postgresql://postgres:password@localhost:5432/mydb?schema=public`
- MySQL: `mysql://user:password@localhost:3306/mydb`
- SQLite: `file:./dev.db`

## 3. Prisma 마이그레이션

데이터베이스 스키마를 생성/업데이트합니다:

```bash
npx prisma migrate dev --name init
```

또는 기존 데이터베이스가 있다면:

```bash
npx prisma db push
```

## 4. Prisma Client 생성

```bash
npx prisma generate
```

## 5. 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### GET /products
상품 목록 조회

쿼리 파라미터:
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 페이지 크기 (기본값: 10)
- `orderBy`: 정렬 기준 (recent, oldest, price_asc, price_desc)
- `keyword`: 검색 키워드

### POST /products
상품 생성

요청 본문:
```json
{
  "name": "상품명",
  "description": "상품 설명",
  "category": "FASHION",
  "price": 10000,
  "stock": 10
}
```

