import orchestrator from "tests/orchestrator.js";
import setCookieParser from "set-cookie-parser";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("with incorrect email but correct password", async () => {
      await orchestrator.createUser({
        password: "senhaCorreta.123",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senhaCorreta.123peppertest",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("with incorrect password but correct email", async () => {
      await orchestrator.createUser({
        email: "emailcorreto@gmail.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailcorreto@gmail.com",
          password: "senhaIncorreta.123",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("with incorrect password and incorrect email", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailincorreto@gmail.com",
          password: "senhaIncorreta.123",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados enviados estão corretos",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("with correct password and correct email", async () => {
      const createdUser = await orchestrator.createUser({
        email: "meuemailcorreto@gmail.com",
        password: "senhacerta.123456",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "meuemailcorreto@gmail.com",
          password: "senhacerta.123456",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        created_at: responseBody.created_at,
        expires_at: responseBody.expires_at,
        id: responseBody.id,
        token: responseBody.token,
        updated_at: responseBody.updated_at,
        user_id: createdUser.id,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, { map: true });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        expires: expiresAt,
        httpOnly: true,
      });
    });
  });
});
