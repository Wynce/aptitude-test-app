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
    // Input validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 [DEBUG] Starting signup process for:', email);
      
      // 1. Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          },
        },
      });
    
      if (signUpError) {
        console.error('❌ [DEBUG] Auth signup error:', signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      
      if (!data.user) {
        console.error('❌ [DEBUG] No user returned after signup');
        setError('Account creation failed. Please try again.');
        setLoading(false);
        return;
      }
      
      console.log('✅ [DEBUG] Auth user created successfully:', data.user.id);
    
      // 2. Create user profile with explicit fields
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        { 
          onConflict: 'id',
          returning: 'minimal' // don't return the value after inserting
        });
    
      if (profileError) {
        console.error('❌ [DEBUG] Profile creation error:', profileError);
        // Continue anyway since auth user was created
        console.log('⚠️ [DEBUG] Continuing despite profile error');
      } else {
        console.log('✅ [DEBUG] User profile created successfully');
      }
      
      // 3. Set default user role (optional, depending on your schema)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: data.user.id,
          role: 'user',
          created_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
          returning: 'minimal'
        });
        
      if (roleError) {
        console.error('⚠️ [DEBUG] Role assignment error (non-critical):', roleError);
        // Continue anyway, user role is not critical for app function
      } else {
        console.log('✅ [DEBUG] User role assigned successfully');
      }
    
      // 4. Success - move to start screen
      console.log('🎉 [DEBUG] User signup complete, navigating to start screen');
      resetTestState();
      setUser(data.user);
      setCurrentScreen('start');
      
    } catch (unexpectedError) {
      console.error('❌ [DEBUG] Unexpected signup error:', unexpectedError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      {/* Logo */}
      <img src={logo} alt="Axcel Logo" className="w-20 h-20 mb-4" />

      {/* App Title */}
      <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
      <p className="text-sm text-gray-600 mb-6">Join the Axcel journey and begin testing your skills!</p>

      <div className="w-full max-w-sm space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        <p
          onClick={() => setCurrentScreen('login')}
          className="text-sm text-blue-600 hover:text-blue-800 text-center cursor-pointer mt-2"
        >
          Already have an account? <span className="underline">Login</span>
        </p>
      </div>
    </div>
  );
}

export default SignupScreen;