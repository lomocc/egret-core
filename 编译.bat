var cmd = "" + sourceList.join(" ") + " -t ES5 --sourcemap --outDir " + "\"" + output + "\"";
            fs.writeFileSync("tsc_config_temp.txt", cmd, "utf-8");
            var ts = cp_exec("tsc @tsc_config_temp.txt");
            ts.stderr.on("data", function (data) {
                console.log(data);
            })