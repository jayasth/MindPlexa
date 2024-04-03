// src/components/withAuth.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../shared/hooks/useUser";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent: React.FC = (props) => {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        const excludedPaths = ["/", "/login", "/signup"];
        if (!excludedPaths.includes(router.pathname)) {
          router.replace("/login");
        }
      }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
