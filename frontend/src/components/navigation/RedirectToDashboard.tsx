// RedirectToDashboard.tsx
import { Navigate } from "react-router-dom";
import { Landing } from "../../pages";

const RedirectToDashboard = () => {
  const isLoggedIn = false;

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
};

export default RedirectToDashboard;
