import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ChatBoxEditor = (props) => {
  const handleChange = (value) => {
    props.setMessage(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      props.handleSendMessage(e);
    }
  };

  return (
    // <div onKeyDown={handleKeyDown}>
      <ReactQuill
        value={props.message}
        onChange={handleChange}
        placeholder="Type your message..."
        modules={{
          toolbar: true, 
        }}
      />
    // </div>
  );
};

export default ChatBoxEditor;
