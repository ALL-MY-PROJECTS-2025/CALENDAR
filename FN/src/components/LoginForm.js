import React, { useState } from 'react';
import axios from '../api/axios';  // 커스텀 axios 인스턴스 사용
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (values) => {
        try {
            const response = await axios.post('/login', {  // /bn/login 대신 /login 사용
                username: values.username,
                password: values.password
            });
            
            const { accessToken, refreshToken } = response.data;
            
            // HTTP Only 쿠키는 자동으로 저장되므로 localStorage는 사용하지 않음
            // 필요한 경우 사용자 정보만 저장
            localStorage.setItem('username', values.username);
            
            // 로그인 성공 후 리다이렉트
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            setError('로그인에 실패했습니다.');
        }
    };

    return (
        <div>
            {error && <div style={{color: 'red'}}>{error}</div>}
            {/* 로그인 폼 UI 코드 */}
        </div>
    );
};

export default LoginForm; 