import React, { useState, useEffect, useRef } from 'react'; 
import { io } from 'socket.io-client';
import { AnchorPill } from './AnchorPill';
import { RosterPanel } from './RosterPanel';
import { ActiveSession } from './ActiveSession';
import { UserProfile } from './UserProfile';
import { useDeskDirectAudio } from '../hooks/useDeskDirectAudio';
import '../styles/DeskDirectWidget.css';

// ⚠️ CRITICAL FOR PC-2: This MUST be the IP address of PC-1!
// Do NOT use 'localhost' here if testing across two different computers.
const socket = io('https://unseraphic-jadiel-nonprescribed.ngrok-free.dev '); 

export function DeskDirectWidget({ currentUser }) {
  const [view, setView] = useState('roster');          
  const [activeUser, setActiveUser] = useState(null);  
  const [roster, setRoster] = useState([]);
  const [isIncoming, setIsIncoming] = useState(false);

  // BUG FIX 1: Guarantee a valid, unique user_id even if the database fails
  const safeId = currentUser?.user_id || currentUser?.id || String(Math.floor(Math.random() * 10000));

  const { 
    startCall, acceptCall, endCall, toggleMute, isMuted, callState 
  } = useDeskDirectAudio(socket, safeId);

  // BUG FIX 2: Use a ref for the roster to prevent the socket listener from dropping payloads
  const rosterRef = useRef(roster);
  useEffect(() => {
    rosterRef.current = roster;
  }, [roster]);

  // ─── Presence & State Management ────────────────────────────────
  useEffect(() => {
    // BUG FIX 3: If logged out, physically cut the socket connection to remove ghost users!
    if (!currentUser) {
      if (socket.connected) socket.disconnect();
      return;
    }

    // If logged in, ensure we are connected
    if (!socket.connected) socket.connect();
    
    const safeProfile = { ...currentUser, user_id: safeId };
    socket.emit('join', safeProfile);

    // 1. Handle Roster Updates
    const handleRosterUpdate = (liveData) => {
      // STRICTLY filter out ourselves so we can't call ourselves
      const others = liveData.filter(u => String(u.user_id) !== String(safeId));
      setRoster(others);
    };

    // 2. Handle Incoming Calls
    const handleIncomingCall = (payload) => {
      const callerId = payload.from;
      const currentRoster = rosterRef.current;
      const caller = currentRoster.find(u => String(u.user_id) === String(callerId));
      
      // Set the active user and explicitly flag it as an incoming call
      setActiveUser(caller || { name: `Operator ${callerId || 'Unknown'}`, department: 'Incoming Call' });
      setIsIncoming(true); 
    };

    socket.on('update_roster', handleRosterUpdate);
    socket.on('offer', handleIncomingCall);

    return () => {
      socket.off('update_roster', handleRosterUpdate);
      socket.off('offer', handleIncomingCall);
    };
  }, [currentUser, safeId]); // Removed 'roster' dependency to stop infinite loops!

  useEffect(() => {
    if (callState === 'ringing' || callState === 'connected') {
      setView('incall');
    } else if (callState === 'idle') {
      setView('roster');
      setActiveUser(null);
      setIsIncoming(false);
    }
  }, [callState]);

  const handleViewProfile = (user) => { setActiveUser(user); setView('profile'); };
  const handleBackToRoster = () => { setView('roster'); setActiveUser(null); };

  const handleCallUser = (user) => {
    setActiveUser(user);
    setIsIncoming(false); // We are initiating!
    startCall(user.user_id || user.id);  
  };

  const handleEndCall = () => endCall(); 
  const handleToggleMute = () => toggleMute(); 
  const handleAcceptCall = () => acceptCall();

  return (
    <div className="dd-widget-root">
      {view === 'roster' && (
        <RosterPanel roster={roster} onCallUser={handleCallUser} onViewProfile={handleViewProfile} />
      )}
      {view === 'profile' && activeUser && (
        <UserProfile user={activeUser} onBack={handleBackToRoster} onCallUser={handleCallUser} />
      )}
      {view === 'incall' && (
        <ActiveSession
          activeUser={activeUser}
          callState={callState}        
          isIncoming={isIncoming} 
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onEndCall={handleEndCall}
          onAcceptCall={handleAcceptCall} 
        />
      )}
    </div>
  );
}


// import React, { useState, useEffect, useRef } from 'react'; 
// import { io } from 'socket.io-client';
// import { AnchorPill } from './AnchorPill';
// import { RosterPanel } from './RosterPanel';
// import { ActiveSession } from './ActiveSession';
// import { UserProfile } from './UserProfile';
// import { useDeskDirectAudio } from '../hooks/useDeskDirectAudio';
// import '../styles/DeskDirectWidget.css';

// // ⚠️ CRITICAL FOR PC-2: This MUST be the IP address of PC-1!
// // Do NOT use 'localhost' here if testing across two different computers.
// const socket = io('http://192.168.1.5:3000'); 

// export function DeskDirectWidget({ currentUser }) {
//   const [view, setView] = useState('roster');          
//   const [activeUser, setActiveUser] = useState(null);  
//   const [roster, setRoster] = useState([]);
//   const [isIncoming, setIsIncoming] = useState(false);

//   // BUG FIX 1: Guarantee a valid, unique user_id even if the database fails
//   const safeId = currentUser?.user_id || currentUser?.id || String(Math.floor(Math.random() * 10000));

//   const { 
//     startCall, acceptCall, endCall, toggleMute, isMuted, callState 
//   } = useDeskDirectAudio(socket, safeId);

//   // BUG FIX 2: Use a ref for the roster to prevent the socket listener from dropping payloads
//   const rosterRef = useRef(roster);
//   useEffect(() => {
//     rosterRef.current = roster;
//   }, [roster]);

//   useEffect(() => {
//     if (!currentUser) return;
    
//     const safeProfile = { ...currentUser, user_id: safeId };
//     socket.emit('join', safeProfile);

//     // 1. Handle Roster Updates
//     const handleRosterUpdate = (liveData) => {
//       // STRICTLY filter out ourselves so we can't call ourselves (Fixes Image 1)
//       const others = liveData.filter(u => String(u.user_id) !== String(safeId));
//       setRoster(others);
//     };

//     // 2. Handle Incoming Calls
//     const handleIncomingCall = (payload) => {
//       const callerId = payload.from;
//       const currentRoster = rosterRef.current;
//       const caller = currentRoster.find(u => String(u.user_id) === String(callerId));
      
//       // Set the active user and explicitly flag it as an incoming call
//       setActiveUser(caller || { name: `Operator ${callerId || 'Unknown'}`, department: 'Incoming Call' });
//       setIsIncoming(true); 
//     };

//     socket.on('update_roster', handleRosterUpdate);
//     socket.on('offer', handleIncomingCall);

//     return () => {
//       socket.off('update_roster', handleRosterUpdate);
//       socket.off('offer', handleIncomingCall);
//     };
//   }, [currentUser, safeId]); // Removed 'roster' dependency to stop infinite loops!

//   useEffect(() => {
//     if (callState === 'ringing' || callState === 'connected') {
//       setView('incall');
//     } else if (callState === 'idle') {
//       setView('roster');
//       setActiveUser(null);
//       setIsIncoming(false);
//     }
//   }, [callState]);

//   const handleViewProfile = (user) => { setActiveUser(user); setView('profile'); };
//   const handleBackToRoster = () => { setView('roster'); setActiveUser(null); };

//   const handleCallUser = (user) => {
//     setActiveUser(user);
//     setIsIncoming(false); // We are initiating!
//     startCall(user.user_id || user.id);  
//   };

//   const handleEndCall = () => endCall(); 
//   const handleToggleMute = () => toggleMute(); 
//   const handleAcceptCall = () => acceptCall();

//   return (
//     <div className="dd-widget-root">
//       {view === 'roster' && (
//         <RosterPanel roster={roster} onCallUser={handleCallUser} onViewProfile={handleViewProfile} />
//       )}
//       {view === 'profile' && activeUser && (
//         <UserProfile user={activeUser} onBack={handleBackToRoster} onCallUser={handleCallUser} />
//       )}
//       {view === 'incall' && (
//         <ActiveSession
//           activeUser={activeUser}
//           callState={callState}        
//           isIncoming={isIncoming} 
//           isMuted={isMuted}
//           onToggleMute={handleToggleMute}
//           onEndCall={handleEndCall}
//           onAcceptCall={handleAcceptCall} 
//         />
//       )}
//     </div>
//   );
// }