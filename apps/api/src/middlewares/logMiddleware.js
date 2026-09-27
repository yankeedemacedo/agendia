const logInfomations = (req, res, next) => {
  const data = new Date().toLocaleString("pt-BR");
  console.log(`[${data}] ${req.method} ${req.url} pelo IP ${req.ip}`);
  next();
};

export default logInfomations;
