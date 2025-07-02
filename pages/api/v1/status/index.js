import database from "infra/database.js";

async function status(req, res) {
  const updatedAt = new Date().toISOString();

  const queryDbVersion = await database.query("SHOW server_version;");
  const dbVersion = queryDbVersion.rows[0].server_version;

  const queryMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = parseInt(queryMaxConnections.rows[0].max_connections);

  const nomeDb = process.env.POSTGRES_DB;
  const queryOpenedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [nomeDb],
  });
  const openedConnections = queryOpenedConnections.rows[0].count;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersion,
        max_connections: maxConnections,
        opened_connections: openedConnections,
      },
    },
  });
}
export default status;
