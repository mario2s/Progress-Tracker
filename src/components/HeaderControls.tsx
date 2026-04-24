import { useTheme } from '../contexts/ThemeContext';
import { useAppMode } from '../contexts/AppModeContext';
import { authService } from '../lib/supabase';

export const HeaderControls = () => {
  const { theme, toggleTheme } = useTheme();
  const { mode, toggleMode } = useAppMode();

  const handleSignOut = async () => {
    await authService.signOut();
  };

  return (
    <div className="w-36 sm:w-52 flex gap-3">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-11 h-11 sm:w-12 sm:h-12 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-100 transition transform hover:scale-105 rounded-xl border border-[#e9d7c4] dark:border-zinc-700 shadow-lg flex items-center justify-center flex-shrink-0"
      >
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Mode toggle */}
      <button
        onClick={toggleMode}
        title={mode === 'quiet' ? 'Switch to Stimulating mode' : 'Switch to Quiet mode'}
        className="w-11 h-11 sm:w-12 sm:h-12 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-100 transition transform hover:scale-105 rounded-xl border border-[#e9d7c4] dark:border-zinc-700 shadow-lg flex items-center justify-center flex-shrink-0"
      >
        {mode === 'quiet' ? (
          /* Bell-off — current mode is quiet, clicking switches to stimulating */
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
            <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
            <path d="M18 8a6 6 0 0 0-9.33-5"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          /* Zap — current mode is stimulating, clicking switches to quiet */
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        )}
      </button>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex-1 h-11 sm:h-12 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-200 rounded-xl font-semibold text-sm sm:text-base transition transform hover:scale-105 border border-[#e9d7c4] dark:border-zinc-700 shadow-lg whitespace-nowrap"
      >
        Out →
      </button>
    </div>
  );
};
