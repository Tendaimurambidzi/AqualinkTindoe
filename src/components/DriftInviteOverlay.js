"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriftInviteOverlay = void 0;
var react_1 = __importDefault(require("react"));
var DriftInviteNotificationPanel_1 = require("./DriftInviteNotificationPanel");
var useDriftInviteNotifications_1 = require("../hooks/useDriftInviteNotifications");
var DriftInviteOverlay = function (_a) {
    var onJoinLive = _a.onJoinLive;
    var _b = (0, useDriftInviteNotifications_1.useDriftInviteNotifications)(), currentInvite = _b.currentInvite, isVisible = _b.isVisible, handleAccept = _b.handleAccept, handlePass = _b.handlePass;
    if (!currentInvite || !isVisible) {
        return null;
    }
    return (<DriftInviteNotificationPanel_1.DriftInviteNotificationPanel visible={isVisible} fromName={currentInvite.fromName} fromPhoto={currentInvite.fromPhoto} fromUid={currentInvite.fromUid} liveTitle={currentInvite.liveTitle} inviteType={currentInvite.inviteType} onAccept={function () { return handleAccept(onJoinLive); }} onPass={handlePass}/>);
};
exports.DriftInviteOverlay = DriftInviteOverlay;
