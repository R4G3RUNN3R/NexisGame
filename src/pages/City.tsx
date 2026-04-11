import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";

function CityLinkRow({
  label,
  to,
  note,
  locked = false,
}: {
  label: string;
  to: string;
  note: string;
  locked?: boolean;
}) {
  return (
    <div className="info-row">
      <div className="info-row__label">{label}</div>
      <div className={`info-row__value${locked ? "" : " info-row__value--accent"}`}>
        {locked ? (
          "Locked"
        ) : (
          <Link className="inline-route-link" to={to}>
            {note}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CityPage() {
  return (
    <AppShell
      title="City"
      hint="This is the city hub. Black Market stays hidden until requirements are met, so for now it is shown as locked here and nowhere else."
    >
      <div className="nexis-grid">
        <div className="nexis-column">
          <ContentPanel title="City Services">
            <div className="info-list">
              <CityLinkRow label="Market" to="/market" note="Open market page" />
              <CityLinkRow label="Black Market" to="/black-market" note="Open black market page" locked />
              <CityLinkRow label="Bank" to="/bank" note="Open bank page" />
              <CityLinkRow label="Hospital" to="/hospital" note="Open hospital page" />
              <CityLinkRow label="Tavern" to="/tavern" note="Open tavern page" />
            </div>
          </ContentPanel>
        </div>

        <div className="nexis-column">
          <ContentPanel title="Civic & Faction">
            <div className="info-list">
              <CityLinkRow label="Guilds / Consortiums" to="/guild" note="Open guilds / consortiums page" />
              <CityLinkRow label="City Board" to="/city-board" note="Open city board page" />
            </div>
          </ContentPanel>
        </div>

        <div className="nexis-column">
          <ContentPanel title="Notes">
            <div className="placeholder-box">
              <div className="placeholder-box__title">City Hub</div>
              <p>
                Sidebar clutter removed properly this time. Humans do love making the same mess twice.
              </p>
            </div>
          </ContentPanel>
        </div>
      </div>
    </AppShell>
  );
}
