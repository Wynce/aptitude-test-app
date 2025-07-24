// StartScreen.js - Updated with separate Admin Dashboard button

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import logo from '../assets/axcel-logo.png';

const industriesList = ['Education'];
const categoriesList = ['Mixed', 'General', 'Numerical', 'Verbal', 'Logical'];
const difficultyLevels = ['Easy', 'Medium', 'Hard'];

const StartScreen = ({ onStart, user, setCurrentScreen }) => {
  const [selectedIndustries, setSelectedIndustries] = useState(['Education']);
  const [selectedCategory, setSelectedCategory] = useState('Mixed');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const dropdownRef = useRef(null);

  // Fetch user profile and role
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        console.log("🔍 [DEBUG] Fetching user data for:", user.id);
        console.log("🔍 [DEBUG] User email:", user.email);
        
        // Fetch user profile from user_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ [DEBUG] Error fetching profile:', profileError);
          // Set default values if profile not found
          setUserProfile(null);
          setProfileForm({
            firstName: user?.user_metadata?.firstName || '',
            lastName: user?.user_metadata?.lastName || '',
            email: user?.email || ''
          });
        } else {
          console.log("✅ [DEBUG] Profile data from user_profiles:", profileData);
          setUserProfile(profileData);
          setProfileForm({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || user.email || ''
          });
        }

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.log('❌ [DEBUG] No role found, user is regular user:', roleError.message);
          setUserRole('user');
        } else {
          console.log("🔐 [DEBUG] User role found:", roleData.role);
          setUserRole(roleData.role);
        }

        // Debug summary
        console.log("📊 [DEBUG] User data summary:", {
          userId: user.id,
          email: user.email,
          profileExists: !!profileData,
          role: roleData?.role || 'user',
          firstName: profileData?.first_name || user?.user_metadata?.firstName,
          lastName: profileData?.last_name || user?.user_metadata?.lastName
        });
      } catch (err) {
        console.error('❌ [DEBUG] Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIndustryChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedIndustries((prev) => [...prev, value]);
    } else {
      setSelectedIndustries((prev) => prev.filter((industry) => industry !== value));
    }
  };

  const handleStartTest = () => {
    const industry = selectedIndustries;
    const category = selectedCategory;
    const difficulty = selectedDifficulty;

    console.log('📋 Selected Values:', { industry, category, difficulty });

    if (industry.length === 0 || !category || !difficulty) {
      alert('Please select Industry, Category, and Difficulty.');
      return;
    }

    onStart({
      industries: industry,
      category,
      difficulty
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Use your app's URL for the redirect
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        alert('Error sending password reset email: ' + error.message);
      } else {
        alert('🔑 Password reset email sent! Check your inbox and click the link to reset your password.');
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      alert('Error sending password reset email.');
    }
  };

  const handleProfileSave = async () => {
    try {
      console.log("💾 [DEBUG] Updating profile with:", profileForm);
      console.log("💾 [DEBUG] User ID:", user.id);
      
      // Simple update without complex policies
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileForm.firstName.trim(),
          last_name: profileForm.lastName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      console.log("💾 [DEBUG] Update result:", { data, error });

      if (error) {
        console.error('❌ [DEBUG] Profile update error:', error);
        alert('Error updating profile: ' + error.message);
      } else {
        console.log("✅ [DEBUG] Profile updated successfully:", data);
        alert('✅ Profile updated successfully!');
        setShowProfileModal(false);
        
        // Refresh user profile data
        if (data && data[0]) {
          setUserProfile(data[0]);
        }
      }
    } catch (err) {
      console.error('❌ [DEBUG] Unexpected error updating profile:', err);
      alert('Error updating profile: ' + err.message);
    }
  };

  const getDisplayName = () => {
    // Priority: user_profiles.first_name > user_metadata.firstName > email username
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.user_metadata?.firstName) {
      return user.user_metadata.firstName;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'super_admin': return '🔥 Super Admin';
      case 'admin': return '👨‍💼 Admin';
      default: return '👤 User';
    }
  };

  // Function to handle direct navigation to admin dashboard
  const handleAdminDashboardClick = () => {
    console.log("🔧 [DEBUG] Admin Dashboard button clicked directly");
    console.log("🔧 [DEBUG] User role:", userRole);
    
    // Direct navigation without any async checks
    console.log("🔐 [DEBUG] Direct navigation to admin dashboard");
    setCurrentScreen('admin');
  };

  return (
    <div className="start-screen min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        {/* Settings Dropdown - Positioned absolutely */}
        <div className="absolute top-4 right-4" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600">{getRoleDisplayName()}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Profile */}
                <button
                  onClick={() => {
                    console.log("🔧 [DEBUG] Edit Profile clicked");
                    setShowProfileModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  <span>Edit Profile</span>
                </button>

                {/* Change Password */}
                <button
                  onClick={() => {
                    console.log("🔑 [DEBUG] Change Password clicked");
                    handleChangePassword();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Change Password</span>
                </button>

                {/* Logout */}
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    console.log("🚪 [DEBUG] Logout clicked");
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        
<div className="absolute top-4 right-4" ref={dropdownRef}>
  <button
    onClick={() => setShowDropdown(!showDropdown)}
    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
  >
    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
    </svg>
  </button>
  
  {/* Admin Button - Only shown to admins, positioned below settings */}
  {['admin', 'super_admin'].includes(userRole) && (
    <button
      onClick={() => {
        console.log("🔧 [DEBUG] Admin button clicked");
        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
          setCurrentScreen('admin');
          console.log("🔐 [DEBUG] setCurrentScreen('admin') called with setTimeout");
        }, 0);
      }}
      className="absolute top-14 right-0 flex items-center justify-center w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
      title="Admin Dashboard"
    >
      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
    </button>
  )}

  {/* Dropdown Menu */}
  {showDropdown && (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Rest of your dropdown code */}
    </div>
  )}
</div>


        {/* Logo - Centered and unaffected */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-16 sm:h-20" />
        </div>

        {/* Greeting */}
        {user && (
          <p className="text-center text-lg text-gray-700 mb-2">
            Welcome, {getDisplayName()}!
          </p>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6">
          Aptitude Test
        </h1>

        {/* Admin Dashboard Button - Only shown to admins */}
        {['admin', 'super_admin'].includes(userRole) && (
          <div className="mb-6">
            <button
              onClick={handleAdminDashboardClick}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Admin Dashboard
            </button>
          </div>
        )}

        {/* Industry Checkboxes */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Select Industry</label>
          <div className="grid grid-cols-2 gap-2">
            {industriesList.map((industry) => (
              <label key={industry} className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  value={industry}
                  checked={selectedIndustries.includes(industry)}
                  onChange={handleIndustryChange}
                  className="mr-2 accent-blue-500"
                />
                {industry}
              </label>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Category --</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Select Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Difficulty --</option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartTest}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Start Test
        </button>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartScreen;