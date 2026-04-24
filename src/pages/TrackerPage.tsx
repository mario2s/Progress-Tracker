import { useEffect, useRef, useState } from 'react';
import type { Target } from '../lib/supabase';
import { targetsService, authService } from '../lib/supabase';
import { TargetForm } from '../components/TargetForm';
import { TargetCard } from '../components/TargetCard';
import { useAuth } from '../contexts/useAuth';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { useAppMode } from '../contexts/AppModeContext';

export const TrackerPage = () => {
  const { user } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDone, setShowDone] = useState(true);

  useEffect(() => {
    loadTargets();
  }, []);

  const sort = (data: Target[]) =>
    [...data].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const loadTargets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await targetsService.getTargets();
      setTargets(sort(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetCreated = (target: Target) => {
    setShowForm(false);
    setTargets(sort([target, ...targets]));
  };

  const handleTargetUpdate = (updated: Target) => {
    setTargets(sort(targets.map(t => (t.id === updated.id ? updated : t))));
  };

  const handleTargetDelete = (id: string) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  const handleSignOut = async () => {
    await authService.signOut();
  };

  const visibleTargets = targets.filter(t => showDone ? true : !t.is_done);

  // Pull-to-refresh
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const THRESHOLD = 80;

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) pullStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (pullStartY.current === null) return;
      const dist = Math.max(0, e.touches[0].clientY - pullStartY.current);
      if (dist > 0) setPullDistance(Math.min(dist, THRESHOLD + 20));
    };
    const onTouchEnd = () => {
      if (pullDistance >= THRESHOLD) loadTargets();
      pullStartY.current = null;
      setPullDistance(0);
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance]);

  return (
    <div className="min-h-screen bg-[#f7efe4] dark:bg-zinc-950 transition-colors duration-200">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <div className={`flex flex-col items-center gap-1 transition-opacity ${pullDistance >= THRESHOLD ? 'opacity-100' : 'opacity-50'}`}>
            <svg
              className={`w-6 h-6 text-orange-500 transition-transform duration-200 ${pullDistance >= THRESHOLD ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs font-semibold text-orange-500">
              {pullDistance >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-6xl font-bold text-[#2a1f16] dark:text-zinc-100 mb-2">Progress Tracker</h1>
              <p className="text-[#7c5f37] dark:text-zinc-500 text-sm sm:text-lg">Track your goals with clarity and purpose</p>
            </div>
            <div className="flex flex-col gap-3 items-end flex-shrink-0">
              {/* Row 1: [Theme] [Mode] [Out →] */}
              <div className="w-36 sm:w-52 flex gap-3">
                <ThemeToggleButton />
                <button
                  onClick={toggleMode}
                  title={mode === 'quiet' ? 'Switch to Stimulating mode' : 'Switch to Quiet mode'}
                  className="aspect-square py-2.5 sm:py-3 px-2.5 sm:px-3 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-100 transition transform hover:scale-105 rounded-xl border border-[#e9d7c4] dark:border-zinc-700 shadow-lg flex items-center justify-center flex-shrink-0 text-base"
                >
                  {mode === 'quiet' ? '🔕' : '🎮'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 sm:py-3 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-200 rounded-xl font-semibold text-sm sm:text-base transition transform hover:scale-105 border border-[#e9d7c4] dark:border-zinc-700 shadow-lg whitespace-nowrap"
                >
                  Out →
                </button>
              </div>
              {/* Row 2: [− Done Targets] */}
              <button
                onClick={() => setShowDone(!showDone)}
                className={`w-36 sm:w-52 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition transform hover:scale-105 whitespace-nowrap shadow-lg ${
                  showDone
                    ? 'bg-[#fff7ef] dark:bg-zinc-800 text-[#3b2b1f] dark:text-zinc-200 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 border border-[#e9d7c4] dark:border-zinc-700'
                    : 'bg-orange-600 text-white hover:bg-orange-500'
                }`}
              >
                {showDone ? '− Done Targets' : '+ Done Targets'}
              </button>
              {/* Row 3: [+ New Target] */}
              <button
                onClick={() => setShowForm(true)}
                className="w-36 sm:w-52 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold text-sm sm:text-base transition transform hover:scale-105 whitespace-nowrap shadow-lg hover:shadow-orange-900/40"
              >
                + New Target
              </button>
            </div>
          </div>
          <p className="text-[#8f7353] dark:text-zinc-600 text-sm">{user?.email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">
            {error}
            <button
              onClick={loadTargets}
              className="ml-4 underline font-medium hover:text-red-500 dark:hover:text-red-200 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Modal Overlay */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-[#ead9c8] dark:border-zinc-800">
              <div className="flex justify-between items-center p-8 border-b border-[#ead9c8] dark:border-zinc-800">
                <h2 className="text-3xl font-bold text-[#2a1f16] dark:text-zinc-100">Create New Target</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#8f7353] dark:text-zinc-500 hover:text-[#2a1f16] dark:hover:text-zinc-200 text-2xl font-bold transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-8">
                <TargetForm onTargetCreated={handleTargetCreated} />
              </div>
            </div>
          </div>
        )}

        {/* Targets List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-[#8f7353] dark:text-zinc-600 animate-pulse">Loading targets...</div>
          </div>
        ) : targets.length === 0 ? (
          <div className="bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl p-16 text-center border border-[#ead9c8] dark:border-zinc-800 shadow-[0_16px_30px_rgba(120,53,15,0.08)]">
            <p className="text-[#7c5f37] dark:text-zinc-500 text-lg">No targets yet. Create one to get started!</p>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2a1f16] dark:text-zinc-200">
                Your Targets <span className="text-[#8f7353] dark:text-zinc-500">({visibleTargets.length})</span>
              </h2>
            </div>
            <div className="grid gap-4">
              {visibleTargets.map(target => (
                <TargetCard
                  key={target.id}
                  target={target}
                  onUpdate={handleTargetUpdate}
                  onDelete={handleTargetDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-[#8f7353] dark:text-zinc-700 text-sm">
          <p>Build with NS and AI by MD</p>
        </div>
      </div>
    </div>
  );
};
