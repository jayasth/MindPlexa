import React from "react";
import withAuth from "../components/withAuth";
import { useRouter } from "next/router";
import Layout from "../components/layout";

const SearchResults: React.FC = () => {
  const router = useRouter();
  const { query } = router.query;

  // Implement your search logic here based on the query parameter
  // You can fetch search results from your backend API or perform client-side filtering

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Search Results for: {query}</h1>
        {/* Display search results */}
      </div>
    </Layout>
  );
};

export default withAuth(SearchResults);
