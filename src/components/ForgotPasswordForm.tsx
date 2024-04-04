import React, { useState } from "react";
import { supabase } from "../shared/supabase/supabaseClient";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage("Error sending reset password email: " + error.message);
    } else {
      setMessage("Please check your email for the password reset link.");
    }
  };
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleResetPassword}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send Reset Link
      </button>
    </div>
  );
};

export default ForgotPasswordForm;
