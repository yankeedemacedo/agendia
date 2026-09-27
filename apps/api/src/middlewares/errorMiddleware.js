export const globalErrorHandler = (error, req, res, next) => {
  console.error("Erro:", error.message);
  console.error("Stack:", error.stack);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Ocorreu um erro inesperado";

  res.status(statusCode).json({
    message,
    ...(error.action ? { action: error.action } : {}),
  });
};
