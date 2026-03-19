import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller";
const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOption = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let pendingMigration;

  return await connectionDB(async (dbClient) => {
    pendingMigration = await migrationRunner({
      ...defaultMigrationOption,
      dbClient: dbClient,
    });

    response.status(200).json(pendingMigration);
  });
}

async function postHandler(request, response) {
  let migratedMigration;

  return await connectionDB(async (dbClient) => {
    migratedMigration = await migrationRunner({
      ...defaultMigrationOption,
      dryRun: false,
      dbClient: dbClient,
    });

    if (migratedMigration.length > 0) {
      return response.status(201).json(migratedMigration);
    }
    response.status(200).json(migratedMigration);
  });
}

async function connectionDB(instance) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    return await instance(dbClient);
  } finally {
    await dbClient?.end();
  }
}
