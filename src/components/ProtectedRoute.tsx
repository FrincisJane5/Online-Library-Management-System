// Navigate is used to redirect unauthenticated or unauthorized users
import { Navigate } from "react-router-dom";
import type { User } from "../types";

interface Props {
  user: User | null;                  // The currently logged-in user, or null if not logged in
  role: "admin" | "staff";           // The role required to access this route
  children: React.ReactNode;         // The page component to render if access is granted
}

/**
 * ProtectedRoute — guards a route so only authenticated users with the correct role can access it.
 * - If no user is logged in → redirect to /login
 * - If the user's role doesn't match the required role → redirect to /login
 * - Otherwise → render the children (the protected page)
 */
export default function ProtectedRoute({ user, role, children }: Props) {
  // Not logged in — send to login page
  if (!user) return <Navigate to="/login" />;

  // Wrong role (e.g. staff trying to access an admin route) — send to login page
  if (user.role !== role) return <Navigate to="/login" />;

  // Access granted — render the protected page
  return <>{children}</>;
}
