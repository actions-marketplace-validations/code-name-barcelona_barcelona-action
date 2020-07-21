const dir = process.argv.slice(2)[0];

var path = require('path');
var fs = require('fs');
var es = require('event-stream');
var http = require('https');
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const run_id = process.env.GITHUB_RUN_ID

var file_list = [];

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
      
              const regex = /^([^ ]+) ##\[debug\]\[octostore\]{([^:]*):([^:]*)}/
              const matches = line.match(regex);
      
              if (matches != undefined) {
                var this_time = new Date(matches[1]);
                var field_name = matches[2];
                var field_value = matches[3];
      
                var log_entry = {log_time: this_time}
                log_entry[field_name] = field_value;
      
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

                var options = {
                    host: 'octostore.herokuapp.com',
                    path: `/octostore/${owner}-${repo}/${run_id}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                      }
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
                
                var req = http.request(options, callback);
                //This is the data we are posting, it needs to be a string or a buffer
                req.write(data);
                req.end();
            }),
        );
};
  
  


