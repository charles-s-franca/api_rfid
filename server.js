var express = require('express');
var app = express();
var Guid = require("guid");
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database');
 
db.serialize(function() {
  db.run(`CREATE TABLE IF NOT EXISTS usuario (
      id TEXT,
      nome TEXT,
      rfid TEXT
  )`);
});

app.get('/', function (req, res) {
    var items = [];
    db.each("select * from usuario", (error, row) => {
        console.log(row);
        items.push(row);
    }, () => {
        console.log("completo");
        res.send(items);
    })
});

app.post('/usuario', function(req, res){
    db.get(`select * from usuario where rfid='${ req.body.rfid }'`, {  }, (error, row) => {
        if(error){
            res.send("erro");
            return;
        }

        if(row){
            res.send("cartão já usado");
            return;
        }

        db.run(`INSERT INTO usuario values ('${Guid.raw()}','${ req.body.nome }','${ req.body.rfid }')`, (error) => {
            if(error){
                console.error(error);
                res.send("erro");
                return;
            }
    
            res.send("ok");
        });
    });
})

app.get('/usuario/:cartao', function(req, res){
    db.get(`select * from usuario where rfid='${req.params.cartao}'`, {}, (error, row) => {
        if(error){
            console.log(error);
            res.send("erro");
            return;
        }

        if(!row){
            res.send("cartão não encontrado");
            return;
        }

        res.send(row);
    });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});