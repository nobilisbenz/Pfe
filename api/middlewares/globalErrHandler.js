const globalErrHandler = (err, req, res, next) => {
  // Log l'erreur en développement
  console.error('Error:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    status: err.status || 'error',
    message: err.message || 'Une erreur est survenue',
    code: err.statusCode || 500,
  };

  // Ajouter plus de détails en mode développement
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.errors || {};
  }

  // Gérer les erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    errorResponse.status = 'validation_error';
    errorResponse.code = 400;
    errorResponse.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Gérer les erreurs de cast Mongoose (ex: ID invalide)
  if (err.name === 'CastError') {
    errorResponse.status = 'invalid_data';
    errorResponse.code = 400;
    errorResponse.message = `Format invalide pour le champ : ${err.path}`;
  }

  // Gérer les erreurs de duplication MongoDB
  if (err.code === 11000) {
    errorResponse.status = 'duplicate_error';
    errorResponse.code = 400;
    errorResponse.message = 'Une entrée avec ces données existe déjà';
  }

  res.status(errorResponse.code).json(errorResponse);
};

//Not found
const notFoundErr = (req, res, next) => {
  const err = new Error(`La ressource ${req.originalUrl} n'a pas été trouvée sur le serveur`);
  err.status = 'not_found';
  err.statusCode = 404;
  next(err);
};

module.exports = { globalErrHandler, notFoundErr };
