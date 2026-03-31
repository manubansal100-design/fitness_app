import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App.jsx';
import axios from 'axios';
import { Zap, ThumbsUp, Flame, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const friendImages = {
  Alex: 'https://images.pexels.com/photos/5937765/pexels-photo-5937765.jpeg',
  Sam: 'https://images.pexels.com/photos/6388527/pexels-photo-6388527.jpeg'
};

const Social = () => {
  const { currentUser, API } = useContext(AppContext);
  const [friends, setFriends] = useState([]);
  const [friendStats, setFriendStats] = useState({});

  useEffect(() => {
    if (currentUser) loadFriends();
  }, [currentUser]);

  const loadFriends = async () => {
    try {
      const response = await axios.get(`${API}/friends/${currentUser.id}`);
      setFriends(response.data);
      const statsResponses = await Promise.all(response.data.map((friend) => axios.get(`${API}/stats/${friend.id}`)));
      const statsMap = {};
      response.data.forEach((friend, index) => {
        statsMap[friend.id] = statsResponses[index].data;
      });
      setFriendStats(statsMap);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const sendInteraction = async (friendId, type) => {
    try {
      await axios.post(`${API}/interactions`, { user_id: currentUser.id, target_user_id: friendId, type });
      toast.success(`${type === 'poke' ? 'Poke' : 'Kudos'} sent`);
    } catch (error) {
      console.error('Error sending interaction:', error);
      toast.error('Failed to send interaction');
    }
  };

  const getProgressColor = (score) => (score >= 80 ? '#00E5FF' : score >= 60 ? '#00BFA5' : score >= 40 ? '#FFA726' : '#FF3B30');

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-obsidian px-6 py-8 pb-24" data-testid="social-page">
      <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Friends Feed</h1>
      <p className="text-zinc-400 mb-8">Poke your crew or send kudos when they’re stacking wins.</p>

      {friends.length === 0 ? (
        <div className="text-center py-12"><p className="text-zinc-400">No friends yet</p></div>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => {
            const stats = friendStats[friend.id];
            if (!stats) return null;
            const progressColor = getProgressColor(stats.discipline_score);
            const imageUrl = friendImages[friend.name];

            return (
              <div key={friend.id} className="bg-surface rounded-3xl border border-white/5 p-6 shadow-glow" data-testid={`friend-card-${friend.id}`}>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full p-[3px]" style={{ background: `linear-gradient(135deg, ${progressColor}, rgba(255,255,255,0.2))` }}>
                        <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none', backgroundColor: '#1E1E1E' }} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-obsidian rounded-full p-1 border border-white/10"><Flame size={12} style={{ color: progressColor }} /></div>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{friend.name}</p>
                      <p className="text-zinc-400 text-sm">{stats.current_streak} day streak</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-3xl" data-testid={`friend-score-${friend.id}`}>{stats.discipline_score}</p>
                    <p className="text-zinc-500 text-xs">SCORE</p>
                  </div>
                </div>

                <div className="mb-4 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${stats.discipline_score}%`, backgroundColor: progressColor }} data-testid={`friend-progress-${friend.id}`} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-white font-bold text-lg">{stats.total_workouts}</p><p className="text-zinc-500 text-xs">Workouts</p></div>
                  <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-white font-bold text-lg">{stats.total_calories_burned}</p><p className="text-zinc-500 text-xs">Calories</p></div>
                  <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-white font-bold text-lg">{stats.badges.length}</p><p className="text-zinc-500 text-xs">Badges</p></div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-2"><Trophy size={14} className="text-[#00E5FF]" /> Elite threshold: 80+</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => sendInteraction(friend.id, 'poke')} className="flex-1 bg-[#FF3B30] text-white font-bold rounded-2xl px-4 py-3 flex items-center justify-center gap-2 active:scale-95 transition-all" data-testid={`poke-btn-${friend.id}`}>
                    <Zap size={16} /> Poke
                  </button>
                  <button onClick={() => sendInteraction(friend.id, 'kudos')} className="flex-1 bg-[#00BFA5] text-black font-bold rounded-2xl px-4 py-3 flex items-center justify-center gap-2 active:scale-95 transition-all" data-testid={`kudos-btn-${friend.id}`}>
                    <ThumbsUp size={16} /> Kudos
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Social;
