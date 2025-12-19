export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const posted = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((now - posted) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return "Yesterday";
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return posted.toLocaleDateString(); // older posts
};

export const formatDefiniteTime = (timestamp) => {
  if (!timestamp) return "";

  const posted = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  // Return format like "Dec 19, 2025 at 3:45 PM"
  return posted.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' at ' + posted.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};