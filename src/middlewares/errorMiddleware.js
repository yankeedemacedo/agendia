export const globalErrorHandler = (error, req, res, next) => {
  console.error("Erro:", error.message);
  console.error("Stack:", error.stack);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Ocorreu um erro inesperado",
  });
};
