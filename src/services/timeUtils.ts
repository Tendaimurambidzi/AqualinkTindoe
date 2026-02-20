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

export const formatAwaySince = (timestamp) => {
  if (!timestamp) return "";

  let date: Date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'number') {
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    date = new Date(ms);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (date >= startOfToday) {
    return `today at ${timeStr}`;
  }
  if (date >= startOfYesterday) {
    return `yesterday at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  return `${dateStr} at ${timeStr}`;
};

export const formatPresenceLastSeenExact = (timestamp) => {
  if (!timestamp) return "";

  let date: Date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'number') {
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    date = new Date(ms);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "";

  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} at ${timeStr}`;
};
