// Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inicializar variables
var app = express();

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
appRoutes = require("./routes/app");
usuarioRoutes = require("./routes/usuario");
loginRoutes = require("./routes/login");

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

app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
  console.log(
    "Express server corriendo en el puerto 3000:  \x1b[32m%s\x1b[0m",
    "ONLINE"
  );
});
