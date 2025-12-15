import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const CallProvider = ({ children }) => {
  const { socket, authUser, axios } = useContext(AuthContext);

  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callType, setCallType] = useState(null); // 'voice' | 'video'
  const [isRinging, setIsRinging] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && activeCall) {
        socket?.emit("iceCandidate", {
          to: activeCall.userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      if (event.streams && event.streams[0]) {
        console.log(
          "Setting remote stream with",
          event.streams[0].getTracks().length,
          "tracks"
        );
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      } else if (event.track) {
        // Handle case where stream is not provided
        const stream = remoteStreamRef.current || new MediaStream();
        stream.addTrack(event.track);
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed"
      ) {
        endCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Start a call
  const startCall = async (user, type) => {
    try {
      setCallType(type);
      setActiveCall({
        userId: user._id,
        userName: user.fullName,
        userPic: user.ProfilePic,
      });
      setIsRinging(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });

      console.log(
        "Got local stream with tracks:",
        stream.getTracks().map((t) => t.kind)
      );
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        console.log("Adding local track to peer connection:", track.kind);
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit("callRequest", {
        to: String(user._id),
        from: String(authUser._id),
        offer,
        callType: type,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to access media devices");
      endCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setCallType(incomingCall.callType);
      setActiveCall({
        userId: incomingCall.from,
        userName: incomingCall.userName,
        userPic: incomingCall.userPic,
      });
      setIsRinging(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.callType === "video",
      });

      console.log(
        "Got local stream (callee) with tracks:",
        stream.getTracks().map((t) => t.kind)
      );
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        console.log(
          "Adding local track (callee) to peer connection:",
          track.kind
        );
        pc.addTrack(track, stream);
      });

      console.log("Setting remote description from offer");
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Process queued ICE candidates after remote description is set
      console.log(
        "Processing",
        iceCandidatesQueue.current.length,
        "queued ICE candidates (callee)"
      );
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Failed to add ICE candidate:", err);
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit("callAccepted", {
        to: incomingCall.from,
        answer,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to accept call");
      rejectCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      socket?.emit("callRejected", { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  // End active call
  const endCall = () => {
    if (activeCall) {
      socket?.emit("endCall", { to: String(activeCall.userId) });
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Stop remote stream
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setCallType(null);
    setIsRinging(false);
    iceCandidatesQueue.current = [];
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, offer, callType }) => {
      try {
        setIncomingCall({
          from,
          offer,
          callType,
          userName: "User", // Ideally fetch this or lookup from friends list
          userPic: null,
        });
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    };

    const handleCallAccepted = async ({ answer }) => {
      try {
        setIsRinging(false);
        const pc = peerConnectionRef.current;
        if (pc) {
          console.log("Setting remote description from answer");
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Process queued ICE candidates after remote description is set
          console.log(
            "Processing",
            iceCandidatesQueue.current.length,
            "queued ICE candidates"
          );
          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.warn("Failed to add ICE candidate:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error handling call accepted:", error);
        toast.error("Failed to establish connection");
        endCall();
      }
    };

    const handleCallRejected = () => {
      toast.error("Call was rejected");
      endCall();
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          console.log("Adding ICE candidate immediately");
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidate if remote description not set yet
          console.log("Queueing ICE candidate (remote description not ready)");
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    };

    const handleCallEnded = () => {
      toast("Call ended");
      endCall();
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, authUser]);

  const value = {
    incomingCall,
    activeCall,
    callType,
    isRinging,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
