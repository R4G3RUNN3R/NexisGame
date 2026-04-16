import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import ConsortiumPreviewPanel from "../components/city/ConsortiumPreviewPanel";
import { groupCityBoardListingsV2 } from "../data/cityBoardDataV2";

const ordered = [
  "civic_jobs",
  "notices",
  "opportunities",
  "bounties",
  "personals",
  "properties",
] as const;

const titles: Record<(typeof ordered)[number], string> = {
  civic_jobs: "Civic Jobs",
  notices: "Notices",
  opportunities: "Opportunities",
  bounties: "Bounties",
  personals: "Personals",
  properties: "Properties",
};

export default function CityBoardV3Page() {
  const grouped = groupCityBoardListingsV2();

  return (
    <AppShell
      title="City Board"
      hint="Nexis public board: jobs, notices, opportunities, bounties, properties, and consortium creation. Slightly more useful than a page that returns null."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <ContentPanel title="Board Listings">
          <div style={{ display: "grid", gap: 14 }}>
            {ordered.map((category) => (
              <div key={category} style={{ display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{titles[category]}</div>
                {grouped[category].map((listing) => (
                  <div
                    key={listing.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: 12,
                      background: "rgba(7, 13, 20, 0.55)",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <strong>{listing.title}</strong>
                    <div style={{ fontSize: 13, opacity: 0.82 }}>{listing.summary}</div>
                    {listing.rewardLabel ? (
                      <div style={{ fontSize: 12, color: "#b7c3cf" }}>Reward: {listing.rewardLabel}</div>
                    ) : null}
                    {listing.requirementLabel ? (
                      <div style={{ fontSize: 12, color: "#b7c3cf" }}>Requires: {listing.requirementLabel}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ContentPanel>

        <ContentPanel title="Available Consortiums">
          <div style={{ padding: "0.25rem 0" }}>
            <ConsortiumPreviewPanel />
          </div>
        </ContentPanel>
      </div>
    </AppShell>
  );
}
