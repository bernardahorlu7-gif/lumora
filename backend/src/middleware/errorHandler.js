function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'This action references a record that does not exist.' });
  }
  if (err instanceof Error && err.message && err.message.includes('File too large')) {
    return res.status(413).json({ error: 'File exceeds the 25MB upload limit.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
