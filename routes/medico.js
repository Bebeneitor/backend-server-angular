// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var JWT = require("jsonwebtoken");
var mdAutenticacion = require("../middleware/autenticacion");
var app = express();

var Medico = require("../models/medico");

// ============================================
// GET Obtener todos los medicos
// ============================================
app.get("/", (request, response) => {
  var desde = request.query.desde || 0,
    desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital", "nombre img")
    .exec((error, medicos) => {
      if (error) {
        return response.status(500).json({
          ok: "false",
          message: "Error cargando medico",
          errors: error,
        });
      }

      Medico.count({}, (error, count) => {
        response.status(200).json({
          ok: "true",
          message: "medicos",
          medicos: medicos,
          count: count,
        });
      });
    });
});

// ============================================
// POST Crear un medico
// ============================================
app.post("/", mdAutenticacion.verificaToken, (request, response) => {
  var body = request.body;
  var medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    usuario: request.usuario,
    hospital: body.hospital,
  });

  medico.save((error, medicoGuardado) => {
    if (error) {
      return response.status(400).json({
        ok: "false",
        message: "Error creando medico",
        errors: error,
      });
    }

    response.status(201).json({
      ok: "true",
      message: "medico creado",
      medico: medico,
      tokenUsuario: request.usuario,
    });
  });
});

// ============================================
// PUT Actualizar medico
// ============================================
app.put("/:id", mdAutenticacion.verificaToken, (request, response) => {
  var body = request.body;
  var id = request.params.id;

  Medico.findById(id, (error, medico) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al buscar medico",
        errors: error,
      });
    }

    if (!medico) {
      return response.status(400).json({
        ok: "false",
        message: "El medico con el id: " + id + " no existe",
        errors: { message: "No existe un medico con ese Id." },
      });
    }

    medico.nombre = body.nombre;
    medico.img = body.img;
    medico.hospital = body.hospital;

    medico.save((error, medicoGuardado) => {
      if (error) {
        return response.status(400).json({
          ok: "false",
          message: "Error al actualizar medico",
          errors: error,
        });
      }
      medicoGuardado.password = ":)";
      response.status(200).json({
        ok: "true",
        medico: medicoGuardado,
      });
    });
  });
});

// ============================================
// DELETE Eliminar medico
// ============================================
app.delete("/:id", mdAutenticacion.verificaToken, (request, response) => {
  var id = request.params.id;

  Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al borrar medico",
        errors: error,
      });
    }

    if (!medicoBorrado) {
      return response.status(400).json({
        ok: "false",
        message: "No existe medico con ese ID",
        errors: { message: "Id de medico no existe" },
      });
    }

    response.status(200).json({
      ok: "true",
      hospital: medicoBorrado,
    });
  });
});

module.exports = app;
