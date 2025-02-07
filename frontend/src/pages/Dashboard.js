import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess, handleError } from '../util';
import { ToastContainer } from 'react-toastify';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '10px', // Rounded corners for the map
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
};

// Default center set to Colombo, Sri Lanka
const center = {
  lat: 6.9271, // Latitude for Colombo
  lng: 79.8612, // Longitude for Colombo
};

function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyB_kHHplvFiu4WyyKoSKFzyQ70aaGXLjTY', //My Google Map API key
  });

  // Check authentication and fetch users on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setLoggedInUser(localStorage.getItem('loggedInUser'));
      fetchUsers();
    }
  }, [navigate]);

  // Fetch all registered users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/cluster-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        setUsers(result.clustered_users); // Update state with clustered data
      } else {
        handleError(result.message);
      }
    } catch (error) {
      handleError('Failed to fetch users');
    }
  };
  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User logged out');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Display loading or error messages
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome, {loggedInUser}</h1>
        <button style={styles.signOutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>
      {/* Map */}
      <div style={styles.mapContainer}>
      <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={center}
      >
      {users.map((user) => (
      <Marker
        key={`${user.latitude}-${user.longitude}`}
        position={{ lat: user.latitude, lng: user.longitude }}
        label={user.name}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: user.cluster === 0 ? 'red' : user.cluster === 1 ? 'blue' : 'green',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10,
        }}
      />
      ))}
      </GoogleMap>
      </div>
      <ToastContainer />
    </div>
  );
}

// Styles for the dashboard
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: '10px 20px',
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  mapContainer: {
    marginBottom: '20px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  footerButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Dashboard;