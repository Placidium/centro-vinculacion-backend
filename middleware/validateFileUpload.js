// middleware/validateFileUpload.js
module.exports = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo o el formato no es válido.' });
  }
  next();
};
