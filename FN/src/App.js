import './App.scss';
import Calendar from "./Calendar"
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Join from "./components/Join"
import Login from "./components/Login"
import Logout from "./components/Logout"
import PrivateRoute from './components/PrivateRoute'

const App = () => {
    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                            <Calendar />
                        </PrivateRoute>
                    } 
                />
                <Route path="/join" element={<Join />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </Router>
    )
}

export default App;
