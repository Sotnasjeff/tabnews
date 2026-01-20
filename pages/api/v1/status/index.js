import database from "infra/database.js";

async function status(request, response) {
  const postgresVersion = await database.query("SHOW server_version;");
  let databaseVersion = postgresVersion.rows[0].server_version;

  const databaseMaxConnections = await database.query("SHOW max_connections;");
  let maxConnections = databaseMaxConnections.rows[0].max_connections;

  const databaseName = "local_db";
  const databaseOpenedConnection = await database.query({
    text: `SELECT count(*) FROM pg_stat_activity WHERE datname = $1 AND state = 'active';`,
    values: [databaseName],
  });

  let openedConnections = databaseOpenedConnection.rows[0].count;
  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database_version: databaseVersion,
      max_connections: Number(maxConnections),
      opened_connections: Number(openedConnections),
    },
  });
}

export default status;
