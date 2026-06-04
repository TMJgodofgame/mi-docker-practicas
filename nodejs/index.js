// import all the library
import express from "express";
import mysql from "mysql2/promise";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// two static to references the folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// declare the port app
const app = express();
const PORT = Number(process.env.PORT || 3000);

// reads HTTP and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// references de directory frontend
const staticFolders = [
    __dirname,
    path.join(__dirname, "templates"),
    path.join(__dirname, "..", "templates"),
    "/templates"
];
// while to the folder to search the /templates
for (const folder of staticFolders) {
    if (fs.existsSync(folder)) {
        app.use(express.static(folder));
    }
}

// declare the connexion of the bbdd
const pool = mysql.createPool({
    host: process.env.DB_HOST || "dbserver",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME || "minode",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// search the index.html
function buscarIndexHtml() {
    const rutas = [
        path.join(__dirname, "index.html"),
        path.join(__dirname, "templates", "index.html"),
        path.join(__dirname, "..", "templates", "index.html"),
        "/templates/index.html"
    ];

    for (const ruta of rutas) {
        if (fs.existsSync(ruta)) {
            return ruta;
        }
    }

    return null;
}

// is valid the first input?
function campo(body, ...nombres) {
    for (const nombre of nombres) {
        const valor = body[nombre];

        if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
            return String(valor).trim();
        }
    }

    return "";
}

// remplace the . of ,
function decimal(valor) {
    return String(valor).replace(",", ".").trim();
}

// the person have a good input?
function validarPersona(body) {
    const name = campo(body, "name", "nombre");
    const lName = campo(body, "l_name", "apellidos", "apellido");
    const tallTexto = decimal(campo(body, "tall", "altura"));
    const weightTexto = decimal(campo(body, "weight", "peso"));

    const tall = Number(tallTexto);
    const weight = Number(weightTexto);

    if (!name || !lName || !tallTexto || !weightTexto) {
        return {
            ok: false,
            mensaje: "Faltan datos del formulario"
        };
    }

    if (!Number.isFinite(tall) || tall <= 0) {
        return {
            ok: false,
            mensaje: "La altura no es válida"
        };
    }

    if (!Number.isFinite(weight) || weight <= 0) {
        return {
            ok: false,
            mensaje: "El peso no es válido"
        };
    }

    return {
        ok: true,
        persona: {
            name,
            lName,
            tall,
            weight
        }
    };
}
// preparate the input to the bbdd
function normalizarPersonaBD(persona, index) {
    return {
        id: persona.id ?? persona.ID ?? index + 1,
        nombre: persona.nombre ?? persona.name ?? "",
        apellidos: persona.apellidos ?? persona.l_name ?? "",
        altura: persona.altura ?? persona.tall ?? "",
        peso: persona.peso ?? persona.weight ?? ""
    };
}

// get the index.html to the principal website
app.get("/", (req, res) => {
    const indexPath = buscarIndexHtml();

    if (!indexPath) {
        return res.status(500).send("No se encontró index.html");
    }

    return res.sendFile(indexPath);
});

// declare a directory /validar to input all the data to the BBDD
app.post("/validar", async (req, res) => {
    const validacion = validarPersona(req.body);

    if (!validacion.ok) {
        return res.status(400).json({
            ok: false,
            mensaje: validacion.mensaje
        });
    }

    const { name, lName, tall, weight } = validacion.persona;

    try {
        await pool.execute(
            "INSERT INTO `User` (`name`, `l_name`, `tall`, `weight`) VALUES (?, ?, ?, ?)",
            [name, lName, tall, weight]
        );

        return res.status(201).json({
            ok: true,
            mensaje: "Persona registrada correctamente"
        });
    } catch (error) {
        console.error("Error INSERT:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al guardar en la BBDD"
        });
    }
});

// declare a directory /personas to show all the bbdd to the index.html
app.get("/personas", async (req, res) => {
    try {
        let filas;

        try {
            const [resultado] = await pool.execute(
                "SELECT `id`, `name`, `l_name`, `tall`, `weight` FROM `User` ORDER BY `id` DESC"
            );

            filas = resultado;
        } catch (error) {
            if (error.code !== "ER_BAD_FIELD_ERROR") {
                throw error;
            }

            const [resultadoSinId] = await pool.execute(
                "SELECT `name`, `l_name`, `tall`, `weight` FROM `User`"
            );

            filas = resultadoSinId;
        }

        return res.json({
            ok: true,
            personas: filas.map(normalizarPersonaBD)
        });
    } catch (error) {
        console.error("Error SELECT:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al cargar registros de la BBDD"
        });
    }
});

// open the port and print the website
app.listen(PORT, "0.0.0.0", async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        console.log("Correcto");
        console.log(`http://localhost:${PORT}`);
    } catch (error) {
        console.error("MySQL no conecta:", error);
    }
});