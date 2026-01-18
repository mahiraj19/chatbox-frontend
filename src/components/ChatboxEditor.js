import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { MDBIcon } from "mdb-react-ui-kit";

const ChatBoxEditor = (props) => {
  const {setShowGifPicker, handleTyping, handleKeyDown, handleSendMessage, editorRef} = props
  return (
    <>
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
    </>
  );
};

export default ChatBoxEditor;
