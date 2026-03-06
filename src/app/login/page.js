'use client';

import { useRouter } from 'next/navigation';

import styles from './login.module.css';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  
  // Stores a given user's login credentials
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Stores an errors/invalid credentials they may occur in the login process
  const [errors, setErrors] = useState({
    emailMessage: '',
    passwordMessage: '',
    generalMessage: '',
    emailInvalid: false,
    passwordInvalid: false,
  });

  // Keeps track of changes to the login information the user edits/adds
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Once the user clicks on the submit button,
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      emailMessage: '',
      passwordMessage: '',
      generalMessage: '',
      emailInvalid: false,
      passwordInvalid: false,
    });
    
    // Retrieve the user's login credentials through the login API route
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      
      // If the user enters an invalid email, then notify they have an invalid email
      if (data.errorType === 'EMAIL_NOT_FOUND') {
        setErrors({
          emailMessage: "The email is invalid",
          passwordMessage: '',
          generalMessage: '',
          emailInvalid: true,
          passwordInvalid: false,
        });
      }
      
      // If the user enters an invalid password, then notify they have an invalid password
      if (data.errorType === 'INVALID_PASSWORD') {
        setErrors({
          emailMessage: '',
          passwordMessage: "The password is invalid",
          generalMessage: '',
          emailInvalid: false,
          passwordInvalid: true,
        });
      }

      // If the user enters an email and password that do not match any existing user's credentials, then notify there's no such user
      if (data.errorType === 'NO_SUCH_USER') {
        setErrors({
          emailMessage: '',
          passwordMessage: '',
          generalMessage: "There's no such user. Please signup to create an account.",
          emailInvalid: true,
          passwordInvalid: true,
        });
      }
      
      if (data.errorType === 'SERVER_ERROR') {
        setErrors({
          emailMessage: '',
          passwordMessage: '',
          generalMessage: "Something went wrong. Please try again.",
          emailInvalid: false,
          passwordInvalid: false,
        });
      }
      return;
    }
    localStorage.setItem('loggedInEmail', formData.email);
    router.push('/dashboard/search');
  };
  
  // If the user decides to delete their account,
  const handleDeleteAccount = async () => {
    
    // Prompt the user to enter their email to verify that is indeed what they want to do
    if (!formData.email || !formData.password) {
      setErrors({
        emailMessage: !formData.email ? 'Email is required' : '',
        passwordMessage: !formData.password ? 'Password is required' : '',
        generalMessage: '',
        emailInvalid: !formData.email,
        passwordInvalid: !formData.password,
      });
      return;
    }

    // Ensures the user entered the correct credentials before deleting their account
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errorType === "EMAIL_NOT_FOUND") {
        setErrors({
          emailMessage: "The email is invalid",
          passwordMessage: "",
          generalMessage: "",
          emailInvalid: true,
          passwordInvalid: false,
        });
        return;
      }

      if (data.errorType === "INVALID_PASSWORD") {
        setErrors({
          emailMessage: "",
          passwordMessage: "The password is invalid",
          generalMessage: "",
          emailInvalid: false,
          passwordInvalid: true,
        });
        return;
      }
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    
    // Delete their request through the delete API route
    const response = await fetch('/api/auth/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setErrors({
        emailMessage: '',
        passwordMessage: '',
        generalMessage: '',
        emailInvalid: false,
        passwordInvalid: false,
      });

      setFormData({
        email: '',
        password: '',
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Welcome Back</h1>
        <p className={styles.subtitle}>
          Login to access your weather dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={errors.emailInvalid ? styles.inputError : ''}
            required
          />
          {errors.emailMessage && (
            <p className={styles.errorText}>{errors.emailMessage}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={errors.passwordInvalid ? styles.inputError : ''}
            required
          />
          {errors.passwordMessage && (
            <p className={styles.errorText}>{errors.passwordMessage}</p>
          )}

          {errors.generalMessage && (
            <p className={styles.errorText}>{errors.generalMessage}</p>
          )}

          <button type="submit">Login</button>
        </form>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className={styles.deleteButton}
        >
          Delete Account
        </button>

        <button
          type="button"
          onClick={() => router.push('/signup')}
          className={styles.signupButton}
        >
          Sign Up
        </button>

        <p className={styles.footerText}></p>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete your account? 
              This action cannot be undone.
            </p>
            
            <div className={styles.modalButtons}>
              <button
              onClick={confirmDeleteAccount}
              className={styles.confirmButton}
              >
                Yes, Delete
              </button>
              
              <button
              onClick={() => setShowDeleteModal(false)}
              className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}