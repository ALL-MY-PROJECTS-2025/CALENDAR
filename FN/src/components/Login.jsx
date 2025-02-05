import { useState, useEffect } from 'react'
import api from '../api/apiConfig'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navi = useNavigate()

    const handleLogin = () => {
        // 입력 검증
        if (!username || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        api.post('/login', {
            username: username,
            password: password
        })
            .then(resp => {
                console.log(resp)
                const accessToken = resp.data.accesstoken;
                console.log("accesstoken", accessToken)
                if (resp.data) {
                    localStorage.setItem("accesstoken", accessToken);
                    navi("/")
                }
            })
            .catch(err => {
                console.log(err)
                setError(err.response?.data?.message || '로그인에 실패했습니다.');
            })
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    }

    return (
        <div className="login-container">
            {/* 로그인 이미지 */}


            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <div className="login-title">
                    <span className="material-symbols-outlined">login</span>
                    <img src={`${process.env.PUBLIC_URL}/login.jpg`} alt="Login" />
                </div>

                <div className="form-group">
                    <label htmlFor="username">아이디</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="아이디를 입력하세요"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                    className="login-button"
                    onClick={handleLogin}
                    disabled={!username || !password}
                >
                    로그인
                </button>

                <div className="register-link">
                    계정이 없으신가요?
                    <Link to="">회원가입(현재사용불가)</Link>
                </div>
            </form>
        </div>
    )
}

export default Login