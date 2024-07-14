import React, { useEffect } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthProvider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Import your desired big icon
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { getUserById, User } = useAuth(); // Assuming you have a user object from your authentication context

  const navigate = useNavigate()
  useEffect(() => {
    getUserById(); // Fetch user data when component mounts
  }, []);

  // Function to handle sign out
  const handleSignOut = () => {    
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('authToken');
    navigate('/')
  };

  return (
    <Container style={{marginTop:"10%"}}>
      <Row className="align-items-center"> {/* Align items vertically */}
        <Col md={6} sm={12} className="d-flex justify-content-center align-items-center">
          <AccountCircleIcon style={{ fontSize: 200, color: '#888' }} /> {/* Big icon */}
        </Col>
        <Col md={6} sm={12} className="d-flex justify-content-center align-items-center">
          <div className="profile-details">
            <h2>Profile Information</h2>
            {User ? (
              <>
                <p><strong>Email:</strong> {User.email}</p>
                <p><strong>Role:</strong> {User.role}</p>
                {/* Add more profile information as needed */}
                <Button variant="primary" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
