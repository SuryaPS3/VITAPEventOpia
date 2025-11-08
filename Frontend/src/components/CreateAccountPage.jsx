import React, { useState } from 'react';
import { authAPI } from '../api/client.js';
import './CreateAccountPage.css';

const CreateAccountPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('Submitting registration data:', formData);
      const response = await authAPI.register(formData);
      if (response.success) {
        setSuccess(response.message);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="create-account-page">
      <div className="create-account-form">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input type="text" name="first_name" id="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input type="text" name="last_name" id="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;
