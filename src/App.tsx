import { BrowserRouter, Navigate, useLocation } from "react-router-dom";
import AppRouter from "./router";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { PlayerProvider, usePlayer } from "./state/PlayerContext";
import { EducationProvider } from "./state/EducationContext";
import { EducationRuntimeProvider } from "./state/EducationRuntimeContext";
import { TravelRuntimeProvider } from "./state/TravelRuntimeContext";
import { MarketRuntimeProvider } from "./state/MarketRuntimeContext";
import { JobsProvider } from "./state/JobsContext";
import { ArenaProvider } from "./state/ArenaContext";
import { AcademyRuntimeProvider } from "./state/AcademyRuntimeContext";
import Ciel from "./components/ciel/Ciel";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { isRegistered } = usePlayer();
  const location = useLocation();

  if (location.pathname === "/register") return <>{children}</>;

  if (!isLoggedIn && !isRegistered) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AcademyRuntimeProvider>
          <EducationRuntimeProvider>
            <TravelRuntimeProvider>
              <MarketRuntimeProvider>
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
              </MarketRuntimeProvider>
            </TravelRuntimeProvider>
          </EducationRuntimeProvider>
        </AcademyRuntimeProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}
