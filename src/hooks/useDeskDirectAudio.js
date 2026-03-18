import { useCallback, useEffect, useRef, useState } from "react";

export function useDeskDirectAudio(socket, currentUserId) {
  const [callState, setCallState] = useState("idle"); // 'idle' | 'ringing' | 'connected'
  const [isMuted, setIsMuted] = useState(false);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const incomingOfferRef = useRef(null);
  const callerIdRef = useRef(null);
  const targetUserIdRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" },{ urls: "stun:stun1.l.google.com:19302" }],
  };

  useEffect(() => {
    const audio = document.createElement("audio");
    audio.autoplay = true;
    remoteAudioRef.current = audio;

    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
      remoteAudioRef.current = null;
    };
  }, []);

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;
    return stream;
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && targetUserIdRef.current) {
        socket.emit("ice-candidate", {
          from: currentUserId,
          to: targetUserIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;

      if (state === "connected") {
        setCallState("connected");
      } else if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        setCallState("idle");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, currentUserId]);

  const addLocalTracks = useCallback(
    async (pc) => {
      const stream = await getLocalStream();

      stream.getTracks().forEach((track) => {
        const alreadyAdded = pc.getSenders().some(
          (sender) => sender.track && sender.track.id === track.id
        );

        if (!alreadyAdded) {
          pc.addTrack(track, stream);
        }
      });
    },
    [getLocalStream]
  );

  const startCall = useCallback(
    async (targetUserId) => {
      try {
        targetUserIdRef.current = targetUserId;
        setCallState("ringing");

        const pc = createPeerConnection();
        await addLocalTracks(pc);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (socket) {
          socket.emit("offer", {
            from: currentUserId,
            to: targetUserId,
            offer,
          });
        }
      } catch (error) {
        console.error("Error starting call:", error);
        setCallState("idle");
      }
    },
    [socket, currentUserId, createPeerConnection, addLocalTracks]
  );

  const acceptCall = useCallback(async () => {
    try {
      if (!incomingOfferRef.current || !callerIdRef.current) {
        return;
      }

      targetUserIdRef.current = callerIdRef.current;

      const pc = createPeerConnection();
      await addLocalTracks(pc);

      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingOfferRef.current)
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket) {
        socket.emit("answer", {
          from: currentUserId,
          to: callerIdRef.current,
          answer,
        });
      }

      setCallState("connected");
    } catch (error) {
      console.error("Error accepting call:", error);
      setCallState("idle");
    }
  }, [socket, currentUserId, createPeerConnection, addLocalTracks]);

  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    incomingOfferRef.current = null;
    callerIdRef.current = null;
    targetUserIdRef.current = null;

    setCallState("idle");
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = ({ from, offer }) => {
      callerIdRef.current = from;
      incomingOfferRef.current = offer;
      setCallState("ringing");
    };

    const handleAnswer = async ({ answer }) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState("connected");
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc || !candidate) return;

        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    callState,
    isMuted,
  };
}