import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../client/src/services/api/supabase/supabaseClient";
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";

const Confirmation: React.FC = () => {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const confirmEmail = async () => {
      const { error } = await supabase.auth.verifyOtp({
        email: router.query.email as string,
        token: router.query.token as string,
        type: "signup",
      });

      if (error) {
        console.error("Error confirming email:", error);
      } else {
        setIsConfirmed(true);
      }

      setIsLoading(false);
    };

    if (router.query.email && router.query.token) {
      confirmEmail();
    } else {
      setIsLoading(false);
    }
  }, [router.query.email, router.query.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-4">Confirming Email...</h1>
          <p>Please wait while we confirm your email address.</p>
        </div>
      </div>
    );
  }

  if (!isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Email Confirmation Failed</h1>
          <p className="mb-8">
            We were unable to confirm your email address. Please check the
            confirmation link and try again.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Email Confirmed!</h1>
        <p className="mb-8">
          Thank you for confirming your email address. Your account is now fully
          activated.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/profile"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <FiArrowRight className="mr-2" />
            Complete Your Profile
          </Link>
          <Link
            href="/workspace"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
