import './App.scss';
import Calendar from "./Calendar"
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Join from "./components/Join"
import Login from "./components/Login"
import Logout from "./components/Logout"

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Calendar />} />
                <Route path="/join" element={<Join />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />

            </Routes>
        </Router>
    )
}

export default App;
