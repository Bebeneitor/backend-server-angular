// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var JWT = require("jsonwebtoken");
var mdAutenticacion = require("../middleware/autenticacion");
var app = express();

var Hospital = require("../models/hospital");

// ============================================
// GET Obtener todos los hospitales
// ============================================
app.get("/", (request, response) => {
  var desde = request.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((error, hospitales) => {
      if (error) {
        return response.status(500).json({
          ok: "false",
          message: "Error cargando hospitales",
          errors: error,
        });
      }

      response.status(200).json({
        ok: "true",
        message: "hospitales",
        hospitales: hospitales,
      });
    });
});

// ============================================
// POST Crear un hospital
// ============================================
app.post("/", mdAutenticacion.verificaToken, (request, response) => {
  var body = request.body;
  var hospital = new Hospital({
    nombre: body.nombre,
    img: body.img,
    usuario: request.usuario,
  });

  hospital.save((error, hospitalGuardado) => {
    if (error) {
      return response.status(400).json({
        ok: "false",
        message: "Error creando hospotal",
        errors: error,
      });
    }

    response.status(201).json({
      ok: "true",
      message: "Hospital creado",
      hospital: hospital,
      tokenUsuario: request.usuario,
    });
  });
});

// ============================================
// PUT Actualizar hospital
// ============================================
app.put("/:id", mdAutenticacion.verificaToken, (request, response) => {
  var body = request.body;
  var id = request.params.id;

  Hospital.findById(id, (error, hospital) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al buscar hospital",
        errors: error,
      });
    }

    if (!hospital) {
      return response.status(400).json({
        ok: "false",
        message: "El hospital con el id: " + id + " no existe",
        errors: { message: "No existe un hospital con ese Id." },
      });
    }

    hospital.nombre = body.nombre;
    hospital.img = body.img;
    hospital.usuario.request.usuario;

    hospital.save((error, hospitalGuardado) => {
      if (error) {
        return response.status(400).json({
          ok: "false",
          message: "Error al actualizar hospital",
          errors: error,
        });
      }
      hospitalGuardado.password = ":)";
      response.status(200).json({
        ok: "true",
        hospital: hospitalGuardado,
      });
    });
  });
});

// ============================================
// DELETE Eliminar hospital
// ============================================
app.delete("/:id", mdAutenticacion.verificaToken, (request, response) => {
  var id = request.params.id;

  Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {
    if (error) {
      return response.status(500).json({
        ok: "false",
        message: "Error al borrar hospital",
        errors: error,
      });
    }

    if (!hospitalBorrado) {
      return response.status(400).json({
        ok: "false",
        message: "No existe hospital con ese ID",
        errors: { message: "Id de hospital no existe" },
      });
    }

    response.status(200).json({
      ok: "true",
      hospital: hospitalBorrado,
    });
  });
});

module.exports = app;
