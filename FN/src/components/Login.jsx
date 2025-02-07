import { useState, useEffect } from "react";
import api from "../api/apiConfig";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navi = useNavigate();

  const handleLogin = () => {
    // 입력 검증
    if (!username || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    api
      .post("/login", {
        username: username,
        password: password,
      })
      .then((resp) => {
        console.log(resp);
        const accessToken = resp.data.accesstoken;
        console.log("accesstoken", accessToken);
        if (resp.data) {
          localStorage.setItem("accesstoken", accessToken);
          navi("/");
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.response?.data?.message || "로그인에 실패했습니다.");
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      {/* 배경스타일 */}
      <div className="login-background">
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/1.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/2.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/3.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/4.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/5.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/6.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/7.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/8.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/9.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/10.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/11.jpg`} alt="login" />
        </div>
        <div className="item">
          <img src={`${process.env.PUBLIC_URL}/login/12.jpg`} alt="login" />
        </div>
      </div>
      {/* 로그인 이미지 */}

      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <div className="login-title">
          {/* <img src={`${process.env.PUBLIC_URL}/login_bak.jpg`} alt="login" /> */}
          <div className="item">
            <img src={`${process.env.PUBLIC_URL}/login.png`} alt="login" />
          </div>
          <div className="show-login">
            <span className="material-symbols-outlined">login</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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
  );
};

export default Login;
