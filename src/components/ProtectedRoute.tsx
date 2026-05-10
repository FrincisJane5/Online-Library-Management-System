import { Navigate } from "react-router-dom";
import type { User } from "../types";

interface Props {
  user: User | null;
  role: "admin" | "staff";
  children: React.ReactNode;
}

export default function ProtectedRoute({ user, role, children }: Props) {
  if (!user) return <Navigate to="/login" />;

  if (user.role !== role) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
