import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send", async () => {
    await email.send({
      from: "Coringa <coringa@gmail.com.br>",
      to: "contato@gmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Coringa <coringa@gmail.com.br>",
      to: "contato@gmail.com",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<coringa@gmail.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@gmail.com>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do ultimo email.\n");
  });
});
