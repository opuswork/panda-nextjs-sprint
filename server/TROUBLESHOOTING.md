# 연결 오류 해결 가이드

## 에러: "The connection was rejected"

이 에러는 VS Code의 HTTP 파일(`products.http`)에서 API 요청을 보낼 때 발생합니다.

## 원인 및 해결 방법

### 1. 백엔드 서버가 실행되지 않음 (가장 흔한 원인)

**확인 방법:**
- 터미널에서 백엔드 서버가 실행 중인지 확인
- 다음 메시지가 보여야 합니다:
  ```
  서버가 http://localhost:3000 에서 실행 중입니다.
  ```

**해결 방법:**
```bash
cd server
npm run dev
```

### 2. 포트가 다름

**확인 방법:**
- `server/.env` 파일에서 `PORT` 값 확인
- 기본값은 3000입니다

**해결 방법:**
- `products.http` 파일의 포트를 `.env`의 `PORT` 값과 일치시키기
- 또는 `.env`에서 `PORT=3000`으로 설정

### 3. 서버가 다른 주소에서 실행 중

**확인 방법:**
- 서버 콘솔에서 실제 실행 주소 확인
- 예: `서버가 http://0.0.0.0:3000 에서 실행 중입니다.`

**해결 방법:**
- `products.http` 파일의 URL을 실제 서버 주소로 변경

### 4. 방화벽 또는 프록시 설정 문제

**해결 방법:**
- VS Code 설정에서 프록시 설정 확인
- 방화벽에서 포트 3000이 차단되지 않았는지 확인

## 빠른 확인 방법

### 브라우저에서 직접 테스트
브라우저에서 다음 URL을 열어보세요:
```
http://localhost:3000/products
```

- JSON 데이터가 보이면 → 서버는 정상 작동, VS Code HTTP 파일 문제
- 연결 오류가 나면 → 서버가 실행되지 않음

### 터미널에서 curl 테스트
```bash
curl http://localhost:3000/products
```

- 데이터가 나오면 → 서버 정상
- "Connection refused" 에러 → 서버 미실행

## 단계별 해결

1. **백엔드 서버 실행 확인**
   ```bash
   cd server
   npm run dev
   ```

2. **서버가 실행되면 터미널에 다음 메시지 표시:**
   ```
   서버가 http://localhost:3000 에서 실행 중입니다.
   ```

3. **VS Code HTTP 파일에서 다시 요청 보내기**
   - `products.http` 파일에서 "Send Request" 클릭
   - 또는 `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **여전히 안 되면 브라우저에서 테스트**
   - `http://localhost:3000/products` 접속
   - 이것도 안 되면 서버 코드에 문제가 있을 수 있음

