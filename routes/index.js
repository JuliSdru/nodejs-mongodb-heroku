const express = require('express')


const db= require('../models/db');


router = express.Router();

router.get('/', (req, res) => {
    
        dbTickets = db.getInstance();
        dbTickets.collection("ticketera")
            .find()
            .toArray(function (err, items) {
                res.send(items);
            });
  
})


module.exports = router;