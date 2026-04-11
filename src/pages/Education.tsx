import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { askCiel } from "../lib/ciel-system";
import {
  educationCategories,
  educationCourseMap,
  type EducationCourse,
} from "../data/educationData";
import { useEducationRuntime } from "../state/EducationRuntimeContext";
import "../styles/education-ui.css";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Course ready to complete";
  const totalSeconds = Math.ceil(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s remaining`;
  return `${minutes}m ${seconds}s remaining`;
}

function formatCountdown(ms: number): string {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.ceil(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getCategoryProgress(categoryId: string, completedCourseIds: string[]) {
  const category = educationCategories.find((entry) => entry.id === categoryId);
  const total = category?.courses.length ?? 0;
  const completed = category?.courses.filter((course) => completedCourseIds.includes(course.id)).length ?? 0;
  return { completed, total };
}

function isCourseLocked(course: EducationCourse, completedCourseIds: string[]) {
  return (course.prerequisites ?? []).some((id) => !completedCourseIds.includes(id));
}

function getCourseState(
  course: EducationCourse,
  completedCourseIds: string[],
  currentCourseId: string | null,
): "completed" | "current" | "locked" | "available" {
  if (completedCourseIds.includes(course.id)) return "completed";
  if (currentCourseId === course.id) return "current";
  if (isCourseLocked(course, completedCourseIds)) return "locked";
  return "available";
}

function CourseLearnArea({
  course,
  categoryId,
  onSelectCourse,
}: {
  course: EducationCourse;
  categoryId: string;
  onSelectCourse?: () => void;
}) {
  const education = useEducationRuntime();
  const [remainingMs, setRemainingMs] = useState<number>(() => education.getRemainingMs());

  const isThisCourseActive = education.isStudyingCourse(course.id);
  const isAnotherCourseActive = !!education.educationState.currentCourseId && !isThisCourseActive;
  const isCompleted = education.isCourseCompleted(course.id);
  const locked = isCourseLocked(course, education.educationState.completedCourseIds);

  useEffect(() => {
    if (!isThisCourseActive) return;
    setRemainingMs(education.getRemainingMs());
    const id = window.setInterval(() => {
      setRemainingMs(education.getRemainingMs());
    }, 1000);
    return () => window.clearInterval(id);
  }, [education, isThisCourseActive]);

  if (isCompleted) {
    return (
      <div className="edu-action-area">
        <span className="edu-action-badge edu-action-badge--completed">Completed ✓</span>
      </div>
    );
  }

  if (isThisCourseActive) {
    const ready = remainingMs <= 0;
    return (
      <div className="edu-action-area">
        <div className="edu-action-countdown">
          {ready ? "Learning complete. Finalize course." : `Learning… ${formatCountdown(remainingMs)} remaining`}
        </div>
        {ready ? (
          <button
            type="button"
            className="edu-action-button edu-action-button--primary"
            onClick={() => education.completeCourse(course.id, course.unlocksSystems ?? [])}
          >
            Complete
          </button>
        ) : (
          <button
            type="button"
            className="edu-action-button edu-action-button--cancel"
            onClick={() => education.leaveCourse()}
          >
            Leave Course
          </button>
        )}
      </div>
    );
  }

  if (isAnotherCourseActive) {
    const activeName = education.educationState.currentCourseId
      ? educationCourseMap[education.educationState.currentCourseId]?.name ?? "another course"
      : "another course";
    return (
      <div className="edu-action-area">
        <button
          type="button"
          className="edu-action-button edu-action-button--primary"
          disabled
          title={`Already studying \"${activeName}\"`}
        >
          Learn
        </button>
        <span className="edu-action-hint">Already studying another course</span>
      </div>
    );
  }

  if (locked) {
    const prereqNames = (course.prerequisites ?? [])
      .filter((id) => !education.isCourseCompleted(id))
      .map((id) => educationCourseMap[id]?.name ?? id)
      .join(", ");

    return (
      <div className="edu-action-area">
        <button
          type="button"
          className="edu-action-button edu-action-button--primary"
          disabled
          title={`Requires: ${prereqNames}`}
        >
          Learn
        </button>
        <span className="edu-action-hint edu-action-hint--lock">Requires: {prereqNames}</span>
      </div>
    );
  }

  return (
    <div className="edu-action-area">
      <button
        type="button"
        className="edu-action-button edu-action-button--primary"
        onClick={() => {
          onSelectCourse?.();
          education.startCourse(categoryId, course.id, course.durationDays, course.unlocksSystems ?? []);
        }}
      >
        Learn
      </button>
    </div>
  );
}

export default function Education() {
  const education = useEducationRuntime();
  const [selectedCategoryId, setSelectedCategoryId] = useState(educationCategories[0]?.id ?? "");

  const selectedCategory =
    educationCategories.find((c) => c.id === selectedCategoryId) ?? educationCategories[0];

  const [selectedCourseId, setSelectedCourseId] = useState(selectedCategory?.courses[0]?.id ?? "");

  useEffect(() => {
    if (!selectedCategory?.courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(selectedCategory?.courses[0]?.id ?? "");
    }
  }, [selectedCategory, selectedCourseId]);

  const selectedCourse = useMemo(() => {
    return educationCourseMap[selectedCourseId] ?? selectedCategory?.courses[0];
  }, [selectedCourseId, selectedCategory]);

  const [bannerRemainingMs, setBannerRemainingMs] = useState(() => education.getRemainingMs());

  useEffect(() => {
    if (!education.educationState.currentCourseId) {
      setBannerRemainingMs(0);
      return;
    }
    const id = window.setInterval(() => {
      setBannerRemainingMs(education.getRemainingMs());
    }, 1000);
    return () => window.clearInterval(id);
  }, [education, education.educationState.currentCourseId]);

  const activeCourseName = education.educationState.currentCourseId
    ? educationCourseMap[education.educationState.currentCourseId]?.name ?? "Current course"
    : null;

  const bannerSubtitle = education.educationState.currentCourseId
    ? formatRemaining(bannerRemainingMs)
    : "No active course";

  const passiveBonuses = [
    education.isCourseCompleted("basic-literacy") ? "education speed +5%" : null,
    education.isCourseCompleted("study-discipline") ? "education speed +5%" : null,
    education.isCourseCompleted("field-survival") ? "health regeneration +10%" : null,
    education.isCourseCompleted("general-mastery") ? "all battle stats +5% • all working stats +5%" : null,
  ].filter(Boolean) as string[];

  return (
    <AppShell>
      <div className="education-page">
        <div className="edu-banner">
          <div className="edu-banner__icon">i</div>
          <div>
            <div className="edu-banner__title">
              EDUCATION <span>{activeCourseName ? `• ${activeCourseName}` : ""}</span>
            </div>
            <div className="edu-banner__subtitle">{bannerSubtitle}</div>
          </div>
          <div className="edu-banner__actions">
            <button
              type="button"
              className="edu-banner__button"
              onClick={() => education.leaveCourse()}
              disabled={!education.educationState.currentCourseId || bannerRemainingMs <= 0}
            >
              Leave Course
            </button>
            <button
              type="button"
              className="edu-banner__button"
              onClick={() => askCiel("page_explain")}
            >
              Ask CIEL
            </button>
          </div>
        </div>

        <div className="edu-category-grid">
          {educationCategories.map((category) => {
            const progress = getCategoryProgress(category.id, education.educationState.completedCourseIds);
            const percentage = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
            const isSelected = category.id === selectedCategory.id;

            return (
              <button
                key={category.id}
                type="button"
                className={`edu-category-card${isSelected ? " edu-category-card--active" : ""}`}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedCourseId(category.courses[0].id);
                }}
              >
                <div className="edu-category-card__title">{category.name}</div>
                <div className="edu-category-card__image" />
                <div className="edu-category-card__footer">
                  <div className="edu-category-card__progress">
                    <div className="edu-category-card__progress-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="edu-category-card__count">{progress.completed}/{progress.total}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="edu-lower-grid">
          <section className="edu-panel">
            <div className="edu-panel__header">
              <span>{selectedCategory.name}</span>
              <span>−</span>
            </div>
            <div className="edu-course-list">
              {selectedCategory.courses.map((course) => {
                const state = getCourseState(
                  course,
                  education.educationState.completedCourseIds,
                  education.educationState.currentCourseId,
                );
                return (
                  <button
                    key={course.id}
                    type="button"
                    className={`edu-course-row edu-course-row--${state}${selectedCourse?.id === course.id ? " edu-course-row--selected" : ""}`}
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    <span className="edu-course-row__bullet" />
                    <span className="edu-course-row__code">{course.code}</span>
                    <span className="edu-course-row__name">{course.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="edu-panel">
            <div className="edu-panel__header">
              <span>{selectedCourse?.name.toUpperCase()}</span>
              <span>−</span>
            </div>
            {selectedCourse && (
              <div className="edu-detail-card">
                {education.isCourseCompleted(selectedCourse.id) ? (
                  <div className="edu-detail-card__completed-banner">You have completed this course!</div>
                ) : null}

                <div className="edu-detail-card__body">
                  <div className="edu-detail-card__course-title">{selectedCourse.name}</div>
                  <div className="edu-detail-card__description">{selectedCourse.description}</div>

                  <div className="edu-detail-section">
                    <div className="edu-detail-section__label">Learning outcome:</div>
                    <ul className="edu-detail-list">
                      {selectedCourse.summaryLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="edu-detail-section">
                    <div className="edu-detail-section__label">Parameters:</div>
                    <ul className="edu-detail-list">
                      <li>Length: {selectedCourse.durationDays} days</li>
                      <li>Cost: {selectedCourse.costGold} gold</li>
                      <li>Reward type: {selectedCourse.rewardKind}</li>
                    </ul>
                  </div>

                  <div className="edu-detail-section">
                    <div className="edu-detail-section__label">Requirements:</div>
                    {selectedCourse.prerequisites?.length ? (
                      <ul className="edu-detail-list">
                        {selectedCourse.prerequisites.map((item) => (
                          <li
                            key={item}
                            className={education.isCourseCompleted(item) ? "edu-prereq--met" : "edu-prereq--unmet"}
                          >
                            {educationCourseMap[item]?.name ?? item}
                            {education.isCourseCompleted(item) ? " ✓" : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="edu-detail-card__plain">No prerequisites.</div>
                    )}
                  </div>

                  <div className="edu-detail-section">
                    <div className="edu-detail-section__label">Actions:</div>
                    <div className="edu-detail-card__actions">
                      <CourseLearnArea
                        course={selectedCourse}
                        categoryId={selectedCategory.id}
                        onSelectCourse={() => setSelectedCourseId(selectedCourse.id)}
                      />
                      <button
                        type="button"
                        className="edu-action-button"
                        onClick={() => askCiel("page_explain")}
                      >
                        Ask CIEL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="edu-passive-strip">
                  <div className="edu-passive-strip__block">
                    <div className="edu-passive-strip__label">Passive bonuses</div>
                    <div className="edu-passive-strip__value">
                      {passiveBonuses.length ? passiveBonuses.join(" • ") : "None yet"}
                    </div>
                  </div>
                  <div className="edu-passive-strip__block">
                    <div className="edu-passive-strip__label">Active course</div>
                    <div className="edu-passive-strip__value">
                      {activeCourseName ? `${activeCourseName} • ${bannerSubtitle}` : "None yet"}
                    </div>
                  </div>
                  <div className="edu-passive-strip__block">
                    <div className="edu-passive-strip__label">System unlocks</div>
                    <div className="edu-passive-strip__value">
                      {education.educationState.unlockedSystems.length
                        ? education.educationState.unlockedSystems.join(" • ")
                        : "None yet"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
