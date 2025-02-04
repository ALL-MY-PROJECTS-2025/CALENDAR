import {useState,useEffect} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
const Login  = ()=>{
    const [username ,setUsername] = useState()
    const [password ,setPassword] = useState()
    const navi = useNavigate()

    const handleLogin = ()=>{
        axios
            .post(
                'http://localhost:8095/login',
                 {"username":username,"password" : password},
                 {headers:{ 'Content-Type' : 'application/json' }}
            )
            .then(resp=>{
                console.log(resp)
                const accessToken = resp.data.accesstoken;
                console.log("accesstoken",accessToken)
                if(resp.data){
                    localStorage.setItem("accesstoken",accessToken);
                    alert(resp.data.message)
                    navi("/")
                }

            })
            .catch(err=>{console.log(err)
                alert(err.response.data.message)
            }
        )
    }

    return (
        <>
            <h1>LOGIN PAGE</h1>
            Username : <input type="text" name="username"     onChange={e=>setUsername(e.target.value)} /><br />
            Password : <input type="password" name="password" onChange={e=>setPassword(e.target.value)} /><br />
            <button onClick={handleLogin}>로그인</button>
        </>
    )
}

export default Login