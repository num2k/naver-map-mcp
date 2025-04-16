import axios from "axios";
import {
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_GEOCODING_API_URL,
  NAVER_REVERSE_GEOCODING_API_URL,
  NAVER_DIRECTION5_API_URL,
  NAVER_DIRECTION15_API_URL,
} from "./config.js";
import {
  NaverGeocodeResponse,
  NaverReverseGeocodeResponse,
  DirectionOptions,
  NaverDirectionResponse,
} from "./types/naver-maps.js";

/**
 * 네이버 Geocoding API를 사용하여 주소를 검색하는 함수
 * @param query 검색할 주소 문자열
 * @param options 추가 검색 옵션
 * @returns API 응답 데이터
 */
export async function searchAddress(
  query: string,
  options: {
    coordinate?: string;
    filter?: string;
    page?: number;
    count?: number;
  } = {}
): Promise<NaverGeocodeResponse> {
  try {
    // API 호출을 위한 파라미터 구성
    const params = new URLSearchParams();
    params.append("query", query);

    if (options.coordinate) params.append("coordinate", options.coordinate);
    if (options.filter) params.append("filter", options.filter);
    if (options.page) params.append("page", options.page.toString());
    if (options.count) params.append("count", options.count.toString());

    // API 호출
    const response = await axios.get(NAVER_GEOCODING_API_URL, {
      params,
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`네이버 Geocoding API 에러: ${error.message}`);
      if (error.response) {
        console.error(`응답 상태 코드: ${error.response.status}`);
        console.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.error(`예상치 못한 에러: ${error}`);
    }

    // 에러가 발생해도 일관된 응답 형식을 유지하기 위한 기본 응답 객체
    return {
      status: "ERROR",
      meta: { totalCount: 0, page: 1, count: 0 },
      addresses: [],
      errorMessage:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 검색 결과를 읽기 쉬운 형식으로 포맷팅하는 함수
 * @param response 네이버 Geocoding API 응답 데이터
 * @returns 포맷팅된 문자열
 */
export function formatAddressResults(response: NaverGeocodeResponse): string {
  if (response.status !== "OK" || response.addresses.length === 0) {
    return response.errorMessage || "검색 결과가 없습니다.";
  }

  return response.addresses
    .map((address, index) => {
      return `[${index + 1}] ${address.roadAddress || address.jibunAddress}
도로명: ${address.roadAddress || "정보 없음"}
지번주소: ${address.jibunAddress || "정보 없음"}
영문주소: ${address.englishAddress || "정보 없음"}
좌표: 위도 ${address.y}, 경도 ${address.x}`;
    })
    .join("\n\n");
}

/**
 * 좌표를 주소로 변환하는 함수 (Reverse Geocoding)
 * @param coords 좌표(경도,위도)
 * @param options 추가 옵션
 * @returns API 응답 데이터
 */
export async function reverseGeocode(
  coords: string,
  options: {
    output?: "json" | "xml";
    orders?: string;
    lang?: "ko" | "en" | "ja" | "zh";
  } = {}
): Promise<NaverReverseGeocodeResponse> {
  try {
    // API 호출을 위한 파라미터 구성
    const params = new URLSearchParams();
    params.append("coords", coords);
    params.append("output", options.output || "json");

    if (options.orders) params.append("orders", options.orders);
    if (options.lang) params.append("lang", options.lang);

    // API 호출
    const response = await axios.get(NAVER_REVERSE_GEOCODING_API_URL, {
      params,
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`네이버 Reverse Geocoding API 에러: ${error.message}`);
      if (error.response) {
        console.error(`응답 상태 코드: ${error.response.status}`);
        console.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.error(`예상치 못한 에러: ${error}`);
    }

    // 에러 응답
    return {
      status: {
        code: -1,
        name: "ERROR",
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      results: [],
    };
  }
}

/**
 * 좌표를 주소로 변환한 결과를 읽기 쉬운 형식으로 포맷팅하는 함수
 * @param response Reverse Geocoding API 응답 데이터
 * @returns 포맷팅된 문자열
 */
export function formatReverseGeocodeResults(
  response: NaverReverseGeocodeResponse
): string {
  if (response.status.code !== 0 || response.results.length === 0) {
    return response.status.message || "검색 결과가 없습니다.";
  }

  return response.results
    .map((result, index) => {
      // 도로명 주소 생성
      let roadAddress = "";
      if (result.road && result.road.name) {
        roadAddress = `${result.region.area1.name} ${
          result.region.area2.name
        } ${result.road.name} ${result.road.number1}${
          result.road.number2 ? "-" + result.road.number2 : ""
        }`;
      }

      // 지번 주소 생성
      let jibunAddress = "";
      if (result.land) {
        jibunAddress = `${result.region.area1.name} ${
          result.region.area2.name
        } ${result.region.area3.name} ${result.land.number1}${
          result.land.number2 ? "-" + result.land.number2 : ""
        }`;
      }

      return `[${index + 1}] ${result.name || roadAddress || jibunAddress}
도로명: ${roadAddress || "정보 없음"}
지번주소: ${jibunAddress || "정보 없음"}
행정구역: ${result.region.area1.name} ${result.region.area2.name} ${
        result.region.area3.name
      } ${result.region.area4.name || ""}`;
    })
    .join("\n\n");
}

/**
 * 경로 검색 함수 (Direction5 API)
 * @param start 출발지 좌표(경도,위도)
 * @param goal 목적지 좌표(경도,위도)
 * @param waypoints 경유지 좌표들(선택적)
 * @param options 추가 옵션
 * @returns API 응답 데이터
 */
export async function getDirection5(
  start: string,
  goal: string,
  waypoints?: string,
  options: DirectionOptions = {}
): Promise<NaverDirectionResponse> {
  try {
    // API 호출을 위한 파라미터 구성
    const params = new URLSearchParams();
    params.append("start", start);
    params.append("goal", goal);

    if (waypoints) params.append("waypoints", waypoints);
    if (options.option) params.append("option", options.option);
    if (options.cartype) params.append("cartype", options.cartype.toString());
    if (options.fueltype) params.append("fueltype", options.fueltype);
    if (options.mileage) params.append("mileage", options.mileage.toString());
    if (options.lang) params.append("lang", options.lang);

    // API 호출
    const response = await axios.get(NAVER_DIRECTION5_API_URL, {
      params,
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`네이버 Direction5 API 에러: ${error.message}`);
      if (error.response) {
        console.error(`응답 상태 코드: ${error.response.status}`);
        console.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.error(`예상치 못한 에러: ${error}`);
    }

    // 에러 응답
    return {
      code: -1,
      message:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      currentDateTime: new Date().toISOString(),
      route: {},
    };
  }
}

/**
 * 경로 검색 함수 (Direction15 API, 최대 15개 경유지)
 * @param start 출발지 좌표(경도,위도)
 * @param goal 목적지 좌표(경도,위도)
 * @param waypoints 경유지 좌표들(선택적, 최대 15개)
 * @param options 추가 옵션
 * @returns API 응답 데이터
 */
export async function getDirection15(
  start: string,
  goal: string,
  waypoints?: string,
  options: DirectionOptions = {}
): Promise<NaverDirectionResponse> {
  try {
    // API 호출을 위한 파라미터 구성
    const params = new URLSearchParams();
    params.append("start", start);
    params.append("goal", goal);

    if (waypoints) params.append("waypoints", waypoints);
    if (options.option) params.append("option", options.option);
    if (options.cartype) params.append("cartype", options.cartype.toString());
    if (options.fueltype) params.append("fueltype", options.fueltype);
    if (options.mileage) params.append("mileage", options.mileage.toString());
    if (options.lang) params.append("lang", options.lang);

    // API 호출
    const response = await axios.get(NAVER_DIRECTION15_API_URL, {
      params,
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`네이버 Direction15 API 에러: ${error.message}`);
      if (error.response) {
        console.error(`응답 상태 코드: ${error.response.status}`);
        console.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      console.error(`예상치 못한 에러: ${error}`);
    }

    // 에러 응답
    return {
      code: -1,
      message:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      currentDateTime: new Date().toISOString(),
      route: {},
    };
  }
}

/**
 * Direction API 결과를 읽기 쉬운 형식으로 포맷팅하는 함수
 * @param response Direction API 응답 데이터
 * @returns 포맷팅된 문자열
 */
export function formatDirectionResults(
  response: NaverDirectionResponse
): string {
  if (response.code !== 0) {
    return `오류 발생: ${response.message || "경로를 찾을 수 없습니다."}`;
  }

  let result = `[경로 검색 결과]\n`;
  result += `검색 시각: ${response.currentDateTime}\n\n`;

  // 각 경로 옵션에 대한 결과 추가
  for (const [optionName, routes] of Object.entries(response.route)) {
    if (!routes || !routes.length) continue;

    const route = routes[0]; // 첫 번째 경로 정보 사용
    const { summary } = route;

    let optionText = "";
    switch (optionName) {
      case "trafast":
        optionText = "빠른길";
        break;
      case "tracomfort":
        optionText = "편한길";
        break;
      case "traoptimal":
        optionText = "최적경로";
        break;
      case "traavoidtoll":
        optionText = "무료경로";
        break;
      case "traavoidcaronly":
        optionText = "자동차전용도로 회피";
        break;
      default:
        optionText = optionName;
    }

    result += `[${optionText}]\n`;
    result += `총 거리: ${(summary.distance / 1000).toFixed(1)}km\n`;
    result += `예상 소요 시간: ${Math.round(summary.duration / 60000)}분\n`;
    result += `통행 요금: ${
      summary.tollFare > 0 ? summary.tollFare.toLocaleString() + "원" : "무료"
    }\n`;
    result += `예상 택시 요금: ${summary.taxiFare.toLocaleString()}원\n`;
    result += `예상 유류비: ${summary.fuelPrice.toLocaleString()}원\n\n`;

    // 주요 도로 구간 정보
    if (route.section && route.section.length) {
      result += `[주요 도로]\n`;
      route.section.forEach((section, index) => {
        result += `${index + 1}. ${section.name} (${(
          section.distance / 1000
        ).toFixed(1)}km)\n`;
      });
      result += "\n";
    }

    // 안내 정보 (출발, 도착, 주요 분기점)
    if (route.guide && route.guide.length) {
      const importantGuides = route.guide.filter(
        (g) => g.type === 1 || g.type === 2 || g.type === 3 || g.type === 88
      );

      if (importantGuides.length) {
        result += `[주요 안내]\n`;
        importantGuides.slice(0, 5).forEach((guide, index) => {
          result += `${index + 1}. ${guide.instructions}\n`;
        });
        if (importantGuides.length > 5) {
          result += `... 외 ${importantGuides.length - 5}개 지점\n`;
        }
      }
    }
  }

  return result;
}
