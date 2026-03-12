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


// WhatsApp-style last seen formatting
export const formatAwaySince = (timestamp) => {
  if (!timestamp) return '';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'object' && timestamp) {
    const seconds =
      typeof timestamp.seconds === 'number'
        ? timestamp.seconds
        : typeof timestamp._seconds === 'number'
        ? timestamp._seconds
        : null;
    const nanoseconds =
      typeof timestamp.nanoseconds === 'number'
        ? timestamp.nanoseconds
        : typeof timestamp._nanoseconds === 'number'
        ? timestamp._nanoseconds
        : 0;
    if (seconds !== null) {
      date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
    } else {
      date = new Date(timestamp);
    }
  } else if (typeof timestamp === 'number') {
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    date = new Date(ms);
  } else {
    date = new Date(timestamp);
  }
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const awayDayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.floor(
    (todayStart.getTime() - awayDayStart.getTime()) / (24 * 60 * 60 * 1000),
  );

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (dayDiff <= 0) return timeStr; // same-day: time only
  if (dayDiff === 1) return 'yesterday';
  if (dayDiff < 7) return `${dayDiff} days ago`;
  if (dayDiff < 14) return '1 week ago';
  if (dayDiff < 21) return '2 weeks ago';
  if (dayDiff < 28) return '3 weeks ago';
  if (dayDiff < 60) return '1 month ago';
  if (dayDiff < 365) return `${Math.floor(dayDiff / 30)} months ago`;
  const years = Math.floor(dayDiff / 365);
  return years <= 1 ? '1 year ago' : `${years} years ago`;
};

export const formatPresenceLastSeenExact = (timestamp) => {
  if (!timestamp) return "";

  let date: Date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'object' && timestamp) {
    const seconds =
      typeof timestamp.seconds === 'number'
        ? timestamp.seconds
        : typeof timestamp._seconds === 'number'
        ? timestamp._seconds
        : null;
    const nanoseconds =
      typeof timestamp.nanoseconds === 'number'
        ? timestamp.nanoseconds
        : typeof timestamp._nanoseconds === 'number'
        ? timestamp._nanoseconds
        : 0;
    if (seconds !== null) {
      date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
    } else {
      date = new Date(timestamp);
    }
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
