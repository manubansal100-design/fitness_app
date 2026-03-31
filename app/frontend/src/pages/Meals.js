import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Plus, Utensils } from 'lucide-react';
import { toast } from 'sonner';

const Meals = () => {
  const { currentUser, API } = useContext(AppContext);
  const [mode, setMode] = useState('home');
  const [meals, setMeals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadMeals();
    }
  }, [currentUser, mode]);

  const loadMeals = async () => {
    try {
      const response = await axios.get(`${API}/meals`, {
        params: { user_id: currentUser.id, mode: mode }
      });
      setMeals(response.data);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    
    if (!mealName || !calories) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(`${API}/meals`, {
        user_id: currentUser.id,
        name: mealName,
        calories: parseInt(calories),
        mode: mode,
        date: today
      });
      
      toast.success('Meal added successfully!');
      setMealName('');
      setCalories('');
      setShowAddForm(false);
      loadMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    }
  };

  const getMealSuggestions = () => {
    const suggestions = {
      home: [
        { name: 'Dal with Rice', calories: 350 },
        { name: 'Hummus Bowl', calories: 280 },
        { name: 'Veggie Curry', calories: 320 },
        { name: 'Mediterranean Salad', calories: 250 }
      ],
      trip: [
        { name: 'Fruit Smoothie', calories: 180 },
        { name: 'Granola Bar', calories: 150 },
        { name: 'Trail Mix', calories: 200 },
        { name: 'Veggie Wrap', calories: 300 }
      ],
      detox: [
        { name: 'Green Juice', calories: 120 },
        { name: 'Light Soup', calories: 150 },
        { name: 'Fruit Salad', calories: 100 },
        { name: 'Herbal Tea', calories: 5 }
      ],
      cheat: [
        { name: 'Pizza', calories: 500 },
        { name: 'Burger', calories: 600 },
        { name: 'Ice Cream', calories: 300 },
        { name: 'Cake', calories: 400 }
      ]
    };
    return suggestions[mode] || [];
  };

  const quickAdd = (suggestion) => {
    setMealName(suggestion.name);
    setCalories(suggestion.calories.toString());
    setShowAddForm(true);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0A0A0A] px-6 py-8 pb-24" data-testid="meals-page">
      <h1 className="text-4xl font-black tracking-tighter text-white mb-8">Meal Tracker</h1>

      {/* Mode Switcher */}
      <div className="flex space-x-2 bg-white/5 p-1.5 rounded-full overflow-x-auto no-scrollbar mb-6" data-testid="mode-switcher">
        {['home', 'trip', 'detox', 'cheat'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
              mode === m
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            data-testid={`mode-${m}`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Meal Suggestions */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Quick Add</p>
        <div className="grid grid-cols-2 gap-3">
          {getMealSuggestions().map((suggestion, index) => (
            <button
              key={index}
              onClick={() => quickAdd(suggestion)}
              className="bg-[#141414] rounded-2xl border border-white/5 p-4 text-left hover:-translate-y-1 transition-transform"
              data-testid={`suggestion-${index}`}
            >
              <Utensils size={20} className="text-[#00BFA5] mb-2" />
              <p className="text-white font-bold text-sm mb-1">{suggestion.name}</p>
              <p className="text-zinc-400 text-xs">{suggestion.calories} cal</p>
            </button>
          ))}
        </div>
      </div>

      {/* Add Meal Form */}
      {showAddForm ? (
        <form onSubmit={handleAddMeal} className="bg-[#141414] rounded-3xl border border-white/5 p-6 mb-6" data-testid="add-meal-form">
          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
              Meal Name
            </label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFA5] transition-colors"
              placeholder="Enter meal name"
              data-testid="meal-name-input"
            />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 block">
              Calories
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFA5] transition-colors"
              placeholder="300"
              data-testid="meal-calories-input"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#00BFA5] text-black font-bold rounded-2xl px-6 py-3 active:scale-95 transition-all"
              data-testid="submit-meal-btn"
            >
              Add Meal
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-white/5 text-white font-bold rounded-2xl px-6 py-3 active:scale-95 transition-all"
              data-testid="cancel-meal-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-white text-black font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 active:scale-95 transition-all mb-6"
          data-testid="show-add-meal-btn"
        >
          <Plus size={20} />
          Add Custom Meal
        </button>
      )}

      {/* Meals List */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Recent Meals</p>
        {meals.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">No meals logged yet</p>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-[#141414] rounded-2xl border border-white/5 p-4" data-testid={`meal-item-${meal.id}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold">{meal.name}</p>
                    <p className="text-zinc-400 text-sm">{meal.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00BFA5] font-bold text-lg">{meal.calories}</p>
                    <p className="text-zinc-500 text-xs">cal</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;
