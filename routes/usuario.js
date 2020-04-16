// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var JWT = require("jsonwebtoken");
var mdAutenticacion = require("../middleware/autenticacion");
var app = express();

var Usuario = require("../models/usuario");

// ============================================
// GET Obtener todos los usuarios
// ============================================
app.get("/", (request, response, next) => {
  var desde = request.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "nombre email img role google")
    .skip(desde)
    .limit(5)
    .exec((error, usuarios) => {
      if (error) {
        return response.status(500).json({
          ok: "false",
          message: "Error cargando usuario",
          errors: error,
        });
      }

      Usuario.count({}, (error, conteo) => {
        response.status(200).json({
          ok: "true",
          message: "Usuarios",
          usuarios: usuarios,
          totalUsuarios: conteo,
        });
      });
    });
});

// ============================================
// PUT Actualizar usuario
// ============================================
app.put("/:id", mdAutenticacion.verificaToken, (request, response) => {
  var body = request.body;
  var id = request.params.id;

  Usuario.findById(id, (error, usuario) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al buscar usuario",
        errors: error,
      });
    }

    if (!usuario) {
      return response.status(400).json({
        ok: "false",
        message: "El usuario con el id: " + id + " no existe",
        errors: { message: "No existe un usuario con ese Id." },
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((error, usuarioGuardado) => {
      if (error) {
        return response.status(400).json({
          ok: "false",
          message: "Error al actualizar usuario",
          errors: error,
        });
      }
      usuarioGuardado.password = ":)";
      response.status(200).json({
        ok: "true",
        usuario: usuarioGuardado,
      });
    });
  });
});
// ============================================
// POST Crear un usuarios
// ============================================
app.post("/", (request, response) => {
  var body = request.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img ? body.img : null,
    role: body.role,
  });

  usuario.save((error, usuarioGuardado) => {
    if (error) {
      return response.status(400).json({
        ok: "false",
        message: "Error creando usuario",
        errors: error,
      });
    }

    response.status(201).json({
      ok: "true",
      message: "Usuario creado",
      usuario: usuarioGuardado,
      tokenUsuario: request.usuario,
    });
  });
});
// ============================================
// DELETE Eliminar usuario
// ============================================
app.delete("/:id", mdAutenticacion.verificaToken, (request, response) => {
  var id = request.params.id;

  Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al borrar usuario",
        errors: error,
      });
    }

    if (!usuarioBorrado) {
      return response.status(400).json({
        ok: "false",
        message: "No existe usuario con ese ID",
        errors: { message: "Id de usuario no existe" },
      });
    }

    response.status(200).json({
      ok: "true",
      usuario: usuarioBorrado,
    });
  });
});

module.exports = app;
