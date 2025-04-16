import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchAddress,
  formatAddressResults,
  reverseGeocode,
  formatReverseGeocodeResults,
  getDirection5,
  getDirection15,
  formatDirectionResults,
} from "./navermap-api.js";

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: "navermap-geocoding",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// 주소 검색 도구 등록
server.tool(
  "search-address",
  "네이버맵 Geocoding API를 사용하여 주소 검색",
  {
    query: z.string().describe("검색할 주소 문자열"),
    coordinate: z
      .string()
      .optional()
      .describe("기준 좌표 (예: 127.1054328,37.3595963)"),
    page: z.number().optional().describe("페이지 번호"),
    count: z.number().optional().describe("한 페이지에 표시할 검색 결과 개수"),
  },
  async ({ query, coordinate, page, count }) => {
    console.error(`주소 검색 요청: "${query}"`);

    const result = await searchAddress(query, {
      coordinate: coordinate,
      page: page,
      count: count,
    });

    const formattedResults = formatAddressResults(result);

    console.error(`검색 결과: ${result.meta.totalCount}개 항목 발견`);

    return {
      content: [
        {
          type: "text",
          text: formattedResults,
        },
      ],
    };
  }
);

// 좌표 -> 주소 변환 도구 등록 (Reverse Geocoding)
server.tool(
  "reverse-geocode",
  "네이버맵 Reverse Geocoding API를 사용하여 좌표를 주소로 변환",
  {
    coords: z.string().describe("좌표(경도,위도) 예: 127.1054328,37.3595963"),
    orders: z
      .string()
      .optional()
      .describe("결과 정렬 기준 (예: legalcode,admcode)"),
    lang: z
      .enum(["ko", "en", "ja", "zh"])
      .optional()
      .describe("응답 언어 (기본값: ko)"),
  },
  async ({ coords, orders, lang }) => {
    console.error(`좌표로 주소 검색 요청: "${coords}"`);

    const result = await reverseGeocode(coords, {
      orders,
      lang,
      output: "json",
    });

    const formattedResults = formatReverseGeocodeResults(result);

    console.error(`검색 결과: ${result.results.length}개 항목 발견`);

    return {
      content: [
        {
          type: "text",
          text: formattedResults,
        },
      ],
    };
  }
);

// 경로 검색 도구 등록 (Direction5)
server.tool(
  "direction5",
  "네이버맵 Direction5 API를 사용하여 경로 검색 (최대 5개 경유지)",
  {
    start: z
      .string()
      .describe("출발지 좌표(경도,위도) 예: 127.1054328,37.3595963"),
    goal: z
      .string()
      .describe("목적지 좌표(경도,위도) 예: 129.075986,35.179470"),
    waypoints: z
      .string()
      .optional()
      .describe("경유지 좌표 (최대 5개, '|'로 구분)"),
    option: z
      .enum([
        "trafast",
        "tracomfort",
        "traoptimal",
        "traavoidtoll",
        "traavoidcaronly",
      ])
      .optional()
      .describe("경로 옵션 (기본값: traoptimal)"),
    cartype: z
      .number()
      .min(1)
      .max(6)
      .optional()
      .describe("차량 타입 (1-6, 기본값: 1)"),
    fueltype: z
      .enum(["gasoline", "highgradegasoline", "diesel", "lpg"])
      .optional()
      .describe("연료 타입 (기본값: gasoline)"),
  },
  async ({ start, goal, waypoints, option, cartype, fueltype }) => {
    console.error(`경로 검색 요청: "${start}" -> "${goal}"`);

    const result = await getDirection5(start, goal, waypoints, {
      option,
      cartype,
      fueltype,
    });

    const formattedResults = formatDirectionResults(result);

    console.error(`경로 검색 완료: 코드 ${result.code}`);

    return {
      content: [
        {
          type: "text",
          text: formattedResults,
        },
      ],
    };
  }
);

// 경로 검색 도구 등록 (Direction15)
server.tool(
  "direction15",
  "네이버맵 Direction15 API를 사용하여 경로 검색 (최대 15개 경유지)",
  {
    start: z
      .string()
      .describe("출발지 좌표(경도,위도) 예: 127.1054328,37.3595963"),
    goal: z
      .string()
      .describe("목적지 좌표(경도,위도) 예: 129.075986,35.179470"),
    waypoints: z
      .string()
      .optional()
      .describe("경유지 좌표 (최대 15개, '|'로 구분)"),
    option: z
      .enum([
        "trafast",
        "tracomfort",
        "traoptimal",
        "traavoidtoll",
        "traavoidcaronly",
      ])
      .optional()
      .describe("경로 옵션 (기본값: traoptimal)"),
    cartype: z
      .number()
      .min(1)
      .max(6)
      .optional()
      .describe("차량 타입 (1-6, 기본값: 1)"),
    fueltype: z
      .enum(["gasoline", "highgradegasoline", "diesel", "lpg"])
      .optional()
      .describe("연료 타입 (기본값: gasoline)"),
  },
  async ({ start, goal, waypoints, option, cartype, fueltype }) => {
    console.error(`경로 검색 요청(15): "${start}" -> "${goal}"`);

    const result = await getDirection15(start, goal, waypoints, {
      option,
      cartype,
      fueltype,
    });

    const formattedResults = formatDirectionResults(result);

    console.error(`경로 검색 완료: 코드 ${result.code}`);

    return {
      content: [
        {
          type: "text",
          text: formattedResults,
        },
      ],
    };
  }
);

// 메인 함수
async function main() {
  try {
    // 표준 입출력을 통한 서버 전송 설정
    const transport = new StdioServerTransport();

    // 서버 연결
    await server.connect(transport);

    console.error("네이버맵 MCP 서버가 실행되었습니다");
    console.error("CTRL+C를 눌러 서버를 종료할 수 있습니다");
  } catch (error) {
    console.error("서버 실행 중 오류 발생:", error);
    process.exit(1);
  }
}

// 서버 시작
main().catch((error) => {
  console.error("서버 실행 중 예기치 못한 오류가 발생했습니다:", error);
  process.exit(1);
});
