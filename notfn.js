const nm = require('nodemailer')
const express = require('express')
const path = require('path')
const fs = require('fs')
const md5 = require('md5');
var	MongoClient	=	require('mongodb').MongoClient;

srvr = express();

/////////////////////////////////THE WEB PART////////////////////////////////////////////////
srvr.get('/', (req, resp) =>{
		if(req.query.akey == undefined){
			resp.sendFile(path.join(__dirname, '/notfn.html'));

		}else{

			/////////////////////FETCH ADMIN KEY////////////////////////////////////////////
			var fetched_adminkey;
			////THE MD5 OF THE AKEY HAS TO BE STORED IN THE AKEY FILE/// "qwerty"
			fs.readFile(path.join(__dirname, '/akey'), function (err, data) {
 			if (err) throw err;
 			fetched_adminkey = data.toString();
 			check_key(fetched_adminkey);
			});

			/////////////////////CHECK ADMIN KEY//////////////////////////////////
			function check_key(key_val){
					if(key_val == md5(req.query.akey)){
						send__mails();
					}else{	
						resp.sendFile(path.join(__dirname, '/invalidkey.html'));
					}

			}
			/////////////////////////////////////////////////////////////////////////////////
			function send__mails(){	
			var mgdb_url = "mongodb://localhost:27017"; //CHANGE URL HERE
			var mgdb_collection_name = "emaillist";	//CHANGE COLLECTION NAME HERE
			var mgdb_databasename = "THIS";	//CHANGE DATABASE NAME HERE
			/////////////////////////////////INITIATE NODEMAILER//////////////////////////////
				let transporter = nm.createTransport({
	 											host: 'smtp.sendgrid.net',

   	 											port: 465,
	 											auth: {
												user: 'apikey',
												pass: '.1HmjCo68TeCSknOjAL3INQ.7h19CRQl8x8STzzU-A8ge2bNW92VTPPzLKHLnWWpf5o'/////NEEDS TO BE KEPT UPDATED
												}
								});

				mailOptions = {
					from: 'incand@incand.com', /////CHANGE THE EMAIL ADDRESS HERE
					to: '',
					subject: req.query.subject,
					text: req.query.message
				};
			////////////////////////////////////////////////////////////////////////////////////
						
				

			//////////////////////////////////SEND TO EACH PERSON IN DATABASE//////////////////
				MongoClient.connect(mgdb_url, {useUnifiedTopology: true}, function(err, client) {
 					const db = client.db(mgdb_databasename);
 					var	count	=	db.collection(mgdb_collection_name).find();
 					count.each(function(err, user)	{
 						if(user != null){
 							mailOptions.to = user.email;
 							console.log(user.email);
 							transporter.sendMail(mailOptions, function(err, data){if(err){console.log(err)}});
 						}


					}); 

 					 client.close();
					});



			////////////////////////////////////////////////////////////////////////////////////



			////////////////////////////////////END////////////////////////////////////////////



			//////////////////////////////////////////////////////////////////////////////////

		
			resp.writeHead(200, {"Content-Type" : "text/html"});
			resp.write("sending now");
			resp.end();
			}			

		}
});
//////////////////////////////////////////////////////////////////////////////////////////////
srvr.listen("3000");

