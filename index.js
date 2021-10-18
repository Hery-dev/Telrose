const express=require('express');
const mysql=require('mysql');
const bodyParser=require('body-parser');
const urlencodedParser=bodyParser.urlencoded({extended:false});
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const bcrypt = require("bcrypt");
const cors = require('cors');
const session = require('express-session');
const cookisPasser = require('cookie-parser');
const multer = require("multer");
const app=express();

const http = require('http');

const server = http.createServer(app);

const { Server } = require("socket.io");
const { dirname } = require('path');

const io = new Server(server);

app.use(cookisPasser());

const expireDate = 10000*60;

app.use(session({
	secret:"my_secret",
	saveUninitialized: true,
	resave: true,
	cookie:{maxAge:expireDate}
}))

app.use(bodyParser.json());

app.use(express.json());

app.use(cors());

var sess;

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

const fileFilter=(req, file, cb)=>{
	if(file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png'){
		cb(null, true);
		return true;
	}
	else{
		return cb(null, false);
		
	}
}

const storage = multer.diskStorage({
	destination:function(req, file, cd){
		cd(null, './public/images');
	},
	filename: function(req, file, cb){
		if (file.mimetype !== 'image/png' && file.mimetype!=='image/jpg' && file.mimetype !=='image/jpeg') {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
        } 
		else {
            cb(null, req.body.titre+""+file.originalname);
        }
		
	}
});

const upload = multer({
	storage:storage,
	fileFilter:fileFilter
});

app.use('/',express.static(__dirname+'/'));

app.use(express.static('assets'));

app.post("/upload", upload.single("myImg"),(req,res,next)=>{
	if(req.file){
		const pathname = req.file.path;
		res.send(pathname);
		//res.sendfile(__dirname+'/backoffice/Accueil.html');
		//res.send("ok");
	}
});


//         ******************* ACCUEIL ************************

app.get('/membres', function(req, res){
	sess = req.session;
	if(sess.userid){
		res.sendfile(__dirname+'/backoffice/categorie.html');
		io.on('connection', (socket) =>{
			console.log('a user connected');
		
			socket.on('disconnect', () => {
				console.log('user disconnected');
			});
		
			socket.on("new user", function (data) {
				console.log(data);
				io.emit("new user", data);
			});
		
			socket.on("new message", function (data) {
				console.log(data);
				console.log(sess.userid);
				
				io.emit("new message", data);
			});
		});
		
	}
    else{
		res.sendfile(__dirname+'/');
	}
});

app.get('/getUser', function(req, res){
	sess=req.session;
	if(sess.userid){
		var fect="SELECT * FROM user WHERE id_user = '"+sess.userid+"';";
		connection.query(fect, (err,result)=>{
			res.send(result);
		});
	}
	else{
		res.send("NON");
	}
});

app.get('/sing', function(req, res){
    res.sendfile(__dirname+'/backoffice/Login.html');
});
//       ******************  USER ****************************

// Ajouter
app.post('/register', urlencodedParser, function(req, res){
    var sql = "INSERT INTO user(nom_user,password,pays,ville,adress,categorie,sexe,contact,apropos,photo) VALUES('"+req.body.nom_user +"','"+req.body.password +"','"+req.body.pays +"','"+req.body.ville+"','"+req.body.adress +"','"+req.body.categorie +"','"+req.body.sexe +"','"+req.body.contact +"','"+req.body.apropos +"','"+req.body.photo +"')";
    connection.query(sql,function(err,resultat){
		if (err) {
            console.log(err);
			res.send('err');
			
		}
		else{
            console.log("succées!");
			var fect="SELECT * FROM user WHERE nom_user = '"+req.body.nom_user+"';";
			connection.query(fect, (err,result)=>{
				console.log(result[0]["id_user"]);
				req.session.userid=result[0]["id_user"];
				res.send(result);
			});
		}
	});
});

// LOGIN 

app.post('/login', urlencodedParser, function(req, res){
    var sql = "SELECT * FROM user WHERE nom_user='"+req.body.nom_user +"'AND password='"+req.body.password +"';";
    connection.query(sql,function(err,resultat){
		if (err) {
            console.log(err);
			res.send('err');
		}
		else{
			if(JSON.stringify(resultat).length>2){
				req.session.userid=resultat[0]["id_user"];
				res.send(resultat);
			}
			else{
				res.send(resultat);
			}
			//
			
		}
	});
});

// LISTE USER
app.get('/listeuser',function(req,res){
	var sql="SELECT * FROM user";
	connection.query(sql,function(err,resultat){
		if (err) {
			res.send('err');
		}
		else{
			res.json(resultat);
		}
	});
});

// Recherche
app.get('/recherche/:para',function(req,res){
	var sql="SELECT * FROM user WHERE nom_user LIKE '%"+req.params.para+"%' OR pays LIKE '%"+req.params.para+"%' OR sexe LIKE '%"+req.params.para+"%' OR categorie LIKE '%"+req.params.para+"%'";
	connection.query(sql,function(err,resultat){
		if (err) {
			res.send('err');
		}
		else{
			res.json(resultat);
		}
	});
});

app.get('/profil/:para', function(req,res){
	res.sendfile(__dirname+"/backoffice/profil.html");
});

const port = process.env.PORT;

/*app.listen(port, ()=>{
    console.log("Conecter sur port ...", port);
});*/

server.listen(port, () => {
    console.log(`SG Transportation App [using Forward Proxy] is listening on port!`);
});
