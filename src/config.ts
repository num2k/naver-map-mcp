// 네이버 API 클라이언트 ID와 시크릿
// 우선순위: 1. 커맨드 라인 인자, 2. 환경 변수

// 커맨드 라인 인자에서 값 가져오기
const getArgValue = (argName: string): string | undefined => {
  const args = process.argv.slice(2);
  const argIndex = args.findIndex((arg) => arg.startsWith(`--${argName}=`));

  if (argIndex !== -1) {
    const value = args[argIndex].split("=")[1];
    return value;
  }

  return undefined;
};

// 커맨드 라인 인자 또는 환경 변수에서 API 키 가져오기
export const NAVER_CLIENT_ID =
  getArgValue("clientId") || process.env.NAVER_CLIENT_ID || "";

export const NAVER_CLIENT_SECRET =
  getArgValue("clientSecret") || process.env.NAVER_CLIENT_SECRET || "";

// 서버 시작 시 키 정보 출력 (디버깅용, 실제 배포 시 주석 처리 권장)
console.error(
  `API 키 정보 로드됨 (clientId: ${NAVER_CLIENT_ID.substring(0, 4)}...)`
);

// 네이버맵 API URL
export const NAVER_GEOCODING_API_URL =
  "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
export const NAVER_REVERSE_GEOCODING_API_URL =
  "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc";
export const NAVER_DIRECTION5_API_URL =
  "https://maps.apigw.ntruss.com/map-direction/v1/driving";
export const NAVER_DIRECTION15_API_URL =
  "https://maps.apigw.ntruss.com/map-direction-15/v1/driving";
