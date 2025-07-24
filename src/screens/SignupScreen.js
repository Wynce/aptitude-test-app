// 📄 src/screens/SignupScreen.js

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import logo from '../assets/axcel-logo.png';

function SignupScreen({ setUser, setCurrentScreen, resetTestState }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setLoading(true);
    setError('');
  
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          firstName,
          lastName,
        },
      },
    });
  
    if (error) {
      setError(error.message);
    } else {
      // ✅ Insert or update user profile safely
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        created_at: new Date(),
      });
  
      resetTestState();
      setUser(data.user);
      setCurrentScreen('start');
    }
  
    setLoading(false);
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* Logo */}
      <img src={logo} alt="Axcel Logo" className="w-20 h-20 mb-4" />

      {/* App Title */}
      <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
      <p className="text-sm text-gray-600 mb-6">Join the Axcel journey and begin testing your skills!</p>

      <div className="w-full max-w-sm space-y-3">
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-1/2 px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2 px-3 py-2 border rounded"
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p
          onClick={() => setCurrentScreen('login')}
          className="text-sm text-blue-600 underline text-center cursor-pointer mt-2"
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

export default SignupScreen;
