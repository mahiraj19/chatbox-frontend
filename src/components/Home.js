import React from 'react';
import UserList from './Users';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const onLogOut = () =>{
        navigate('/')
    }
    return (
      <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
        
          <div class="collapse navbar-collapse d-flex flex-row-reverse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item active">
                <a class="nav-link" href="#">
                  Home <span class="sr-only">(current)</span>
                </a>
              </li>
              <li style={{cursor:'pointer'}} class="nav-item">
                <a onClick={() => onLogOut()} class="nav-link">
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </a>
              </li>
            </ul>
          </div>
        </nav>
        {/* <h1>Welcome to the Home Page</h1>
        <p>You are logged in!</p> */}
        <UserList />
      </div>
    );
};

export default Home;
