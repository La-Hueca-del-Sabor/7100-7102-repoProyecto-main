import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
// ... otros imports ...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        {/* ... otras rutas ... */}
      </Routes>
    </Router>
  );
}

export default App; 