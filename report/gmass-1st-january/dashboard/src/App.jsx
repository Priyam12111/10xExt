import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './Components/Navbar'
import Section from './Components/Section'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Section />} />
        <Route path="/:name" element={<><Navbar /><Section /></>} />
      </Routes>
    </Router>
  )
}

export default App
