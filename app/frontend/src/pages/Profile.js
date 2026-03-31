import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Award, Calculator, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const Profile = () => {
  const { currentUser, API } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [showBMI, setShowBMI] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadStats();
      loadProgressData();
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

  const loadProgressData = async () => {
    try {
      const response = await axios.get(`${API}/progress/${currentUser.id}`, {
        params: { days: 7 }
      });
      setProgressData(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const calculateBMI = async (e) => {
    e.preventDefault();
    
    if (!weight || !height) {
      toast.error('Please enter both weight and height');
      return;
    }

    try {
      const response = await axios.post(`${API}/bmi/calculate`, {
        weight: parseFloat(weight),
        height: parseFloat(height)
      });
      setBmiResult(response.data);
      toast.success('BMI calculated!');
    } catch (error) {
      console.error('Error calculating BMI:', error);
      toast.error('Failed to calculate BMI');
    }
  };

  const getBadgeInfo = (badge) => {
    const badges = {
      '7_day_streak': { name: '7-Day Streak', icon: '🔥' },
      'early_bird': { name: 'Early Bird', icon: '🌅' },
      'detox_champion': { name: 'Detox Champion', icon: '🥗' }
    };
    return badges[badge] || { name: badge, icon: '🏆' };
  };

  if (!stats) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] px-6 py-8 pb-24">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] px-6 py-8 pb-24" data-testid="profile-page">
      <h1 className="text-4xl font-black tracking-tighter text-white mb-8">Profile & Stats</h1>

      {/* User Info */}
      <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 mb-6" data-testid="user-info-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00BFA5] flex items-center justify-center text-3xl font-black">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{currentUser.name}</p>
            <p className="text-zinc-400">Discipline Score: {stats.discipline_score}</p>
          </div>
        </div>
      </div>

      {/* BMI Calculator Toggle */}
      <button
        onClick={() => setShowBMI(!showBMI)}
        className="w-full bg-white text-black font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 active:scale-95 transition-all mb-6"
        data-testid="toggle-bmi-btn"
      >
        <Calculator size={20} />
        {showBMI ? 'Hide' : 'Show'} BMI Calculator
      </button>

      {/* BMI Calculator */}
      {showBMI && (
        <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 mb-6" data-testid="bmi-calculator">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">BMI Calculator</p>
          <form onSubmit={calculateBMI} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="70"
                data-testid="weight-input"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="170"
                data-testid="height-input"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00E5FF] text-black font-bold rounded-2xl px-6 py-3 active:scale-95 transition-all"
              data-testid="calculate-bmi-btn"
            >
              Calculate BMI
            </button>
          </form>
          {bmiResult && (
            <div className="mt-4 p-4 bg-white/5 rounded-2xl" data-testid="bmi-result">
              <p className="text-white font-bold text-2xl mb-1">BMI: {bmiResult.bmi}</p>
              <p className="text-zinc-400">Category: {bmiResult.category}</p>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 mb-6" data-testid="badges-display">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Your Badges</p>
          <div className="grid grid-cols-3 gap-3">
            {stats.badges.map((badge, index) => {
              const badgeInfo = getBadgeInfo(badge);
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-[#00E5FF]/50 text-center"
                  data-testid={`badge-${badge}`}
                >
                  <Award size={32} className="text-[#00E5FF] mx-auto mb-2" />
                  <p className="text-white text-xs font-bold">{badgeInfo.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Chart */}
      <div className="bg-[#141414] rounded-3xl border border-white/5 p-6" data-testid="progress-chart">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-[#00E5FF]" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">7-Day Progress</p>
        </div>
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <XAxis 
                dataKey="date" 
                stroke="#52525B"
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#52525B" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#141414',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="calories_burned" 
                stroke="#00E5FF" 
                strokeWidth={3}
                dot={{ fill: '#00E5FF', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-zinc-400 text-center py-8">No data yet. Start logging workouts!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
