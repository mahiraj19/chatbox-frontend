import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MDBTable, MDBTableHead, MDBTableBody, MDBSpinner, MDBCard, MDBTooltip, MDBBtn } from 'mdb-react-ui-kit';
import PendingRequestsPage from '../components/PendingRequests';
import { io } from 'socket.io-client';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [sendingRequest, setSendingRequest] = useState(false);
    const UserId = localStorage.getItem('userId');

    const socketRef = useRef(null); // Declare socket reference

    const checkRequestStatus = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/chatrequest/pending-requests', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const pendingIds = [];
            const acceptedIds = [];
            response.data.forEach(request => {
                if (request.status === 'accepted') {
                    acceptedIds.push(request.receiver._id);
                } else if (request.status === 'pending') {
                    pendingIds.push(request.receiver._id);
                }
            });

            setPendingRequests(pendingIds);
            setAcceptedRequests(acceptedIds);
        } catch (error) {
            console.error('Error checking pending requests:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users?userId=${UserId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            if (err.response && err.response.status === 401) {
                setError('Unauthorized. Please log in again.');
                navigate('/login');
            } else {
                setError('Failed to fetch users');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        checkRequestStatus();

        socketRef.current = io('http://localhost:3001', {
            auth: { token: localStorage.getItem('token') },
        });

        socketRef.current.on('updateRequests', () => {
            checkRequestStatus();
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [navigate, UserId]);

    const handleUserClick = (userId) => {
        if (acceptedRequests.includes(userId)) {
            navigate(`/chat/${userId}`);
        } else {
            alert("The chat request is not yet accepted.");
        }
    };

        const sendRequestForMessage = async (receiverId) => {
          setSendingRequest(true);
          try {
              const response = await axios.post(
                  'http://localhost:3001/api/chatrequest/send-request',
                  { senderId: UserId, receiverId },
                  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );

              if (response.data.success) {
                  setPendingRequests((prev) => [...prev, receiverId]);
                  alert('Chat request sent!');
                  // Emit socket event for real-time updates
                  socketRef.current.emit('chatRequestSent', {
                      senderId: UserId,
                      receiverId,
                  });
              }
          } catch (error) {
              console.error('Error sending chat request:', error);
              alert('Failed to send chat request.');
          } finally {
              setSendingRequest(false);
          }
        };


    if (loading) return <MDBSpinner style={{ display: 'block', margin: '0 auto' }} />;
    if (error) return <div className="text-center text-danger">{error}</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">User List</h2>
            <MDBCard>
                <PendingRequestsPage />
            </MDBCard>
            <MDBCard>
                <MDBTable striped bordered hover>
                    <MDBTableHead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td
                                    onClick={() => handleUserClick(user._id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {user.name}
                                </td>
                                <td
                                    onClick={() => handleUserClick(user._id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {user.email}
                                </td>
                                <td>
                                    {pendingRequests.includes(user._id) ? (
                                        <span>Request Pending</span>
                                    ) : acceptedRequests.includes(user._id) ? (
                                        <span>Request Accepted</span>
                                    ) : (
                                        <MDBTooltip title="Send Message Request" placement="top">
                                            <span>
                                                <MDBBtn
                                                    size="sm"
                                                    color="primary"
                                                    disabled={sendingRequest}
                                                    onClick={() => sendRequestForMessage(user._id)}
                                                >
                                                    {sendingRequest ? <MDBSpinner size="sm" role="status" /> : 'Send Request'}
                                                </MDBBtn>
                                            </span>
                                        </MDBTooltip>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </MDBTableBody>
                </MDBTable>
            </MDBCard>
        </div>
    );
};

export default UserList;
