import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBIcon,
  MDBCardFooter,
} from "mdb-react-ui-kit";
import VideoCall from "./VideoCall";

const socket = io("http://localhost:3001");

const Chatbox = () => {
  const navigate = useNavigate();
  const { receiverId } = useParams();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/chat/${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    socket.emit("joinRoom", userId);
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
  });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('userOnline', (userId) => {
      console.log(userId, 'online');
      setUsersOnline(prevUsers => new Set(prevUsers).add(userId));
  });

  socket.on('userOffline', (userId) => {
      console.log(userId, 'offline');
      setUsersOnline(prevUsers => {
          const updatedUsers = new Set(prevUsers);
          updatedUsers.delete(userId);
          return updatedUsers;
      });
  });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("receiveMessage");
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        sender: userId,
        receiver: receiverId,
        content: message,
      };
  
      socket.emit("sendMessage", newMessage);
      socket.emit("stopTyping", receiverId);
  
      setMessages((prevMessages) => [...prevMessages, newMessage]);
  
      try {
        await axios.post("http://localhost:3001/api/chat", newMessage, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMessage(""); // Clear the input field
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };
  

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", receiverId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", receiverId);
    }, 1000);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEndCall = () => {
    console.log("Call ended");
  };

  const onBack = () => navigate("/home");

  return (
    <MDBContainer className="py-5">
      <MDBRow className="d-flex justify-content-center">
        <MDBCol md="8" lg="6" xl="4">
          <MDBCard id="chat1" style={{ borderRadius: "15px" }}>
            <MDBCardHeader
              className="d-flex justify-content-between align-items-center p-3 bg-info text-white border-bottom-0"
              style={{
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
              }}
            >
              <MDBIcon fas icon="angle-left" onClick={onBack} />
              <p className="mb-0 fw-bold">{console.log(usersOnline.has(receiverId))}
                Live chat{" "}
                {usersOnline.has(receiverId) ? (
                  <span className="text-success">(Online)</span>
                ) : (
                  <span className="text-danger">(Offline)</span>
                )}
              </p>
              <MDBIcon fas icon="times" onClick={onBack} />
              {/* <VideoCall userId={userId} receiverId={receiverId} onEndCall={handleEndCall} /> */}
            </MDBCardHeader>

            <MDBCardBody style={{ height: "400px", overflowY: "auto" }}>
              {messages.map((msg, index) => (
                <div key={index}>
                  {msg.sender !== userId ? (
                    <div className="d-flex flex-row justify-content-start mb-4">
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                        alt="avatar 1"
                        style={{ width: "45px", height: "100%" }}
                      />
                      <div
                        className="p-3 ms-3"
                        style={{
                          borderRadius: "15px",
                          backgroundColor: "rgba(57, 192, 237,.2)",
                        }}
                      >
                        <p className="small mb-0">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-row justify-content-end mb-4">
                      <div
                        className="p-3 me-3 border"
                        style={{
                          borderRadius: "15px",
                          backgroundColor: "#fbfbfb",
                        }}
                      >
                        <p className="small mb-0">{msg.content}</p>
                      </div>
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                        alt="avatar 2"
                        style={{ width: "45px", height: "100%" }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <p className="text-muted small">The other user is typing...</p>
              )}
              <div ref={messagesEndRef} />
            </MDBCardBody>

            <MDBCardFooter className="text-muted d-flex justify-content-start align-items-center p-3">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                alt="avatar 3"
                style={{ width: "45px", height: "100%" }}
              />
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Type message"
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
              />
              <a className="ms-3" onClick={handleSendMessage}>
                <MDBIcon fas icon="paper-plane" />
              </a>
            </MDBCardFooter>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Chatbox;