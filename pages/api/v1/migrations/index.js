import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const allowedMethods = ["GET", "POST"];

  const defaultMigrationOption = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      message: "Method Now Allowed",
    });
  }

  if (request.method === "GET") {
    const pendingMigration = await migrationRunner(defaultMigrationOption);
    await dbClient.end();
    response.status(200).json(pendingMigration);
  }

  if (request.method === "POST") {
    const migratedMigration = await migrationRunner({
      ...defaultMigrationOption,
      dryRun: false,
    });

    await dbClient.end();

    if (migratedMigration.length > 0) {
      return response.status(201).json(migratedMigration);
    }
    response.status(200).json(migratedMigration);
  }

  return response.status(405).end();
}
