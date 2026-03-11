import useSWR from "swr";

async function fetchStatus(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <DatabaseStatus />
    </>
  );
}

function DatabaseStatus() {
  const { isLoading, error, data } = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  if (error) {
    return (
      <h1>
        Perdão, estamos com problemas, já estamos trabalhando para corrigir
      </h1>
    );
  }

  if (isLoading) {
    return <h1>Carregando...</h1>;
  }

  const { database_version, max_connections, opened_connections } =
    data.dependencies;

  return (
    <>
      <h1>Status</h1>
      <h2>Atualização: {new Date(data.updated_at).toLocaleString("pt-BR")}</h2>
      <p>
        <b>Versão do Banco de Dados:</b> {database_version}
      </p>
      <p>
        <b>Máximo de conexões:</b> {max_connections}
      </p>
      <p>
        <b>Conexões Abertas:</b>
        {opened_connections}
      </p>
    </>
  );
}
