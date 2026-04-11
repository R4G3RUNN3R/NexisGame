import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import { AcademyDefinition, academyDefinitions, academySystemRules } from "../data/academyData";
import { useAcademyRuntime } from "../state/AcademyRuntimeContext";
import "../styles/academies-ui.css";

const ACADEMY_IMAGES: Record<string, string> = {
  southern: "/images/academies/academy_southern.png",
  eastern: "/images/academies/academy_eastern.png",
  northern: "/images/academies/academy_northern.png",
  western: "/images/academies/academy_western.png",
  professions: "/images/academies/academy_professions.png",
};

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="academy-meta-row">
      <span className="academy-meta-row__label">{label}</span>
      <strong className="academy-meta-row__value">{value}</strong>
    </div>
  );
}

export default function AcademiesPage() {
  const [selectedId, setSelectedId] = useState(academyDefinitions[0]?.id ?? "southern");
  const {
    academyState,
    setActiveAcademy,
    setAcademyRank,
    setWesternBranch,
    hasPassive,
  } = useAcademyRuntime();

  const selectedAcademy = useMemo<AcademyDefinition | undefined>(
    () => academyDefinitions.find((academy) => academy.id === selectedId),
    [selectedId]
  );

  const selectedRank = selectedAcademy ? academyState.rankProgress[selectedAcademy.id] ?? 0 : 0;
  const isActive = selectedAcademy ? academyState.activeAcademy === selectedAcademy.id : false;

  return (
    <AppShell
      title="Academies"
      hint="Academy runtime state is now wired. Selection, progress, and Western branch groundwork are live."
    >
      <div className="academies-grid">
        <div className="academies-column academies-column--left">
          <ContentPanel title="Academy Rules">
            <ul className="academy-rule-list">
              {academySystemRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </ContentPanel>

          <ContentPanel title="Academy Directory">
            <div className="academy-card-list">
              {academyDefinitions.map((academy) => {
                const progress = academyState.rankProgress[academy.id] ?? 0;
                const active = academyState.activeAcademy === academy.id;
                return (
                  <button
                    key={academy.id}
                    type="button"
                    className={`academy-card${academy.id === selectedId ? " academy-card--active" : ""}`}
                    onClick={() => setSelectedId(academy.id)}
                  >
                    <div className="academy-card__title">{academy.name}</div>
                    <div className="academy-card__subtitle">{academy.shortName}</div>
                    <div className="academy-card__theme">{academy.theme}</div>
                    <div className="academy-card__location">{academy.locationName}</div>
                    <div className="academy-card__location">Rank: {progress} / {academy.totalRanks}</div>
                    <div className="academy-card__location">{active ? "Currently Active" : "Inactive"}</div>
                  </button>
                );
              })}
            </div>
          </ContentPanel>
        </div>

        <div className="academies-column academies-column--center">
          {selectedAcademy ? (
            <>
              <ContentPanel title={selectedAcademy.name}>
                {ACADEMY_IMAGES[selectedAcademy.id] && (
                  <div className="academy-art-frame">
                    <img
                      src={ACADEMY_IMAGES[selectedAcademy.id]}
                      alt={selectedAcademy.name}
                      className="academy-art-img"
                    />
                  </div>
                )}
                <div className="academy-header-block">
                  <div className="academy-header-block__theme">{selectedAcademy.theme}</div>
                  <p className="academy-header-block__description">{selectedAcademy.description}</p>
                </div>

                <div className="academy-meta-grid">
                  <MetaRow label="Short Name" value={selectedAcademy.shortName} />
                  <MetaRow label="Region" value={selectedAcademy.region} />
                  <MetaRow label="Location" value={selectedAcademy.locationName} />
                  <MetaRow label="Role Identity" value={selectedAcademy.roleIdentity} />
                  <MetaRow label="Academy Type" value={selectedAcademy.academyType} />
                  <MetaRow label="Ranks" value={selectedAcademy.totalRanks} />
                  <MetaRow label="Current Rank" value={selectedRank} />
                  <MetaRow label="Status" value={isActive ? "Active" : "Inactive"} />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <button type="button" className="housing-detail__purchase-btn" onClick={() => setActiveAcademy(selectedAcademy.id)}>
                    Set Active Academy
                  </button>
                  <button
                    type="button"
                    className="housing-detail__purchase-btn"
                    onClick={() => setAcademyRank(selectedAcademy.id, selectedRank + 1)}
                    disabled={selectedRank >= selectedAcademy.totalRanks}
                  >
                    Advance Rank
                  </button>
                </div>

                {selectedAcademy.id === "western" && selectedRank >= 3 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div className="academy-summary-block__label">Western Branch</div>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        className="housing-detail__purchase-btn"
                        onClick={() => setWesternBranch("order")}
                      >
                        Choose Order
                      </button>
                      <button
                        type="button"
                        className="housing-detail__purchase-btn"
                        onClick={() => setWesternBranch("shadow")}
                      >
                        Choose Shadow
                      </button>
                    </div>
                    <p className="academy-goal-note" style={{ marginTop: "0.75rem" }}>
                      Current branch: {academyState.westernBranch ?? "Unchosen"}
                    </p>
                    <p className="academy-goal-note">
                      Black Market passive: {hasPassive("blackMarketAccess") ? "Unlocked" : "Locked"}
                    </p>
                  </div>
                )}
              </ContentPanel>

              <ContentPanel title="Activation & Progression Notes">
                <ul className="academy-rule-list">
                  {selectedAcademy.activationRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </ContentPanel>

              <ContentPanel title="Rank Ladder">
                <div className="academy-rank-list">
                  {selectedAcademy.ranks.map((rank, index) => (
                    <article key={`${selectedAcademy.id}-${rank.title}-${index}`} className="academy-rank-card">
                      <div className="academy-rank-card__top">
                        <span className="academy-rank-card__rank">
                          Rank {rank.rank}
                          {rank.branch ? ` • ${rank.branch}` : ""}
                        </span>
                        <span className={`academy-rank-card__mode academy-rank-card__mode--${rank.rewardMode}`}>
                          {rank.rewardMode}
                        </span>
                      </div>

                      <h3>{rank.title}</h3>
                      <p>{rank.description}</p>

                      <div className="academy-rank-card__foot">
                        <span>{rank.durationDays} days</span>
                      </div>

                      {rank.dependencies?.length ? (
                        <div className="academy-rank-card__block">
                          <div className="academy-rank-card__label">Dependencies</div>
                          <ul>
                            {rank.dependencies.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {rank.notes?.length ? (
                        <div className="academy-rank-card__block">
                          <div className="academy-rank-card__label">Notes</div>
                          <ul>
                            {rank.notes.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </ContentPanel>
            </>
          ) : null}
        </div>

        <div className="academies-column academies-column--right">
          <ContentPanel title="Runtime Summary">
            <div className="academy-summary-block">
              <div className="academy-summary-block__label">Active Academy</div>
              <p>{academyState.activeAcademy ?? "None selected"}</p>
            </div>

            <div className="academy-summary-block">
              <div className="academy-summary-block__label">Western Branch</div>
              <p>{academyState.westernBranch ?? "Unchosen"}</p>
            </div>

            <div className="academy-summary-block">
              <div className="academy-summary-block__label">Black Market Passive</div>
              <p>{hasPassive("blackMarketAccess") ? "Unlocked" : "Locked"}</p>
            </div>
          </ContentPanel>

          <ContentPanel title="Current Goal">
            <p className="academy-goal-note">
              Academy runtime now stores active academy, rank progress, western branch choice, and passive unlock state.
              Next step is tying western shadow progression into actual unlock rewards.
            </p>
          </ContentPanel>
        </div>
      </div>
    </AppShell>
  );
}
