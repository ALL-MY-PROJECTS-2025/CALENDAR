import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: '/bn',
  withCredentials: true, // HTTP-Only 쿠키 포함
});

//------------------------
// 요청 인터셉터 설정
//------------------------
api.interceptors.request.use(
  async (config) => {
    // 로그인 페이지나 회원가입 페이지 등 인증이 필요없는 경로는 제외
<<<<<<< HEAD
    const publicPaths = ['/#/login', '/#/join','/login','/bn/validate','/validate'];
    if (publicPaths.some(path => config.url.includes(path))) {
      return config;
    }

=======
    const publicPaths = ['/login', '/join', '/validate'];
    if (publicPaths.some(path => config.url.includes(path))) {
      return config;
    }
>>>>>>> ca62672f4d1c579eee2439721438a28fe7dc9035
    try {
      
      // 토큰 유효성 검증을 위한 별도 엔드포인트 호출
      await axios.get('/bn/validate', {
        withCredentials: true
      });
      console.log("[정상-요청 인터셉터] 인증된 상태입니다");
      return config;

    } catch (error) {
<<<<<<< HEAD
      
      console.log("[오류-요청 인터셉터] ",error);
      window.location.href = '/#/login';
=======
      console.log("[오류-요청 인터셉터] ",error);
>>>>>>> ca62672f4d1c579eee2439721438a28fe7dc9035
      return Promise.reject('인증이 필요합니다.');
      
    }
  },
  (error) => {
    console.log("[오류-요청 인터셉터] ",error);
<<<<<<< HEAD
    window.location.href = '/#/login';
=======
>>>>>>> ca62672f4d1c579eee2439721438a28fe7dc9035
    return Promise.reject(error);
  }
);

//------------------------
// 응답 인터셉터 설정
//------------------------
api.interceptors.response.use(
  (response) => {
    console.log("[정상-응답 인터셉터] ",response);
    if (response.data?.auth === false) {
<<<<<<< HEAD
      window.location.href = '/#/login';
=======
      window.location.href = '/login';
>>>>>>> ca62672f4d1c579eee2439721438a28fe7dc9035
      return Promise.reject('세션이 만료되었습니다.');
    }
    return response;
  },
  (error) => {
  
    console.log("[오류-응답 인터셉터] ",error);
    if (error.response?.data?.expired === true) {
<<<<<<< HEAD
      window.location.href = '/#/login';
=======
      window.location.href = '/login';
>>>>>>> ca62672f4d1c579eee2439721438a28fe7dc9035
    }
    return Promise.reject(error);
  }
);

export default api; 