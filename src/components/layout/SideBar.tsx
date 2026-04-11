import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/education", label: "Education" },
  { to: "/jobs", label: "Jobs" },
  { to: "/travel", label: "Travel" },
  { to: "/housing", label: "Housing" },
  { to: "/city", label: "City" },
  { to: "/city-board", label: "City Board" },
  { to: "/hospital", label: "Hospital" },
  { to: "/guilds", label: "Guilds / Consortiums" },
  { to: "/life-paths", label: "Life Paths" },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <section className="sidebar__logo-panel">
        <div className="sidebar__logo">NEXIS</div>
      </section>

      <section className="sidebar__panel">
        <div className="sidebar__panel-header">Information</div>

        <div className="sidebar__panel-body">
          <div className="sidebar__stat-row">
            <span className="sidebar__stat-label">Name:</span>
            <span className="sidebar__stat-value">Player#0001</span>
          </div>

          <div className="sidebar__stat-row">
            <span className="sidebar__stat-label">Gold:</span>
            <span className="sidebar__stat-value">0</span>
          </div>

          <div className="sidebar__stat-row">
            <span className="sidebar__stat-label">Level:</span>
            <span className="sidebar__stat-value">1</span>
          </div>

          <div className="sidebar__stat-row">
            <span className="sidebar__stat-label">Points:</span>
            <span className="sidebar__stat-value">0</span>
          </div>

          <div className="sidebar__stat-row">
            <span className="sidebar__stat-label">Age:</span>
            <span className="sidebar__stat-value">0 days</span>
          </div>

          <div className="sidebar__meter-block">
            <div className="sidebar__meter-top">
              <span>Energy:</span>
              <span>100/100</span>
            </div>
            <div className="sidebar__meter">
              <div
                className="sidebar__meter-fill sidebar__meter-fill--energy"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="sidebar__meter-block">
            <div className="sidebar__meter-top">
              <span>Stamina:</span>
              <span>10/10</span>
            </div>
            <div className="sidebar__meter">
              <div
                className="sidebar__meter-fill sidebar__meter-fill--stamina"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="sidebar__meter-block">
            <div className="sidebar__meter-top">
              <span>Comfort:</span>
              <span>100/100</span>
            </div>
            <div className="sidebar__meter">
              <div
                className="sidebar__meter-fill sidebar__meter-fill--comfort"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="sidebar__meter-block">
            <div className="sidebar__meter-top">
              <span>Life:</span>
              <span>100/100</span>
            </div>
            <div className="sidebar__meter">
              <div
                className="sidebar__meter-fill sidebar__meter-fill--life"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sidebar__panel">
        <div className="sidebar__panel-header">Navigation</div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__nav-link${isActive ? " sidebar__nav-link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </section>
    </div>
  );
}