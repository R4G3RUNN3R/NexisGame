import { Navigate, useLocation } from "react-router-dom";
import { usePlayer } from "../../state/PlayerContext";

const BLOCKED_WHILE_HOSPITALIZED = new Set([
  "/education",
  "/jobs",
  "/travel",
  "/city",
  "/market",
  "/black-market",
  "/bank",
  "/academies",
  "/life-paths",
]);

export default function RouteGuard({ children }: { children: JSX.Element }) {
  const { isHospitalized } = usePlayer();
  const location = useLocation();

  if (isHospitalized && BLOCKED_WHILE_HOSPITALIZED.has(location.pathname)) {
    return <Navigate to="/hospital" replace state={{ redirectedFrom: location.pathname }} />;
  }

  return children;
}
