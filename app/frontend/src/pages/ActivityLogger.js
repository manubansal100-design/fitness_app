import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Waves, Heart, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ActivityLogger = () => {
  const { currentUser, refreshUser, API } = useContext(AppContext);
  const [activityType, setActivityType] = useState('swimming');
  const [duration, setDuration] = useState('');
  const [laps, setLaps] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [time, setTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!duration || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        user_id: currentUser.id,
        type: activityType,
        duration: parseInt(duration),
        date: today,
        time: time
      };

      if (activityType === 'swimming') {
        payload.laps = laps ? parseInt(laps) : 0;
      } else {
        payload.intensity = intensity;
      }

      await axios.post(`${API}/workouts`, payload);
      toast.success('Workout logged successfully!');
      
      // Reset form
      setDuration('');
      setLaps('');
      setIntensity('medium');
      setTime('');
      
      await refreshUser();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] px-6 py-8 pb-24" data-testid="activity-logger">
      <h1 className="text-4xl font-black tracking-tighter text-white mb-8">Log Activity</h1>

      {/* Activity Type Switcher */}
      <div className="flex space-x-2 bg-white/5 p-1.5 rounded-full mb-6" data-testid="activity-type-switcher">
        <button
          onClick={() => setActivityType('swimming')}
          className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
            activityType === 'swimming'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
          data-testid="swimming-tab"
        >
          <Waves size={16} className="inline mr-2" />
          Swimming
        </button>
        <button
          onClick={() => setActivityType('yoga')}
          className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
            activityType === 'yoga'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
          data-testid="yoga-tab"
        >
          <Heart size={16} className="inline mr-2" />
          Yoga
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#141414] rounded-3xl border border-white/5 p-6">
          {/* Duration */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
              placeholder="30"
              data-testid="duration-input"
            />
          </div>

          {/* Time */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
              Time of Day
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
              data-testid="time-input"
            />
          </div>

          {/* Swimming-specific: Laps */}
          {activityType === 'swimming' && (
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
                Laps (optional)
              </label>
              <input
                type="number"
                value={laps}
                onChange={(e) => setLaps(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="20"
                data-testid="laps-input"
              />
            </div>
          )}

          {/* Yoga-specific: Intensity */}
          {activityType === 'yoga' && (
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
                Intensity
              </label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                      intensity === level
                        ? 'bg-[#00BFA5] text-black'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                    data-testid={`intensity-${level}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 active:scale-95 transition-all ${
            activityType === 'swimming' ? 'bg-[#00E5FF] text-black' : 'bg-[#00BFA5] text-black'
          }`}
          data-testid="submit-workout-btn"
        >
          <Plus size={20} />
          Log {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
        </button>
      </form>
    </div>
  );
};

export default ActivityLogger;
