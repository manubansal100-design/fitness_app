import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Flame, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { currentUser, refreshUser, API } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [nudges, setNudges] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadStats();
      loadNudges();
      checkAndGenerateNudges();
    }
  }, [currentUser]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/${currentUser.id}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadNudges = async () => {
    try {
      const response = await axios.get(`${API}/nudges`, { params: { user_id: currentUser.id } });
      setNudges(response.data);
    } catch (error) {
      console.error('Error loading nudges:', error);
    }
  };

  const checkAndGenerateNudges = async () => {
    try {
      await axios.post(`${API}/nudges/generate`, null, { params: { user_id: currentUser.id } });
      loadNudges();
    } catch (error) {
      console.error('Error generating nudges:', error);
    }
  };

  const dismissNudge = async (nudgeId) => {
    try {
      await axios.post(`${API}/nudges/dismiss`, null, { params: { nudge_id: nudgeId } });
      loadNudges();
    } catch (error) {
      console.error('Error dismissing nudge:', error);
    }
  };

  if (!stats) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] px-6 py-8 pb-24">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] relative pb-24 overflow-x-hidden" data-testid="dashboard">
      {/* Nudge Banner */}
      {nudges.length > 0 && (
        <div className="bg-[#FF3B30] border-l-4 border-white p-4 mx-6 mt-6 rounded-xl" data-testid="nudge-banner">
          <div className="flex justify-between items-start">
            <p className="text-white font-bold">{nudges[0].message}</p>
            <button
              onClick={() => dismissNudge(nudges[0].id)}
              className="text-white/80 hover:text-white"
              data-testid="dismiss-nudge-btn"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2" data-testid="dashboard-title">
            Discipline & Flow
          </h1>
          <p className="text-zinc-400">Welcome back, {currentUser.name}</p>
        </div>

        {/* Discipline Score */}
        <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 mb-6" data-testid="discipline-score-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Discipline Score</p>
              <p className="text-5xl font-black text-white" data-testid="discipline-score-value">{stats.discipline_score}</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-[#00E5FF] flex items-center justify-center">
              <Flame size={40} className="text-[#00E5FF]" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6" data-testid="streak-card">
            <TrendingUp size={24} className="text-[#00E5FF] mb-2" />
            <p className="text-3xl font-black text-white mb-1" data-testid="streak-value">{stats.current_streak}</p>
            <p className="text-sm text-zinc-400">Day Streak</p>
          </div>
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6" data-testid="workouts-card">
            <Activity size={24} className="text-[#00BFA5] mb-2" />
            <p className="text-3xl font-black text-white mb-1" data-testid="workouts-value">{stats.total_workouts}</p>
            <p className="text-sm text-zinc-400">Workouts</p>
          </div>
        </div>

        {/* Calories Burned */}
        <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 mb-6" data-testid="calories-card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Total Calories Burned</p>
              <p className="text-4xl font-black text-white" data-testid="calories-value">{stats.total_calories_burned}</p>
            </div>
            <div className="text-[#00E5FF]">
              <Flame size={32} />
            </div>
          </div>
        </div>

        {/* Badges */}
        {stats.badges.length > 0 && (
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6" data-testid="badges-section">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Your Badges</p>
            <div className="flex gap-3 flex-wrap">
              {stats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl rounded-full p-4 border border-[#00E5FF]/50"
                  data-testid={`badge-${badge}`}
                >
                  <Award size={24} className="text-[#00E5FF]" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
