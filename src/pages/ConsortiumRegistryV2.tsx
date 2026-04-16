import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import ConsortiumTemplateRegistry from "../components/city/ConsortiumTemplateRegistry";

export default function ConsortiumRegistryV2Page() {
  return (
    <AppShell
      title="Consortium Registry"
      hint="Consortiums are fixed company-style organizations with predefined passives and actives. Pick one because it fits your plan, not because you misread a tooltip at 3 AM."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <ContentPanel title="Registry Overview">
          <div style={{ padding: "1rem", color: "var(--color-text-muted, #aaa)" }}>
            <p>Consortiums are the Nexis company system. They do not use a leader skill tree.</p>
            <p>Each consortium type has a fixed structure, fixed passives, and fixed actives.</p>
            <p>Guilds remain the faction-style organization with a leader-controlled tree and separate progression model.</p>
          </div>
        </ContentPanel>

        <ContentPanel title="Available Consortium Templates">
          <div style={{ padding: "1rem" }}>
            <ConsortiumTemplateRegistry />
          </div>
        </ContentPanel>
      </div>
    </AppShell>
  );
}
