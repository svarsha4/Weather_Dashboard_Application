'use client';

import { useRouter } from 'next/navigation';

import styles from './signup.module.css';
import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  
  // Stores a given user's signup information
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    emailInvalid: false,
    passwordInvalid: false,
    generalMessage: '',
  });

  // Keeps track of changes to the signup information the user edits/adds
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Once the user clicks on the submit button,
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Their signup information gets sent to the login API route for validation
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    setErrors({
      emailInvalid: false,
      passwordInvalid: false,
      generalMessage: '',
    });

    if (!response.ok) {
      if (data.errorType === 'EMAIL_EXISTS') {
        setErrors({
          emailInvalid: true,
          passwordInvalid: false,
          generalMessage: 'This account information already exists.',
        });
      }
      return;
    }
    
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>
          Join us and start tracking the weather
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={errors.emailInvalid ? styles.inputError : ''}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={errors.passwordInvalid ? styles.inputError : ''}
            required
          />

          {errors.generalMessage && (
            <p className={styles.errorText}>{errors.generalMessage}</p>
          )}

          <button type="submit">Sign Up</button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}