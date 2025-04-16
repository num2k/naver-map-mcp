# 네이버맵 MCP 서버

Claude Desktop에서 사용할 수 있는 네이버맵 API(Geocoding, Reverse Geocoding, Direction5, Direction15, Static Map, Dynamic Map)를 활용한 MCP 서버입니다.

## 기능

- 네이버맵 Geocoding API를 사용하여 주소 검색
- 네이버맵 Reverse Geocoding API를 사용하여 좌표를 주소로 변환
- 네이버맵 Direction5 API를 사용하여 경로 검색 (최대 5개 경유지)
- 네이버맵 Direction15 API를 사용하여 경로 검색 (최대 15개 경유지)
- Claude Desktop과 통합하여 대화 내에서 위 기능들 모두 사용

## 설정 방법

1. 네이버 개발자 센터(https://developers.naver.com) 또는 네이버 클라우드 플랫폼에서 애플리케이션을 등록하고 클라이언트 ID와 시크릿을 발급받습니다.

2. 아래 세 가지 방법 중 하나를 선택해 API 키를 설정할 수 있습니다:

### 방법 1: Claude Desktop 설정 파일에서 직접 커맨드 라인 인자로 전달

`%AppData%\Claude\claude_desktop_config.json` 파일(Windows) 또는 `~/Library/Application Support/Claude/claude_desktop_config.json` 파일(Mac)을 열고 다음과 같이 수정합니다:

```json
{
  "mcpServers": {
    "navermap-mcp": {
      "command": "node",
      "args": [
        "설치경로/dist/index.js",
        "--clientId=발급받은_클라이언트_ID",
        "--clientSecret=발급받은_클라이언트_시크릿"
      ]
    }
  }
}
```

### 방법 2: 환경 변수로 설정

시스템의 환경 변수를 사용해 API 키를 설정할 수 있습니다. 이 방법은 여러 스크립트에서 동일한 키를 사용할 때 유용합니다.

Windows에서는 명령 프롬프트에서:

```cmd
set NAVER_CLIENT_ID=발급받은_클라이언트_ID
set NAVER_CLIENT_SECRET=발급받은_클라이언트_시크릿
```

Mac/Linux에서는 터미널에서:

```bash
export NAVER_CLIENT_ID=발급받은_클라이언트_ID
export NAVER_CLIENT_SECRET=발급받은_클라이언트_시크릿
```

그런 다음 Claude Desktop 설정 파일은 다음과 같이 작성합니다:

```json
{
  "mcpServers": {
    "navermap-mcp": {
      "command": "node",
      "args": ["설치경로/dist/index.js"],
      "env": {
        "NAVER_CLIENT_ID": "발급받은_클라이언트_ID",
        "NAVER_CLIENT_SECRET": "발급받은_클라이언트_시크릿"
      }
    }
  }
}
```

### 방법 3: 시작 스크립트 작성

시작 스크립트를 만들어 환경 변수를 설정하고 MCP 서버를 실행할 수 있습니다.

Windows용 시작 스크립트 예시 (`start-mcp.bat`):

```batch
@echo off
set NAVER_CLIENT_ID=발급받은_클라이언트_ID
set NAVER_CLIENT_SECRET=발급받은_클라이언트_시크릿
node 설치경로/dist/index.js
```

Mac/Linux용 시작 스크립트 예시 (`start-mcp.sh`):

```bash
#!/bin/bash
export NAVER_CLIENT_ID=발급받은_클라이언트_ID
export NAVER_CLIENT_SECRET=발급받은_클라이언트_시크릿
node 설치경로/dist/index.js
```

그런 다음 Claude Desktop 설정 파일은 다음과 같이 작성합니다:

```json
{
  "mcpServers": {
    "navermap-mcp": {
      "command": "설치경로/start-mcp.bat" // Windows
      // 또는
      // "command": "설치경로/start-mcp.sh"  // Mac/Linux
    }
  }
}
```

Mac/Linux에서는 시작 스크립트에 실행 권한을 부여해야 합니다:

```bash
chmod +x 설치경로/start-mcp.sh
```

3. Claude Desktop을 재시작합니다.

## 사용 방법

Claude와 대화 중에 다음과 같은 형식으로 서비스를 요청할 수 있습니다:

### 주소 검색 (Geocoding API)

- "서울특별시 강남구 테헤란로 검색해줘"
- "부산광역시 해운대구의 좌표가 어떻게 되나요?"
- "대전광역시 유성구 대학로 검색"

### 좌표를 주소로 변환 (Reverse Geocoding API)

- "127.1058342,37.3597080 좌표의 주소 알려줘"
- "위도 37.5666103, 경도 126.9783882 위치가 어디야?"
- "이 좌표(129.075986,35.179470)의 주소 정보 알려줘"

### 경로 검색 (Direction5/15 API)

- "서울에서 부산까지 가는 길 알려줘"
- "출발지(127.1058342,37.3597080)에서 도착지(129.075986,35.179470)까지 경로 검색"
- "서울→대전→대구→부산 경로로 가는 길 찾아줘"
- "강남역에서 광화문까지 가는 최적 경로 찾기"

## 개발 환경

- Node.js
- TypeScript
- MCP SDK
- 네이버맵 API (Geocoding, Reverse Geocoding, Direction5, Direction15)

## 라이선스

- MIT
