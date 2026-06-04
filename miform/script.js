const form = document.getElementById("personaForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  mensaje.textContent = "";
  mensaje.className = "mensaje";

  const nombre = document.getElementById("nombre").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const altura = document.getElementById("altura").value;
  const peso = document.getElementById("peso").value;

  if (!nombre || !apellidos || !altura || !peso) {
    mostrarMensaje("Todos los campos son obligatorios", "error");
    return;
  }

  if (Number(altura) <= 0 || Number(altura) > 9.99) {
    mostrarMensaje("La altura debe estar entre 0.01 y 9.99", "error");
    return;
  }

  if (Number(peso) <= 0 || Number(peso) > 999.99) {
    mostrarMensaje("El peso debe estar entre 0.01 y 999.99", "error");
    return;
  }

  const datos = new FormData(form);

  try {
    const boton = form.querySelector("button");
    boton.disabled = true;
    boton.textContent = "Guardando...";

    const respuesta = await fetch("guardar_persona.php", {
      method: "POST",
      body: datos
    });

    const resultado = await respuesta.json();

    if (resultado.ok) {
      mostrarMensaje(resultado.mensaje, "ok");
      form.reset();
    } else {
      mostrarMensaje(resultado.mensaje, "error");
    }

    boton.disabled = false;
    boton.textContent = "Guardar persona";

  } catch (error) {
    mostrarMensaje("Error de conexión con el servidor", "error");

    const boton = form.querySelector("button");
    boton.disabled = false;
    boton.textContent = "Guardar persona";
  }
});

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}