import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../App.jsx';
import axios from 'axios';
import { Flame, TrendingUp, Award, Activity, Waves, Heart, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const swimImage = 'https://images.pexels.com/photos/5259883/pexels-photo-5259883.jpeg';

const Dashboard = () => {
  const { currentUser, API } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    loadDashboard();
  }, [currentUser]);

  const loadDashboard = async () => {
    try {
      await axios.post(`${API}/nudges/generate`, null, { params: { user_id: currentUser.id } });
      const [statsResponse, nudgesResponse, progressResponse, workoutsResponse] = await Promise.all([
        axios.get(`${API}/stats/${currentUser.id}`),
        axios.get(`${API}/nudges`, { params: { user_id: currentUser.id } }),
        axios.get(`${API}/progress/${currentUser.id}`, { params: { days: 7 } }),
        axios.get(`${API}/workouts`, { params: { user_id: currentUser.id } })
      ]);
      setStats(statsResponse.data);
      setNudges(nudgesResponse.data);
      setProgressData(progressResponse.data);
      setWorkouts(workoutsResponse.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const dismissNudge = async (nudgeId) => {
    try {
      await axios.post(`${API}/nudges/dismiss`, null, { params: { nudge_id: nudgeId } });
      setNudges((prev) => prev.filter((item) => item.id !== nudgeId));
    } catch (error) {
      console.error('Error dismissing nudge:', error);
    }
  };

  const summary = useMemo(() => {
    const consumed = progressData.reduce((acc, day) => acc + day.calories_consumed, 0);
    const burned = progressData.reduce((acc, day) => acc + day.calories_burned, 0);
    return { consumed, burned, delta: burned - consumed };
  }, [progressData]);

  if (!stats) {
    return <div className="w-full max-w-md mx-auto min-h-screen bg-obsidian px-6 py-8 pb-24 text-white">Loading...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-obsidian relative pb-24 overflow-x-hidden" data-testid="dashboard">
      {nudges.length > 0 && (
        <div className="bg-[#FF3B30] border border-white/20 mx-6 mt-6 rounded-2xl p-4 shadow-glow" data-testid="nudge-banner">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-white/70 mb-1">Nudge Engine</p>
              <p className="text-white font-bold leading-snug">{nudges[0].message}</p>
            </div>
            <button onClick={() => dismissNudge(nudges[0].id)} className="text-white/80 hover:text-white" data-testid="dismiss-nudge-btn">×</button>
          </div>
        </div>
      )}

      <div className="px-6 py-8">
        <div
          className="rounded-[28px] border border-white/10 p-6 mb-6 bg-cover bg-center relative overflow-hidden shadow-glow"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.25), rgba(10,10,10,0.92)), url(${swimImage})` }}
          data-testid="hero-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 to-transparent" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 mb-2">Command Center</p>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-3" data-testid="dashboard-title">Discipline &amp; Flow</h1>
            <p className="text-zinc-300 max-w-[240px]">Welcome back, {currentUser.name}. Build streaks, fuel smart, and keep your edge.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => navigate('/activity')} className="bg-[#00E5FF] text-black font-bold rounded-2xl px-4 py-3" data-testid="hero-log-activity-btn">Quick Log</button>
              <button onClick={() => navigate('/meals')} className="bg-white/10 text-white font-bold rounded-2xl px-4 py-3 border border-white/10" data-testid="hero-track-meals-btn">Track Meals</button>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-3xl border border-white/5 p-6 mb-6 shadow-glow" data-testid="discipline-score-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Discipline Score</p>
              <p className="text-5xl font-black text-white" data-testid="discipline-score-value">{stats.discipline_score}</p>
              <p className="text-zinc-400 mt-2">Stay above 80 for elite momentum.</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-[#00E5FF] flex items-center justify-center shadow-swim">
              <Flame size={38} className="text-[#00E5FF]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface rounded-3xl border border-white/5 p-5" data-testid="streak-card">
            <TrendingUp size={22} className="text-[#00E5FF] mb-3" />
            <p className="text-3xl font-black text-white" data-testid="streak-value">{stats.current_streak}</p>
            <p className="text-sm text-zinc-400">Day streak</p>
          </div>
          <div className="bg-surface rounded-3xl border border-white/5 p-5" data-testid="workouts-card">
            <Activity size={22} className="text-[#00BFA5] mb-3" />
            <p className="text-3xl font-black text-white" data-testid="workouts-value">{stats.total_workouts}</p>
            <p className="text-sm text-zinc-400">Total workouts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => navigate('/activity')} className="bg-surface rounded-3xl border border-[#00E5FF]/20 p-5 text-left hover:-translate-y-1 transition-transform" data-testid="log-swimming-button">
            <Waves size={22} className="text-[#00E5FF] mb-3" />
            <p className="text-white font-bold mb-1">Log Swimming</p>
            <p className="text-zinc-400 text-sm">Laps, duration, pace</p>
          </button>
          <button onClick={() => navigate('/activity')} className="bg-surface rounded-3xl border border-[#00BFA5]/20 p-5 text-left hover:-translate-y-1 transition-transform" data-testid="log-yoga-button">
            <Heart size={22} className="text-[#00BFA5] mb-3" />
            <p className="text-white font-bold mb-1">Log Yoga</p>
            <p className="text-zinc-400 text-sm">Intensity, flow, focus</p>
          </button>
        </div>

        <div className="bg-surface rounded-3xl border border-white/5 p-6 mb-6" data-testid="progress-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">7-Day Burn Trend</p>
              <p className="text-3xl font-black text-white" data-testid="calories-value">{summary.burned}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${summary.delta >= 0 ? 'text-[#00E5FF]' : 'text-[#FF3B30]'}`}>{summary.delta >= 0 ? '+' : ''}{summary.delta}</p>
              <p className="text-zinc-500 text-xs">Burn vs intake</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#fff' }}
                labelStyle={{ color: '#A1A1AA' }}
              />
              <Area type="monotone" dataKey="calories_burned" stroke="#00E5FF" strokeWidth={3} fill="url(#burnGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface rounded-3xl border border-white/5 p-6 mb-6" data-testid="recent-workouts-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Recent Sessions</p>
            <button onClick={() => navigate('/activity')} className="text-white flex items-center gap-1 text-sm font-semibold" data-testid="view-all-workouts-btn">
              View all <ChevronRight size={16} />
            </button>
          </div>
          {workouts.length === 0 ? (
            <p className="text-zinc-400">No sessions yet. Log your first workout to activate the tracker.</p>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <div key={workout.id} className="bg-white/5 rounded-2xl p-4 border border-white/5" data-testid={`recent-workout-${workout.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold capitalize">{workout.type}</p>
                      <p className="text-zinc-400 text-sm">{workout.duration} min • {workout.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{workout.calories}</p>
                      <p className="text-zinc-500 text-xs">cal burned</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {stats.badges.length > 0 && (
          <div className="bg-surface rounded-3xl border border-white/5 p-6" data-testid="badges-section">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Reward Badges</p>
            <div className="flex gap-3 flex-wrap">
              {stats.badges.map((badge, index) => (
                <div key={index} className="bg-white/10 rounded-full p-4 border border-[#00E5FF]/40 shadow-swim" data-testid={`badge-${badge}`}>
                  <Award size={22} className="text-[#00E5FF]" />
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
