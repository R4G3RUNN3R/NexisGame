function mapUserRow(row) {
  if (!row) return null;

  return {
    internalId: row.internal_id,
    publicId: Number(row.public_id),
    username: row.username,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function findAuthUserByEmail(client, email) {
  const result = await client.query(
    `
      SELECT internal_id, public_id, username, email, first_name, last_name, password_hash, created_at
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    ...mapUserRow(row),
    passwordHash: row.password_hash,
  };
}

export async function findUserByInternalId(client, internalId) {
  const result = await client.query(
    `
      SELECT internal_id, public_id, username, email, first_name, last_name, created_at
      FROM users
      WHERE internal_id = $1
    `,
    [internalId],
  );

  return mapUserRow(result.rows[0]);
}

export async function findUserByPublicId(client, publicId) {
  const result = await client.query(
    `
      SELECT internal_id, public_id, username, email, first_name, last_name, created_at
      FROM users
      WHERE public_id = $1
    `,
    [publicId],
  );

  return mapUserRow(result.rows[0]);
}

export async function createUser(
  client,
  { internalId, publicId, username, email, firstName, lastName, passwordHash },
) {
  const result = await client.query(
    `
      INSERT INTO users (
        internal_id,
        public_id,
        username,
        email,
        first_name,
        last_name,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING internal_id, public_id, username, email, first_name, last_name, created_at
    `,
    [internalId, publicId, username, email, firstName, lastName, passwordHash],
  );

  return mapUserRow(result.rows[0]);
}
