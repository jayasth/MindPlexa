import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../shared/utils/useUser";
import { supabase } from "../shared/utils/supabaseClient";
import Layout from "../components/layout";
import {
  FiUser,
  FiEdit2,
  FiSave,
  FiBriefcase,
  FiMapPin,
  FiLink,
  FiTwitter,
  FiGithub,
  FiX,
} from "react-icons/fi";
import useTheme from "../shared/hooks/useTheme";

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        setIsEditing(false);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <Layout>
      <div
        className={`container mx-auto px-4 py-8 ${
          theme === "dark" ? "bg-gray-900 text-white" : ""
        }`}
      >
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <FiUser className="mr-2" />
          Profile
        </h1>
        {profile && (
          <div
            className={`shadow-md rounded-lg p-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isEditing ? (
                  <>
                    <FiX className="mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block font-semibold mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={profile.username || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, username: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="occupation"
                      className="block font-semibold mb-1"
                    >
                      Occupation
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      value={profile.occupation || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, occupation: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block font-semibold mb-1"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={profile.location || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="website"
                      className="block font-semibold mb-1"
                    >
                      Website
                    </label>
                    <input
                      type="text"
                      id="website"
                      value={profile.website || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="twitter"
                      className="block font-semibold mb-1"
                    >
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      value={profile.twitter || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, twitter: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="github"
                      className="block font-semibold mb-1"
                    >
                      GitHub
                    </label>
                    <input
                      type="text"
                      id="github"
                      value={profile.github || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, github: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="about" className="block font-semibold mb-1">
                    About Me
                  </label>
                  <textarea
                    id="about"
                    value={profile.about || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, about: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "border-gray-300"
                    }`}
                    rows={4}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${
                      theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <FiSave className="mr-2" />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Name:</span>{" "}
                    {profile.username}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Email:</span> {user.email}
                  </p>
                  <p className="mb-2 flex items-center">
                    <FiBriefcase className="mr-2" />
                    <span className="font-semibold">Occupation:</span>{" "}
                    {profile.occupation || "Not specified"}
                  </p>
                  <p className="mb-2 flex items-center">
                    <FiMapPin className="mr-2" />
                    <span className="font-semibold">Location:</span>{" "}
                    {profile.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 flex items-center">
                    <FiLink className="mr-2" />
                    <span className="font-semibold">Website:</span>{" "}
                    {profile.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profile.website}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </p>
                  <p className="mb-2 flex items-center">
                    <FiTwitter className="mr-2" />
                    <span className="font-semibold">Twitter:</span>{" "}
                    {profile.twitter ? (
                      <a
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        @{profile.twitter}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </p>
                  <p className="mb-2 flex items-center">
                    <FiGithub className="mr-2" />
                    <span className="font-semibold">GitHub:</span>{" "}
                    {profile.github ? (
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profile.github}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </p>
                </div>
              </div>
            )}
            {!isEditing && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">About Me</h3>
                <p>{profile.about || "No description provided."}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
