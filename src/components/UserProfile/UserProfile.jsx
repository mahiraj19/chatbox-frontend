import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import {
  MDBInput,
  MDBBtn,
  MDBFile,
  MDBRadio,
  MDBContainer,
} from 'mdb-react-ui-kit';
import axios from 'axios';

const UserProfile = (props) => {
  const UserId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    profileImage: null,
    gender: '',
  });
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}users/user/${UserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        
        const { name, mobile, gender, profileImage } = response.data;
        const nameParts = name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[1] : ''; // Handle cases where last name might be missing
        setFormData({ firstName, lastName, mobile, gender, profileImage: null });

        // If a profile image exists, set it for preview; otherwise, use a default placeholder
        setProfileImagePreview(
          profileImage
            ? `http://localhost:3001/${profileImage}` // Replace with your server's image URL
            : '/path/to/default-image.jpg' // Path to default image
        );
      } else {
        console.error('Failed to fetch user data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file });

    // Set preview for newly selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const apiEndpoint = `${process.env.REACT_APP_API_URL}users/users/${UserId}`; // Replace with your API URL

    // Create a FormData object to handle file upload
    const formDataToSend = new FormData();
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('mobile', formData.mobile);
    formDataToSend.append('gender', formData.gender);
    if (formData.profileImage) {
      formDataToSend.append('profileImage', formData.profileImage);
    }

    try {
      const response = await axios.put(apiEndpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('Profile updated successfully:', response.data);
        props.setIsModalOpen(false); // Close the modal on success
      } else {
        console.error('Failed to update profile:', response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    props.setIsModalOpen(false);
  };

  useEffect(() => {
    if (props.isModalOpen && UserId) {
      fetchUserData();
    }
  }, [props.isModalOpen, UserId]);

  return (
    <>
      <Modal
        title="User Profile"
        open={props.isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <MDBContainer>
          <form>
            <div className="mb-3 text-center">
              {/* Profile Image Preview */}
              <img
                src={profileImagePreview}
                alt="Profile Preview"
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
            </div>
            <MDBInput
              className="mb-3"
              label="First Name"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <MDBInput
              className="mb-3"
              label="Last Name"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            <MDBInput
              className="mb-3"
              label="Mobile"
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleInputChange}
            />
            <MDBFile
              className="mb-3"
              label="Profile Image"
              id="profileImage"
              name="profileImage"
              onChange={handleFileChange}
            />
            <div className="mb-3">
              <label>Gender</label>
              <div>
                <MDBRadio
                  name="gender"
                  id="male"
                  label="Male"
                  value="male"
                  onChange={handleInputChange}
                  checked={formData.gender === 'male'}
                />
                <MDBRadio
                  name="gender"
                  id="female"
                  label="Female"
                  value="female"
                  onChange={handleInputChange}
                  checked={formData.gender === 'female'}
                />
              </div>
            </div>
            <MDBBtn type="button" className="me-2" onClick={handleSubmit}>
              Submit
            </MDBBtn>
            <MDBBtn type="button" color="danger" onClick={handleCancel}>
              Cancel
            </MDBBtn>
          </form>
        </MDBContainer>
      </Modal>
    </>
  );
};

export default UserProfile;
