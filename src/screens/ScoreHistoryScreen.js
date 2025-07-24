import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "../supabaseClient";
import { formatToMalaysiaTime } from "../utils/formatDate";
import logo from '../assets/axcel-logo.png';

function ScoreHistoryScreen({ user, setCurrentScreen, setHasSavedScore }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    latestScore: 0,
    improvement: 0
  });

  // Fetch user profile for proper name display
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, [user]);

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
      return `${user.user_metadata.firstName} ${user.user_metadata.lastName}`;
    }
    if (user?.user_metadata?.firstName) {
      return user.user_metadata.firstName;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("test-results")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(5); // ✅ Only get last 5 scores

        if (error) {
          console.error("❌ Error fetching test results:", error);
          setResults([]);
          return;
        }

        if (!data || data.length === 0) {
          console.log("📊 No test results found");
          setResults([]);
          return;
        }

        // Process results for display
        const processedResults = data.map((result, index) => ({
          ...result,
          testNumber: data.length - index,
          label: `Test ${data.length - index}`,
          percentage: result.score || 0,
          date: result.created_at
        }));

        setResults(processedResults);

        // Calculate statistics from the limited data (last 5 scores)
        const scores = data.map(r => r.score || 0);
        const totalTests = data.length;
        const averageScore = totalTests > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalTests) : 0;
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const latestScore = scores[0] || 0;
        
        // Calculate improvement (latest vs oldest in the 5)
        const oldestScore = scores[scores.length - 1] || 0;
        const improvement = latestScore - oldestScore;

        setStats({
          totalTests,
          averageScore,
          bestScore,
          latestScore,
          improvement
        });

      } catch (err) {
        console.error("❌ Unexpected error fetching results:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResults();
    }
  }, [user]);

  const handleGoHome = () => {
    console.log("🏠 [DEBUG] handleGoHome clicked");
    console.log("🏠 [DEBUG] Setting screen to 'start'");
    setCurrentScreen('start');
  };

  const handleBackToResults = () => {
    console.log("📊 [DEBUG] Back to Results clicked");
    console.log("📊 [DEBUG] Setting screen to 'result'");
    setCurrentScreen('result');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your score history...</p>
        </div>
      </div>
    );
  }

  // No results case
  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          {/* Logo */}
          <img src={logo} alt="Axcel Logo" className="w-16 h-16 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📊 Score History
          </h2>
          
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Test Results Yet
            </h3>
            
            <p className="text-gray-600 mb-6">
              Hi {getDisplayName()}! You haven't taken any tests yet. 
              Start your first aptitude test to see your progress here.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🚀 Take Your First Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Axcel Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Score History</h1>
                <p className="text-gray-600">{getDisplayName()}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBackToResults}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ← Back to Results
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Avg</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.bestScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stats.improvement >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={stats.improvement >= 0 ? 
                    "M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" :
                    "M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  } clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Test: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Test: ${label}`}
                  />
                  <Bar dataKey="percentage" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Detailed Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.testNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        result.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-bold ${
                        result.score >= 80 ? 'text-green-600' :
                        result.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.time_taken_sec ? `${result.time_taken_sec}s` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatToMalaysiaTime(result.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            * Showing your <strong>last 5 test results</strong> based on first attempts only.
          </p>
          <button
            onClick={handleBackToResults}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScoreHistoryScreen;