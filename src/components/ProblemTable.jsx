import React, { useMemo, useState } from 'react';
import { useProblems } from '../hooks/useProblems';
import { useFilterStore } from '../store/useFilterStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStatus } from '../hooks/useUserStatus';
import { CheckCircle2, Star } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const ITEMS_PER_PAGE = 50;

const ProblemTable = ({ onlyBookmarked = false }) => {
  const { data: problems = [], isLoading, isError, error } = useProblems();
  const { searchQuery, selectedTags, ratingRange, sortBy, sortOrder } = useFilterStore();
  const { user, cfHandle, bookmarks, toggleLocalBookmark } = useAuthStore();
  const { data: solvedSet = new Set() } = useUserStatus(cfHandle);
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggleBookmark = async (problemKey) => {
    if (!user) {
      alert("Please sign in to bookmark problems!");
      return;
    }

    const isCurrentlyBookmarked = bookmarks.includes(problemKey);
    // Optimistic local update
    toggleLocalBookmark(problemKey);

    try {
      const docRef = doc(db, 'users', user.uid);
      if (isCurrentlyBookmarked) {
        await updateDoc(docRef, { bookmarks: arrayRemove(problemKey) });
      } else {
        await updateDoc(docRef, { bookmarks: arrayUnion(problemKey) });
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      // Revert if error
      toggleLocalBookmark(problemKey);
    }
  };

  const filteredAndSortedProblems = useMemo(() => {
    // 1. Filter
    let result = problems.filter(prob => {
      // Check Bookmarks first
      if (onlyBookmarked && !bookmarks.includes(`${prob.contestId}-${prob.index}`)) {
        return false;
      }
      
      // Name Search
      if (searchQuery && !prob.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Rating Range (Assume unrated problems have rating 0)
      const r = prob.rating || 0;
      if (r < ratingRange[0] || r > ratingRange[1]) {
        return false;
      }
      // Tags (must contain ALL selected tags)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => prob.tags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }
      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'rating') {
        valA = a.rating || 0;
        valB = b.rating || 0;
      } else if (sortBy === 'solvedCount') {
        valA = a.solvedCount;
        valB = b.solvedCount;
      } else {
        // default by name
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [problems, searchQuery, selectedTags, ratingRange, sortBy, sortOrder, onlyBookmarked, bookmarks]);

  // Reset pagination to 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, ratingRange, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedProblems.length / ITEMS_PER_PAGE) || 1;
  const currentProblems = filteredAndSortedProblems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400 p-4 font-medium bg-red-950 border border-red-900 rounded-lg">Error loading problems: {error.message}</div>;
  }

  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden">
      <div className="overflow-x-auto shadow-lg border border-slate-800 rounded-xl bg-slate-900">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950">
            <tr>
              <th scope="col" className="px-6 py-4 w-12"></th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Problem</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tags</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Solved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {currentProblems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                  No problems match your exact filters.
                </td>
              </tr>
            ) : (
              currentProblems.map(prob => {
                const problemUrl = `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`;
                const problemKey = `${prob.contestId}-${prob.index}`;
                const isSolved = solvedSet.has(problemKey);

                return (
                  <tr 
                    key={problemKey} 
                    className={`transition-colors duration-150 group flex items-center ${
                      isSolved 
                        ? 'bg-gradient-to-r from-emerald-900/20 to-transparent border-l-4 border-emerald-500 hover:from-emerald-900/30' 
                        : 'border-l-4 border-transparent hover:bg-slate-800/50'
                    }`}
                    style={{ display: 'table-row' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap w-12">
                      <button 
                        onClick={() => handleToggleBookmark(problemKey)}
                        className="p-1 rounded-md hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
                        title={bookmarks.includes(problemKey) ? "Remove bookmark" : "Bookmark problem"}
                      >
                        <Star 
                          className={`w-5 h-5 transition-all duration-200 ${
                            bookmarks.includes(problemKey) 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                              : 'text-slate-600 hover:text-amber-400/50'
                          }`} 
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={problemUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className={`font-medium font-sans flex items-center gap-2 transition-colors ${isSolved ? 'text-emerald-400 hover:text-emerald-300' : 'text-cyan-400 group-hover:text-cyan-300'}`}
                      >
                        {isSolved && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        <span className={`font-mono text-xs ${isSolved ? 'text-emerald-600' : 'text-slate-500'}`}>{prob.contestId}{prob.index}</span>
                        {prob.name}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md border ${
                        (prob.rating >= 2400) ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        (prob.rating >= 1900) ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' :
                        (prob.rating >= 1600) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        (prob.rating >= 1400) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        (prob.rating > 0) ? 'bg-slate-700/50 text-slate-300 border-slate-600' :
                        'bg-slate-800/50 text-slate-500 border-slate-700'
                      }`}>
                        {prob.rating || 'Unrated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {prob.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-400 border border-slate-700 tracking-wider">
                            {tag}
                          </span>
                        ))}
                        {prob.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500">
                            +{prob.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-400 font-mono">
                      {prob.solvedCount.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredAndSortedProblems.length > 0 && (
        <div className="flex items-center justify-between border border-slate-800 bg-slate-900 px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-slate-200">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProblems.length)}</span> of{' '}
                <span className="font-semibold text-slate-200">{filteredAndSortedProblems.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  &larr; Prev
                </button>
                <div className="px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-inset ring-slate-700 bg-slate-800/50">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Next</span>
                  Next &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemTable;
