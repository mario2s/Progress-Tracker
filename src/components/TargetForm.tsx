import { useState } from 'react';
import { targetsService } from '../lib/supabase';
import type { Target } from '../lib/supabase';

interface TargetFormProps {
  onTargetCreated: (target: Target) => void;
}

const defaultDueDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

export const TargetForm: React.FC<TargetFormProps> = ({ onTargetCreated }) => {
  const [name, setName] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Target name is required');
      return;
    }

    if (!targetHours || parseFloat(targetHours) <= 0) {
      setError('Target hours must be greater than 0');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    setLoading(true);
    try {
      const target = await targetsService.createTarget(name, parseFloat(targetHours), dueDate);
      onTargetCreated(target);
      setName('');
      setTargetHours('');
      setDueDate(defaultDueDate());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create target');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-sm font-semibold text-[#7c5f37] dark:text-zinc-400 mb-2">
            Target Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Learning React"
            className="w-full px-4 py-2.5 bg-[#fff7ef] dark:bg-zinc-800 border border-[#e9d7c4] dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[#2a1f16] dark:text-zinc-100 placeholder-[#b89b7c] dark:placeholder-zinc-600 transition"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#7c5f37] dark:text-zinc-400 mb-2">
            Target (Hours)
          </label>
          <input
            type="number"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            placeholder="e.g., 10"
            step="0.5"
            min="0.5"
            className="w-full px-4 py-2.5 bg-[#fff7ef] dark:bg-zinc-800 border border-[#e9d7c4] dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[#2a1f16] dark:text-zinc-100 placeholder-[#b89b7c] dark:placeholder-zinc-600 transition"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#7c5f37] dark:text-zinc-400 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#fff7ef] dark:bg-zinc-800 border border-[#e9d7c4] dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[#2a1f16] dark:text-zinc-100 transition"
            disabled={loading}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-[#ead9c8] dark:disabled:bg-zinc-800 disabled:text-[#9b7a58] dark:disabled:text-zinc-600 text-white rounded-xl font-semibold transition transform hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : '✓ Create Target'}
      </button>
    </form>
  );
};
