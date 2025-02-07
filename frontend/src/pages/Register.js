import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '10px',
  marginTop: '10px',
};

// Default center set to Colombo, Sri Lanka
const center = {
  lat: 6.9271, // Latitude for Colombo
  lng: 79.8612, // Longitude for Colombo
};

function Register() {
  const [registerInfo, setRegisterInfo] = useState({
    name: '',
    email: '',
    password: '',
    latitude: null,
    longitude: null,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyB_kHHplvFiu4WyyKoSKFzyQ70aaGXLjTY', // Replace with your API key
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterInfo({ ...registerInfo, [name]: value });
  };

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });

    setRegisterInfo({
      ...registerInfo,
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, latitude, longitude } = registerInfo;
    if (!name || !email || !password || !latitude || !longitude) {
      toast.error('Name, email, password, and location are required');
      return;
    }
    try {
      const url = 'http://localhost:8080/auth/register';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerInfo),
      });
      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        toast.success(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else if (error) {
        const details = error?.details[0]?.message;
        toast.error(details || message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h1 style={styles.title}>Register</h1>
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>Name</label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              autoFocus
              placeholder="Enter your name..."
              value={registerInfo.name}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your email..."
              value={registerInfo.email}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter your password..."
              value={registerInfo.password}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="location" style={styles.label}>Select Your Location</label>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={10}
              center={center}
              onClick={handleMapClick}
            >
              {selectedLocation && <Marker position={selectedLocation} />}
            </GoogleMap>
          </div>
          <button type="submit" style={styles.registerButton}>Register</button>
          <p style={styles.loginText}>
            Already have an account? <Link to="/login" style={styles.loginLink}>Login</Link>
          </p>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Full viewport height
    backgroundColor: '#f0f0f0', // Optional: Add a background color
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    maxWidth: '500px',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '15px',
    width: '100%', // Ensure input group takes full width
  },
  label: {
    fontSize: '16px',
    marginBottom: '5px',
    display: 'block', // Ensure labels are block elements
    width: '100%', // Labels take full width
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxSizing: 'border-box', // Ensure padding is included in width
  },
  registerButton: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  loginText: {
    textAlign: 'center',
    marginTop: '10px',
  },
  loginLink: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default Register;