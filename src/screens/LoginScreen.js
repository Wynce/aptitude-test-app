// 📄 src/screens/LoginScreen.js

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import logo from '../assets/axcel-logo.png'; // ✅ your logo

function LoginScreen({ setUser, setCurrentScreen, resetTestState }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    resetTestState(); // 🧼 clear state before new session
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
      setCurrentScreen('start');
    }
  
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* ✅ Logo */}
      <img src={logo} alt="Axcel Logo" className="w-24 h-24 mb-4" />

      {/* ✅ App Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Axcel Aptitude Test</h1>

      {/* ✅ Greeting */}
      <p className="text-lg text-gray-600 mb-1">Welcome! Ready to discover your potential?</p>

      {/* ✅ Quote */}
      <p className="text-sm text-gray-400 italic mb-8">
        "The journey of a thousand miles begins with a single step." – Lao Tzu
      </p>

      {/* 🔐 Login Section */}
      <div className="w-full max-w-sm space-y-4">
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center space-y-2 mt-4">
          <p
            onClick={() => setCurrentScreen('signup')}
            className="text-sm text-blue-600 underline cursor-pointer"
          >
            Don't have an account? Sign up
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;