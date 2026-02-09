import React from 'react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { Theme } from '../App';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, theme, toggleTheme }) => {
  const navItems: { id: ViewState; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'collection', label: 'Index' },
    { id: 'shelf', label: 'Shelf' },
    { id: 'recommendations', label: 'Research' },
  ];

  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const inactiveColor = theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-black';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/5';
  const bgColor = theme === 'dark' ? 'bg-black/20' : 'bg-white/5';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 px-6 py-5 flex justify-between items-center backdrop-blur-md ${bgColor} ${borderColor} border-b transition-colors duration-500`}>
      <div className="flex flex-col gap-0.5" onClick={() => setView('dashboard')}>
        <h1 className={`text-sm font-bold tracking-tighter uppercase cursor-pointer hover:opacity-70 transition-opacity ${textColor}`}>
          Groove * Vault
        </h1>
        <span className={`text-[9px] uppercase tracking-widest hidden md:block ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
          Vinyl Management System v2.0
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex gap-1 md:gap-8 p-1 rounded-full md:p-0 ${theme === 'dark' ? 'bg-white/5 md:bg-transparent' : 'bg-black/5 md:bg-transparent'}`}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className="relative px-4 py-1.5 md:px-0 md:py-0"
              >
                <span className={`relative z-10 text-[10px] md:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isActive ? `${textColor} font-bold` : inactiveColor}`}>
                  {item.label}
                </span>
                
                {/* Desktop Underline */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-underline"
                    className={`absolute -bottom-1 left-0 w-full h-[1px] hidden md:block ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Mobile Pill */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill"
                    className={`absolute inset-0 shadow-sm rounded-full md:hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-white'}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </nav>
  );
};