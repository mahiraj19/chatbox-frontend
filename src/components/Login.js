import React, { useState } from 'react';
import axios from 'axios';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardImage,
    MDBInput,
    MDBIcon,
    MDBCheckbox,
  } from "mdb-react-ui-kit";
  import "mdb-react-ui-kit/dist/css/mdb.min.css";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import { useNavigate } from "react-router-dom";
import { login } from '../services/authService';
const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await login(formData);
            console.log('User logged in successfully:', res.data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem("userId", res.data.userId);
            navigate("/home");
        } catch (err) {
            console.error('Error during login:', err.response.data);
        }
    };

    return (
        <form onSubmit={onSubmit}>
        <MDBContainer fluid>
          <MDBCard className="text-black m-5" style={{ borderRadius: "25px" }}>
            <MDBCardBody>
              <MDBRow>
                <MDBCol
                  md="10"
                  lg="6"
                  className="order-2 order-lg-1 d-flex flex-column align-items-center"
                >
                  <p classNAme="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                    Login Form
                  </p>
  
                  <div className="d-flex flex-row align-items-center mb-4">
                    <MDBIcon fas icon="envelope me-3" size="lg" />
                    <MDBInput
                      label="Your Email"
                      id="form2"
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                    />
                  </div>
  
                  <div className="d-flex flex-row align-items-center mb-4">
                    <MDBIcon fas icon="lock me-3" size="lg" />
                    <MDBInput
                      label="Password"
                      id="form3"
                      type="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                    />
                  </div>
                  <MDBBtn className="mb-4" size="lg">
                    Login
                  </MDBBtn>
                </MDBCol>
  
                <MDBCol
                  md="8"
                  lg="6"
                  className="order-1 order-lg-2 d-flex align-items-center"
                >
                  <MDBCardImage
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                    fluid
                  />
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </form>
    );
};

export default Login;
