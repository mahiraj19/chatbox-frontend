import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Chatbox from './components/Chatbox';
import SignUpOTP from './components/SignUpOTP';
import PendingRequestsPage from './components/PendingRequests'
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
                <Route 
                    path="/pending-requests" 
                    element={
                        <PrivateRoute>
                            <PendingRequestsPage/>
                        </PrivateRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;
