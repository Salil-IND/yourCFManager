/**
 * Codeforces API Utility
 * Fetch problems from the public problemset API
 */

export const fetchProblems = async () => {
  const response = await fetch('https://codeforces.com/api/problemset.problems');
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch problems from Codeforces');
  }

  // The API returns an object { status, result: { problems, problemStatistics } }
  // We normalize to just extract the problems array.
  return data.result.problems;
};
