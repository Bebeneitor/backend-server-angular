// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var JWT = require("jsonwebtoken");
var SEED = require("../config/config").SEED;
var CLIENT_ID = require("../config/config").CLIENT_ID;
var app = express();

var Usuario = require("../models/usuario");

// Google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require("../middleware/autenticacion");

// =====================================
// Renovar token
// =====================================
app.get("/renovartoken", mdAutenticacion.verificaToken, (request, response) => {
  //Creado por google regresa token
  var token = JWT.sign({ usuario: request.usuario }, SEED, {
    expiresIn: 14400,
  });

  return response.status(200).json({
    ok: true,
    token: token,
  });
});

// =====================================
// Validacion Google
// =====================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post("/google", async (request, response) => {
  var token = request.body.token;
  var googleUser = await verify(token).catch((error) => {
    return response.status(403).json({
      ok: false,
      message: "Token no valido",
      error: error,
    });
  });

  Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
    if (error) {
      response.status(200).json({
        ok: false,
        message: "-Algo mamo",
        errors: {
          message: error,
        },
      });
    }

    if (usuarioDB) {
      //Existe el usuario
      if (usuarioDB.google === false) {
        //No creado por google
        response.status(200).json({
          ok: true,
          message:
            "Su registro no fue realizado por google, favor de usar su autenticacion normal",
        });
      } else {
        //Creado por google regresa token
        var token = JWT.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400,
        });

        usuarioDB.password = ":)";
        response.status(200).json({
          ok: "true",
          mensaje: "Login correcto",
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role),
        });
      }
    } else {
      // El usuario no existe, se crea
      var usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";

      usuario.save((error, usuarioBD) => {
        var token = JWT.sign({ usuario: usuarioBD }, SEED, {
          expiresIn: 14400,
        });

        if (error) {
          // Algo mamo al guardar el usuario
          response.status(400).json({
            ok: false,
            usuario: usuario,
            errors: {
              message: error,
            },
          });
        }

        response.status(200).json({
          ok: "true",
          mensaje: "Usuario generado correctamente",
          usuario: usuario,
          token: token,
          menu: obtenerMenu(usuario.role),
        });
      });
    }
  });
});

// =====================================
// Validacion Normal
// =====================================

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
      menu: obtenerMenu(usuarioBD.role),
    });
  });
});

// =====================================
// Menu
// =====================================
function obtenerMenu(ROLE) {
  var menu = [
    {
      titulo: "Principal",
      icono: "mdi mdi-gauge",
      submenu: [
        { titulo: "Dashboard", url: "/dashboard" },
        { titulo: "Progress", url: "/progress" },
        { titulo: "Graficas", url: "/graficas1" },
        { titulo: "Promesas", url: "/promesas" },
        { titulo: "RxJs", url: "/rxjs" },
      ],
    },
    {
      titulo: "Mantenimientos",
      icono: "mdi mdi-folder-lock-open",
      submenu: [
        { titulo: "Hospitales", url: "/hospitales" },
        { titulo: "Medicos", url: "/medicos" },
      ],
    },
  ];

  if (ROLE === "ADMIN_ROLE") {
    menu[1].submenu.unshift({ titulo: "Usuarios", url: "/usuarios" });
  }

  return menu;
}

module.exports = app;
