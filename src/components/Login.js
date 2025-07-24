import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      onLogin(data.session.user)
    }
  }

  const handleGuest = () => {
    onLogin(null) // null means Guest
  }

  return (
    <div className="p-4 max-w-sm mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <button onClick={handleGuest} className="w-full mb-4 bg-gray-200 p-2 rounded">
        Continue as Guest
      </button>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border mb-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border mb-2 rounded"
      />

      <button onClick={handleSignIn} className="w-full bg-blue-500 text-white p-2 rounded">
        Login
      </button>

      {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
    </div>
  )
}

export default Login
