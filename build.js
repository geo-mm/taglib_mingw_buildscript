var program = require('commander');

require('shelljs/global');
require('pkginfo')(module, 'version');
 
program
  .version(module.exports.version)
  .option('-s, --source <s>', 'Source path')
  .option('-u, --url <s>', 'taglib URL')
  .option('-b, --build <s>', 'Build path')
  .option('-o, --output <s>', 'Output path')
  .option('-m, --mingw <s>', 'mingw path')
  .parse(process.argv);

/*  
console.log('you ordered a pizza with:');
if (program.peppers) console.log('  - peppers');
if (program.pineapple) console.log('  - pineapple');
if (program.bbqSauce) console.log('  - bbq');
console.log('  - %s cheese', program.cheese);
*/

if (exec('where cmake').code) {
    console.log('cmake is not installed! Please install cmake first.');
    exit(1);
}

var SRC = program.source;
var URL = program.url;
var BUILD = program.build;
var OUTPUT = program.output;
var MINGW = program.mingw;
var checker = [
    { param: SRC, msg: "source path" },
    { param: URL, msg: "taglib url" },
    { param: BUILD, msg: "build path" },
    { param: OUTPUT, msg: "output path" },
    { param: MINGW, msg: "mingw path" },
    ];

checker.forEach(function (elem) {
    if (!elem.param) {
        console.error('Error: ' + elem.msg + ' is not set. Exit');
        exit(1);
    }
});

checker = [
    { dir: SRC, msg: "source path" },
    { dir: BUILD, msg: "build path" },
    { dir: OUTPUT, msg: "output path" },
    ];

checker.forEach(function (elem) {
    [elem.dir + '/debug', elem.dir + '/release'].forEach(function (path) {
        mkdir('-p', path);
        if (!test('-d', path)) {
            console.error('Error: build directory ' + path + ' failed. Exit');
        }
    });
});

var CWD = pwd();

cd(BUILD);

/*
var Decompress = require('decompress');
var targz = require('decompress-targz');
 
var decompress = new Decompress()
	.src('foo.tar.gz')
	.dest('dest')
	.use(targz({strip: 1}));
 
decompress.run(function (err, files) {
	if (err) {
		throw err;
	}
 
	console.log('Files extracted successfully!'); 
});
*/

var wget = require('wget-improved');
var tarball = BUILD + '/taglib.tar.gz';

console.log('Downloading ' + URL + ' to ' + tarball);

wget
.download(URL, BUILD + '/taglib.tar.gz', {})
.on('error', function (err) {
    console.error('Error: taglib source download failed. Exit');
    exit(1);
})
.on('start', function(fileSize) {
    console.log('Download started: ' + fileSize);
})
.on('end', function(output) {
    console.log(output);
})
.on('progress', function(progress) {
    console.log('Progress: ' + progress);
})
;

if (!test('-f', tarball)) {
    console.error('Error: taglib source file does not exist. Exit');
    exit(1);
}

console.log(tarball + ' downloaded succeed.');





    

