// Require
var express = require("express");
var fileupload = require("express-fileupload");
var fs = require("fs");
var app = express();

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

// Default options
app.use(fileupload());

app.put("/:tipo/:id", (request, response) => {
  var tipo = request.params.tipo;
  var id = request.params.id;
  var tiposColeccion = ["medicos", "usuarios", "hospitales"];

  // Validar coleccion
  if (tiposColeccion.indexOf(tipo) < 0) {
    return response.status(400).json({
      ok: false,
      message: "Tipo de coleccion incorrecta",
      error: {
        message:
          "Coleccion incorrecta, las colecciones validas son: " +
          tiposColeccion.join(", "),
      },
    });
  }

  // Se valida que vengan archivos
  if (!request.files) {
    return response.status(400).json({
      ok: false,
      message: "No se selecciono imagen",
      error: { message: "falta seleccionar imagen" },
    });
  }

  // Obtener nombre dle archivo
  var archivo = request.files.imagen;
  var archivoSplit = archivo.name.split(".");
  var archivoExtension = archivoSplit[archivoSplit.length - 1];

  // Extensiones aceptadas
  var extensionesValidas = ["png", "gif", "jpg", "jpeg"];

  if (extensionesValidas.indexOf(archivoExtension) < 0) {
    return response.status(400).json({
      ok: false,
      message: "Extension no valida",
      error: {
        message: "Extensiones validas " + extensionesValidas.join(", "),
      },
    });
  }

  //Nombre archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${archivoExtension}`;

  // Mover archivo a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (error) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        message: "Error al mover archivo",
        errors: { error },
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, path, response);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, path, response) {
  switch (tipo) {
    case "usuarios":
      Usuario.findById(id, (error, usuario) => {
        if (!usuario) {
          fs.unlinkSync(path);
          return response.status(500).json({
            ok: false,
            message: "Usuario inexistente",
          });
        }
        var pathViejo = "./uploads/usuarios/" + usuario.img;

        // Si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        usuario.img = nombreArchivo;

        usuario.save((error, usuarioActualizado) => {
          if (error) {
            return response.status(400).json({
              ok: false,
              message: "Error al actualizar archivo -USUARIO",
            });
          }
          usuarioActualizado.password = ":)";
          return response.status(200).json({
            ok: true,
            message: "Imagen actualizado correctamente usuarios- USUARIO",
            usuario: usuarioActualizado,
          });
        });
      });
      break;

    case "medicos":
      Medico.findById(id, (error, medico) => {
        if (!medico) {
          fs.unlinkSync(path);
          return response.status(500).json({
            ok: false,
            message: "medico inexistente",
          });
        }
        var pathViejo = "./uploads/medicos/" + medico.img;
        // Si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        medico.img = nombreArchivo;

        medico.save((error, medicoActualizado) => {
          if (error) {
            return response.status(400).json({
              ok: false,
              message: "Error al actualizar archivo - MEDICOS",
              errors: { message: error },
            });
          }

          return response.status(200).json({
            ok: true,
            message: "Imagen actualizada correctamente -MEDICOS",
            medico: medicoActualizado,
          });
        });
      });

      break;
    case "hospitales":
      Hospital.findById(id, (error, hospital) => {
        if (!hospital) {
          fs.unlinkSync(path);
          return response.status(500).json({
            ok: false,
            message: "hospital inexistente",
          });
        }

        var pathViejo = "./uploads/hospitales/" + hospital.img;
        // Si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        hospital.img = nombreArchivo;

        hospital.save((error, hospitalActualizado) => {
          if (error) {
            return response.status(400).json({
              ok: false,
              message: "Error al actualizar archivo -HOSPITAL",
              errors: { message: error },
            });
          }

          return response.status(200).json({
            ok: true,
            message: "Imagen actualizada correctamente -HOSPITAL",
            hospital: hospitalActualizado,
          });
        });
      });

      break;

    default:
      break;
  }
}

module.exports = app;
