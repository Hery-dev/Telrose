var app=angular.module("monApp",[]);

app.controller("usercontroller",function($scope,$http, $timeout){


    const socket = io();
    $scope.username="";
    $scope.userid="";
    $scope.error_text=false;
    $scope.hotessNonVlide = false;
    $scope.messageshow = false;
    $scope.champNonvalid=false;
     
    $scope.chargement=true;
    $scope.chargementOk=false;
    $scope.messagetonga=false;
   

    $scope.login=function(){
        if($scope.f_login_user){
            $scope.champNonvalid=false;
            if ($scope.f_login_user.nom_user!=null && $scope.f_login_user.password!=null){
                //alert($scope.f_login_user.password);
                $http.post('/login', $scope.f_login_user)
                .then(function(data){
                    if(data=="err"){
                        alert("Error base");
                    }
                    else{
                        var res = JSON.stringify(data.data).length;
                        if(res>2){
                            $scope.username=data.data[0]["nom_user"];
                            $scope.username=data.data[0]["id_user"];
                            $scope.error_text=false;
                            /*alert(window.location.host);
                            */
                            socket.emit("new user", {
                                id_user:data.data[0]["id_user"],
                                nom_user:data.data[0]["nom_user"]
                            });
                            var respgUrl = "http://" + window.location.host + "/membres";
                            window.location = respgUrl;
                        }
                        else{
                            $scope.error_text=true;
                        }
                    }
                });
                $scope.f_login_user={};
            }
        }
        else{
            $scope.champNonvalid=true;
        }
        
        
    }

    $scope.getUserTo = function(){
        $http.get('/getUser')
		.then(function(data){
			if (data.data=="NON") {
				//alert(data);
			}
			else{
				//alert(data.data[0]["id_user"]);
                $scope.user = data.data;
                $scope.user_to_id=data.data[0]["id_user"];
                $scope.user_to_nom=data.data[0]["nom_user"];
                $scope.user_to_photo=data.data[0]["photo"];
			}
		})
    }

    $scope.getUserTo();

    $scope.lister = function(){
        $http.get('/listeuser')
		.then(function(data){
			if (data!='err') {
				$scope.listuser=data.data;
			}
			else{
				alert("Erreur d'affichage!");
			}
		})
    }

    $scope.lister();

    $scope.listermes = function(){
        $http.get('/listeusermessage')
		.then(function(data){
			if (data!='err') {
				$scope.listusermes=data.data;
			}
			else{
				alert("Erreur d'affichage!");
			}
		})
    }

    $scope.listermes();

    $scope.listerec=(rec)=>{
        $http.get('/listerec/'+rec)
		.then(function(data){
			$scope.listuser=data.data;
		});
    }
    
    $scope.voir=(id)=>{
        $http.get('/profil/'+id)
		.then(function(data){
            var respgUrl = "http://" + window.location.host + "/detail";
            window.location = respgUrl;
		});
    }

    $scope.detailSession=function(){
        $http.get('/detailprofil')
		.then(function(data){
            if(data.data=="NON"){
                $scope.detailuser="";
            }
            else{
                $scope.detailuser=data.data;
                $scope.id_user_to=data.data[0]["id_user"];
                $scope.nom=data.data[0]["nom_user"];
                $scope.age=data.data[0]["age"];
                $scope.categorie=data.data[0]["categorie"];
                $scope.photo=data.data[0]["photo"];
                $scope.apropos=data.data[0]["apropos"];
            }
			
		});
    }
    $scope.detailSession();

    $scope.detailencore=function(){
        $http.get('/detailprofilencore')
		.then(function(data){
            if(data.data=="NON"){
                $scope.detailuserencore="";
            }
            else{
                $scope.detailuserencore=data.data;
            }
			
		});
    }
    $scope.detailencore();
    $scope.ajouter=function(){
		if ($scope.f_ajout_user.nom_user!=null && $scope.f_ajout_user.password!=null && $scope.f_ajout_user.pays!=null && $scope.f_ajout_user.ville!=null && $scope.f_ajout_user.sexe!=null && $scope.f_ajout_user.categorie!=null) {
			$http.post('/register',$scope.f_ajout_user)
			.then(function(data){
				if (data=="err") {
					alert("Impossible d'ajouter!");
				}
				else{
					alert("Ajout avec succés!");

				}
			})
			$scope.f_ajout_user={};
            $scope.lister();
		}
		
	}

    $scope.messageprive=(toid)=>{
        $http.get('/getUsermessage/'+toid)
        .then(function(data){
            if(data.data=="ok"){
                var respgUrl = "http://" + window.location.host + "/message";
                window.location = respgUrl;
            }
        });
    }
   
    $scope.messagetous=(status)=>{
        if(status=="charge"){
            $http.get('/derniermessage')
                .then(function(data){
                $scope.messageContent=true;
                $scope.message=data.data;
                $timeout(function(){
                    $scope.chargement=false;
                    $scope.chargementOk=true;
                },2680);
            });
        }
        else{
            $http.get('/derniermessage')
                .then(function(data){
                $scope.messageContent=true;
                $scope.message=data.data;
            });
        }
        
    }

    $scope.messagetous("charge");

    $scope.envoiemessage=function(){
        $http.post('/sendmes', {
            id_user:$scope.user_to_id,
            id_touser:$scope.id_user_to,
            nom_touser:$scope.user_to_nom,
            photo_touser:$scope.user_to_photo,
            mes:$scope.f_messageto.mes
        }).then(function(data){
            if(data.data=="non"){

            }
            else{
                /*const mesBox = document.getElementById("mesBox");
                const mesCont = `<div class="row" style="margin-left: 30%;margin-right: 5%;">
                                                    <div class="col-10">
                                                        <p ng-show="chargementOk" style="margin-bottom: 0px;margin-top: 10px;border-radius: 30px;padding: 10px 20px 10px 10px;background-color: #0991c4;max-width: 100%;">${$scope.f_messageto.mes}</p> </div>
                                                    <div class="col-2" style="padding: 0px;">
                                                        <img src="../${$scope.user_to_photo}" alt="" style="width: 60px;height: 60px;border-radius: 30px;">
                                                    </div>
                                                </div>
                                                `;
                mesBox.innerHTML=mesCont;*/
                $scope.messagetous("send");
                const mesBox = document.getElementById("mesBox");
                mesBox.scrollTop=mesBox.scrollHeight;
                socket.emit("message", {
                    id_user:$scope.user_to_id,
                    id_touser:$scope.id_user_to,
                    nom_touser:$scope.user_to_nom,
                    photo_touser:$scope.user_to_photo,
                    mes:$scope.f_messageto.mes
                });
                $scope.f_messageto.mes="";
            }
        });
        
        
    };

    socket.on("message", function (data) {
        if($scope.user_to_id==data["id_touser"]){
            $scope.messagetous("send");
            $scope.sary = data["photo_touser"];
            $scope.messagetonga=true;
            /*const mesBox = document.getElementById("mesBox");
            const mesCont = `<div class="row" style="margin-right: 30%;margin-left: 5%;">
                                            <div class="col-2">
                                                <img src="../${data["photo_touser"]}" alt="" style="width: 60px;height: 60px;border-radius: 30px;">
                                            </div>
                                            <div class="col-10" style="padding: 0px;">
                                                <p ng-show="chargementOk" style="margin-bottom: 0px;margin-top: 10px;border-radius: 30px;padding: 10px 20px 10px 10px;background-color: #f26d7d;max-width: 100%;margin-left: 10%;">${data["mes"]}</p>
                                            </div>
                                        </div>
                                        `;
            mesBox.lastElementChild.innerHTML=mesCont;*/
        //$compile(mesBox)($scope);
        }
        else{
            //alert("misy message");
        }

    });

    $scope.passverif=false;
    $scope.inscrire=function(){
        if($scope.f_inscrire_user.pass!=null && $scope.f_inscrire_user.nom_user!=null && $scope.f_inscrire_user.passverif!=null){
            if($scope.f_inscrire_user.pass!=$scope.f_inscrire_user.passverif){
                $scope.passverif=true;
            }
            else{
                $http.post('/saveclient', $scope.f_inscrire_user)
                .then(function(data){
                    if(data.data=="err"){
                        alert("Non inscrit");
                    }
                    else{
                        var respgUrl = "http://" + window.location.host + "/membres";
                        window.location = respgUrl;
                    }
                });
            }
        }
    }

    socket.on("new user", function (data) {
        if($scope.username==data["id_user"]){
            return
        }
        else{
            //alert("user nom : "+data["nom_user"]);
        }

    });
    $scope.actionner=(toid)=>{
        $scope.messageshow = true;
        $scope.toid=toid;
        //alert(toid);
    }
   
    $scope.send_message=function(){
        
        if($scope.f_message.msg!=""){
            
            socket.emit("new message", {
                id_user:$scope.user[0]["id_user"],
                nom_user:$scope.user[0]["nom_user"],
                toid:$scope.toid,
                msg:$scope.f_message.msg
            });
        }        
    }

    const messageBox = document.getElementById("messagebox");
    const addNewMessage = ({nom_user,msg})=>{
        const receivedMsg = `
        <div class="incoming__message">
            <div class="received__message">
                <p>De la part de : ${nom_user}</p>
                <p>Message : ${msg}</p>
            </div>
        </div>
        `;

        messageBox.innerHTML = receivedMsg;
    }
    
    socket.on("new message", function (data) {
        if($scope.user[0]["id_user"]==data["id_user"]){
            return
        }
        else{

            if($scope.user[0]["id_user"]==data["toid"]){
                addNewMessage({
                    nom_user:data["nom_user"],
                    msg:data["msg"]
                });
            }
        }
    });

    $scope.voirhotesse = function(){
        if($scope.user){
            var respgUrl = "http://" + window.location.host + "/membres";
            window.location = respgUrl;
        }
        else{
            $scope.hotessNonVlide = true;
        }
    }

    $scope.voirprofil=(nom)=>{
        //alert(nom);
    }

    $scope.register=function(){
       $http.post('/upload', "ok")
       .then(function(data){
           //alert(data);
       });
    }
});