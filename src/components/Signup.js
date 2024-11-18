import React, { useState } from "react";
import { signup } from "../services/authService";
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

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const res = await signup(formData); // Call the service function
        console.log("User signed up successfully:", res.data);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        navigate("/home");
      } catch (err) {
        console.error("Error during signup:", err?.response?.data);
      }
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
                <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                  Sign up
                </p>

                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBIcon fas icon="user me-3" size="lg" />
                  <MDBInput
                    label="Your Name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    className="w-100"
                  />
                </div>
                {errors.name && (
                  <p className="text-danger small">{errors.name}</p>
                )}

                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBIcon fas icon="envelope me-3" size="lg" />
                  <MDBInput
                    label="Your Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    className="w-100"
                  />
                </div>
                {errors.email && (
                  <p className="text-danger small">{errors.email}</p>
                )}

                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBIcon fas icon="lock me-3" size="lg" />
                  <MDBInput
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    className="w-100"
                  />
                </div>
                {errors.password && (
                  <p className="text-danger small">{errors.password}</p>
                )}

                <div className="mb-4">
                  <MDBCheckbox
                    name="flexCheck"
                    value=""
                    id="flexCheckDefault"
                    label="Subscribe to our newsletter"
                  />
                </div>

                <MDBBtn className="mb-4" size="lg" type="submit">
                  Register
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

export default Signup;
