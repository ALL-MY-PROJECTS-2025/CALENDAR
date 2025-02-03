import React, { useState, useEffect } from "react";
import "./css/Weather.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

//------------------------------------------------------------------------
// 날씨 정보 가져오기 - 초단기 실황조회
//------------------------------------------------------------------------
const fetchWeatherInfo_Ultra = async (nx,ny) => {
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

  console.log(
    `baseDate : ${formattedDate} base_time : ${baseTime} 격자 좌표: x=${nx}, y=${ny}`
  );

  try {
    const resp = await axios.get(
      `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`,
      {
        params: {
          ServiceKey:
            "xYZ80mMcU8S57mCCY/q8sRsk7o7G8NtnfnK7mVEuVxdtozrl0skuhvNf34epviHrru/jiRQ41FokE9H4lK0Hhg==", // 실제 API 키로 교체
          pageNo: 1,
          numOfRows: 100,
          dataType: "JSON",
          base_date: formattedDate,
          base_time: baseTime,
          nx: nx,
          ny: ny,
        },
      }
    );

    if (resp.data && resp.data.response && resp.data.response.body) {
      console.log('기상청 API 응답:', resp.data);
      return resp;
    } else {
      console.error('기상청 API 응답 형식이 올바르지 않습니다:', resp.data);
      return null;
    }
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
const Weather = ({ location }) => {
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [dustData, setDustData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  // 미세먼지 등급 판정
  const getDustGrade = (value) => {
    if (value <= 30) return '좋음';
    if (value <= 80) return '보통';
    if (value <= 150) return '나쁨';
    return '매우나쁨';
  };

  // 미세먼지 등급별 색상 반환 함수 추가
  const getDustGradeColor = (value) => {
    if (value <= 30) return '#32A1FF';  // 좋음 - 파란색
    if (value <= 80) return '#00C73C';  // 보통 - 초록색
    if (value <= 150) return '#FD9B5A'; // 나쁨 - 주황색
    return '#FF5959';                   // 매우나쁨 - 빨간색
  };

  // 시도명 추출 함수 추가
  const extractSidoName = (address) => {
    // 특별시, 광역시, 특별자치시, 도, 특별자치도 처리
    const sidoPatterns = {
      '서울': '서울',
      '부산': '부산',
      '대구': '대구',
      '인천': '인천',
      '광주': '광주',
      '대전': '대전',
      '울산': '울산',
      '세종': '세종',
      '경기': '경기',
      '강원': '강원',
      '충북': '충북',
      '충남': '충남',
      '전북': '전북',
      '전남': '전남',
      '경북': '경북',
      '경남': '경남',
      '제주': '제주'
    };

    // 입력된 주소에서 시도명 찾기
    for (const [key, value] of Object.entries(sidoPatterns)) {
      if (address.includes(key)) {
        return value;
      }
    }
    return null;
  };

  // 미세먼지 정보 가져오기
  const fetchDustInfo = async () => {
    if (!location) return;
    
    const serviceKey = 'xYZ80mMcU8S57mCCY/q8sRsk7o7G8NtnfnK7mVEuVxdtozrl0skuhvNf34epviHrru/jiRQ41FokE9H4lK0Hhg==';
    try {
      // 주소에서 시도 정보 추출
      const sidoName = extractSidoName(location);
      if (!sidoName) {
        console.error('올바른 시도 정보를 찾을 수 없습니다.');
        return;
      }
      
      console.log('미세먼지 검색 지역:', sidoName);

      const response = await axios.get(
        'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty',
        {
          params: {
            serviceKey,
            returnType: 'json',
            numOfRows: 100,
            pageNo: 1,
            sidoName: sidoName,
            ver: '1.0'
          }
        }
      );

      console.log('미세먼지 API 응답:', response.data);

      if (response.data?.response?.body?.items) {
        // 구/군 정보로 필터링
        const guName = location.split(' ')[1]?.replace(/구$/, ''); // '구' 제거
        let dustData = null;

        if (guName) {
          // 정확한 구/군 매칭
          dustData = response.data.response.body.items.find(
            item => item.stationName.includes(guName)
          );
        }
        
        // 매칭되는 구/군 데이터가 없으면 해당 시도의 첫 번째 측정소 데이터 사용
        if (!dustData) {
          dustData = response.data.response.body.items[0];
          console.log('해당 구의 미세먼지 정보가 없어 가장 가까운 측정소 데이터를 사용합니다.');
        }

        console.log('선택된 미세먼지 정보:', {
          측정소: dustData.stationName,
          미세먼지: dustData.pm10Value,
          시도: sidoName,
          구군: guName || '없음'
        });
        
        if (dustData.pm10Value && dustData.pm10Value !== '-') {
          setDustData({
            pm10Value: dustData.pm10Value
          });
        } else {
          console.log('유효한 미세먼지 데이터가 없습니다.');
          setDustData(null);
        }
      }
    } catch (error) {
      console.error('미세먼지 정보 가져오기 실패:', error);
      setDustData(null);
    }
  };

  // 주소를 좌표로 변환하는 함수
  const getCoordinatesFromAddress = async (address) => {
    try {
      // 주소에서 기본 주소만 추출 (시/구 까지만)
      const baseAddress = address.split(' ').slice(0, 2).join(' ');
      console.log('📍 변환할 주소:', baseAddress);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(baseAddress)}&limit=1&accept-language=ko`,
        {
          headers: {
            'User-Agent': 'Calendar App'
          }
        }
      );
      const data = await response.json();
      console.log("data ", data);
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        console.log('📍 Nominatim 좌표:', { lat, lon });
        
        const gridCoords = dfs_xy_conv('toXY', parseFloat(lat), parseFloat(lon));
        console.log('📍 기상청 격자 좌표:', {
          x: gridCoords.x,
          y: gridCoords.y,
          입력주소: baseAddress, // 기본 주소로 변경
          원본주소: address,    // 원본 주소도 함께 로깅
          위도: lat,
          경도: lon,
          상세주소: data[0].display_name
        });
        
        setCoordinates(gridCoords);
        return gridCoords;
      }
      return null;
    } catch (error) {
      console.error('주소 변환 실패:', error);
      return null;
    }
  };

  // location이 변경될 때마다 날씨 정보 업데이트
  useEffect(() => {
    const updateWeather = async () => {
      if (!location) return;

      const coords = await getCoordinatesFromAddress(location);
      if (coords) {
        try {
          const weatherResponse = await fetchWeatherInfo_Ultra(coords.x, coords.y);
          if (weatherResponse && weatherResponse.data && 
              weatherResponse.data.response && 
              weatherResponse.data.response.body) {
            setWeatherData(weatherResponse.data.response.body.items);
            console.log('날씨 정보:', weatherResponse.data.response.body.items);
          } else {
            console.error('날씨 데이터 형식이 올바르지 않습니다:', weatherResponse);
            setWeatherData(null);
          }
          await fetchDustInfo();
        } catch (error) {
          console.error('날씨 정보 업데이트 실패:', error);
          setWeatherData(null);
        }
      }
    };

    updateWeather();
  }, [location]);

  if (!weatherData) {
    return (
      <div className="weather-loading-container weather-block">
        <div className="loading-wrapper">
          <div className="spinner-container">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <div className="loading-text">WEATHER LOADING...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-block">
      <div className="items">
        <div className="item">
          <div>
            <div className="icon">
              <span className="material-symbols-outlined">
                {PTY_LIST[Number(weatherData.item[0].obsrValue)].icon}
              </span>
            </div>
            <div className="obsrValue">
              <span>{weatherData.item[3].obsrValue} ℃</span>
            </div>
          </div>
        </div>

        <div className="item">
          <div>
            <div className="icon">
              <span className="material-symbols-outlined">humidity_low</span>
            </div>
            <div className="obsrValue">
              <span>{weatherData.item[1].obsrValue} %</span>
            </div>
          </div>
        </div>

        <div className="item">
          <div>
            <div className="icon">
              <span className="material-symbols-outlined">air</span>
            </div>
            <div className="obsrValue">
              {dustData ? (
                <span style={{ color: getDustGradeColor(parseInt(dustData.pm10Value)) }}>
                  {getDustGrade(parseInt(dustData.pm10Value))}
                </span>
              ) : (
                <span>--</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;