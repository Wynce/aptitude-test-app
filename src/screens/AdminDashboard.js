import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import logo from "../assets/axcel-logo.png";

function AdminDashboard({ user, setCurrentScreen }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    activeUsers: 0,
    newUsersToday: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTests, setRecentTests] = useState([]);

  // Define handleLogout inside the component but outside useEffect
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentScreen('login');
    } catch (error) {
      console.error("❌ [ERROR] Logout failed:", error);
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen('start');
  };

  // useEffect with all dependencies properly included
  useEffect(() => {
    // Verify admin access first
    const checkAdminAccess = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("🔐 [ERROR] Session error in admin dashboard:", sessionError?.message);
          handleLogout();
          return;
        }
        
        // Verify admin role using user_roles table (matching your app's structure)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (roleError || !roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
          console.error("🔐 [ERROR] Admin access denied:", roleError?.message || "Insufficient privileges");
          alert("You don't have permission to access the admin dashboard.");
          setCurrentScreen('start');
          return;
        }
        
        console.log("🔐 [SUCCESS] Admin access verified:", roleData.role);
        
        // User is authorized, continue loading admin data
        const fetchAdminData = async () => {
          setLoading(true);
          try {
            // Fetch dashboard statistics
            const [
              usersResult,
              testsResult,
              activeUsersResult,
              newUsersResult,
              recentUsersResult,
              recentTestsResult
            ] = await Promise.all([
              // Get total users count
              supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
              
              // Get total tests count
              supabase.from('test-results').select('id', { count: 'exact', head: true }),
              
              // Get active users (logged in last 7 days)
              supabase.from('user_profiles')
                .select('id', { count: 'exact', head: true })
                .gt('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
              
              // Get new users today
              supabase.from('user_profiles')
                .select('id', { count: 'exact', head: true })
                .gt('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
              
              // Get recent users with details
              supabase.from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10),
              
              // Get recent tests with details
              supabase.from('test-results')
                .select('*, user_profiles(first_name, last_name, email)')
                .order('created_at', { ascending: false })
                .limit(10)
            ]);

            setStats({
              totalUsers: usersResult.count || 0,
              totalTests: testsResult.count || 0,
              activeUsers: activeUsersResult.count || 0,
              newUsersToday: newUsersResult.count || 0,
            });
            
            setRecentUsers(recentUsersResult.data || []);
            setRecentTests(recentTestsResult.data || []);
          } catch (err) {
            console.error("❌ [ERROR] Failed to fetch admin data:", err);
          } finally {
            setLoading(false);
          }
        };

        fetchAdminData();
      } catch (err) {
        console.error("🔐 [CRITICAL] Admin access check failed:", err);
        setCurrentScreen('start');
      }
    };
    
    checkAdminAccess();
    // Include all dependencies that are used inside the useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setCurrentScreen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src={logo} alt="Axcel Logo" className="w-10 h-10" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Back to Home
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users (7d)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Users Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newUsersToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout for Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <li key={user.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <div className="flex text-sm">
                          <p className="font-medium text-blue-600 truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex overflow-hidden">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Tests */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tests</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentTests.map((test) => (
                <li key={test.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {test.user_profiles?.first_name} {test.user_profiles?.last_name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          test.score >= 80 ? 'bg-green-100 text-green-800' :
                          test.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {test.score}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {test.category} - {test.difficulty}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {new Date(test.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;