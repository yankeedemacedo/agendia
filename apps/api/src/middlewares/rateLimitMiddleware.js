// Rate limit simples em memória (sem nova dependência).
// Suficiente para login/cadastro; para múltiplas instâncias use Redis.
const hits = new Map();

export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res
        .status(429)
        .json({ error: "Muitas tentativas. Tente novamente em instantes." });
    }
    next();
  };
};
