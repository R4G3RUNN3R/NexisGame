import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { usePlayer } from "../../state/PlayerContext";
import { useAuth } from "../../state/AuthContext";

const navLinks: Array<[string, string]> = [
  ["Wiki", "#"],
  ["Rules", "#"],
  ["Forums", "#"],
  ["Discord", "#"],
  ["Staff", "#"],
  ["Credits", "#"],
];

function formatClock(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat(timeZone ? "en-GB" : undefined, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function TopBar() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const { player, resetPlayer } = usePlayer();
  const { logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const playerMenuRef = useRef<HTMLDivElement | null>(null);
  const clockMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (playerMenuRef.current && !playerMenuRef.current.contains(target)) {
        setPlayerOpen(false);
      }
      if (clockMenuRef.current && !clockMenuRef.current.contains(target)) {
        setClockOpen(false);
      }
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const localTime = useMemo(() => formatClock(now), [now]);
  const nexisTime = useMemo(() => formatClock(now, "Europe/London"), [now]);

  const displayName = player.lastName
    ? `${player.name} ${player.lastName}`
    : player.name || "Unknown";

  const initial = player.name ? player.name.charAt(0).toUpperCase() : "?";

  function handleLogout() {
    setPlayerOpen(false);
    logout();
    resetPlayer();
    navigate("/register", { replace: true });
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        {navLinks.map(([label, to]) => (
          <a key={label} href={to} className="topbar__link">
            {label}
          </a>
        ))}
      </div>

      <div className="topbar__center">
        <input
          className="topbar__search"
          type="search"
          placeholder="search..."
          aria-label="Search"
        />
      </div>

      <div className="topbar__right">
        <div className="topbar__menu-wrap" ref={clockMenuRef}>
          <button
            type="button"
            className="topbar__icon"
            aria-label="Clock"
            onClick={() => setClockOpen((value) => !value)}
          >
            ◷
          </button>

          {clockOpen ? (
            <div className="topbar__dropdown topbar__dropdown--clock">
              <div className="topbar__dropdown-row">
                <span className="topbar__dropdown-label">Local</span>
                <strong>{localTime}</strong>
              </div>
              <div className="topbar__dropdown-row">
                <span className="topbar__dropdown-label">Nexis</span>
                <strong>{nexisTime}</strong>
              </div>
            </div>
          ) : null}
        </div>

        <button type="button" className="topbar__icon" aria-label="Menu">
          ☰
        </button>

        <div className="player-menu" ref={playerMenuRef}>
          <button
            type="button"
            className="player-menu__trigger"
            onClick={() => setPlayerOpen((value) => !value)}
          >
            <span className="player-menu__avatar">{initial}</span>
            <span className="player-menu__name">{player.name || "Player"}</span>
            <span className="player-menu__caret">{playerOpen ? "▲" : "▼"}</span>
          </button>

          {playerOpen ? (
            <div className="player-menu__dropdown">
              <div className="player-menu__server">Shard: Cay</div>
              <NavLink to="/profile" className="player-menu__item" onClick={() => setPlayerOpen(false)}>
                Character Profile
              </NavLink>
              <NavLink to="/achievements" className="player-menu__item" onClick={() => setPlayerOpen(false)}>
                Achievements
              </NavLink>
              <NavLink to="/housing" className="player-menu__item" onClick={() => setPlayerOpen(false)}>
                Housing
              </NavLink>
              <NavLink to="/education" className="player-menu__item" onClick={() => setPlayerOpen(false)}>
                Education
              </NavLink>
              <button type="button" className="player-menu__item player-menu__item--button">
                Settings
              </button>
              <div className="player-menu__divider" />
              <button
                type="button"
                className="player-menu__item player-menu__item--logout"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
