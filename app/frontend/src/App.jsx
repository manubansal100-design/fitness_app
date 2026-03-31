import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard.jsx';
import ActivityLogger from './pages/ActivityLogger.jsx';
import Meals from './pages/Meals.jsx';
import Social from './pages/Social.jsx';
import Profile from './pages/Profile.jsx';
import BottomNav from './components/BottomNav.jsx';
import { Toaster } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export const AppContext = React.createContext();

const friendSeeds = [
  { name: 'Alex' },
  { name: 'Sam' }
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');

      if (storedUserId) {
        const response = await axios.get(`${API}/users/${storedUserId}`);
        setCurrentUser(response.data);
      } else {
        const response = await axios.post(`${API}/users`, { name: 'You' });
        setCurrentUser(response.data);
        localStorage.setItem('userId', response.data.id);

        const friendResponses = await Promise.all(friendSeeds.map((friend) => axios.post(`${API}/users`, friend)));
        await Promise.all(friendResponses.map((friend) => axios.post(`${API}/friends`, {
          user_id: response.data.id,
          friend_user_id: friend.data.id
        })));
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    const response = await axios.get(`${API}/users/${currentUser.id}`);
    setCurrentUser(response.data);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-obsidian flex items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-surface px-8 py-6 text-center shadow-glow">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Booting</p>
          <div className="text-white text-xl font-extrabold">Discipline &amp; Flow</div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ currentUser, refreshUser, API }}>
      <div className="App bg-tactical">
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
        <Toaster position="top-center" theme="dark" richColors />
      </div>
    </AppContext.Provider>
  );
}

export default App;
