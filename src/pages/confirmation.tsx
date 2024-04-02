// src/pages/confirmation.tsx

import React, { useState } from "react";

const Confirmation: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resendConfirmationEmail = async () => {
    setIsSubmitting(true);
    setMessage("");

    if (email) {
      // Replace this with a POST request to your server-side endpoint that handles resending confirmation emails
      const response = await fetch("/api/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(
          "A new confirmation email has been sent. Please check your inbox."
        );
      }
    } else {
      setMessage("Please enter your email address.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Confirm Your Email
        </h1>
        <p className="text-center mb-4">
          A confirmation email has been sent to your address. Please click the
          link in the email to complete your signup.
        </p>
        <p className="text-center mb-4">
          If you haven&apos;t received the email, enter your email address below
          to resend the confirmation email.
        </p>

        <div className="flex flex-col items-center">
          <input
            type="email"
            placeholder="Your email"
            className="mb-2 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={resendConfirmationEmail}
            disabled={isSubmitting}
          >
            Resend Email
          </button>
          {message && <p className="text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
