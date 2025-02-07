import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: '/bn',
  withCredentials: true, // HTTP-Only 쿠키 포함
});

// 마지막 인증 검증 시간을 저장
let lastValidationTime = 0;
const VALIDATION_INTERVAL = 1000 * 15; // 15초로 수정

//------------------------
// 요청 인터셉터 설정
//------------------------
api.interceptors.request.use(
  async (config) => {
    // 로그인 페이지나 회원가입 페이지 등 인증이 필요없는 경로는 제외
    const publicPaths = ['/#/login', '/#/join','/login','/bn/validate','/validate'];
    if (publicPaths.some(path => config.url.includes(path))) {
      return config;
    }

    const now = Date.now();
    // 마지막 검증 이후 5분이 지났을 때만 새로운 검증 요청
    if (now - lastValidationTime > VALIDATION_INTERVAL) {
      try {
        await axios.get('/bn/validate', {
          withCredentials: true
        });
        lastValidationTime = now;
        console.log("[정상-요청 인터셉터] 인증된 상태입니다");
      } catch (error) {
        console.log("[오류-요청 인터셉터] ", error);
        window.location.href = '/#/login';
        return Promise.reject('인증이 필요합니다.');
      }
    }

    return config;
  },
  (error) => {
    console.log("[오류-요청 인터셉터] ",error);
    window.location.href = '/#/login';
    return Promise.reject(error);
  }
);

//------------------------
// 응답 인터셉터 설정
//------------------------
api.interceptors.response.use(
  (response) => {
    if (response.data?.auth === false) {
      lastValidationTime = 0; // 인증 실패시 다음 요청에서 재검증하도록 초기화
      window.location.href = '/#/login';
      return Promise.reject('세션이 만료되었습니다.');
    }
    return response;
  },
  (error) => {
    if (error.response?.data?.expired === true) {
      lastValidationTime = 0; // 인증 실패시 다음 요청에서 재검증하도록 초기화
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

export default api; 