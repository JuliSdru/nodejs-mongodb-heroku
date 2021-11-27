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
router.get('/clienteUno', (req, res) => {
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
router.get('/atencionAempleados', (req, res) => {
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


//CLIENTES CON RECLAMOS
router.get('/reclamosClientes', (req, res) => {
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


//EMPLEADOS CLIENTES
router.get('/empleadoCliente', (req, res) => {
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
router.get('/reclamoFinalizado', (req, res) => {
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
router.get('/reclamoDerivado', (req, res) => {
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



//CANTIDAD DE CLIENTES POR ZONA
router.get('/mismaZona', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera")
        .aggregate([
            {
                $group: {
                    _id: "$cliente.direccion.localidad.descripcion",
                    cantidadDeClientes: { $sum: 1 },
                    cliente: {
                        $push: {
                            numeroCliente: "$cliente.id",
                            nombre: "$cliente.nombre"
                        }
                    }
                },
            },
            { $sort: { "cantidadDeClientes": -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})



//OBTENER UBICACION POR ZONA SUR
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
                                    [-58.48417282104492,-34.855368945050444],
                                    [ -58.32916259765626, -34.855368945050444],
                                    [-58.32916259765626,-34.7476778289446],
                                    [-58.48417282104492, -34.7476778289446],
                                    [-58.48417282104492,-34.855368945050444]
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



// //CALCULAR CUANTOS CLIENTES EXISTE A X DISTANCIA
router.get('/clientesTicketsDistancia', (req, res) => {
    dbTickets = db.getInstance();
    dbTickets.collection("ticketera").find().forEach((ticket) => 
    {
        dbTickets.collection("sucursal").aggregate([
            {
                $geoNear: {
                    near: ticket.location.ubicacion,
                    distanceField: "dist.calculated",
                    maxDistance: 10000000000
                }
            },
            {
                $group: {
                    _id:ticket.cliente.nombre,
                    cantidadClientes: { $sum: 1 }
                }
            }
    
    ]).toArray((err, result) => {
        if (err) return console.log(err)
        res.send(result)
    })

})
})


module.exports = router;