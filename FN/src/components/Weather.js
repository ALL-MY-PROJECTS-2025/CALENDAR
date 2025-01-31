import React, { useState, useEffect } from "react";
import "./css/Weather.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

//------------------------------------------------------------------------
// 날씨 정보 가져오기 - 초단기 실황조회
//------------------------------------------------------------------------
const fetchWeatherInfo_Ultra = async (latitude, longitude) => {
  // 현재 날짜와 시간을 가져와서 포맷
  const now = new Date();

  // 가능한 base_time 목록 (30분 단위로 설정)
  const availableTimes = [
    "0200",
    "0500",
    "0800",
    "1100",
    "1400",
    "1700",
    "2000",
    "2300",
  ];

  let baseDate = new Date(now);
  let baseTime = `${String(now.getHours()).padStart(2, "0")}${String(
    Math.floor(now.getMinutes() / 10) * 10
  ).padStart(2, "0")}`;

  // 주어진 `availableTimes` 중 가장 가까운 이전 시간 찾기
  for (let i = availableTimes.length - 1; i >= 0; i--) {
    if (baseTime >= availableTimes[i]) {
      baseTime = availableTimes[i];
      break;
    }
  }

  // 자정 이전의 경우 날짜 조정
  if (baseTime === "2300" && now.getHours() < 2) {
    baseDate.setDate(baseDate.getDate() - 1);
  }

  // base_date 포맷: YYYYMMDD
  const formattedDate = `${baseDate.getFullYear()}${String(
    baseDate.getMonth() + 1
  ).padStart(2, "0")}${String(baseDate.getDate()).padStart(2, "0")}`;

  const gridCoords = dfs_xy_conv("toXY", latitude, longitude);
  console.log(
    `baseDate : ${formattedDate} base_time : ${baseTime} 격자 좌표: x=${gridCoords.x}, y=${gridCoords.y}`
  );

  try {
    const resp = await axios.get(
      `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`,
      {
        params: {
          ServiceKey:
            "xYZ80mMcU8S57mCCY/q8sRsk7o7G8NtnfnK7mVEuVxdtozrl0skuhvNf34epviHrru/jiRQ41FokE9H4lK0Hhg==",
          pageNo: 1,
          numOfRows: 100,
          dataType: "JSON",
          base_date: formattedDate,
          base_time: baseTime,
          nx: gridCoords.x,
          ny: gridCoords.y,
        },
      }
    );
    return resp;
  } catch (error) {
    console.error("날씨 정보를 가져오는 데 실패했습니다:", error);
    return null;
  }
};
//날씨정보
function dfs_xy_conv(code, v1, v2) {
  //<!--
  //
  // LCC DFS 좌표변환을 위한 기초 자료
  //
  var RE = 6371.00877; // 지구 반경(km)
  var GRID = 5.0; // 격자 간격(km)
  var SLAT1 = 30.0; // 투영 위도1(degree)
  var SLAT2 = 60.0; // 투영 위도2(degree)
  var OLON = 126.0; // 기준점 경도(degree)
  var OLAT = 38.0; // 기준점 위도(degree)
  var XO = 43; // 기준점 X좌표(GRID)
  var YO = 136; // 기1준점 Y좌표(GRID)
  //
  // LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
  //

  var DEGRAD = Math.PI / 180.0;
  var RADDEG = 180.0 / Math.PI;

  var re = RE / GRID;
  var slat1 = SLAT1 * DEGRAD;
  var slat2 = SLAT2 * DEGRAD;
  var olon = OLON * DEGRAD;
  var olat = OLAT * DEGRAD;

  var sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  var rs = {};
  if (code == "toXY") {
    rs["lat"] = v1;
    rs["lng"] = v2;
    var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs["x"] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs["y"] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  } else {
    rs["x"] = v1;
    rs["y"] = v2;
    var xn = v1 - XO;
    var yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) ra = -ra;
    var alat = Math.pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) theta = -theta;
      } else theta = Math.atan2(xn, yn);
    }
    var alon = theta / sn + olon;
    rs["lat"] = alat * RADDEG;
    rs["lng"] = alon * RADDEG;
  }
  return rs;
}

//------------------------------------------------------------------------
// 날씨 정보 가져오기 - 날씨 방향 처리
//------------------------------------------------------------------------
// 바람 방향 계산 함수(UUU, VVV) - 16방위 변환
const calculateWindDirection = (uuu, vvv) => {
  console.log("uuu", uuu, "vvv", vvv);
  const angle = (270 - Math.atan2(vvv, uuu) * (180 / Math.PI) + 360) % 360;

  console.log("angle", angle);
  const index = Math.floor((angle + 22.5 * 0.5) / 22.5);
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
    "N",
  ];
  return directions[index];
};

//오늘날씨
//PTY (초단기) 없음(0), 비(1), 비/눈(2), 눈(3),소나기(4) , 빗방울(5), 빗방울눈날림(6), 눈날림(7)

const PTY_LIST = [
  { icon: "sunny", text: "맑음", color: "" },
  { icon: "rainy", text: "비", color: "gray" },
  { icon: "rainy_snow", text: "비/눈", color: "" },
  { icon: "snowing", text: "눈", color: "white" },
  { icon: "rainy_light", text: "소나기", color: "" },
  { icon: "water_drop", text: "빗방울", color: "" },
  { icon: "weather_mix", text: "빗방울/눈날림", color: "" },
  { icon: "snowing_heavy", text: "눈날림", color: "" },
];

//
//
//
const Weather = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // ✅ 위치 정보 가져오기
  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) {
        setError("브라우저에서 위치 정보를 지원하지 않습니다.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError(error.message);
        }
      );
    };

    getLocation();
  }, []);

  // ✅ location이 변경된 후 날씨 데이터 요청하기
  useEffect(() => {
    if (location.lat !== null && location.lng !== null) {
      const getWeather = async () => {
        try {
          const resp = await fetchWeatherInfo_Ultra(location.lat, location.lng);

          setWeatherData(resp?.data?.response?.body?.items || { item: [] });
        } catch (error) {
          console.error("날씨 정보를 가져오는 데 실패했습니다:", error);
        }
      };

      getWeather();
    }
  }, [location]); // 🚀 location이 변경될 때마다 실행

  // ✅ 데이터 로딩 상태 처리
  if (!weatherData || !weatherData.item || weatherData.item.length === 0) {
    return (
      <>
        <div className="weather-block">
          <div className="items">
            <div className="item">
              <div>
                {/* icon */}
                <div className="icon">
                  <span className="material-symbols-outlined ">
                    🎁
                  </span>
                  <div className="obsrValue">
                  <span>-</span>
                </div>
                </div>
                <div className="obsrValue">
               
                  <span></span>
                </div>
              </div>
            </div>

            {/*  */}
            <div className="item">
              <div>
                {/* icon */}
                <div className="icon">
                  <span className="material-symbols-outlined ">
                    🎈
                  </span>
                </div>
                {/* data */}
                <div className="obsrValue">
                  <span>-</span>
                </div>
              </div>
            </div>

            {/*  */}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="weather-block">
      <div className="items">
        <div className="item">
          <div>
            {/* icon */}
            <div className="icon">
              <span className="material-symbols-outlined ">
                {PTY_LIST[Number(weatherData.item[0].obsrValue)].icon}
              </span>
            </div>

            {/* data */}

            <div className="obsrValue">
              {/* 
              <span>
                {PTY_LIST[Number(weatherData.item[0].obsrValue)].text}
              </span> 
              */}
              <span>{weatherData.item[3].obsrValue} ℃</span>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="item">
          <div>
            {/* icon */}
            <div className="icon">
              <span className="material-symbols-outlined ">humidity_low</span>
            </div>
            {/* data */}
            <div className="obsrValue">
              <span>{weatherData.item[1].obsrValue} %</span>
            </div>
          </div>
        </div>

        {/*  */}
      </div>
    </div>
  );
};

export default Weather;
