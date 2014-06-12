/**
 * 将TypeScript编译为JavaScript
 */
var path = require("path");
var fs = require("fs");
var async = require('../core/async');
var libs = require("../core/normal_libs");
var param = require("../core/params_analyze.js");
var compiler = require("./compile.js")
function run(dir, args, opts) {

	var egretOutput = "egret.js";
	

    var needCompileEngine = opts["-e"];
	var needCompileFile = opts["-f"];
	var projectDir = path.join(dir, opts["-project"] || ".");
	var mainApp = args[0] + ".ts";
	var projectOutput = opts["-out"] || "output.js";
	console.log(dir);
	console.log(args);
	console.log(opts);
	console.log("projectDir=" + projectDir, "\nmainApp=" + mainApp, "\nprojectOutput=" + projectOutput,"\n");
	
    var task = [];
    if (needCompileEngine) {
        task.push(
            function (callback) {
                var runtime = param.getOption(opts, "--runtime", ["html5", "native"]);
                compiler.generateEgretFileList(callback, runtime);

            },
            function (callback) {
                compiler.compile(callback,
                    path.join(param.getEgretPath(), "src"),
                    path.join(projectDir, "bin-debug"),
					egretOutput,
                    egret_file_list
                );
            },
            function (callback) {
                compiler.exportHeader(callback,
                    path.join(param.getEgretPath(), "src"),
                    path.join(projectDir, "src", "egret.d.ts"),
                    egret_file_list
                );
            }
        );
    }
    else {
        var exist = fs.existsSync(path.join(projectDir,"bin-debug", egretOutput));
        if (!exist){
            libs.exit(1102)
        }
    }

	if (needCompileFile)
	{
		task.push(
			function (callback) {
				compiler.compile(callback,
					path.join(projectDir, "src"),
					path.join(projectDir, "bin-debug"),
					projectOutput,
					[mainApp]
				);
			}
		);
	}
    

    async.series(task, function (err) {
        libs.log("构建成功");
    })
}


function help_title() {
    return "构建指定项目,编译指定项目的 TypeScript 文件\n";
}
function getFileList(file_list) {
    if (fs.existsSync(file_list)) {
        var js_content = fs.readFileSync(file_list, "utf-8");
        eval(js_content);
        var varname = path.basename(file_list).split(".js")[0];
        return eval(varname);
    }
    else {
        libs.exit(1301, file_list);
    }
}

function help_example() {
    var result =  "\n";
    result += "    egret build [project_name] [-e] [--runtime html5|native]\n";
    result += "描述:\n";
    result += "    " + help_title();
    result += "参数说明:\n";
    result += "    -e           编译指定项目的同时编译引擎目录\n";
    result += "    --runtime    设置构建方式为 html5 或者是 native方式，默认值为html5";
    return result;
}

exports.run = run;
exports.help_title = help_title;
exports.help_example = help_example;