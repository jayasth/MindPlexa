import React, { useState } from "react";
import { supabase } from "../services/api/supabase/supabaseClient";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage("Error sending reset password email: " + error.message);
    } else {
      setMessage("Please check your email for the password reset link.");
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleResetPassword}>Send reset link</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
