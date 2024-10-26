// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Home from './components/Home'; // Your home component
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Chatbox from './components/Chatbox';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route 
                    path="/home" 
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } 
                />
                <Route path="/chat/:receiverId" element={<PrivateRoute><Chatbox /></PrivateRoute>} />
                <Route path="/login" element={<Login />} /> {/* Add your login component */}
                {/* <Route path="*" element={<Signup />} /> */}
            </Routes>
        </Router>
    );
};

export default App;
