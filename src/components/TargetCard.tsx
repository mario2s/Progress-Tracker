import React, { useState } from 'react';
import type { Target } from '../lib/supabase';
import { targetsService } from '../lib/supabase';
import { timeUtils } from '../lib/timeUtils';

interface TargetCardProps {
  target: Target;
  onUpdate: (target: Target) => void;
  onDelete: (id: string) => void;
}

export const TargetCard: React.FC<TargetCardProps> = ({ target, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMarkDoneConfirm, setShowMarkDoneConfirm] = useState(false);

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
      return { background: 'linear-gradient(135deg,#d97706,#fbbf24)', boxShadow: '0 0 22px 8px rgba(251,191,36,0.75)' };
    }
    if (isOver || i < filledCount) {
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
    if (isOver && i === 9) return 'flex-1 h-9 rounded-lg pulse-over';
    if (hasPartialBlock && i === filledCount) return 'flex-1 h-9 rounded-lg pulse-lead';
    if (isOver || i < filledCount) return 'flex-1 h-9 rounded-lg';
    return 'flex-1 h-9 rounded-lg';
  };

  return (
    <div className={`bg-blue-300 dark:bg-zinc-900 rounded-2xl p-6 border transition-colors duration-200 ${
      target.is_done
        ? 'border-blue-400 dark:border-zinc-800 opacity-50'
        : 'border-blue-400 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-zinc-700'
    }`}>
      {error && <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 p-2 rounded mb-3 text-sm">{error}</div>}

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className={`text-xl font-bold transition ${target.is_done ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-800 dark:text-zinc-100'}`}>
              {target.name}
            </h3>
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="text-zinc-400 dark:text-zinc-600 hover:text-red-400 font-bold text-lg transition w-7 h-7 rounded-full border-2 border-orange-600 hover:border-red-400 flex items-center justify-center flex-shrink-0"
              title="Delete"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm text-zinc-500">{target.progress_minutes} / {target.target_hours * 60} min</span>
            <span className="text-zinc-600">·</span>
            <select
              value={target.priority}
              onChange={(e) => handlePriorityChange(parseInt(e.target.value))}
              disabled={loading}
              className="text-sm bg-transparent border-none outline-none text-zinc-500 cursor-pointer hover:text-zinc-300 transition"
            >
              {[1, 2, 3, 4, 5].map(p => (
                <option key={p} value={p}>P{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top-right: % below 100%, Mark Done at/above 100%, ✓ Done if finished */}
        <div className="flex-shrink-0 ml-4 text-right">
          {target.is_done ? (
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={confirmMarkAsDone}
                disabled={loading}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                ✓ Done
              </button>
              {progressPercentage > 100 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ background: '#78350f', color: '#fbbf24' }}>
                  +{Math.round(progressPercentage - 100)}% extra
                </span>
              )}
            </div>
          ) : progressPercentage >= 100 ? (
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={confirmMarkAsDone}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                Mark Done ✓
              </button>
              {progressPercentage > 100 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ background: '#78350f', color: '#fbbf24' }}>
                  +{Math.round(progressPercentage - 100)}% extra
                </span>
              )}
            </div>
          ) : (
            <div>
              <p className="text-4xl font-black text-orange-500 leading-none">{Math.round(progressPercentage)}%</p>
              <p className="text-xs text-zinc-600 mt-1">
                {Math.max(0, target.target_hours * 60 - target.progress_minutes)} min left
              </p>
            </div>
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
          disabled={loading || target.is_done}
          className="flex-1 px-4 py-3 bg-blue-200 dark:bg-zinc-800 hover:bg-blue-300 dark:hover:bg-zinc-700 disabled:bg-blue-100 dark:disabled:bg-zinc-900 text-slate-700 dark:text-zinc-200 disabled:text-slate-400 dark:disabled:text-zinc-700 border border-blue-400 dark:border-zinc-700 disabled:border-blue-300 dark:disabled:border-zinc-800 rounded-xl font-semibold transition hover:border-blue-500 dark:hover:border-zinc-600 disabled:cursor-not-allowed"
        >
          {loading ? '↑ Adding...' : '+1 (15 min)'}
        </button>
        <button
          onClick={handleReset}
          disabled={loading || target.is_done}
          className="flex-1 px-4 py-3 bg-blue-200 dark:bg-zinc-800 hover:bg-blue-300 dark:hover:bg-zinc-700 disabled:bg-blue-100 dark:disabled:bg-zinc-900 text-slate-700 dark:text-zinc-200 disabled:text-slate-400 dark:disabled:text-zinc-700 border border-blue-400 dark:border-zinc-700 disabled:border-blue-300 dark:disabled:border-zinc-800 rounded-xl font-semibold transition hover:border-blue-500 dark:hover:border-zinc-600 disabled:cursor-not-allowed"
        >
          {loading ? '↓ Removing...' : '-1 (15 min)'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-blue-300 dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-blue-400 dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-blue-400 dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Delete Target</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-zinc-300 mb-6">
                Are you sure you want to delete <strong>"{target.name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-200 dark:bg-zinc-800 hover:bg-blue-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-blue-400 dark:border-zinc-700 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-blue-300 dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-blue-400 dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-blue-400 dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Mark Done</h3>
              <button
                onClick={() => setShowMarkDoneConfirm(false)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-zinc-300 mb-6">
                Mark <strong>"{target.name}"</strong> as complete?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMarkDoneConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-200 dark:bg-zinc-800 hover:bg-blue-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-blue-400 dark:border-zinc-700 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
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
