import useSWR from "swr";

async function fetchStatus(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const fetch = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  const updatedAt = new Date(fetch.data.updated_at).toLocaleString("pt-BR");

  return <p>Última Atualização: {updatedAt}</p>;
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
      <h1>Banco de Dados</h1>
      <div>
        <b>Versão do Banco de Dados:</b> {database_version}
      </div>
      <div>
        <b>Máximo de conexões:</b> {max_connections}
      </div>
      <div>
        <b>Conexões Abertas:</b>
        {opened_connections}
      </div>
    </>
  );
}
