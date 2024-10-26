// src/components/Home.js
import React from 'react';
import UserList from './Users';

const Home = () => {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>You are logged in!</p>
            <UserList />
        </div>
    );
};

export default Home;
