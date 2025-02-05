import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/bn' 
  : 'http://localhost:8095';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: '/bn',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // HTTP-Only 쿠키 포함
});

// ------------------------
// 요청 인터셉터 설정
// ------------------------
api.interceptors.request.use(
  async (config) => {
    // 인증이 필요없는 경로들
    const publicPaths = ['/login', '/join', '/validate'];
    if (publicPaths.some(path => config.url.includes(path))) {
      return config;
    }

    const token = localStorage.getItem('accesstoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      // 토큰 유효성 검증
      await api.get('/validate');
      console.log("[정상-요청 인터셉터] 인증된 상태입니다");
      return config;
    } catch (error) {
      console.log("[오류-요청 인터셉터] ", error);
      window.location.href = '/#/login';
      return Promise.reject('인증이 필요합니다.');
    }
  },
  (error) => {
    console.log("[오류-요청 인터셉터] ", error);
    window.location.href = '/#/login';
    return Promise.reject(error);
  }
);

// //------------------------
// // 응답 인터셉터 설정
// //------------------------
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     console.log("[오류-응답 인터셉터] ", error);
//     if (error.response?.status === 401) {
//       window.location.href = '/#/login';
//     }
//     return Promise.reject(error);
//   }
// );



export default api; 