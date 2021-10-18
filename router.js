const express = require('express');
const router = express.Router();
const mysql=require('mysql');

const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bodyParser=require('body-parser');
const urlencodedParser=bodyParser.urlencoded({extended:false});

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const DB_HOST = process.env.DB_HOST 
const DB_USER = process.env.DB_USER 
const DB_PASSWORD = process.env.DB_PASSWORD 
const DB_DATABASE = process.env.DB_DATABASE 
const DB_PORT = process.env.DB_PORT

const connection=mysql.createConnection({
	time_zone:'+03:00',
	host:DB_HOST,
	user:DB_USER,
	password:DB_PASSWORD,
	database:DB_DATABASE,
	dateStrings:'date'
});
connection.connect((err)=>{
	if (err)throw err;
	console.log('connection avec succés');
});

router.get('/sing', (req, res)=>{
    res.sendfile(__dirname+'/backoffice/Login.html');
});

router.post('/register', urlencodedParser, (req, res)=>{
    var sql = "INSERT INTO user(nom_user,password,pays,ville,adress,categorie,sexe,contact,apropos,photo) VALUES('"+req.body.nom_user +"','"+req.body.password +"','"+req.body.pays +"','"+req.body.ville+"','"+req.body.adress +"','"+req.body.categorie +"','"+req.body.sexe +"','"+req.body.contact +"','"+req.body.apropos +"','"+req.body.photo +"')";
    connection.query(sql,function(err,resultat){
		if (err) {
            console.log(err);
			res.send('err');
		}
		else{
            console.log("User created!");
			res.send(resultat);
		}
	});
});

router.post('/login', urlencodedParser, (req,resultat)=>{
    var sql = "SELECT * FROM user WHERE nom_user='"+req.body.nom_user +"'AND password='"+req.body.password +"';";
    connection.query(sql,function(err,res){
		if (err) {
            console.log(err);
			resultat.send('err');
		}
		else{
            
            var val = JSON.stringify(res);
            if(val.length>2){
                resultat.send({
                    msg:'Loggin',
                    user:res[0]
                });
            }
            else{
                resultat.send("Login non trouver");
            }
            
		}
	});
});

router.get('/me', function(req,res){
 
});

router.get('/membres', (req, res)=>{
    if(req.session.id){
        res.sendfile(__dirname+'/backoffice/Accueil.html');
    }
    else{
        res.sendFile(__dirname+'/backoffice/Login.html');
    }
});

router.get('/listeuser',function(req,res){
    /*if(req.session.page){
        var sql="SELECT * FROM user";
	    connection.query(sql,function(err,resultat){
		if (err) {
			res.send('err');
		}
		else{
			res.send(resultat);
		}
	});
    }
    else{
        res.send("Veillez vous identifier!");
    }*/

    var sql="SELECT * FROM user";
	connection.query(sql,function(err,resultat){
	if (err) {
		res.send('err');
	}
	else{
		res.send(resultat);
	}
	});
	
});

module.exports = router;