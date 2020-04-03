// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var JWT = require("jsonwebtoken");
var SEED = require("../config/config").SEED;
var app = express();

var Usuario = require("../models/usuario");

app.post("/", (request, response) => {
  var body = request.body;

  Usuario.findOne({ email: body.email }, (error, usuarioBD) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al buscar usuario",
        errors: error,
      });
    }

    if (!usuarioBD) {
      return response.status(400).json({
        ok: "false",
        message: "Credenciales no validas - email",
        errors: error,
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      return response.status(400).json({
        ok: "false",
        message: "Credenciales no validas - password",
        errors: error,
      });
    }

    // Crear token
    var token = JWT.sign({ usuario: usuarioBD }, SEED, {
      expiresIn: 14400,
    });

    usuarioBD.password = ":)";
    response.status(200).json({
      ok: "true",
      mensaje: "Login correcto",
      usuario: usuarioBD,
      token: token,
      id: usuarioBD._id,
    });
  });
});

module.exports = app;
