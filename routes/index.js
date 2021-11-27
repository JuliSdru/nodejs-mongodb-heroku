const express = require('express');
const db= require('../models/db');
router = express.Router();


//TRAE TODOS
router.get('/', (req, res) => {
    
        dbTickets = db.getInstance();
        dbTickets.collection("ticketera")
            .find()
            .toArray(function (err, items) {
                res.send(items);
            });
})

//TRAE UN CLIENTE
router.get('/cliente', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .find({ "cliente.id": 90 })
        .toArray(function (err, items) {
            res.send(items);
        });
})

//TRAE MOTIVO DESPERFECTO
router.get('/motivo', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $match: { motivo: "desperfecto" } },
            { $project: { _id: 0, descripcion: 1 } },
            { $group: { _id: "$descripcion", cantidad: { $sum: 1 } } }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

//TRAE DESPERFECTO POR LUGAR
router.get('/desperfectosUbicacion', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $match: { motivo: "desperfecto" } },
            {
                $group: {
                    _id: "$descripcion",
                    ubicaciones: { $push: "$cliente.direccion.localidad.descripcion" }
                }
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

//QUIEN ATIENDE LOS TICKET
router.get('/atencion-empleado', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $unwind: "$estado" },
            { $project: { "estado.empleado": 1 } },
            {
                $group: {
                    _id: "$estado.empleado.id",
                    empleadoNombre: { "$first": "$estado.empleado.nombre" },
                    atenciones: { $sum: 1 }
                }
            },
            { $sort: { atenciones: -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})


//CONSULTA DE CLIENTES
router.get('/clientes-consultas', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $project: { cliente: 1 } },
            {
                $group: {
                    _id: "$cliente.id",
                    cantidad: { $sum: 1 },
                    cliente: {
                        $first: {
                            id: "$cliente.id",
                            nombre: "$cliente.nombre",
                            apellido: "$cliente.apellido"
                        }
                    }
                },
            },
            { $sort: { cantidad: -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})


//EMPLEADOS CON RECLAMO FINALIZADO
router.get('/empleado-cliente', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $unwind: "$cliente" },
            {
                $match: {
                    "cliente.esEmpleado": { $nin: [false] }
                }
            },
            {
                $group: {
                    _id: "$cliente.id",
                    cliente: {
                        $first: {
                            numeroCliente: "$cliente.id",
                            nombre: "$cliente.nombre"
                        }
                    }
                },
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})



//EMPLEADOS CON RECLAMO FINALIZADO
router.get('/clientes-tickets', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $unwind: "$estadoFinal" },
            {
                $match: {
                    "estadoFinal.resuelto": { $nin: [false] }
                }
            },
            {
                $group: {
                    _id: "$cliente.id",
                    cliente: {
                        $first: {
                            numeroCliente: "$cliente.id",
                            nombre: "$cliente.nombre"
                        }
                    }
                },
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})




//EMPLEADOS CON RECLAMO DERIVADO
router.get('/clientes-derivados', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $unwind: "$estadoFinal" },
            {
                $match: {
                    "estadoFinal.derivadoNuevamente": { $nin: [false] }
                }
            },
            {
                $group: {
                    _id: "$cliente.id",
                    cliente: {
                        $first: {
                            numeroCliente: "$cliente.id",
                            nombre: "$cliente.nombre"
                        }
                    }
                },
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/atencion-horario', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            { $unwind: "$estado" },
            { $unwind: "$estado.fecha" },
            { $project: { hour: { $hour: "$estado.fecha" } } },
            { $group: { _id: "$hour", atenciones: { $sum: 1 } } },
            { $sort: { atenciones: -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/cuantosExiste', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .find(
            {
                "cliente.direccion.ubicacion":{ 
                    $near:{ 
                        $geometry:{
                            "type": "Point",
                            "coordinates": [                      
                                -58.3956,
                                -34.753
                            ]
                        },
                        $maxDistance: 100000
                    }
                }
            }
        )
        .toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})






//Cambiar coordenadas
//obtener por ubicacion de zona sur
router.get('/geoZonaSur', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .find({
            "estado.empleado.sucursal.ubicacion":{
                    $geoWithin:{
                        $geometry:{
                            "type": "Polygon",
                            "coordinates": 
                            [
                                [
                                    [-58.395423889160156,-34.71650011651563],
                                    [-58.333625793457024,-34.71650011651563],
                                    [-58.333625793457024,-34.65326216318602],
                                    [-58.395423889160156,-34.65326216318602],
                                    [-58.395423889160156,-34.71650011651563]
                                ]
                            ]
                        }
                    }
                }
            }
        )
        .toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})



module.exports = router;