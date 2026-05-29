// importar libreria del servidor
import express from 'express'
import path from 'node:path'
import mysql from 'mysql2'
// renombrar express
const app = express()
// declarar el puerto saliente
const port = 3000;

app.use(express.urlencoded({ extended: true }))

const connection = mysql.createConnection({
    host: 'dbserver',
    user: 'root',
    password: '',
    database: 'minode',
    port: 3306
})
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd() + 'index.html'));
});
connection.connect((error) => {
    if (error){
        console.log("Error")
    } else{
        console.log("Correcto")
    }
})
app.post("/validar", function(req,res){
    const datos = req.body
    const name = datos.name
    const l_name = datos.l_name
    const tall = datos.tall
    const weight = datos.weight
    const insert = 'INSERT INTO User (name, l_name, tall, weight) VALUES("'+name+'", "'+l_name+'", "'+tall+'", "'+weight+'")'
    connection.query(insert, function(error){
        if (error){
            throw error
        } else {
            console.log('Los datos introducido perfectamente')
            return res.redirect('/');
        }
    })
});
// abrimos app
app.listen(port, '0.0.0.0',() => console.log('http://localhost:{port}'))
