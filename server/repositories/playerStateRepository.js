const DEFAULT_STATS = {
  energy: 100,
  maxEnergy: 100,
  health: 100,
  maxHealth: 100,
  stamina: 10,
  maxStamina: 10,
  comfort: 100,
  maxComfort: 100,
  nerve: 16,
  maxNerve: 84,
  chain: 0,
  maxChain: 10,
};

const DEFAULT_WORKING_STATS = {
  manualLabor: 0,
  intelligence: 0,
  endurance: 0,
};

const DEFAULT_BATTLE_STATS = {
  strength: 0,
  defense: 0,
  speed: 0,
  dexterity: 0,
};

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mapPlayerStateRow(row) {
  if (!row) return null;

  return {
    level: Number(row.level ?? 0),
    gold: Number(row.gold ?? 0),
    stats: row.stats ?? DEFAULT_STATS,
    workingStats: row.working_stats ?? DEFAULT_WORKING_STATS,
    battleStats: row.battle_stats ?? DEFAULT_BATTLE_STATS,
    currentJob: row.current_job ?? { current: null },
    runtimeState: {
      player: row.player_snapshot ?? {},
      jobs: row.jobs_state ?? {},
      education: row.education_state ?? {},
      arena: row.arena_state ?? {},
      timers: row.timer_state ?? {},
      guild: row.guild_state ?? {},
      consortium: row.consortium_state ?? {},
    },
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

export async function createDefaultPlayerState(client, userInternalId) {
  await client.query(
    `
      INSERT INTO player_state (
        user_internal_id,
        level,
        gold,
        stats,
        working_stats,
        battle_stats,
        current_job,
        player_snapshot,
        jobs_state,
        education_state,
        arena_state,
        timer_state,
        guild_state,
        consortium_state
      )
      VALUES ($1, 0, 500, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb)
      ON CONFLICT (user_internal_id) DO NOTHING
    `,
    [
      userInternalId,
      JSON.stringify(DEFAULT_STATS),
      JSON.stringify(DEFAULT_WORKING_STATS),
      JSON.stringify(DEFAULT_BATTLE_STATS),
      JSON.stringify({ current: null }),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
    ],
  );
}

export async function findPlayerStateByUserInternalId(client, userInternalId) {
  const result = await client.query(
    `
      SELECT
        level,
        gold,
        stats,
        working_stats,
        battle_stats,
        current_job,
        player_snapshot,
        jobs_state,
        education_state,
        arena_state,
        timer_state,
        guild_state,
        consortium_state,
        created_at,
        updated_at
      FROM player_state
      WHERE user_internal_id = $1
    `,
    [userInternalId],
  );

  return mapPlayerStateRow(result.rows[0]);
}

export async function upsertPlayerRuntimeState(client, userInternalId, runtimeState = {}) {
  const playerSnapshot = asRecord(runtimeState.player);
  const stats = asRecord(playerSnapshot.stats);
  const workingStats = asRecord(playerSnapshot.workingStats);
  const battleStats = asRecord(playerSnapshot.battleStats);
  const current = asRecord(playerSnapshot.current);

  await client.query(
    `
      INSERT INTO player_state (
        user_internal_id,
        level,
        gold,
        stats,
        working_stats,
        battle_stats,
        current_job,
        player_snapshot,
        jobs_state,
        education_state,
        arena_state,
        timer_state,
        guild_state,
        consortium_state,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7::jsonb,
        $8::jsonb,
        $9::jsonb,
        $10::jsonb,
        $11::jsonb,
        $12::jsonb,
        $13::jsonb,
        $14::jsonb,
        NOW()
      )
      ON CONFLICT (user_internal_id) DO UPDATE SET
        level = EXCLUDED.level,
        gold = EXCLUDED.gold,
        stats = EXCLUDED.stats,
        working_stats = EXCLUDED.working_stats,
        battle_stats = EXCLUDED.battle_stats,
        current_job = EXCLUDED.current_job,
        player_snapshot = EXCLUDED.player_snapshot,
        jobs_state = EXCLUDED.jobs_state,
        education_state = EXCLUDED.education_state,
        arena_state = EXCLUDED.arena_state,
        timer_state = EXCLUDED.timer_state,
        guild_state = EXCLUDED.guild_state,
        consortium_state = EXCLUDED.consortium_state,
        updated_at = NOW()
    `,
    [
      userInternalId,
      Math.max(0, Math.floor(asNumber(playerSnapshot.level, 0))),
      Math.max(0, Math.floor(asNumber(playerSnapshot.gold, 500))),
      JSON.stringify(Object.keys(stats).length ? stats : DEFAULT_STATS),
      JSON.stringify(Object.keys(workingStats).length ? workingStats : DEFAULT_WORKING_STATS),
      JSON.stringify(Object.keys(battleStats).length ? battleStats : DEFAULT_BATTLE_STATS),
      JSON.stringify({ current: current.job ?? null }),
      JSON.stringify(playerSnapshot),
      JSON.stringify(asRecord(runtimeState.jobs)),
      JSON.stringify(asRecord(runtimeState.education)),
      JSON.stringify(asRecord(runtimeState.arena)),
      JSON.stringify(asRecord(runtimeState.timers)),
      JSON.stringify(asRecord(runtimeState.guild)),
      JSON.stringify(asRecord(runtimeState.consortium)),
    ],
  );

  return findPlayerStateByUserInternalId(client, userInternalId);
}
