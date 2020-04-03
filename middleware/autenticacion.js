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
