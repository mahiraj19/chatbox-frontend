import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MDBBtn, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const PendingRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const UserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/chatrequest/pending-requests', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const filteredRequests = response.data.filter(
                    (request) => request.sender._id !== UserId && request.status == "pending"
                );
                
                setRequests(filteredRequests);
            } catch (error) {
                console.error('Error fetching pending requests:', error);
            }
        };

        fetchRequests();

        socket.on('chatRequestSent', (newRequest) => {
            if (newRequest.receiver._id === UserId) {
                setRequests((prev) => {
                    if (!prev.some((req) => req._id === newRequest._id)) {
                        return [...prev, newRequest];
                    }
                    return prev;
                });
            }
        });

        socket.on('chatRequestAccepted', ({ requestId, senderId }) => {
            console.log(`Request ${requestId} accepted. Redirecting to chat...`);
        });
        
        socket.on('chatRequestRejected', ({ requestId, senderId }) => {
            console.log(`Request ${requestId} rejected.`);
        });

        return () => {
            socket.off('chatRequestSent');
            socket.off('chatRequestAccepted');
            socket.off('chatRequestRejected');
        };
    }, [UserId]);

    const acceptRequest = async (requestId) => {
        try {
            const response = await axios.post(
                'http://localhost:3001/api/chatrequest/accept-request',
                { requestId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data.success) {
                alert('Chat request accepted!');

                const senderId = requests.find((req) => req._id === requestId).sender._id;
                socket.emit('chatRequestAccepted', { requestId, senderId });

                navigate(`/chat/${senderId}`);

                setRequests((prev) => prev.filter((req) => req._id !== requestId));
            }
        } catch (error) {
            console.error('Error accepting chat request:', error);
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            const response = await axios.post(
                'http://localhost:3001/api/chatrequest/reject-request',
                { requestId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data.success) {
                alert('Chat request rejected!');

                const senderId = requests.find((req) => req._id === requestId).sender._id;
                socket.emit('chatRequestRejected', { requestId, senderId });

                setRequests((prev) => prev.filter((req) => req._id !== requestId));
            }
        } catch (error) {
            console.error('Error rejecting chat request:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Pending Chat Requests</h2>
            {requests.length === 0 ? (
                <p>No pending requests.</p>
            ) : (
                requests.map((request) => (
                    <MDBCard key={request._id} className="mb-3">
                        <MDBCardBody>
                            <h5>{request.sender.name}</h5>
                            <p>{request.sender.email}</p>
                            <MDBBtn
                                color="success"
                                className="me-2"
                                onClick={() => acceptRequest(request._id)}
                            >
                                Accept
                            </MDBBtn>
                            <MDBBtn
                                color="danger"
                                onClick={() => rejectRequest(request._id)}
                            >
                                Reject
                            </MDBBtn>
                        </MDBCardBody>
                    </MDBCard>
                ))
            )}
        </div>
    );
};

export default PendingRequests;
