var JWT = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

// ============================================
// Verificar Token
// ============================================
exports.verificaToken = function (request, response, next) {
  var token = request.query.token;
  JWT.verify(token, SEED, (error, decoded) => {
    if (error) {
      return response.status(401).json({
        ok: "false",
        message: "Token incorrecto",
        errors: error,
      });
    }
    request.usuario = decoded.usuario;
    next();
  });
};

// ============================================
// Verificar ADMIN
// ============================================
exports.varificaAdmin = function (request, response, next) {
  var token = request.query.token;
  var usuario = request.usuario;
  if (usuario.role === "ADMIN_ROLE") {
    next();
    return;
  } else {
    return response.status(401).json({
      ok: "false",
      message: "Token incorrecto - no ADM",
      errors: { message: "No tienes los privilegios para hacer esta accion" },
    });
  }
};

// ============================================
// Verificar MySelf
// ============================================
exports.varificaMySelf = function (request, response, next) {
  var usuario = request.usuario;
  var id = request.params.id;

  if (usuario.role === "ADMIN_ROLE" || usuario._id === id) {
    next();
    return;
  } else {
    return response.status(401).json({
      ok: "false",
      message: "Token incorrecto - no ADM || mySelf",
      errors: { message: "No tienes los privilegios para hacer esta accion" },
    });
  }
};
