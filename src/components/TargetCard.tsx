import React, { useEffect, useState } from 'react';
import type { Target } from '../lib/supabase';
import { targetsService } from '../lib/supabase';
import { timeUtils } from '../lib/timeUtils';
import { useAppMode } from '../contexts/AppModeContext';

const formatDueDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface TargetCardProps {
  target: Target;
  onUpdate: (target: Target) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  dragHandleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const TargetCard: React.FC<TargetCardProps> = ({ target, onUpdate, onDelete, compact = false, dragHandleProps }) => {
  const { mode } = useAppMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMarkDoneConfirm, setShowMarkDoneConfirm] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [showFullName, setShowFullName] = useState(false);
  const [nameLimit, setNameLimit] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 20
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const updateNameLimit = () => setNameLimit(mediaQuery.matches ? 12 : 20);

    updateNameLimit();
    mediaQuery.addEventListener('change', updateNameLimit);

    return () => {
      mediaQuery.removeEventListener('change', updateNameLimit);
    };
  }, []);

  const isLongName = target.name.length > nameLimit;
  const displayName = isLongName ? target.name.slice(0, nameLimit) + '...' : target.name;

  const progressPercentage = timeUtils.getProgressPercentage(
    target.progress_minutes,
    target.target_hours
  );

  const handleAddProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await targetsService.updateProgress(target.id, 15);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const delta = Math.max(-15, -target.progress_minutes);
      const updated = await targetsService.updateProgress(target.id, delta);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await targetsService.deleteTarget(target.id);
      setShowDeleteConfirm(false);
      onDelete(target.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete target');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handlePriorityChange = async (newPriority: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await targetsService.updatePriority(target.id, newPriority);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async () => {
    const isDone = !target.is_done;
    setLoading(true);
    setError(null);
    try {
      const updated = await targetsService.markAsDone(target.id, isDone);
      setShowMarkDoneConfirm(false);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const confirmMarkAsDone = () => {
    if (!target.is_done) {
      setShowMarkDoneConfirm(true);
    } else {
      handleMarkAsDone();
    }
  };

  const filledCount = Math.min(10, Math.floor(progressPercentage / 10));
  const isOver = progressPercentage >= 100;
  const hasPartialBlock = !isOver && progressPercentage % 10 > 0;

  const blockStyle = (i: number): React.CSSProperties => {
    if (isOver && i === 9) {
      const glow = target.is_done ? {} : { boxShadow: '0 0 22px 8px rgba(251,191,36,0.75)' };
      return { background: 'linear-gradient(135deg,#d97706,#fbbf24)', ...glow };
    }
    if (isOver || i < filledCount) {
      if (target.is_done) {
        if (i === 0) return { background: '#7c2d12' };
        if (i === 1) return { background: '#9a3412' };
        if (i === 2) return { background: '#c2410c' };
        return { background: 'linear-gradient(135deg,#ea580c,#fb923c)' };
      }
      if (i === 0) return { background: '#7c2d12', boxShadow: '0 0 8px 2px rgba(124,45,18,0.5)' };
      if (i === 1) return { background: '#9a3412', boxShadow: '0 0 8px 2px rgba(154,52,18,0.55)' };
      if (i === 2) return { background: '#c2410c', boxShadow: '0 0 10px 3px rgba(194,65,12,0.6)' };
      return { background: 'linear-gradient(135deg,#ea580c,#fb923c)', boxShadow: '0 0 10px 3px rgba(234,88,12,0.55)' };
    }
    if (hasPartialBlock && i === filledCount) {
      return { background: 'linear-gradient(135deg,#ea580c,#fb923c)' };
    }
    return { background: '#3f3f46' };
  };

  const blockClass = (i: number): string => {
    if (!target.is_done && isOver && i === 9) return 'flex-1 h-9 rounded-lg pulse-over';
    if (!target.is_done && hasPartialBlock && i === filledCount) return 'flex-1 h-9 rounded-lg pulse-lead';
    if (isOver || i < filledCount) return 'flex-1 h-9 rounded-lg';
    return 'flex-1 h-9 rounded-lg';
  };

  if (compact) {
    return (
      <div className={`bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl px-4 py-3 border shadow-[0_10px_18px_rgba(120,53,15,0.08)] transition-all duration-200 ${
        target.is_done
          ? 'border-[#ead9c8] dark:border-zinc-800'
          : 'border-[#ead9c8] dark:border-zinc-800 hover:border-[#ddb892] dark:hover:border-zinc-700'
      }`}>
        <div className={`flex items-center gap-3 min-w-0 ${target.is_done ? 'opacity-50' : ''}`}>
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <h3 className={`truncate text-base font-bold ${target.is_done ? 'text-[#b89b7c] dark:text-zinc-600 line-through' : 'text-[#2a1f16] dark:text-zinc-100'}`}>
              {target.name}
            </h3>
            <span className="text-xs font-semibold text-[#7c5f37] dark:text-zinc-500 whitespace-nowrap">P{target.priority}</span>
            <span className="text-xs text-[#8f7353] dark:text-zinc-600 whitespace-nowrap">
              {target.progress_minutes} / {target.target_hours * 60} min
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {target.due_date && (
              <span className="hidden sm:inline text-xs text-[#7c5f37] dark:text-zinc-500 whitespace-nowrap">
                {formatDueDate(target.due_date)}
              </span>
            )}
            <span className={`text-lg font-black whitespace-nowrap ${target.is_done ? 'text-[#b89b7c] dark:text-zinc-600' : 'text-orange-500'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl p-6 border shadow-[0_16px_30px_rgba(120,53,15,0.08)] transition-colors duration-200 ${
      target.is_done
        ? 'border-[#ead9c8] dark:border-zinc-800'
        : 'border-[#ead9c8] dark:border-zinc-800 hover:border-[#ddb892] dark:hover:border-zinc-700'
    }`}>
      <div className={target.is_done ? 'opacity-50' : ''}>
      {error && <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 p-2 rounded mb-3 text-sm">{error}</div>}

      {/* Title row: name + X */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {dragHandleProps && (
            <button
              type="button"
              aria-label="Reorder target"
              title="Drag to reorder"
              className="mt-0.5 text-[#8f7353] dark:text-zinc-600 hover:text-orange-500 active:cursor-grabbing cursor-grab transition flex-shrink-0 p-1"
              {...dragHandleProps}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </button>
          )}
          <h3
            className={`text-xl font-bold transition min-w-0 ${isLongName ? 'cursor-pointer hover:opacity-70' : ''} ${target.is_done ? 'text-[#b89b7c] dark:text-zinc-600 line-through' : 'text-[#2a1f16] dark:text-zinc-100'}`}
            onClick={isLongName ? () => setShowFullName(true) : undefined}
            onPointerDown={e => e.stopPropagation()}
            title={isLongName ? target.name : undefined}
          >
            {displayName}
          </h3>
        </div>
        <button
          onClick={confirmDelete}
          onPointerDown={e => e.stopPropagation()}
          disabled={loading}
          className="text-[#8f7353] dark:text-zinc-600 hover:text-red-400 font-bold text-lg transition w-7 h-7 rounded-full border-2 border-orange-600 hover:border-red-400 flex items-center justify-center flex-shrink-0"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {/* Meta row: date · priority */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {/* Due date — Q: icon toggle, S: always visible */}
        {target.due_date && (
          mode === 'quiet' ? (
            <>
              <button
                onClick={() => setShowDueDate(v => !v)}
                title={showDueDate ? 'Hide due date' : 'Show due date'}
                className="text-[#8f7353] dark:text-zinc-500 hover:text-orange-500 transition flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
              {showDueDate && (
                <span className="text-xs text-[#7c5f37] dark:text-zinc-500">{formatDueDate(target.due_date)}</span>
              )}
              <span className="text-[#8f7353] dark:text-zinc-600">·</span>
            </>
          ) : (
            <>
              <span className="text-xs text-[#7c5f37] dark:text-zinc-500">{formatDueDate(target.due_date)}</span>
              <span className="text-[#8f7353] dark:text-zinc-600">·</span>
            </>
          )
        )}
        <select
          value={target.priority}
          onChange={(e) => handlePriorityChange(parseInt(e.target.value))}
          onPointerDown={e => e.stopPropagation()}
          disabled={loading}
          className="text-sm bg-transparent border-none outline-none text-[#7c5f37] dark:text-zinc-500 cursor-pointer hover:text-[#2a1f16] dark:hover:text-zinc-300 transition"
        >
          {[1, 2, 3, 4, 5].map(p => (
            <option key={p} value={p}>P{p}</option>
          ))}
        </select>
      </div>

      {/* Progress panel: mins info (left) | % or action button (right) */}
      <div className="flex items-stretch gap-0 mb-5">
        <div className="flex-1 flex flex-col justify-center px-0 py-2">
          <span className="text-sm text-[#7c5f37] dark:text-zinc-500">{target.progress_minutes} / {target.target_hours * 60} min</span>
          {progressPercentage < 100 && (
            <span className="text-xs text-[#8f7353] dark:text-zinc-600 mt-0.5">
              {Math.max(0, target.target_hours * 60 - target.progress_minutes)} min left
            </span>
          )}
        </div>
        <div className="flex items-center justify-center px-4 self-stretch">
          {target.is_done ? (
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={confirmMarkAsDone}
                onPointerDown={e => e.stopPropagation()}
                disabled={loading}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg text-xs transition disabled:opacity-50"
              >
                ✓ Done
              </button>
              {progressPercentage > 100 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ background: '#78350f', color: '#fbbf24' }}>
                  +{Math.round(progressPercentage - 100)}%
                </span>
              )}
            </div>
          ) : progressPercentage >= 100 ? (
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={confirmMarkAsDone}
                onPointerDown={e => e.stopPropagation()}
                disabled={loading}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs transition disabled:opacity-50 pulse-btn"
              >
                Mark Done ✓
              </button>
              {progressPercentage > 100 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ background: '#78350f', color: '#fbbf24' }}>
                  +{Math.round(progressPercentage - 100)}%
                </span>
              )}
            </div>
          ) : (
            <p className="text-4xl font-black text-orange-500 leading-none">{Math.round(progressPercentage)}%</p>
          )}
        </div>
      </div>

      {/* Gradient Blocks */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={blockClass(i)}
            style={blockStyle(i)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddProgress}
          onPointerDown={e => e.stopPropagation()}
          disabled={loading || target.is_done}
          className="flex-1 px-4 py-3 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 disabled:bg-[#ead9c8] dark:disabled:bg-zinc-900 text-[#3b2b1f] dark:text-zinc-200 disabled:text-[#9b7a58] dark:disabled:text-zinc-700 border border-[#e9d7c4] dark:border-zinc-700 disabled:border-[#ead9c8] dark:disabled:border-zinc-800 rounded-xl font-semibold transition hover:border-[#ddb892] dark:hover:border-zinc-600 disabled:cursor-not-allowed"
        >
          {loading ? '↑ Adding...' : '+1 (15 min)'}
        </button>
        <button
          onClick={handleReset}
          onPointerDown={e => e.stopPropagation()}
          disabled={loading || target.is_done}
          className="flex-1 px-4 py-3 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 disabled:bg-[#ead9c8] dark:disabled:bg-zinc-900 text-[#3b2b1f] dark:text-zinc-200 disabled:text-[#9b7a58] dark:disabled:text-zinc-700 border border-[#e9d7c4] dark:border-zinc-700 disabled:border-[#ead9c8] dark:disabled:border-zinc-800 rounded-xl font-semibold transition hover:border-[#ddb892] dark:hover:border-zinc-600 disabled:cursor-not-allowed"
        >
          {loading ? '↓ Removing...' : '-1 (15 min)'}
        </button>
      </div>
      </div>

      {/* Full Name Modal */}
      {showFullName && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-[#ead9c8] dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-[#ead9c8] dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-[#2a1f16] dark:text-zinc-100">Target Name</h3>
              <button
                onClick={() => setShowFullName(false)}
                className="text-[#8f7353] dark:text-zinc-500 hover:text-[#2a1f16] dark:hover:text-zinc-200 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-lg text-[#2a1f16] dark:text-zinc-100 break-words">{target.name}</p>
            </div>
            <div className="p-6 border-t border-[#ead9c8] dark:border-zinc-800">
              <button
                onClick={() => setShowFullName(false)}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-[#ead9c8] dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-[#ead9c8] dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-[#2a1f16] dark:text-zinc-100">Delete Target</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[#8f7353] dark:text-zinc-500 hover:text-[#2a1f16] dark:hover:text-zinc-200 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#3b2b1f] dark:text-zinc-300 mb-6">
                Are you sure you want to delete <strong>"{target.name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-200 border border-[#e9d7c4] dark:border-zinc-700 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Done Confirmation Modal */}
      {showMarkDoneConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#fff8f0] dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-[#ead9c8] dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-[#ead9c8] dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-[#2a1f16] dark:text-zinc-100">Mark Done</h3>
              <button
                onClick={() => setShowMarkDoneConfirm(false)}
                className="text-[#8f7353] dark:text-zinc-500 hover:text-[#2a1f16] dark:hover:text-zinc-200 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#3b2b1f] dark:text-zinc-300 mb-6">
                Mark <strong>"{target.name}"</strong> as complete?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMarkDoneConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#fff7ef] dark:bg-zinc-800 hover:bg-[#f8ede0] dark:hover:bg-zinc-700 text-[#3b2b1f] dark:text-zinc-200 border border-[#e9d7c4] dark:border-zinc-700 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsDone}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Marking...' : 'Mark Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
