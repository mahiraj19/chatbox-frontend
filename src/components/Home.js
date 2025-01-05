import React, { useState } from 'react';
import UserList from './Users';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Button, Popover } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import UserProfile from './UserProfile/UserProfile';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const onLogOut = () =>{
        navigate('/')
    }
    return (
      <div>
        <UserProfile isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}/>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
        
          <div class="collapse navbar-collapse d-flex flex-row-reverse" style={{marginRight:'20px'}} id="navbarNav">
          <Popover 
          content={ <ul class="navbar-nav">
              <li onClick={() => setIsModalOpen(true)} class="nav-item active">
                <a class="nav-link" href="#">
                <HomeOutlined /> Profile
                </a>
              </li>
              <li style={{cursor:'pointer'}} class="nav-item">
                <a onClick={() => onLogOut()} class="nav-link">
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </a>
              </li>
            </ul>}>
                  <Button type="primary"><UserOutlined/></Button>
                </Popover>
          </div>
        </nav>
        {/* <h1>Welcome to the Home Page</h1>
        <p>You are logged in!</p> */}
        <UserList />
      </div>
    );
};

export default Home;
