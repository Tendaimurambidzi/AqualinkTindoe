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
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isToday) {
    return `today at ${timeStr}`;
  } else if (isYesterday) {
    return `yesterday at ${timeStr}`;
  } else {
    // WhatsApp: show date as "dd/mm/yyyy at HH:MM"
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} at ${timeStr}`;
  }
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
