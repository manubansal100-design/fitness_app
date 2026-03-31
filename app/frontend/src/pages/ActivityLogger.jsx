import React, { useState, useContext } from 'react';
import { AppContext } from '../App.jsx';
import axios from 'axios';
import { Waves, Heart, Plus, Clock3, TimerReset } from 'lucide-react';
import { toast } from 'sonner';

const ActivityLogger = () => {
  const { currentUser, refreshUser, API } = useContext(AppContext);
  const [activityType, setActivityType] = useState('swimming');
  const [duration, setDuration] = useState('');
  const [laps, setLaps] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setDuration('');
    setLaps('');
    setIntensity('medium');
    setTime('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!duration || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        user_id: currentUser.id,
        type: activityType,
        duration: parseInt(duration, 10),
        date: today,
        time
      };

      if (activityType === 'swimming') payload.laps = laps ? parseInt(laps, 10) : 0;
      if (activityType === 'yoga') payload.intensity = intensity;

      await axios.post(`${API}/workouts`, payload);
      toast.success('Workout logged successfully');
      resetForm();
      await refreshUser();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-obsidian px-6 py-8 pb-24" data-testid="activity-logger">
      <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Log Activity</h1>
      <p className="text-zinc-400 mb-8">Choose your discipline and lock today’s work in.</p>

      <div className="flex space-x-2 bg-white/5 p-1.5 rounded-full mb-6" data-testid="activity-type-switcher">
        <button onClick={() => setActivityType('swimming')} className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${activityType === 'swimming' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`} data-testid="swimming-tab">
          <Waves size={16} className="inline mr-2" /> Swimming
        </button>
        <button onClick={() => setActivityType('yoga')} className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${activityType === 'yoga' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`} data-testid="yoga-tab">
          <Heart size={16} className="inline mr-2" /> Yoga
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-3xl border border-white/5 p-5">
          <Clock3 size={18} className="text-white mb-3" />
          <p className="text-white font-bold">Best for consistency</p>
          <p className="text-zinc-400 text-sm">Small sessions still move the score.</p>
        </div>
        <div className="bg-surface rounded-3xl border border-white/5 p-5">
          <TimerReset size={18} className="text-white mb-3" />
          <p className="text-white font-bold">Stack momentum</p>
          <p className="text-zinc-400 text-sm">Morning workouts can unlock the early bird badge.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-3xl border border-white/5 p-6 shadow-glow">
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Duration (minutes)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors" placeholder="30" data-testid="duration-input" />
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Time of Day</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors" data-testid="time-input" />
          </div>

          {activityType === 'swimming' && (
            <div className="mb-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Laps</label>
              <input type="number" value={laps} onChange={(e) => setLaps(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors" placeholder="20" data-testid="laps-input" />
            </div>
          )}

          {activityType === 'yoga' && (
            <div className="mb-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Intensity</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((level) => (
                  <button key={level} type="button" onClick={() => setIntensity(level)} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${intensity === level ? 'bg-[#00BFA5] text-black' : 'bg-white/5 text-zinc-400 hover:text-white'}`} data-testid={`intensity-${level}`}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className={`flex-1 font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 active:scale-95 transition-all ${activityType === 'swimming' ? 'bg-[#00E5FF] text-black' : 'bg-[#00BFA5] text-black'} ${submitting ? 'opacity-70' : ''}`} data-testid="submit-workout-btn">
            <Plus size={20} /> {submitting ? 'Logging...' : `Log ${activityType.charAt(0).toUpperCase() + activityType.slice(1)}`}
          </button>
          <button type="button" onClick={resetForm} className="bg-white/5 text-white font-bold rounded-2xl px-5 py-4 active:scale-95 transition-all" data-testid="reset-workout-btn">Reset</button>
        </div>
      </form>
    </div>
  );
};

export default ActivityLogger;
