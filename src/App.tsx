import './App.css';
import './style.css';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="chat" element={<ChatPage />} />
      {/* необязательная страница 404 */}
      <Route path="*" element={<MainPage />} />
    </Routes>
  );
}

export default App;
