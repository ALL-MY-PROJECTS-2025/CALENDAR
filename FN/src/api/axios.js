import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/bn',
    withCredentials: true,  // 쿠키 전송을 위해 필요
    headers: {
        'Content-Type': 'application/json',
    }
});

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        // 쿠키 기반 인증이므로 별도의 헤더 설정 불필요
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response.status === 401) {
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance; 