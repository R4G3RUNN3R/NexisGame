import { Routes, Route, Navigate } from "react-router-dom";
import RouteGuard from "../components/routing/RouteGuard";
import RegisterPage from "../pages/Register";
import { usePlayer } from "../state/PlayerContext";
import { getProfileRoute } from "../lib/publicIds";

import HomePage from "../pages/Home";
import EducationPage from "../pages/Education";
import JobsPage from "../pages/Jobs";
import TravelPage from "../pages/Travel";
import AcademiesPage from "../pages/Academies";
import MarketPage from "../pages/MarketV3";
import HousingPage from "../pages/Housing";
import SkillsPage from "../pages/Skills";
import LifePathsPage from "../pages/LifePaths";
import CityBoardPage from "../pages/CityBoardV3";
import ProfilePage from "../pages/Profile";
import AchievementsPage from "../pages/Achievements";
import BlackMarketPage from "../pages/BlackMarketV2";
import BankPage from "../pages/Bank";
import GuildPage from "../pages/Guild";
import HospitalPage from "../pages/Hospital";
import TavernPage from "../pages/Tavern";
import CityPage from "../pages/City";
import InventoryPage from "../pages/Inventory";
import ArenaPage from "../pages/Arena";
import ConsortiumRegistryV2Page from "../pages/ConsortiumRegistryV2";

function OwnProfileRedirect() {
  const { player } = usePlayer();
  return <Navigate to={getProfileRoute(player.publicId)} replace />;
}

export default function AppRouterV3() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage initialMode="register" />} />
      <Route path="/login" element={<RegisterPage initialMode="login" />} />

      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/profile" element={<OwnProfileRedirect />} />
      <Route path="/profile/:publicId" element={<ProfilePage />} />
      <Route path="/profiles/:publicId" element={<ProfilePage />} />
      <Route path="/profiles" element={<Navigate to="/profile" replace />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/housing" element={<HousingPage />} />
      <Route path="/guild" element={<GuildPage />} />
      <Route path="/hospital" element={<HospitalPage />} />
      <Route path="/city-board" element={<CityBoardPage />} />
      <Route path="/consortium-registry" element={<ConsortiumRegistryV2Page />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/tavern" element={<TavernPage />} />

      <Route path="/education" element={<RouteGuard><EducationPage /></RouteGuard>} />
      <Route path="/jobs" element={<RouteGuard><JobsPage /></RouteGuard>} />
      <Route path="/arena" element={<RouteGuard><ArenaPage /></RouteGuard>} />
      <Route path="/travel" element={<RouteGuard><TravelPage /></RouteGuard>} />
      <Route path="/city" element={<RouteGuard><CityPage /></RouteGuard>} />
      <Route path="/market" element={<RouteGuard><MarketPage /></RouteGuard>} />
      <Route path="/black-market" element={<RouteGuard><BlackMarketPage /></RouteGuard>} />
      <Route path="/bank" element={<RouteGuard><BankPage /></RouteGuard>} />
      <Route path="/academies" element={<RouteGuard><AcademiesPage /></RouteGuard>} />
      <Route path="/life-paths" element={<RouteGuard><LifePathsPage /></RouteGuard>} />
    </Routes>
  );
}
