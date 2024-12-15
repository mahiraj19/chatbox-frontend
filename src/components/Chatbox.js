import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./index.css";
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
import { Editor } from "@tinymce/tinymce-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { Modal } from "antd";

const socket = io("http://localhost:3001");
const gf = new GiphyFetch("6TKaSjZEdZFk4LjhHl1JQRekL47k6gbt");

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
  const [userData, setUserData] = useState();
  const editorRef = useRef(null);
  const [showGifPicker, setShowGifPicker] = useState(false); // State to toggle GIF picker

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
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/users/user/${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response?.data);
        // setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchUserData();
    fetchMessages();
  }, [receiverId]);
  const selectGif = async (gif) => {
    const gifUrl = gif.images.original.url;

    const newMessage = {
      receiver: receiverId, 
      content: gifUrl,
    };

    socket.emit("sendMessage", { ...newMessage, sender: userId });

    try {
      const response = await axios.post(
        "http://localhost:3001/api/chat",
        newMessage,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("GIF sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending GIF:", error);
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { ...newMessage, sender: userId },
    ]);
    setShowGifPicker(false);
  };

  useEffect(() => {
    socket.emit("joinRoom", userId);
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("userOnline", (userId) => {
      console.log(userId, "online");
      setUsersOnline((prevUsers) => new Set(prevUsers).add(userId));
    });

    socket.on("userOffline", (userId) => {
      console.log(userId, "offline");
      setUsersOnline((prevUsers) => {
        const updatedUsers = new Set(prevUsers);
        updatedUsers.delete(userId);
        return updatedUsers;
      });
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("receiveMessage");
      socket.off("userOnline");
      socket.off("userOffline");
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
      const plainTextMessage = message.replace(/<[^>]*>?/gm, "");
      const newMessage = {
        sender: userId,
        receiver: receiverId,
        content: plainTextMessage,
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
        if (editorRef.current) {
          editorRef.current.setContent("");
        }
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleTyping = (e) => {
    setMessage(e);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
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
              <p className="mb-0 fw-bold">
                {console.log(usersOnline.has(receiverId))}
                {userData?.name}
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
                        {msg.content.startsWith("http") ? (
                          <img
                            src={msg.content}
                            alt="GIF"
                            style={{ maxWidth: "200px", borderRadius: "8px" }}
                          />
                        ) : (
                          <p className="small mb-0">{msg.content}</p>
                        )}
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
                        {msg.content.startsWith("http") ? (
                          <img
                            src={msg.content}
                            alt="GIF"
                            style={{ maxWidth: "200px", borderRadius: "8px" }}
                          />
                        ) : (
                          <p className="small mb-0">{msg.content}</p>
                        )}
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
                <p className="text-muted small">
                  {userData?.name} is typing...
                </p>
              )}
              <div ref={messagesEndRef} />
            </MDBCardBody>

            <MDBCardFooter className="text-muted d-flex justify-content-start align-items-center p-3">
              <Editor
                apiKey="10vgweay22hk7uk1mur0qmeq2dilhs68jjqjfdmlul5x73z3"
                init={{
                  height: 100,
                  width: 1000,
                  menubar: false,
                  plugins: ["emoticons"],
                  toolbar: "emoticons customInsertGifButton",
                  toolbar_location: "bottom",
                  statusbar: false,
                  content_style:
                    "body { font-family:Arial,sans-serif; font-size:14px }",
                  setup: (editor) => {
                    editor.ui.registry.addButton("customInsertGifButton", {
                      text: "GIF",
                      onAction: () => setShowGifPicker(true),
                    });
                  },
                }}
                onEditorChange={handleTyping}
                onKeyDown={handleKeyDown}
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                }}
              />
              <a className="ms-3" onClick={handleSendMessage}>
                <MDBIcon fas icon="paper-plane" />
              </a>
            </MDBCardFooter>
          </MDBCard>
          <Modal
            bodyStyle={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
            title="Basic Modal"
            open={showGifPicker}
            onCancel={() => setShowGifPicker(false)}
          >
            <div className="gif-picker">
              <Grid
                fetchGifs={(offset) => gf.trending({ offset, limit: 10 })}
                onGifClick={(gif, event) => {
                  event.preventDefault();
                  selectGif(gif);
                }}
                width={400}
                columns={3}
                gutter={6}
              />
            </div>
          </Modal>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Chatbox;