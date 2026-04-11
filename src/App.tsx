import { BrowserRouter, Navigate, useLocation } from "react-router-dom";
import AppRouter from "./router";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { PlayerProvider, usePlayer } from "./state/PlayerContext";
import { EducationProvider } from "./state/EducationContext";
import { TimerProvider } from "./state/TimerContext";
import { JobsProvider } from "./state/JobsContext";
import { ArenaProvider } from "./state/ArenaContext";
import Ciel from "./components/ciel/Ciel";

/**
 * Redirects to /register if:
 *  1. No auth session (not logged in), OR
 *  2. Logged in but player hasn't registered a character yet
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { isRegistered } = usePlayer();
  const location = useLocation();

  // Allow /register route to render without redirecting
  if (location.pathname === "/register") return <>{children}</>;

  // Not logged in → go to register/login page
  if (!isLoggedIn && !isRegistered) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <TimerProvider>
          <JobsProvider>
            <ArenaProvider>
            <EducationProvider>
              <BrowserRouter>
                <AuthGate>
                  <AppRouter />
                  <Ciel />
                </AuthGate>
              </BrowserRouter>
            </EducationProvider>
            </ArenaProvider>
          </JobsProvider>
        </TimerProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}
