import { useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────
// useWebRTC — Stub placeholder hook
// Replace the console.log bodies with the real WebRTC team's logic.
// ─────────────────────────────────────────────────────────────────

export function useWebRTC() {
  const [isMuted, setIsMuted] = useState(false);

  /**
   * startCall — initiate a peer-to-peer audio session.
   * @param {string} targetUserId — from the roster row's user.id
   * BIND POINT: Replace body with WebRTC team's signaling call.
   */
  const startCall = useCallback((targetUserId) => {
    console.log('[DeskDirect WebRTC] startCall() triggered for userId:', targetUserId);
    // TODO: WebRTC team — wire peer connection + signaling here
  }, []);

  /**
   * endCall — tear down the active peer-to-peer session.
   * BIND POINT: Replace body with WebRTC team's cleanup call.
   */
  const endCall = useCallback(() => {
    console.log('[DeskDirect WebRTC] endCall() triggered');
    // TODO: WebRTC team — close peer connection + cleanup here
    setIsMuted(false); // reset mute on hang-up
  }, []);

  /**
   * toggleMute — toggle the local audio track mute state.
   * BIND POINT: Replace body with WebRTC team's track mute/unmute.
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      console.log('[DeskDirect WebRTC] toggleMute() →', next ? 'MUTED' : 'UNMUTED');
      // TODO: WebRTC team — localStream.getAudioTracks()[0].enabled = !next
      return next;
    });
  }, []);

  return { startCall, endCall, toggleMute, isMuted };
}
