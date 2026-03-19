import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigration = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigration);
}

async function postHandler(request, response) {
  const migratedMigration = await migrator.runPendingMigrations();
  if (migratedMigration.length > 0) {
    return response.status(201).json(migratedMigration);
  }

  return response.status(200).json(migratedMigration);
}
