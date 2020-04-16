// Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inicializar variables
var app = express();

//CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

  next();
});

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
imagenRoutes = require("./routes/imagenes");
appRoutes = require("./routes/app");
uploadRoutes = require("./routes/upload");
usuarioRoutes = require("./routes/usuario");
hospitalRoutes = require("./routes/hospital");
medicoRoutes = require("./routes/medico");
busquedaRoutes = require("./routes/busqueda");
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

//Serve index config
// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads"));

// Rutas
app.use("/img", imagenRoutes);
app.use("/upload", uploadRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
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
