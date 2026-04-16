import { BrowserRouter, Navigate, useLocation } from "react-router-dom";
import AppRouterV3 from "./router/indexV3";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { PlayerProvider } from "./state/PlayerContext";
import { EducationProvider } from "./state/EducationContext";
import { TimerProvider } from "./state/TimerContext";
import { JobsProvider } from "./state/JobsContext";
import { ArenaProvider } from "./state/ArenaContext";
import Ciel from "./components/ciel/Ciel";
import { BackendStateBridge } from "./components/state/BackendStateBridge";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (location.pathname === "/register" || location.pathname === "/login") {
    return <>{children}</>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ redirectedFrom: location.pathname }} />;
  }

  return <>{children}</>;
}

export default function AppV3() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <TimerProvider>
          <JobsProvider>
            <ArenaProvider>
              <EducationProvider>
                <BackendStateBridge />
                <BrowserRouter>
                  <AuthGate>
                    <AppRouterV3 />
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
