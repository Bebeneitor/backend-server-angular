// Requires
var express = require("express");

var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// ============================================
// GET Busqueda por coleccion
// ============================================
app.get("/coleccion/:tabla/:busqueda", (request, response) => {
  var busqueda = request.params.busqueda;
  var tabla = request.params.tabla;
  var regex = RegExp(busqueda, "i");

  var promesa;

  switch (tabla) {
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regex);
      break;
    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;
    default:
      return response.status(400).json({
        ok: false,
        message:
          "Los tipos  de busqueda solo son Usuarios, Medicos, Hospitales",
        error: { message: "Coleccion no valida" },
      });
  }
  promesa.then((data) => {
    response.status(200).json({
      ok: true,
      [tabla]: data,
    });
  });
});

// ============================================
// GET Busqueda general
// ============================================
app.get("/todo/:busqueda", (request, response, next) => {
  var busqueda = request.params.busqueda;
  var regex = RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex),
  ]).then((respuestas) => {
    response.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2],
    });
  });
});

function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre  img")
      .exec((error, hospitales) => {
        if (error) {
          reject("Error al buscar hospitales", error);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate("usuario", "nombre email img")
      .populate("hospital")
      .exec((error, medicos) => {
        if (error) {
          reject("Error al buscar medicos", error);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre email role google img")
      .or([{ nombre: regex }, { email: regex }])
      .exec((error, usuarios) => {
        if (error) {
          reject("Error al buscar usuarios", error);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
