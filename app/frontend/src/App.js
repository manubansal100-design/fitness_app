import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import ActivityLogger from './pages/ActivityLogger';
import Meals from './pages/Meals';
import Social from './pages/Social';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import { Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AppContext = React.createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user exists in localStorage
      const storedUserId = localStorage.getItem('userId');
      
      if (storedUserId) {
        const response = await axios.get(`${API}/users/${storedUserId}`);
        setCurrentUser(response.data);
      } else {
        // Create a demo user
        const response = await axios.post(`${API}/users`, { name: 'You' });
        setCurrentUser(response.data);
        localStorage.setItem('userId', response.data.id);
        
        // Create some demo friends
        const friend1 = await axios.post(`${API}/users`, { name: 'Alex' });
        const friend2 = await axios.post(`${API}/users`, { name: 'Sam' });
        
        await axios.post(`${API}/friends`, {
          user_id: response.data.id,
          friend_user_id: friend1.data.id
        });
        
        await axios.post(`${API}/friends`, {
          user_id: response.data.id,
          friend_user_id: friend2.data.id
        });
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (currentUser) {
      const response = await axios.get(`${API}/users/${currentUser.id}`);
      setCurrentUser(response.data);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ currentUser, refreshUser, API }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activity" element={<ActivityLogger />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/social" element={<Social />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
        <Toaster position="top-center" theme="dark" />
      </div>
    </AppContext.Provider>
  );
}

export default App;
