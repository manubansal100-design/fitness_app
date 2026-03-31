import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, UtensilsCrossed, Users, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/activity', icon: Activity, label: 'Activity' },
    { path: '/meals', icon: UtensilsCrossed, label: 'Meals' },
    { path: '/social', icon: Users, label: 'Social' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 backdrop-blur-2xl bg-[#0A0A0A]/80 border-t border-white/10 flex justify-around items-center px-4 z-50" data-testid="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
