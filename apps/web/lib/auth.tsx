"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../components/ui/button";

interface ProtectedComponentProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedComponent({
  children,
  redirectTo = "/login",
  fallback,
}: ProtectedComponentProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push(redirectTo);
  }, [session, status, router, redirectTo]);

  if (status === "loading") {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <Button onClick={() => router.push(redirectTo)}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedComponent>
        <Component {...props} />
      </ProtectedComponent>
    );
  };
}

// Simple hook to get current user
export function useCurrentUser() {
  const { data: session } = useSession();
  return session?.user;
}

// Simple hook to get access token
export function useAccessToken() {
  const { data: session } = useSession();
  return (session as any)?.accessToken;
}
