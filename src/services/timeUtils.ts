export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const posted = timestamp.toDate();
  const diff = Math.floor((now - posted) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return "Yesterday";
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return posted.toLocaleDateString(); // older posts
};