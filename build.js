var program = require('commander');

require('shelljs/global');
require('pkginfo')(module, 'version');

// ============== help functions ==============
 
var die = function (msg) {
    console.error('Error: ' + msg + ' Exit');
    exit(1);
}

var getAbsPath = function (path) {
    var ret = '';
    
    cd(path);
    ret = pwd();
    cd(CWD);
    
    return ret;
}

// ============== end of help functions ==============

program
    .version(module.exports.version)
    .option('-s, --source <s>', 'Source path')
    .option('-u, --url <s>', 'taglib URL')
    .option('-b, --build <s>', 'Build path')
    .option('-o, --output <s>', 'Output path')
    .option('-m, --mingw <s>', 'mingw path')
    .parse(process.argv);

!exec('cmake --version').code || die('cmake is not installed! Please install cmake first.');

var SRC = program.source;
var URL = program.url;
var BUILD = program.build;
var OUTPUT = program.output;
var MINGW = program.mingw;
var TARBALL = 'taglib.tar.gz';
var TAGLIB = 'taglib'
var checker = [
    { param: SRC, msg: "source path" },
    { param: URL, msg: "taglib url" },
    { param: BUILD, msg: "build path" },
    { param: OUTPUT, msg: "output path" },
    { param: MINGW, msg: "mingw path" },
    ];

var CWD = pwd();

var stage4_build_cmake = function(mode) {
    mode = mode.toLowerCase();

    var cmd = 'cmake -G "MinGW Makefiles"' +
    ' -DCMAKE_MAKE_PROGRAM=' + MINGW + '/mingw32-make.exe' +
    ' -DCMAKE_SOURCE_DIR=' + BUILD + '/' + TAGLIB +
    ' -DCMAKE_C_COMPILER=' + MINGW + '/i686-w64-mingw32-gcc.exe' +
    ' -DCMAKE_CXX_COMPILER=' + MINGW + '/i686-w64-mingw32-g++.exe' +
    ' -DCMAKE_INSTALL_PREFIX=' + OUTPUT + '/' + mode +
    ' -DCMAKE_BUILD_TYPE=' + mode.charAt(0).toUpperCase() + mode.substring(1) + ' ' + BUILD + '/' + TAGLIB;

    cd(BUILD + '/debug');
    
    !exec(cmd).code || die('cmake debug config error');
    !exec(MINGW + '/mingw32-make.exe').code || die('cmake debug build error');
    !exec(MINGW + '/mingw32-make.exe install').code || die('cmake debug install error');
};

var stage3_configure_taglib = function () {
    var Decompress = require('decompress');
    var targz = require('decompress-targz');
    var unzip = new Decompress()
        .src(TARBALL)
        .dest(TAGLIB)
        .use(targz({strip: 1}));
 
    unzip.run(function (err, files) {
        !err || die('taglib untar failed.');
        
        stage4_build_cmake('debug');
        stage4_build_cmake('release');
    });
};

var stage2_download_taglib = function() {
    var wget = require('wget-improved');
    var ProgressBar = require('progress');
    var bar = new ProgressBar('    Downloading ' + URL + ' [:bar] :percent :etas', 
                                {
                                    complete: "=", 
                                    incomplete: ' ',
                                    width: 40, 
                                    total: 100 
                                }
                            );

    cd(BUILD);
    
    var lastProgress = 0;

    wget
    .download(URL, TARBALL, {})
    .on('error', function (err) {
        die('taglib source download failed.');
    })
    .on('start', function(fileSize) {
    })
    .on('end', function(output) {
        console.log(output);
        stage3_configure_taglib();
    })
    .on('progress', function(progress) {
        progress = Math.floor(progress * 100);
        bar.tick(progress - lastProgress);
        lastProgress = progress;
    })
    ;
};

var stage1_make_dirs = function() {    
    checker.forEach(function (elem) {
        elem.param || die(elem.msg + ' is not set.');
    });

    checker = [
        { dir: SRC, msg: "source path" },
        { dir: BUILD, msg: "build path" },
        { dir: OUTPUT, msg: "output path" },
        ];

    checker.forEach(function (elem) {
        [elem.dir + '/debug', elem.dir + '/release'].forEach(function (path) {
            mkdir('-p', path);
            test('-d', path) || die('build directory ' + path + ' failed.');
        });
    });
};

rm('-rf', BUILD);
rm('-rf', OUTPUT);
rm('-rf', SRC);

stage1_make_dirs();

BUILD = getAbsPath(BUILD);
OUTPUT = getAbsPath(OUTPUT);
SRC = getAbsPath(SRC);

stage2_download_taglib();

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



/*
if (!test('-f', tarball)) {
    console.error('Error: taglib source file does not exist. Exit');
    exit(1);
}
*/

//console.log(tarball + ' downloaded succeed.');





    

