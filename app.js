// Requires
var express = require("express");
var mongoose = require("mongoose");

// Inicializar variables
var app = express();

// Conexion a la BD
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (error, response) => {
    if (error) {
      throw error;
    }
    console.log(
      "MongoDB corriendo en el puerto 27017:  \x1b[32m%s\x1b[0m",
      "ONLINE"
    );
  }
);

// Rutas
app.get("/", (request, response, next) => {
  response.status(200).json({
    ok: "true",
    message: "peticion realizado correctamente XD",
  });
});

// Escuchar peticiones
app.listen(3000, () => {
  console.log(
    "Express server corriendo en el puerto 3000:  \x1b[32m%s\x1b[0m",
    "ONLINE"
  );
});
