import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // 로그아웃 처리
        localStorage.removeItem("accesstoken");
        console.log("LOGOUT...");
        // 로그인 페이지로 리다이렉트
        navigate('/login');
    }, [navigate]);

    return null;
}

export default Logout;
