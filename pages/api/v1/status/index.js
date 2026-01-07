function status(request, response) {
  response.status(200).json({
    mensagem: "Exito",
  });
}

export default status;
