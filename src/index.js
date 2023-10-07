const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');

let data = require('./bd.json');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));

app.get('/api/vendors', (req, res) => {
    const pageSize = 5;
    const pageNumber = req.query.page || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const vendors = data.slice(startIndex, endIndex);

    res.json({ vendors, total: data.length, totalPages: Math.ceil(data.length / pageSize) });
});

app.get('/api/:id', (req, res) => {
    const result = data.filter(obj => {
        return obj.id == req.params['id']
    });
    res.send(result);
});

//Create a new Vendor
app.post('/api/vendor', (req, res) => {
    let result = data.filter(obj => {
        return obj.razonSocial.toLowerCase().replace(" ", "_") == req.body.razonSocial.toLowerCase().replace(" ", "_");
    });

    if (result == 0) {
        data.push(
            {
                "id": Math.floor(100000 + Math.random() * 900000),
                "nombre": req.body.nombre,
                "razonSocial": req.body.razonSocial,
                "direccion": req.body.direccion,
            }
        );
        const dataString = JSON.stringify(data);
        fs.writeFile("./bd.json", dataString, (error) => {
            if (error) {
                console.error(error);
                throw error;
            }
            console.log("data.json written correctly");
        });
        res.send(data);
    } else {
        console.log("Duplicate Entry");
        res.send({ "error": "duplicate entry!!!" });
    }
});

app.delete('/api/vendor/:id', (req, res) => {
    const vendorId = req.params['id'];

    removeObjectWithId(data, vendorId);
    const dataString = JSON.stringify(data);
    fs.writeFile("./bd.json", dataString, (error) => {
        if (error) {
            console.error(error);
            throw error;
        }
        console.log("data.json written correctly");
    });
    res.send(data);
});

function removeObjectWithId(arr, id) {
    const objWithIdIndex = arr.findIndex((obj) => obj.id == id);

    if (objWithIdIndex > -1) {
        arr.splice(objWithIdIndex, 1);
    }

    return arr;
}
// starting the server
app.listen(3001, () => {
    console.log('listening on port 3001');
});