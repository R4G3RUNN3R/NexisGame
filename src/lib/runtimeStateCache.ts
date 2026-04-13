const JOBS_STORAGE_KEY = "nexis_jobs";
const EDUCATION_STORAGE_KEY = "nexis.education";
const ARENA_STORAGE_KEY = "nexis_arena";
const TIMER_STORAGE_KEY = "nexis_timers";

export type CachedRuntimeState = {
  player: Record<string, unknown>;
  jobs: Record<string, unknown>;
  education: Record<string, unknown>;
  arena: Record<string, unknown>;
  timers: Record<string, unknown>;
  guild: Record<string, unknown>;
  consortium: Record<string, unknown>;
};

function playerStorageKey(email: string) {
  return `nexis_player__${email.trim().toLowerCase()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(key: string): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeRecord(key: string, value: unknown) {
  if (!isRecord(value)) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readCachedRuntimeState(email: string): CachedRuntimeState {
  return {
    player: readRecord(playerStorageKey(email)),
    jobs: readRecord(JOBS_STORAGE_KEY),
    education: readRecord(EDUCATION_STORAGE_KEY),
    arena: readRecord(ARENA_STORAGE_KEY),
    timers: readRecord(TIMER_STORAGE_KEY),
    guild: {},
    consortium: {},
  };
}

export function writeCachedRuntimeState(email: string, state: Partial<CachedRuntimeState>) {
  if (typeof window === "undefined") return;

  if (state.player) writeRecord(playerStorageKey(email), state.player);
  if (state.jobs) writeRecord(JOBS_STORAGE_KEY, state.jobs);
  if (state.education) writeRecord(EDUCATION_STORAGE_KEY, state.education);
  if (state.arena) writeRecord(ARENA_STORAGE_KEY, state.arena);
  if (state.timers) writeRecord(TIMER_STORAGE_KEY, state.timers);
}

type MergeServerStateArgs = {
  email: string;
  user: {
    internalPlayerId: string;
    publicId: number;
    firstName: string;
    lastName: string;
  };
  playerState: {
    level?: number;
    gold?: number;
    stats?: Record<string, number>;
    workingStats?: Record<string, number>;
    battleStats?: Record<string, number>;
    currentJob?: Record<string, unknown> | string | null;
    runtimeState?: Partial<CachedRuntimeState>;
  } | null;
};

export function mergeServerStateIntoCache({
  email,
  user,
  playerState,
}: MergeServerStateArgs) {
  if (typeof window === "undefined") return;

  const existing = readRecord(playerStorageKey(email));
  const runtimePlayer = isRecord(playerState?.runtimeState?.player)
    ? playerState.runtimeState.player
    : {};
  const runtimeJobs = isRecord(playerState?.runtimeState?.jobs)
    ? playerState.runtimeState.jobs
    : null;
  const runtimeEducation = isRecord(playerState?.runtimeState?.education)
    ? playerState.runtimeState.education
    : null;
  const runtimeArena = isRecord(playerState?.runtimeState?.arena)
    ? playerState.runtimeState.arena
    : null;
  const runtimeTimers = isRecord(playerState?.runtimeState?.timers)
    ? playerState.runtimeState.timers
    : null;

  const mergedCurrent = {
    ...(isRecord(existing.current) ? existing.current : {}),
    ...(isRecord(runtimePlayer.current) ? runtimePlayer.current : {}),
  };

  const resolvedJob =
    typeof playerState?.currentJob === "string"
      ? playerState.currentJob
      : isRecord(playerState?.currentJob) && typeof playerState.currentJob.current === "string"
        ? playerState.currentJob.current
        : null;

  const mergedPlayer: Record<string, unknown> = {
    ...existing,
    ...runtimePlayer,
    internalId: user.internalPlayerId,
    publicId: user.publicId,
    name:
      typeof runtimePlayer.name === "string" && runtimePlayer.name
        ? runtimePlayer.name
        : typeof existing.name === "string" && existing.name
          ? existing.name
          : user.firstName,
    lastName:
      typeof runtimePlayer.lastName === "string" && runtimePlayer.lastName
        ? runtimePlayer.lastName
        : typeof existing.lastName === "string" && existing.lastName
          ? existing.lastName
          : user.lastName,
    isRegistered: true,
    level: playerState?.level ?? runtimePlayer.level ?? existing.level ?? 0,
    gold: playerState?.gold ?? runtimePlayer.gold ?? existing.gold ?? 500,
    stats: {
      ...(isRecord(existing.stats) ? existing.stats : {}),
      ...(isRecord(runtimePlayer.stats) ? runtimePlayer.stats : {}),
      ...(isRecord(playerState?.stats) ? playerState.stats : {}),
    },
    workingStats: {
      ...(isRecord(existing.workingStats) ? existing.workingStats : {}),
      ...(isRecord(runtimePlayer.workingStats) ? runtimePlayer.workingStats : {}),
      ...(isRecord(playerState?.workingStats) ? playerState.workingStats : {}),
    },
    battleStats: {
      ...(isRecord(existing.battleStats) ? existing.battleStats : {}),
      ...(isRecord(runtimePlayer.battleStats) ? runtimePlayer.battleStats : {}),
      ...(isRecord(playerState?.battleStats) ? playerState.battleStats : {}),
    },
    current: {
      ...mergedCurrent,
      job:
        resolvedJob ??
        (typeof mergedCurrent.job === "string" ? mergedCurrent.job : null),
    },
  };

  writeRecord(playerStorageKey(email), mergedPlayer);
  if (runtimeJobs) writeRecord(JOBS_STORAGE_KEY, runtimeJobs);
  if (runtimeEducation) writeRecord(EDUCATION_STORAGE_KEY, runtimeEducation);
  if (runtimeArena) writeRecord(ARENA_STORAGE_KEY, runtimeArena);
  if (runtimeTimers) writeRecord(TIMER_STORAGE_KEY, runtimeTimers);
}
