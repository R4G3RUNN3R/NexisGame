import { AppShell } from "./AppShell";
import { ContentPanel } from "./ContentPanel";

type PlaceholderPageProps = {
  title: string;
  hint?: string;
};

export function PlaceholderPage({ title, hint }: PlaceholderPageProps) {
  return (
    <AppShell title={title} hint={hint ?? "This page is ready and linked. We will populate it later."}>
      <div className="placeholder-wrap">
        <ContentPanel title={title}>
          <div className="placeholder-box">
            <div className="placeholder-box__title">Empty page shell</div>
            <p>This route works and keeps the dashboard visible. Nothing else is pretending to be done yet.</p>
          </div>
        </ContentPanel>
      </div>
    </AppShell>
  );
}
