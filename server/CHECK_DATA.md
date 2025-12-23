# 데이터 확인 가이드

## 문제: 데이터가 0개로 나옴

데이터가 0개로 나오는 경우 다음을 확인하세요:

## 1. 백엔드 서버 콘솔 로그 확인

백엔드 서버 터미널에서 다음 로그를 확인하세요:

```
🔍 [Backend] Query params: { page: 1, pageSize: 10, orderBy: 'recent', keyword: '' }
📊 [Backend] Total count: 0  ← 이 값이 0이면 DB에 데이터가 없음
📦 [Backend] Found products: 0
```

## 2. 데이터베이스에 데이터가 있는지 확인

### 방법 1: Prisma Studio 사용
```bash
cd server
npx prisma studio
```

브라우저에서 `http://localhost:5555`가 열리면 `Product` 테이블을 확인하세요.

### 방법 2: 직접 SQL 쿼리
PostgreSQL에 접속하여:
```sql
SELECT COUNT(*) FROM "Product";
```

## 3. 테스트 데이터 추가하기

### 방법 1: Prisma Studio에서 직접 추가
1. `npx prisma studio` 실행
2. `Product` 테이블 클릭
3. "Add record" 버튼 클릭
4. 데이터 입력:
   - name: "테스트 상품"
   - category: FASHION (드롭다운에서 선택)
   - price: 10000
   - stock: 10
   - description: "테스트 설명" (선택사항)

### 방법 2: API를 통해 추가
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 상품",
    "category": "FASHION",
    "price": 10000,
    "stock": 10,
    "description": "테스트 설명"
  }'
```

### 방법 3: React 앱의 등록 페이지 사용
1. `http://localhost:5173/registration` 접속
2. 상품 정보 입력 후 등록

## 4. 스키마와 DB 동기화 확인

스키마가 변경되었다면:
```bash
cd server
npx prisma db push
npx prisma generate
```

## 5. 데이터베이스 연결 확인

`.env` 파일의 `DATABASE_URL`이 올바른지 확인:
```
DATABASE_URL="postgresql://사용자명:비밀번호@localhost:5432/데이터베이스명?schema=public"
```

## 6. 테이블 이름 확인

Prisma 스키마에서 `@@map("products")`가 있다면 실제 테이블 이름이 `products`일 수 있습니다.
현재 스키마는 `Product` 모델이므로 기본적으로 `Product` 테이블을 사용합니다.

