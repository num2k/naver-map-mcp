/**
 * 네이버 지도 API 관련 타입 정의
 */

/**
 * 네이버 Geocoding API 응답 타입 정의
 */
export interface NaverGeocodeResponse {
  status: string;
  meta: {
    totalCount: number;
    page: number;
    count: number;
  };
  addresses: Array<{
    roadAddress: string;
    jibunAddress: string;
    englishAddress: string;
    addressElements: Array<{
      types: string[];
      longName: string;
      shortName: string;
      code: string;
    }>;
    x: string; // 경도
    y: string; // 위도
    distance: number;
  }>;
  errorMessage?: string;
}

/**
 * Reverse Geocoding API 응답 타입 정의
 */
export interface NaverReverseGeocodeResponse {
  status: {
    code: number;
    name: string;
    message: string;
  };
  results: Array<{
    name: string;
    code: {
      id: string;
      type: string;
      mappingId: string;
    };
    region: {
      area0: {
        name: string;
        coords: {
          center: {
            crs: string;
            x: number;
            y: number;
          };
        };
      };
      area1: {
        name: string;
        coords: {
          center: {
            crs: string;
            x: number;
            y: number;
          };
        };
        alias?: string;
      };
      area2: {
        name: string;
        coords: {
          center: {
            crs: string;
            x: number;
            y: number;
          };
        };
      };
      area3: {
        name: string;
        coords: {
          center: {
            crs: string;
            x: number;
            y: number;
          };
        };
      };
      area4: {
        name: string;
        coords: {
          center: {
            crs: string;
            x: number;
            y: number;
          };
        };
      };
    };
    land: {
      type: string;
      number1: string;
      number2: string;
      addition0: {
        type: string;
        value: string;
      };
      addition1: {
        type: string;
        value: string;
      };
      addition2: {
        type: string;
        value: string;
      };
      addition3: {
        type: string;
        value: string;
      };
      addition4: {
        type: string;
        value: string;
      };
      name: string;
    };
    road: {
      name: string;
      region: {
        area1: {
          name: string;
        };
        area2: {
          name: string;
        };
        area3: {
          name: string;
        };
        area4: {
          name: string;
        };
      };
      number1: string;
      number2: string;
    };
  }>;
}

/**
 * Direction API 옵션 타입 정의
 */
export interface DirectionOptions {
  option?:
    | "trafast"
    | "tracomfort"
    | "traoptimal"
    | "traavoidtoll"
    | "traavoidcaronly";
  cartype?: number;
  fueltype?: "gasoline" | "highgradegasoline" | "diesel" | "lpg";
  mileage?: number;
  lang?: "ko" | "en" | "ja" | "zh";
}

/**
 * Direction API 응답 타입 정의
 */
export interface NaverDirectionResponse {
  code: number;
  message: string;
  currentDateTime: string;
  route: {
    [option: string]: Array<{
      summary: {
        start: {
          location: number[];
        };
        goal: {
          location: number[];
          dir?: number;
        };
        distance: number;
        duration: number;
        departureTime: string;
        bbox: number[][];
        tollFare: number;
        taxiFare: number;
        fuelPrice: number;
      };
      path: number[][];
      section: Array<{
        pointIndex: number;
        pointCount: number;
        distance: number;
        name: string;
        congestion: number;
        speed: number;
      }>;
      guide: Array<{
        pointIndex: number;
        type: number;
        instructions: string;
        distance: number;
        duration: number;
      }>;
    }>;
  };
}
