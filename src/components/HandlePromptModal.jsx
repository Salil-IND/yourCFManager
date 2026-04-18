import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const HandlePromptModal = () => {
  const { user, cfHandle, isAuthLoading, setCfHandle } = useAuthStore();
  const [handleInput, setHandleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Only show if logged in, loading is done, and handle is not set
  if (isAuthLoading || !user || cfHandle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Basic verification that the handle exists on CF (optional, but good practice)
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${handleInput.trim()}`);
      const data = await res.json();

      if (data.status !== 'OK') {
        throw new Error('Codeforces handle not found');
      }

      const verifiedHandle = data.result[0].handle;

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        cfHandle: verifiedHandle,
        email: user.email,
        displayName: user.displayName,
        updatedAt: new Date()
      }, { merge: true });

      // Update local state
      setCfHandle(verifiedHandle);
    } catch (err) {
      setError(err.message || 'Failed to link handle. Please check your spelling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome, Developer!</h2>
          <p className="text-slate-400 text-sm mb-6">
            To track your progress and enable personalized analytics, we need your Codeforces handle.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Codeforces Handle
              </label>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="e.g. tourist"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-slate-200"
              />
            </div>
            
            {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !handleInput.trim()}
              className="mt-2 w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying & Saving...' : 'Link Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HandlePromptModal;
