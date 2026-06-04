// declare the principal variables 
const form = document.getElementById("personaForm");
const mensaje = document.getElementById("mensaje");
const personasBody = document.getElementById("personasBody");

// load the cargarPersonas functions
document.addEventListener("DOMContentLoaded", () => {
    cargarPersonas();
});

// send all the data of the form but not reload the data
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    mensaje.textContent = "";
    mensaje.style.color = "black";

    const formData = new FormData(form);

    try {
        const response = await fetch("/validar", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData)
        });

        const data = await response.json();

        if (!response.ok || data.ok === false) {
            mensaje.textContent = data.mensaje || "Error al registrar";
            mensaje.style.color = "red";
            return;
        }

        mensaje.textContent = data.mensaje || "Registrado correctamente";
        mensaje.style.color = "green";

        form.reset();
        await cargarPersonas();
    } catch (error) {
        console.error(error);
        mensaje.textContent = "Error conectando con el servidor";
        mensaje.style.color = "red";
    }
});

// Load the bbdd of person
async function cargarPersonas() {
    personasBody.innerHTML = `
        <tr>
            <td colspan="5">Cargando registros...</td>
        </tr>
    `;

    try {
        const response = await fetch("/personas");
        const data = await response.json();

        if (!response.ok || data.ok === false) {
            pintarMensaje(data.mensaje || "Error al cargar registros");
            return;
        }

        pintarTabla(data.personas);
    } catch (error) {
        console.error(error);
        pintarMensaje("No se pudo conectar con /personas");
    }
}

// print the table and result of the BBDD
function pintarTabla(personas) {
    personasBody.innerHTML = "";

    if (!personas || personas.length === 0) {
        pintarMensaje("No hay registros en la BBDD");
        return;
    }

    personas.forEach((persona) => {
        const fila = document.createElement("tr");

        fila.appendChild(crearCelda(persona.id));
        fila.appendChild(crearCelda(persona.nombre));
        fila.appendChild(crearCelda(persona.apellidos));
        fila.appendChild(crearCelda(persona.altura));
        fila.appendChild(crearCelda(persona.peso));

        personasBody.appendChild(fila);
    });
}

// print cells by record
function crearCelda(valor) {
    const celda = document.createElement("td");
    celda.textContent = valor ?? "";
    return celda;
}

// print the log mensaje
function pintarMensaje(texto) {
    personasBody.innerHTML = `
        <tr>
            <td colspan="5">${texto}</td>
        </tr>
    `;
}