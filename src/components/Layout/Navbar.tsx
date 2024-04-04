import React from "react";
import Link from "next/link";
import { useUser } from "../../shared/hooks/useUser";
import { supabase } from "../../shared/supabase/supabaseClient";
import { useRouter } from "next/router";

const Navbar: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/icons/logo.svg"
                alt="Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/workspace"
                  className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Workspace
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
