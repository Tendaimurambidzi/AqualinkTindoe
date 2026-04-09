"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBytesDownloaded = addBytesDownloaded;
exports.resetSessionBytes = resetSessionBytes;
exports.getSessionMB = getSessionMB;
exports.overCap = overCap;
var sessionBytes = 0;
function addBytesDownloaded(bytes) {
    if (!Number.isFinite(bytes))
        return;
    sessionBytes += Math.max(0, Math.floor(bytes));
}
function resetSessionBytes() {
    sessionBytes = 0;
}
function getSessionMB() {
    return sessionBytes / (1024 * 1024);
}
function overCap(mb) {
    if (!mb || mb <= 0)
        return false;
    return getSessionMB() >= mb;
}
