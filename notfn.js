const nm = require('nodemailer')
const express = require('express')
const path = require('path')
const fs = require('fs')
const md5 = require('md5');
const MongoClient = require('mongodb').MongoClient; 

srvr = express();

/////////////////////////////////THE WEB PART////////////////////////////////////////////////
srvr.get('/', (req, resp) =>{
		if(req.query.akey == undefined){
			resp.sendFile(path.join(__dirname, '/notfn.html'));

		}else{

			/////////////////////FETCH ADMIN KEY////////////////////////////////////////////
			var fetched_adminkey;
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
		
			////////////////////////////////MANGODB DETAILS AND SENDGRID DETAILS///////////////////////////
			let notfndata = fs.readFileSync('notfndata.json');
			notfndata = JSON.parse(notfndata);
			var mgdb_url = notfndata.mgdburl;
			var mgdb_collection_name = notfndata.mgdbcollection;


			///////////////////////////////////////////////////////////////////////////////////



			/////////////////////////////////INITIATE NODEMAILER//////////////////////////////
				let transporter = nm.createTransport({
	 											host: 'smtp.sendgrid.net',
   	 											port: 465,
   	 											pool: true,
	 											auth: {
												user: notfndata.sendgriduser,
												pass: notfndata.sendgridpassword
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
				MongoClient.connect(mgdb_url,	function(err,	db)	{
				var send_each =	db.collection(mgdb_collection_name).find();
				send_each.each(function(err,	doc){
							mailOptions.to = doc.email;
							transporter.sendMail(mailOptions, function(err, data){if(err){}});	
				}); 
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

