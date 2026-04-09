"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPresenceLastSeenExact = exports.formatAwaySince = exports.formatDefiniteTime = exports.timeAgo = void 0;
var timeAgo = function (timestamp) {
    if (!timestamp)
        return "";
    var now = new Date();
    var posted = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    var diff = Math.floor((now - posted) / 1000);
    if (diff < 60)
        return "Just now";
    if (diff < 3600)
        return "".concat(Math.floor(diff / 60), " min ago");
    if (diff < 86400)
        return "".concat(Math.floor(diff / 3600), " hrs ago");
    if (diff < 172800)
        return "Yesterday";
    if (diff < 604800)
        return "".concat(Math.floor(diff / 86400), " days ago");
    return posted.toLocaleDateString(); // older posts
};
exports.timeAgo = timeAgo;
var formatDefiniteTime = function (timestamp) {
    if (!timestamp)
        return "";
    var posted = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
exports.formatDefiniteTime = formatDefiniteTime;
// WhatsApp-style last seen formatting
var formatAwaySince = function (timestamp) {
    if (!timestamp)
        return '';
    var date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    }
    else if (typeof timestamp === 'object' && timestamp) {
        var seconds = typeof timestamp.seconds === 'number'
            ? timestamp.seconds
            : typeof timestamp._seconds === 'number'
                ? timestamp._seconds
                : null;
        var nanoseconds = typeof timestamp.nanoseconds === 'number'
            ? timestamp.nanoseconds
            : typeof timestamp._nanoseconds === 'number'
                ? timestamp._nanoseconds
                : 0;
        if (seconds !== null) {
            date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
        }
        else {
            date = new Date(timestamp);
        }
    }
    else if (typeof timestamp === 'number') {
        var ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        date = new Date(ms);
    }
    else {
        date = new Date(timestamp);
    }
    if (isNaN(date.getTime()))
        return '';
    var now = new Date();
    var isToday = date.toDateString() === now.toDateString();
    var yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    var isYesterday = date.toDateString() === yesterday.toDateString();
    var timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    if (isToday) {
        return "today at ".concat(timeStr);
    }
    else if (isYesterday) {
        return "yesterday at ".concat(timeStr);
    }
    else {
        // WhatsApp: show date as "dd/mm/yyyy at HH:MM"
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var year = date.getFullYear();
        return "".concat(day, "/").concat(month, "/").concat(year, " at ").concat(timeStr);
    }
};
exports.formatAwaySince = formatAwaySince;
var formatPresenceLastSeenExact = function (timestamp) {
    if (!timestamp)
        return "";
    var date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    }
    else if (typeof timestamp === 'object' && timestamp) {
        var seconds = typeof timestamp.seconds === 'number'
            ? timestamp.seconds
            : typeof timestamp._seconds === 'number'
                ? timestamp._seconds
                : null;
        var nanoseconds = typeof timestamp.nanoseconds === 'number'
            ? timestamp.nanoseconds
            : typeof timestamp._nanoseconds === 'number'
                ? timestamp._nanoseconds
                : 0;
        if (seconds !== null) {
            date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
        }
        else {
            date = new Date(timestamp);
        }
    }
    else if (typeof timestamp === 'number') {
        var ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        date = new Date(ms);
    }
    else {
        date = new Date(timestamp);
    }
    if (isNaN(date.getTime()))
        return "";
    var dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    var timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    return "".concat(dateStr, " at ").concat(timeStr);
};
exports.formatPresenceLastSeenExact = formatPresenceLastSeenExact;
