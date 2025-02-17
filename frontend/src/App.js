import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import Register from './components/Register';
import History from './components/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/" element={<Register/>}/>
        <Route path="/history" element={<History/>}/>
      </Routes>
    </Router>
  );
}

export default App;
