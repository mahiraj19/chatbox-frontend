import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

const VideoCall = ({ userId, receiverId, onEndCall }) => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isCallIncoming, setIsCallIncoming] = useState(false);
  const [callerId, setCallerId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Initialize WebRTC Peer Connection
  const initializePeerConnection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection(iceServers);
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteVideoRef.current.srcObject = remoteStream;
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: receiverId,
            from: userId,
            candidate: event.candidate,
          });
        }
      };
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Handle Incoming Offer
  const handleIncomingOffer = async (from, offer) => {
    setCallerId(from);
    setIsCallIncoming(true);

    try {
      await initializePeerConnection();
      peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("videoAnswer", { to: from, from: userId, answer });
      setIsVideoCallActive(true);
      setIsCallIncoming(false);
    } catch (error) {
      console.error("Error handling incoming offer:", error);
    }
  };

  // Handle Incoming Answer
  const handleIncomingAnswer = async (answer) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(answer);
    }
  };

  // Handle ICE Candidate
  const handleIceCandidate = async (candidate) => {
    if (peerConnection.current) {
      await peerConnection.current.addIceCandidate(candidate);
    }
  };

  // Initiate Video Call
  const initiateVideoCall = async () => {
    setIsVideoCallActive(true);
    try {
      await initializePeerConnection();

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("videoOffer", {
        to: receiverId,
        from: userId,
        offer,
      });
    } catch (error) {
      console.error("Error initiating video call:", error);
      setIsVideoCallActive(false);
    }
  };

  // End Video Call
  const endVideoCall = () => {
    setIsVideoCallActive(false);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (onEndCall) onEndCall();
  };

  // Socket.IO Event Listeners
  useEffect(() => {
    socket.on("videoOffer", ({ from, offer }) => handleIncomingOffer(from, offer));
    socket.on("videoAnswer", ({ answer }) => handleIncomingAnswer(answer));
    socket.on("iceCandidate", ({ candidate }) => handleIceCandidate(candidate));

    return () => {
      socket.off("videoOffer");
      socket.off("videoAnswer");
      socket.off("iceCandidate");
    };
  }, []);

  return (
    <div>
      {isVideoCallActive && (
        <div style={{ position: "relative" }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "300px", background: "black" }}
          ></video>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "30%",
              height: "100px",
              position: "absolute",
              bottom: "10px",
              right: "10px",
              background: "black",
            }}
          ></video>
          <button onClick={endVideoCall} className="btn btn-danger mt-2">
            End Call
          </button>
        </div>
      )}

      {!isVideoCallActive && !isCallIncoming && (
        <button onClick={initiateVideoCall} className="btn btn-info mt-2">
          Start Video Call
        </button>
      )}

      {isCallIncoming && (
        <div className="incoming-call-alert">
          <p>Incoming Call from {callerId}</p>
          <button
            onClick={() => handleIncomingOffer(callerId, peerConnection.current.localDescription)}
            className="btn btn-success"
          >
            Accept
          </button>
          <button onClick={endVideoCall} className="btn btn-danger">
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
