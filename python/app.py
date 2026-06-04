# import all the library
from decimal import Decimal, InvalidOperation
from pathlib import Path
import os
import time
from flask import Flask, jsonify, render_template, request, send_from_directory
import mysql.connector
from mysql.connector import Error

# two static to references the folder
BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"

# declare the flask library like app
app = Flask(__name__)

# declare all the variables of the conexion bbdd
DB_HOST = os.getenv("DB_HOST", "mi-py-sql")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "pysql")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

# function to connect to the bbdd
def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
    )

# function to try 30 times to the bbdd
def init_db():
    intentos = 30

    for intento in range(1, intentos + 1):
        con = None
        cursor = None

        try:
            con = get_connection()
            cursor = con.cursor()

            # if not exits the table in the bbdd create
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS personas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    apellidos VARCHAR(100) NOT NULL,
                    altura DECIMAL(5,2) NOT NULL,
                    peso DECIMAL(5,2) NOT NULL
                )
                """
            )

            adaptar_tabla_personas(cursor)
            con.commit()

            print("BBDD lista")
            return

        except Error as error:
            print(f"Intento {intento}/{intentos}: MySQL no está listo: {error}")
            time.sleep(2)

        finally:
            if cursor:
                cursor.close()
            if con and con.is_connected():
                con.close()

    raise RuntimeError("No se ha podido conectar con MySQL")

# function to show all the table result of my bbdd
def adaptar_tabla_personas(cursor):
    cursor.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = 'personas'
        """,
        (DB_NAME,),
    )

    columnas = {fila[0] for fila in cursor.fetchall()}

    if "apellido" in columnas and "apellidos" not in columnas:
        cursor.execute(
            """
            ALTER TABLE personas
            CHANGE apellido apellidos VARCHAR(100) NOT NULL
            """
        )

# remplace the . to , in tall and weight
def validar_decimal(valor, nombre_campo):
    valor_limpio = valor.replace(",", ".").strip()

    try:
        numero = Decimal(valor_limpio)
    except InvalidOperation:
        return None, f"{nombre_campo} debe ser un número válido."

    if numero <= 0:
        return None, f"{nombre_campo} debe ser mayor que 0."

    return numero, None


# the main website to enter 
@app.route("/", methods=["GET"])
def inicio():
    return render_template("index.html")

# the script of the script.js
@app.route("/script.js", methods=["GET"])
def cargar_script():
    return send_from_directory(TEMPLATES_DIR, "script.js")

# the directory to input all the data to the bbdd
@app.route("/validar", methods=["POST"])
def validar():
    nombre = request.form.get("nombre", "").strip()
    apellidos = request.form.get("apellidos", "").strip()
    altura_raw = request.form.get("altura", "").strip()
    peso_raw = request.form.get("peso", "").strip()

    errores = []

    if not nombre:
        errores.append("El nombre es obligatorio.")

    if not apellidos:
        errores.append("Los apellidos son obligatorios.")

    if not altura_raw:
        errores.append("La altura es obligatoria.")

    if not peso_raw:
        errores.append("El peso es obligatorio.")

    altura = None
    peso = None

    if altura_raw:
        altura, error_altura = validar_decimal(altura_raw, "La altura")
        if error_altura:
            errores.append(error_altura)

    if peso_raw:
        peso, error_peso = validar_decimal(peso_raw, "El peso")
        if error_peso:
            errores.append(error_peso)

    if errores:
        return jsonify({
            "ok": False,
            "mensaje": " | ".join(errores)
        }), 400

    con = None
    cursor = None

    try:
        con = get_connection()
        cursor = con.cursor()

        cursor.execute(
            """
            INSERT INTO personas (nombre, apellidos, altura, peso)
            VALUES (%s, %s, %s, %s)
            """,
            (nombre, apellidos, altura, peso),
        )

        con.commit()

        return jsonify({
            "ok": True,
            "mensaje": "Registro correcto"
        })

    except Error as error:
        return jsonify({
            "ok": False,
            "mensaje": f"Error al guardar: {error}"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if con and con.is_connected():
            con.close()

# the directory to show me in the index.html all the result of my BBDD
@app.route("/personas", methods=["GET"])
def listar_personas():
    con = None
    cursor = None

    try:
        con = get_connection()
        cursor = con.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, nombre, apellidos, altura, peso
            FROM personas
            ORDER BY id ASC
            """
        )

        personas = cursor.fetchall()

        for persona in personas:
            persona["altura"] = str(persona["altura"])
            persona["peso"] = str(persona["peso"])

        return jsonify({
            "ok": True,
            "personas": personas
        })

    except Error as error:
        return jsonify({
            "ok": False,
            "mensaje": f"Error al listar personas: {error}"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if con and con.is_connected():
            con.close()

# run the app and the server
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)