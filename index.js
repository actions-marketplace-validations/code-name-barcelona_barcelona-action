var path = require('path');
var fs = require('fs');
var es = require('event-stream');
var https = require('https');
var http = require('http');
const core = require('@actions/core');
const { exit } = require('process');
require('dotenv').config();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const run_id = process.env.GITHUB_RUN_ID

var file_list = [];
const octostoreEndpointRemote = core.getInput('OCTOSTORE_WRITER_ENDPOINT_REMOTE');
const octostoreEndpointLocal = core.getInput('OCTOSTORE_WRITER_ENDPOINT_LOCAL');
const octostoreEndpointPort = core.getInput('OCTOSTORE_LOCAL_PORT');
const urlpath = core.getInput('OCTOSTORE_WRITER_PATH');
const azure_function_code  = core.getInput('OCTOSTORE_AUTHENTICATION_CREDENTIAL');
const dir  = core.getInput('LOG_PATH');
const run_locally = core.getInput('OCTOSTORE_LOCAL');

function fromDir(startPath,filter){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return file_list;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            file_list.push(filename)
        };
    };
};

if (azure_function_code == "")
{
  console.log("Please set a secret variable named 'OCTOSTORE_AUTHENTICATION_CREDENTIAL' with the Azure Function Code necessary to run.");
  exit();
} 

fromDir(dir,'.log');
console.log(file_list);
var file_count = file_list.length;

var totalLines = 0;

var all_objects = [];

for (var i = 0; i < file_count; i++) {
    var objects = [];
    args = file_list[i];
    console.log(args);
    if (args == undefined){
        throw new Error("No file provided.");
      }
      
      var s = fs
        .createReadStream(args)
        .pipe(es.split())
        .pipe(
          es
            .mapSync(function (line) {
              //2020-07-13T21:30:53.0566008Z ##[debug][octostore]{my_metadata_key:my_metadata_value}
              totalLines++;
            //   console.log(line)
      
              const regex = /^([^ ]+) ##\[debug\]\[octostore\](.*?)$/
              const matches = line.match(regex);
      
              if (matches != undefined) {
                var this_time = new Date(matches[1]);
                var log_value = matches[2];
      
                var log_entry = {log_time: this_time}
                log_entry['log_body'] = log_value;
      
                objects.push(log_entry);
              }
            })
            .on('error', function (err) {
              console.log('Error while reading file.', err);
            })
            .on('end', function () {
                var setOfObjects = new Set(objects)
                var objectsFinal = Array.from(setOfObjects)
                var data = JSON.stringify(objectsFinal)
                console.log(data);

                octostore_endpoint_var = octostoreEndpointRemote;
                octostore_endpoint_port = 443;

                var h = https;

                if(run_locally==1)
                {
                  octostore_endpoint_var = octostoreEndpointLocal;
                  octostore_endpoint_port = octostoreEndpointPort;
                  h = http;
                }
                var fullpath = urlpath + azure_function_code;
                var options = {
                    host: octostore_endpoint_var,
                    port: octostore_endpoint_port,
                    path: fullpath,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                      },
                  };
                  
                callback = function(response) {
                var str = ''
                response.on('data', function (chunk) {
                    str += chunk;
                });
                
                response.on('end', function () {
                    console.log(str);
                });
                }
                
                var req = h.request(options, callback);
                //This is the data we are posting, it needs to be a string or a buffer
                req.write(data);
                req.end();
            }),
        );
};