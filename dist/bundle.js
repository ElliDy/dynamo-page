webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var path = __webpack_require__(2);
	var fs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"fs\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var os = __webpack_require__(3);
	var loaderUtils = __webpack_require__(4);
	var objectAssign = __webpack_require__(31);
	var arrify = __webpack_require__(32);
	var makeResolver = __webpack_require__(33);
	var Console = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"console\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).Console;
	var semver = __webpack_require__(75);
	__webpack_require__(76);
	var console = new Console(process.stderr);
	var pushArray = function (arr, toPush) {
	    Array.prototype.splice.apply(arr, [0, 0].concat(toPush));
	};
	function hasOwnProperty(obj, property) {
	    return Object.prototype.hasOwnProperty.call(obj, property);
	}
	var instances = {};
	var webpackInstances = [];
	var scriptRegex = /\.tsx?$/i;
	// Take TypeScript errors, parse them and format to webpack errors
	// Optionally adds a file name
	function formatErrors(diagnostics, instance, merge) {
	    return diagnostics
	        .filter(function (diagnostic) { return instance.loaderOptions.ignoreDiagnostics.indexOf(diagnostic.code) == -1; })
	        .map(function (diagnostic) {
	        var errorCategory = instance.compiler.DiagnosticCategory[diagnostic.category].toLowerCase();
	        var errorCategoryAndCode = errorCategory + ' TS' + diagnostic.code + ': ';
	        var messageText = errorCategoryAndCode + instance.compiler.flattenDiagnosticMessageText(diagnostic.messageText, os.EOL);
	        if (diagnostic.file) {
	            var lineChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
	            return {
	                message: "" + '('.white + (lineChar.line + 1).toString().cyan + "," + (lineChar.character + 1).toString().cyan + "): " + messageText.red,
	                rawMessage: messageText,
	                location: { line: lineChar.line + 1, character: lineChar.character + 1 },
	                loaderSource: 'ts-loader'
	            };
	        }
	        else {
	            return {
	                message: "" + messageText.red,
	                rawMessage: messageText,
	                loaderSource: 'ts-loader'
	            };
	        }
	    })
	        .map(function (error) { return objectAssign(error, merge); });
	}
	// The tsconfig.json is found using the same method as `tsc`, starting in the current directory
	// and continuing up the parent directory chain.
	function findConfigFile(compiler, searchPath, configFileName) {
	    while (true) {
	        var fileName = path.join(searchPath, configFileName);
	        if (compiler.sys.fileExists(fileName)) {
	            return fileName;
	        }
	        var parentPath = path.dirname(searchPath);
	        if (parentPath === searchPath) {
	            break;
	        }
	        searchPath = parentPath;
	    }
	    return undefined;
	}
	// The loader is executed once for each file seen by webpack. However, we need to keep
	// a persistent instance of TypeScript that contains all of the files in the program
	// along with definition files and options. This function either creates an instance
	// or returns the existing one. Multiple instances are possible by using the
	// `instance` property.
	function ensureTypeScriptInstance(loaderOptions, loader) {
	    function log() {
	        var messages = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            messages[_i - 0] = arguments[_i];
	        }
	        if (!loaderOptions.silent) {
	            console.log.apply(console, messages);
	        }
	    }
	    if (hasOwnProperty(instances, loaderOptions.instance)) {
	        return { instance: instances[loaderOptions.instance] };
	    }
	    try {
	        var compiler = __webpack_require__(89)(loaderOptions.compiler);
	    }
	    catch (e) {
	        var message = loaderOptions.compiler == 'typescript'
	            ? 'Could not load TypeScript. Try installing with `npm install typescript`'
	            : "Could not load TypeScript compiler with NPM package name `" + loaderOptions.compiler + "`. Are you sure it is correctly installed?";
	        return { error: {
	                message: message.red,
	                rawMessage: message,
	                loaderSource: 'ts-loader'
	            } };
	    }
	    var motd = "ts-loader: Using " + loaderOptions.compiler + "@" + compiler.version, compilerCompatible = false;
	    if (loaderOptions.compiler == 'typescript') {
	        if (compiler.version && semver.gte(compiler.version, '1.6.2-0')) {
	            // don't log yet in this case, if a tsconfig.json exists we want to combine the message
	            compilerCompatible = true;
	        }
	        else {
	            log((motd + ". This version is incompatible with ts-loader. Please upgrade to the latest version of TypeScript.").red);
	        }
	    }
	    else {
	        log((motd + ". This version may or may not be compatible with ts-loader.").yellow);
	    }
	    var files = {};
	    var instance = instances[loaderOptions.instance] = {
	        compiler: compiler,
	        compilerOptions: null,
	        loaderOptions: loaderOptions,
	        files: files,
	        languageService: null,
	        version: 0
	    };
	    var compilerOptions = {
	        module: 1 /* CommonJS */
	    };
	    // Load any available tsconfig.json file
	    var filesToLoad = [];
	    var configFilePath = findConfigFile(compiler, path.dirname(loader.resourcePath), loaderOptions.configFileName);
	    var configFile;
	    if (configFilePath) {
	        if (compilerCompatible)
	            log((motd + " and " + configFilePath).green);
	        else
	            log(("ts-loader: Using config file at " + configFilePath).green);
	        // HACK: relies on the fact that passing an extra argument won't break
	        // the old API that has a single parameter
	        configFile = compiler.readConfigFile(configFilePath, compiler.sys.readFile);
	        if (configFile.error) {
	            var configFileError = formatErrors([configFile.error], instance, { file: configFilePath })[0];
	            return { error: configFileError };
	        }
	    }
	    else {
	        if (compilerCompatible)
	            log(motd.green);
	        configFile = {
	            config: {
	                compilerOptions: {},
	                files: []
	            }
	        };
	    }
	    configFile.config.compilerOptions = objectAssign({}, configFile.config.compilerOptions, loaderOptions.compilerOptions);
	    // do any necessary config massaging
	    if (loaderOptions.transpileOnly) {
	        configFile.config.compilerOptions.isolatedModules = true;
	    }
	    var configParseResult;
	    if (typeof compiler.parseJsonConfigFileContent === 'function') {
	        // parseConfigFile was renamed between 1.6.2 and 1.7
	        configParseResult = compiler.parseJsonConfigFileContent(configFile.config, compiler.sys, path.dirname(configFilePath));
	    }
	    else {
	        configParseResult = compiler.parseConfigFile(configFile.config, compiler.sys, path.dirname(configFilePath));
	    }
	    if (configParseResult.errors.length) {
	        pushArray(loader._module.errors, formatErrors(configParseResult.errors, instance, { file: configFilePath }));
	        return { error: {
	                file: configFilePath,
	                message: 'error while parsing tsconfig.json'.red,
	                rawMessage: 'error while parsing tsconfig.json',
	                loaderSource: 'ts-loader'
	            } };
	    }
	    instance.compilerOptions = objectAssign(compilerOptions, configParseResult.options);
	    filesToLoad = configParseResult.fileNames;
	    var libFileName = 'lib.d.ts';
	    // Special handling for ES6 targets
	    if (compilerOptions.target == 2 /* ES6 */) {
	        compilerOptions.module = 0 /* None */;
	        libFileName = 'lib.es6.d.ts';
	    }
	    libFileName = path.join(path.dirname(/*require.resolve*/(__webpack_require__(89).resolve(loaderOptions.compiler))), libFileName);
	    if (loaderOptions.transpileOnly) {
	        // quick return for transpiling
	        // we do need to check for any issues with TS options though
	        var program = compiler.createProgram([], compilerOptions), diagnostics = program.getOptionsDiagnostics();
	        pushArray(loader._module.errors, formatErrors(diagnostics, instance, { file: configFilePath || 'tsconfig.json' }));
	        return { instance: instances[loaderOptions.instance] = { compiler: compiler, compilerOptions: compilerOptions, loaderOptions: loaderOptions, files: files } };
	    }
	    if (!compilerOptions.noLib) {
	        filesToLoad.push(libFileName);
	    }
	    // Load initial files (core lib files, any files specified in tsconfig.json)
	    filesToLoad.forEach(function (filePath) {
	        filePath = path.normalize(filePath);
	        files[filePath] = {
	            text: fs.readFileSync(filePath, 'utf-8'),
	            version: 0
	        };
	    });
	    var newLine = compilerOptions.newLine === 0 /* CarriageReturnLineFeed */ ? '\r\n' :
	        compilerOptions.newLine === 1 /* LineFeed */ ? '\n' :
	            os.EOL;
	    // make a (sync) resolver that follows webpack's rules
	    var resolver = makeResolver(loader.options);
	    var moduleResolutionHost = {
	        fileExists: function (fileName) { return servicesHost.getScriptSnapshot(fileName) !== undefined; },
	        readFile: function (fileName) {
	            var snapshot = servicesHost.getScriptSnapshot(fileName);
	            return snapshot && snapshot.getText(0, snapshot.getLength());
	        }
	    };
	    // Create the TypeScript language service
	    var servicesHost = {
	        getProjectVersion: function () { return instance.version + ''; },
	        getScriptFileNames: function () { return Object.keys(files).filter(function (filePath) { return scriptRegex.test(filePath); }); },
	        getScriptVersion: function (fileName) {
	            fileName = path.normalize(fileName);
	            return files[fileName] && files[fileName].version.toString();
	        },
	        getScriptSnapshot: function (fileName) {
	            // This is called any time TypeScript needs a file's text
	            // We either load from memory or from disk
	            fileName = path.normalize(fileName);
	            var file = files[fileName];
	            if (!file) {
	                try {
	                    file = files[fileName] = {
	                        version: 0,
	                        text: fs.readFileSync(fileName, { encoding: 'utf8' })
	                    };
	                }
	                catch (e) {
	                    return;
	                }
	            }
	            return compiler.ScriptSnapshot.fromString(file.text);
	        },
	        getCurrentDirectory: function () { return process.cwd(); },
	        getCompilationSettings: function () { return compilerOptions; },
	        getDefaultLibFileName: function (options) { return libFileName; },
	        getNewLine: function () { return newLine; },
	        log: log,
	        resolveModuleNames: function (moduleNames, containingFile) {
	            var resolvedModules = [];
	            for (var _i = 0, moduleNames_1 = moduleNames; _i < moduleNames_1.length; _i++) {
	                var moduleName = moduleNames_1[_i];
	                var resolvedFileName = void 0;
	                var resolutionResult = void 0;
	                try {
	                    resolvedFileName = resolver.resolveSync(path.normalize(path.dirname(containingFile)), moduleName);
	                    if (!resolvedFileName.match(/\.tsx?$/))
	                        resolvedFileName = null;
	                    else
	                        resolutionResult = { resolvedFileName: resolvedFileName };
	                }
	                catch (e) {
	                    resolvedFileName = null;
	                }
	                var tsResolution = compiler.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
	                if (tsResolution.resolvedModule) {
	                    if (resolvedFileName) {
	                        if (resolvedFileName == tsResolution.resolvedModule.resolvedFileName) {
	                            resolutionResult.isExternalLibraryImport = tsResolution.resolvedModule.isExternalLibraryImport;
	                        }
	                    }
	                    else
	                        resolutionResult = tsResolution.resolvedModule;
	                }
	                resolvedModules.push(resolutionResult);
	            }
	            return resolvedModules;
	        }
	    };
	    var languageService = instance.languageService = compiler.createLanguageService(servicesHost, compiler.createDocumentRegistry());
	    var getCompilerOptionDiagnostics = true;
	    loader._compiler.plugin("after-compile", function (compilation, callback) {
	        var stats = compilation.stats;
	        // handle all other errors. The basic approach here to get accurate error
	        // reporting is to start with a "blank slate" each compilation and gather
	        // all errors from all files. Since webpack tracks errors in a module from
	        // compilation-to-compilation, and since not every module always runs through
	        // the loader, we need to detect and remove any pre-existing errors.
	        function removeTSLoaderErrors(errors) {
	            var index = -1, length = errors.length;
	            while (++index < length) {
	                if (errors[index].loaderSource == 'ts-loader') {
	                    errors.splice(index--, 1);
	                    length--;
	                }
	            }
	        }
	        removeTSLoaderErrors(compilation.errors);
	        // handle compiler option errors after the first compile
	        if (getCompilerOptionDiagnostics) {
	            getCompilerOptionDiagnostics = false;
	            pushArray(compilation.errors, formatErrors(languageService.getCompilerOptionsDiagnostics(), instance, { file: configFilePath || 'tsconfig.json' }));
	        }
	        // build map of all modules based on normalized filename
	        // this is used for quick-lookup when trying to find modules
	        // based on filepath
	        var modules = {};
	        compilation.modules.forEach(function (module) {
	            if (module.resource) {
	                var modulePath = path.normalize(module.resource);
	                if (hasOwnProperty(modules, modulePath)) {
	                    var existingModules = modules[modulePath];
	                    if (existingModules.indexOf(module) == -1) {
	                        existingModules.push(module);
	                    }
	                }
	                else {
	                    modules[modulePath] = [module];
	                }
	            }
	        });
	        // gather all errors from TypeScript and output them to webpack
	        Object.keys(instance.files)
	            .filter(function (filePath) { return !!filePath.match(/(\.d)?\.ts(x?)$/); })
	            .forEach(function (filePath) {
	            var errors = languageService.getSyntacticDiagnostics(filePath).concat(languageService.getSemanticDiagnostics(filePath));
	            // if we have access to a webpack module, use that
	            if (hasOwnProperty(modules, filePath)) {
	                var associatedModules = modules[filePath];
	                associatedModules.forEach(function (module) {
	                    // remove any existing errors
	                    removeTSLoaderErrors(module.errors);
	                    // append errors
	                    var formattedErrors = formatErrors(errors, instance, { module: module });
	                    pushArray(module.errors, formattedErrors);
	                    pushArray(compilation.errors, formattedErrors);
	                });
	            }
	            else {
	                pushArray(compilation.errors, formatErrors(errors, instance, { file: filePath }));
	            }
	        });
	        callback();
	    });
	    // manually update changed declaration files
	    loader._compiler.plugin("watch-run", function (watching, cb) {
	        var mtimes = watching.compiler.watchFileSystem.watcher.mtimes;
	        Object.keys(mtimes)
	            .filter(function (filePath) { return !!filePath.match(/\.d\.ts$/); })
	            .forEach(function (filePath) {
	            filePath = path.normalize(filePath);
	            var file = instance.files[filePath];
	            if (file) {
	                file.text = fs.readFileSync(filePath, { encoding: 'utf8' });
	                file.version++;
	                instance.version++;
	            }
	        });
	        cb();
	    });
	    return { instance: instance };
	}
	function loader(contents) {
	    this.cacheable && this.cacheable();
	    var callback = this.async();
	    var filePath = path.normalize(this.resourcePath);
	    var queryOptions = loaderUtils.parseQuery(this.query);
	    var configFileOptions = this.options.ts || {};
	    var options = objectAssign({}, {
	        silent: false,
	        instance: 'default',
	        compiler: 'typescript',
	        configFileName: 'tsconfig.json',
	        transpileOnly: false,
	        compilerOptions: {}
	    }, configFileOptions, queryOptions);
	    options.ignoreDiagnostics = arrify(options.ignoreDiagnostics).map(Number);
	    // differentiate the TypeScript instance based on the webpack instance
	    var webpackIndex = webpackInstances.indexOf(this._compiler);
	    if (webpackIndex == -1) {
	        webpackIndex = webpackInstances.push(this._compiler) - 1;
	    }
	    options.instance = webpackIndex + '_' + options.instance;
	    var _a = ensureTypeScriptInstance(options, this), instance = _a.instance, error = _a.error;
	    if (error) {
	        callback(error);
	        return;
	    }
	    // Update file contents
	    var file = instance.files[filePath];
	    if (!file) {
	        file = instance.files[filePath] = { version: 0 };
	    }
	    if (file.text !== contents) {
	        file.version++;
	        file.text = contents;
	        instance.version++;
	    }
	    var outputText, sourceMapText, diagnostics = [];
	    if (options.transpileOnly) {
	        var fileName = path.basename(filePath);
	        var transpileResult = instance.compiler.transpileModule(contents, {
	            compilerOptions: instance.compilerOptions,
	            reportDiagnostics: true,
	            fileName: fileName
	        });
	        (outputText = transpileResult.outputText, sourceMapText = transpileResult.sourceMapText, diagnostics = transpileResult.diagnostics, transpileResult);
	        pushArray(this._module.errors, formatErrors(diagnostics, instance, { module: this._module }));
	    }
	    else {
	        var langService = instance.languageService;
	        // Make this file dependent on *all* definition files in the program
	        this.clearDependencies();
	        this.addDependency(filePath);
	        var allDefinitionFiles = Object.keys(instance.files).filter(function (filePath) { return /\.d\.ts$/.test(filePath); });
	        allDefinitionFiles.forEach(this.addDependency.bind(this));
	        this._module.meta.tsLoaderDefinitionFileVersions = allDefinitionFiles.map(function (filePath) { return filePath + '@' + instance.files[filePath].version; });
	        // Emit Javascript
	        var output = langService.getEmitOutput(filePath);
	        var outputFile = output.outputFiles.filter(function (file) { return !!file.name.match(/\.js(x?)$/); }).pop();
	        if (outputFile) {
	            outputText = outputFile.text;
	        }
	        var sourceMapFile = output.outputFiles.filter(function (file) { return !!file.name.match(/\.js(x?)\.map$/); }).pop();
	        if (sourceMapFile) {
	            sourceMapText = sourceMapFile.text;
	        }
	    }
	    if (outputText == null)
	        throw new Error("Typescript emitted no output for " + filePath);
	    if (sourceMapText) {
	        var sourceMap = JSON.parse(sourceMapText);
	        sourceMap.sources = [loaderUtils.getRemainingRequest(this)];
	        sourceMap.file = filePath;
	        sourceMap.sourcesContent = [contents];
	        outputText = outputText.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
	    }
	    // Make sure webpack is aware that even though the emitted JavaScript may be the same as
	    // a previously cached version the TypeScript may be different and therefore should be
	    // treated as new
	    this._module.meta.tsLoaderFileVersion = file.version;
	    callback(null, outputText, sourceMap);
	}
	module.exports = loader;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.endianness = function () { return 'LE' };

	exports.hostname = function () {
	    if (typeof location !== 'undefined') {
	        return location.hostname
	    }
	    else return '';
	};

	exports.loadavg = function () { return [] };

	exports.uptime = function () { return 0 };

	exports.freemem = function () {
	    return Number.MAX_VALUE;
	};

	exports.totalmem = function () {
	    return Number.MAX_VALUE;
	};

	exports.cpus = function () { return [] };

	exports.type = function () { return 'Browser' };

	exports.release = function () {
	    if (typeof navigator !== 'undefined') {
	        return navigator.appVersion;
	    }
	    return '';
	};

	exports.networkInterfaces
	= exports.getNetworkInterfaces
	= function () { return {} };

	exports.arch = function () { return 'javascript' };

	exports.platform = function () { return 'browser' };

	exports.tmpdir = exports.tmpDir = function () {
	    return '/tmp';
	};

	exports.EOL = '\n';


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var JSON5 = __webpack_require__(5);
	var path = __webpack_require__(2);
	var assign = __webpack_require__(6);
	var emojiRegex = /[\uD800-\uDFFF]./;
	var emojiList = __webpack_require__(7).filter(function(emoji) {
		return emojiRegex.test(emoji)
	});

	var baseEncodeTables = {
		26: "abcdefghijklmnopqrstuvwxyz",
		32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
		36: "0123456789abcdefghijklmnopqrstuvwxyz",
		49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
		52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
		58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
		62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
		64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
	};
	var emojiCache = {};

	function encodeStringToEmoji(content, length) {
		if (emojiCache[content]) return emojiCache[content];
		length = length || 1;
		var emojis = [];
		do {
			var index = Math.floor(Math.random() * emojiList.length);
			emojis.push(emojiList[index]);
			emojiList.splice(index, 1);
		} while (--length > 0);
		var emojiEncoding = emojis.join('');
		emojiCache[content] = emojiEncoding;
		return emojiEncoding;
	}

	function encodeBufferToBase(buffer, base) {
		var encodeTable = baseEncodeTables[base];
		if (!encodeTable) throw new Error("Unknown encoding base" + base);

		var readLength = buffer.length;

		var Big = __webpack_require__(8);
		Big.RM = Big.DP = 0;
		var b = new Big(0);
		for (var i = readLength - 1; i >= 0; i--) {
			b = b.times(256).plus(buffer[i]);
		}

		var output = "";
		while (b.gt(0)) {
			output = encodeTable[b.mod(base)] + output;
			b = b.div(base);
		}

		Big.DP = 20;
		Big.RM = 1;

		return output;
	}

	exports.parseQuery = function parseQuery(query) {
		var specialValues = {
			'null': null,
			'true': true,
			'false': false
		};
		if(!query) return {};
		if(typeof query !== "string")
			throw new Error("parseQuery should get a string as first argument");
		if(query.substr(0, 1) !== "?")
			throw new Error("a valid query string passed to parseQuery should begin with '?'");
		query = query.substr(1);
		var queryLength = query.length;
		if(query.substr(0, 1) === "{" && query.substr(-1) === "}") {
			return JSON5.parse(query);
		}
		var queryArgs = query.split(/[,\&]/g);
		var result = {};
		queryArgs.forEach(function(arg) {
			var idx = arg.indexOf("=");
			if(idx >= 0) {
				var name = arg.substr(0, idx);
				var value = decodeURIComponent(arg.substr(idx+1));
				if (specialValues.hasOwnProperty(value)) {
					value = specialValues[value];
				}
				if(name.substr(-2) === "[]") {
					name = decodeURIComponent(name.substr(0, name.length-2));
					if(!Array.isArray(result[name]))
						result[name] = [];
					result[name].push(value);
				} else {
					name = decodeURIComponent(name);
					result[name] = value;
				}
			} else {
				if(arg.substr(0, 1) === "-") {
					result[decodeURIComponent(arg.substr(1))] = false;
				} else if(arg.substr(0, 1) === "+") {
					result[decodeURIComponent(arg.substr(1))] = true;
				} else {
					result[decodeURIComponent(arg)] = true;
				}
			}
		});
		return result;
	};

	exports.getLoaderConfig = function(loaderContext, defaultConfigKey) {
		if (!defaultConfigKey) {
			throw new Error("Default config key missing");
		}
		var query = exports.parseQuery(loaderContext.query);
		var configKey = query.config || defaultConfigKey;
		var config = loaderContext.options[configKey] || {};

		delete query.config;

		return assign({}, config, query);
	};

	exports.stringifyRequest = function(loaderContext, request) {
		var splitted = request.split("!");
		var context = loaderContext.context || (loaderContext.options && loaderContext.options.context);
		return JSON.stringify(splitted.map(function(part) {
			if(/^\/|^[A-Z]:/i.test(part) && context) {
				part = path.relative(context, part);
				if(/^[A-Z]:/i.test(part)) {
					return part;
				} else {
					return "./" + part.replace(/\\/g, "/");
				}
			}
			return part;
		}).join("!"));
	};

	function dotRequest(obj) {
		return obj.request;
	}

	exports.getRemainingRequest = function(loaderContext) {
		var request = loaderContext.loaders.slice(loaderContext.loaderIndex+1).map(dotRequest).concat([loaderContext.resource]);
		return request.join("!");
	};

	exports.getCurrentRequest = function(loaderContext) {
		var request = loaderContext.loaders.slice(loaderContext.loaderIndex).map(dotRequest).concat([loaderContext.resource]);
		return request.join("!");
	};

	exports.isUrlRequest = function(url, root) {
		// An URL is not an request if
		// 1. it's a Data Url
		// 2. it's an absolute url or and protocol-relative
		// 3. it's some kind of url for a template
		if(/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return false;
		// 4. It's also not an request if root isn't set and it's a root-relative url
		if((root === undefined || root === false) && /^\//.test(url)) return false;
		return true;
	};

	exports.urlToRequest = function(url, root) {
		var moduleRequestRegex = /^[^?]*~/;
		var request;

		if(/^[a-zA-Z]:\\|^\\\\/.test(url)) {
			// absolute windows path, keep it
			request = url;
		} else if(root !== undefined && root !== false && /^\//.test(url)) {
			// if root is set and the url is root-relative
			switch(typeof root) {
				// 1. root is a string: root is prefixed to the url
				case "string":
					// special case: `~` roots convert to module request
					if (moduleRequestRegex.test(root)) {
						request = root.replace(/([^~\/])$/, "$1/") + url.slice(1);
					} else {
						request = root + url;
					}
					break;
				// 2. root is `true`: absolute paths are allowed
				//    *nix only, windows-style absolute paths are always allowed as they doesn't start with a `/`
				case "boolean":
					request = url;
					break;
				default:
					throw new Error("Unexpected parameters to loader-utils 'urlToRequest': url = " + url + ", root = " + root + ".");
			}
		} else if(/^\.\.?\//.test(url)) {
			// A relative url stays
			request = url;
		} else {
			// every other url is threaded like a relative url
			request = "./" + url;
		}

		// A `~` makes the url an module
		if (moduleRequestRegex.test(request)) {
			request = request.replace(moduleRequestRegex, "");
		}

		return request;
	};

	exports.parseString = function parseString(str) {
		try {
			if(str[0] === '"') return JSON.parse(str);
			if(str[0] === "'" && str.substr(str.length - 1) === "'") {
				return parseString(str.replace(/\\.|"/g, function(x) {
					if(x === '"') return '\\"';
					return x;
				}).replace(/^'|'$/g, '"'));
			}
			return JSON.parse('"' + str + '"');
		} catch(e) {
			return str;
		}
	};

	exports.getHashDigest = function getHashDigest(buffer, hashType, digestType, maxLength) {
		hashType = hashType || "md5";
		maxLength = maxLength || 9999;
		var hash = __webpack_require__(9).createHash(hashType);
		hash.update(buffer);
		if (digestType === "base26" || digestType === "base32" || digestType === "base36" ||
		    digestType === "base49" || digestType === "base52" || digestType === "base58" ||
		    digestType === "base62" || digestType === "base64") {
			return encodeBufferToBase(hash.digest(), digestType.substr(4)).substr(0, maxLength);
		} else {
			return hash.digest(digestType || "hex").substr(0, maxLength);
		}
	};

	exports.interpolateName = function interpolateName(loaderContext, name, options) {
		var filename = name || "[hash].[ext]";
		var context = options.context;
		var content = options.content;
		var regExp = options.regExp;
		var ext = "bin";
		var basename = "file";
		var directory = "";
		var folder = "";
		if(loaderContext.resourcePath) {
			var resourcePath = loaderContext.resourcePath;
			var idx = resourcePath.lastIndexOf(".");
			var i = resourcePath.lastIndexOf("\\");
			var j = resourcePath.lastIndexOf("/");
			var p = i < 0 ? j : j < 0 ? i : i < j ? i : j;
			if(idx >= 0) {
				ext = resourcePath.substr(idx+1);
				resourcePath = resourcePath.substr(0, idx);
			}
			if(p >= 0) {
				basename = resourcePath.substr(p+1);
				resourcePath = resourcePath.substr(0, p+1);
			}
			if (typeof context !== 'undefined') {
				directory = path.relative(context, resourcePath + "_").replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
				directory = directory.substr(0, directory.length-1);
			}
			else {
				directory = resourcePath.replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
			}
			if (directory.length === 1) {
				directory = "";
			} else if (directory.length > 1) {
				folder = path.basename(directory);
			}
		}
		var url = filename;
		if(content) {
			// Match hash template
			url = url.replace(/\[(?:(\w+):)?hash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, function() {
				return exports.getHashDigest(content, arguments[1], arguments[2], parseInt(arguments[3], 10));
			}).replace(/\[emoji(?::(\d+))?\]/ig, function() {
				return encodeStringToEmoji(content, arguments[1]);
			});
		}
		url = url.replace(/\[ext\]/ig, function() {
			return ext;
		}).replace(/\[name\]/ig, function() {
			return basename;
		}).replace(/\[path\]/ig, function() {
			return directory;
		}).replace(/\[folder\]/ig, function() {
			return folder;
		});
		if(regExp && loaderContext.resourcePath) {
			var re = new RegExp(regExp);
			var match = loaderContext.resourcePath.match(re);
			if(match) {
				for (var i = 0; i < match.length; i++) {
					var re = new RegExp("\\[" + i + "\\]", "ig");
					url = url.replace(re, match[i]);
				}
			}
		}
		if(typeof loaderContext.options === "object" && typeof loaderContext.options.customInterpolateName === "function") {
			url = loaderContext.options.customInterpolateName.call(loaderContext, url, name, options);
		}
		return url;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// json5.js
	// Modern JSON. See README.md for details.
	//
	// This file is based directly off of Douglas Crockford's json_parse.js:
	// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

	var JSON5 = ( true ? exports : {});

	JSON5.parse = (function () {
	    "use strict";

	// This is a function that can parse a JSON5 text, producing a JavaScript
	// data structure. It is a simple, recursive descent parser. It does not use
	// eval or regular expressions, so it can be used as a model for implementing
	// a JSON5 parser in other languages.

	// We are defining the function inside of another function to avoid creating
	// global variables.

	    var at,           // The index of the current character
	        lineNumber,   // The current line number
	        columnNumber, // The current column number
	        ch,           // The current character
	        escapee = {
	            "'":  "'",
	            '"':  '"',
	            '\\': '\\',
	            '/':  '/',
	            '\n': '',       // Replace escaped newlines in strings w/ empty string
	            b:    '\b',
	            f:    '\f',
	            n:    '\n',
	            r:    '\r',
	            t:    '\t'
	        },
	        ws = [
	            ' ',
	            '\t',
	            '\r',
	            '\n',
	            '\v',
	            '\f',
	            '\xA0',
	            '\uFEFF'
	        ],
	        text,

	        renderChar = function (chr) {
	            return chr === '' ? 'EOF' : "'" + chr + "'";
	        },

	        error = function (m) {

	// Call error when something is wrong.

	            var error = new SyntaxError();
	            // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
	            error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
	            error.at = at;
	            // These two property names have been chosen to agree with the ones in Gecko, the only popular
	            // environment which seems to supply this info on JSON.parse
	            error.lineNumber = lineNumber;
	            error.columnNumber = columnNumber;
	            throw error;
	        },

	        next = function (c) {

	// If a c parameter is provided, verify that it matches the current character.

	            if (c && c !== ch) {
	                error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
	            }

	// Get the next character. When there are no more characters,
	// return the empty string.

	            ch = text.charAt(at);
	            at++;
	            columnNumber++;
	            if (ch === '\n' || ch === '\r' && peek() !== '\n') {
	                lineNumber++;
	                columnNumber = 0;
	            }
	            return ch;
	        },

	        peek = function () {

	// Get the next character without consuming it or
	// assigning it to the ch varaible.

	            return text.charAt(at);
	        },

	        identifier = function () {

	// Parse an identifier. Normally, reserved words are disallowed here, but we
	// only use this for unquoted object keys, where reserved words are allowed,
	// so we don't check for those here. References:
	// - http://es5.github.com/#x7.6
	// - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
	// - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
	// TODO Identifiers can have Unicode "letters" in them; add support for those.

	            var key = ch;

	            // Identifiers must start with a letter, _ or $.
	            if ((ch !== '_' && ch !== '$') &&
	                    (ch < 'a' || ch > 'z') &&
	                    (ch < 'A' || ch > 'Z')) {
	                error("Bad identifier as unquoted key");
	            }

	            // Subsequent characters can contain digits.
	            while (next() && (
	                    ch === '_' || ch === '$' ||
	                    (ch >= 'a' && ch <= 'z') ||
	                    (ch >= 'A' && ch <= 'Z') ||
	                    (ch >= '0' && ch <= '9'))) {
	                key += ch;
	            }

	            return key;
	        },

	        number = function () {

	// Parse a number value.

	            var number,
	                sign = '',
	                string = '',
	                base = 10;

	            if (ch === '-' || ch === '+') {
	                sign = ch;
	                next(ch);
	            }

	            // support for Infinity (could tweak to allow other words):
	            if (ch === 'I') {
	                number = word();
	                if (typeof number !== 'number' || isNaN(number)) {
	                    error('Unexpected word for number');
	                }
	                return (sign === '-') ? -number : number;
	            }

	            // support for NaN
	            if (ch === 'N' ) {
	              number = word();
	              if (!isNaN(number)) {
	                error('expected word to be NaN');
	              }
	              // ignore sign as -NaN also is NaN
	              return number;
	            }

	            if (ch === '0') {
	                string += ch;
	                next();
	                if (ch === 'x' || ch === 'X') {
	                    string += ch;
	                    next();
	                    base = 16;
	                } else if (ch >= '0' && ch <= '9') {
	                    error('Octal literal');
	                }
	            }

	            switch (base) {
	            case 10:
	                while (ch >= '0' && ch <= '9' ) {
	                    string += ch;
	                    next();
	                }
	                if (ch === '.') {
	                    string += '.';
	                    while (next() && ch >= '0' && ch <= '9') {
	                        string += ch;
	                    }
	                }
	                if (ch === 'e' || ch === 'E') {
	                    string += ch;
	                    next();
	                    if (ch === '-' || ch === '+') {
	                        string += ch;
	                        next();
	                    }
	                    while (ch >= '0' && ch <= '9') {
	                        string += ch;
	                        next();
	                    }
	                }
	                break;
	            case 16:
	                while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
	                    string += ch;
	                    next();
	                }
	                break;
	            }

	            if(sign === '-') {
	                number = -string;
	            } else {
	                number = +string;
	            }

	            if (!isFinite(number)) {
	                error("Bad number");
	            } else {
	                return number;
	            }
	        },

	        string = function () {

	// Parse a string value.

	            var hex,
	                i,
	                string = '',
	                delim,      // double quote or single quote
	                uffff;

	// When parsing for string values, we must look for ' or " and \ characters.

	            if (ch === '"' || ch === "'") {
	                delim = ch;
	                while (next()) {
	                    if (ch === delim) {
	                        next();
	                        return string;
	                    } else if (ch === '\\') {
	                        next();
	                        if (ch === 'u') {
	                            uffff = 0;
	                            for (i = 0; i < 4; i += 1) {
	                                hex = parseInt(next(), 16);
	                                if (!isFinite(hex)) {
	                                    break;
	                                }
	                                uffff = uffff * 16 + hex;
	                            }
	                            string += String.fromCharCode(uffff);
	                        } else if (ch === '\r') {
	                            if (peek() === '\n') {
	                                next();
	                            }
	                        } else if (typeof escapee[ch] === 'string') {
	                            string += escapee[ch];
	                        } else {
	                            break;
	                        }
	                    } else if (ch === '\n') {
	                        // unescaped newlines are invalid; see:
	                        // https://github.com/aseemk/json5/issues/24
	                        // TODO this feels special-cased; are there other
	                        // invalid unescaped chars?
	                        break;
	                    } else {
	                        string += ch;
	                    }
	                }
	            }
	            error("Bad string");
	        },

	        inlineComment = function () {

	// Skip an inline comment, assuming this is one. The current character should
	// be the second / character in the // pair that begins this inline comment.
	// To finish the inline comment, we look for a newline or the end of the text.

	            if (ch !== '/') {
	                error("Not an inline comment");
	            }

	            do {
	                next();
	                if (ch === '\n' || ch === '\r') {
	                    next();
	                    return;
	                }
	            } while (ch);
	        },

	        blockComment = function () {

	// Skip a block comment, assuming this is one. The current character should be
	// the * character in the /* pair that begins this block comment.
	// To finish the block comment, we look for an ending */ pair of characters,
	// but we also watch for the end of text before the comment is terminated.

	            if (ch !== '*') {
	                error("Not a block comment");
	            }

	            do {
	                next();
	                while (ch === '*') {
	                    next('*');
	                    if (ch === '/') {
	                        next('/');
	                        return;
	                    }
	                }
	            } while (ch);

	            error("Unterminated block comment");
	        },

	        comment = function () {

	// Skip a comment, whether inline or block-level, assuming this is one.
	// Comments always begin with a / character.

	            if (ch !== '/') {
	                error("Not a comment");
	            }

	            next('/');

	            if (ch === '/') {
	                inlineComment();
	            } else if (ch === '*') {
	                blockComment();
	            } else {
	                error("Unrecognized comment");
	            }
	        },

	        white = function () {

	// Skip whitespace and comments.
	// Note that we're detecting comments by only a single / character.
	// This works since regular expressions are not valid JSON(5), but this will
	// break if there are other valid values that begin with a / character!

	            while (ch) {
	                if (ch === '/') {
	                    comment();
	                } else if (ws.indexOf(ch) >= 0) {
	                    next();
	                } else {
	                    return;
	                }
	            }
	        },

	        word = function () {

	// true, false, or null.

	            switch (ch) {
	            case 't':
	                next('t');
	                next('r');
	                next('u');
	                next('e');
	                return true;
	            case 'f':
	                next('f');
	                next('a');
	                next('l');
	                next('s');
	                next('e');
	                return false;
	            case 'n':
	                next('n');
	                next('u');
	                next('l');
	                next('l');
	                return null;
	            case 'I':
	                next('I');
	                next('n');
	                next('f');
	                next('i');
	                next('n');
	                next('i');
	                next('t');
	                next('y');
	                return Infinity;
	            case 'N':
	              next( 'N' );
	              next( 'a' );
	              next( 'N' );
	              return NaN;
	            }
	            error("Unexpected " + renderChar(ch));
	        },

	        value,  // Place holder for the value function.

	        array = function () {

	// Parse an array value.

	            var array = [];

	            if (ch === '[') {
	                next('[');
	                white();
	                while (ch) {
	                    if (ch === ']') {
	                        next(']');
	                        return array;   // Potentially empty array
	                    }
	                    // ES5 allows omitting elements in arrays, e.g. [,] and
	                    // [,null]. We don't allow this in JSON5.
	                    if (ch === ',') {
	                        error("Missing array element");
	                    } else {
	                        array.push(value());
	                    }
	                    white();
	                    // If there's no comma after this value, this needs to
	                    // be the end of the array.
	                    if (ch !== ',') {
	                        next(']');
	                        return array;
	                    }
	                    next(',');
	                    white();
	                }
	            }
	            error("Bad array");
	        },

	        object = function () {

	// Parse an object value.

	            var key,
	                object = {};

	            if (ch === '{') {
	                next('{');
	                white();
	                while (ch) {
	                    if (ch === '}') {
	                        next('}');
	                        return object;   // Potentially empty object
	                    }

	                    // Keys can be unquoted. If they are, they need to be
	                    // valid JS identifiers.
	                    if (ch === '"' || ch === "'") {
	                        key = string();
	                    } else {
	                        key = identifier();
	                    }

	                    white();
	                    next(':');
	                    object[key] = value();
	                    white();
	                    // If there's no comma after this pair, this needs to be
	                    // the end of the object.
	                    if (ch !== ',') {
	                        next('}');
	                        return object;
	                    }
	                    next(',');
	                    white();
	                }
	            }
	            error("Bad object");
	        };

	    value = function () {

	// Parse a JSON value. It could be an object, an array, a string, a number,
	// or a word.

	        white();
	        switch (ch) {
	        case '{':
	            return object();
	        case '[':
	            return array();
	        case '"':
	        case "'":
	            return string();
	        case '-':
	        case '+':
	        case '.':
	            return number();
	        default:
	            return ch >= '0' && ch <= '9' ? number() : word();
	        }
	    };

	// Return the json_parse function. It will have access to all of the above
	// functions and variables.

	    return function (source, reviver) {
	        var result;

	        text = String(source);
	        at = 0;
	        lineNumber = 1;
	        columnNumber = 1;
	        ch = ' ';
	        result = value();
	        white();
	        if (ch) {
	            error("Syntax error");
	        }

	// If there is a reviver function, we recursively walk the new structure,
	// passing each name/value pair to the reviver function for possible
	// transformation, starting with a temporary root object that holds the result
	// in an empty key. If there is not a reviver function, we simply return the
	// result.

	        return typeof reviver === 'function' ? (function walk(holder, key) {
	            var k, v, value = holder[key];
	            if (value && typeof value === 'object') {
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = walk(value, k);
	                        if (v !== undefined) {
	                            value[k] = v;
	                        } else {
	                            delete value[k];
	                        }
	                    }
	                }
	            }
	            return reviver.call(holder, key, value);
	        }({'': result}, '')) : result;
	    };
	}());

	// JSON5 stringify will not quote keys where appropriate
	JSON5.stringify = function (obj, replacer, space) {
	    if (replacer && (typeof(replacer) !== "function" && !isArray(replacer))) {
	        throw new Error('Replacer must be a function or an array');
	    }
	    var getReplacedValueOrUndefined = function(holder, key, isTopLevel) {
	        var value = holder[key];

	        // Replace the value with its toJSON value first, if possible
	        if (value && value.toJSON && typeof value.toJSON === "function") {
	            value = value.toJSON();
	        }

	        // If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
	        // presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
	        if (typeof(replacer) === "function") {
	            return replacer.call(holder, key, value);
	        } else if(replacer) {
	            if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
	                return value;
	            } else {
	                return undefined;
	            }
	        } else {
	            return value;
	        }
	    };

	    function isWordChar(c) {
	        return (c >= 'a' && c <= 'z') ||
	            (c >= 'A' && c <= 'Z') ||
	            (c >= '0' && c <= '9') ||
	            c === '_' || c === '$';
	    }

	    function isWordStart(c) {
	        return (c >= 'a' && c <= 'z') ||
	            (c >= 'A' && c <= 'Z') ||
	            c === '_' || c === '$';
	    }

	    function isWord(key) {
	        if (typeof key !== 'string') {
	            return false;
	        }
	        if (!isWordStart(key[0])) {
	            return false;
	        }
	        var i = 1, length = key.length;
	        while (i < length) {
	            if (!isWordChar(key[i])) {
	                return false;
	            }
	            i++;
	        }
	        return true;
	    }

	    // export for use in tests
	    JSON5.isWord = isWord;

	    // polyfills
	    function isArray(obj) {
	        if (Array.isArray) {
	            return Array.isArray(obj);
	        } else {
	            return Object.prototype.toString.call(obj) === '[object Array]';
	        }
	    }

	    function isDate(obj) {
	        return Object.prototype.toString.call(obj) === '[object Date]';
	    }

	    var objStack = [];
	    function checkForCircular(obj) {
	        for (var i = 0; i < objStack.length; i++) {
	            if (objStack[i] === obj) {
	                throw new TypeError("Converting circular structure to JSON");
	            }
	        }
	    }

	    function makeIndent(str, num, noNewLine) {
	        if (!str) {
	            return "";
	        }
	        // indentation no more than 10 chars
	        if (str.length > 10) {
	            str = str.substring(0, 10);
	        }

	        var indent = noNewLine ? "" : "\n";
	        for (var i = 0; i < num; i++) {
	            indent += str;
	        }

	        return indent;
	    }

	    var indentStr;
	    if (space) {
	        if (typeof space === "string") {
	            indentStr = space;
	        } else if (typeof space === "number" && space >= 0) {
	            indentStr = makeIndent(" ", space, true);
	        } else {
	            // ignore space parameter
	        }
	    }

	    // Copied from Crokford's implementation of JSON
	    // See https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
	    // Begin
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        meta = { // table of character substitutions
	        '\b': '\\b',
	        '\t': '\\t',
	        '\n': '\\n',
	        '\f': '\\f',
	        '\r': '\\r',
	        '"' : '\\"',
	        '\\': '\\\\'
	    };
	    function escapeString(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.
	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string' ?
	                c :
	                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }
	    // End

	    function internalStringify(holder, key, isTopLevel) {
	        var buffer, res;

	        // Replace the value, if necessary
	        var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

	        if (obj_part && !isDate(obj_part)) {
	            // unbox objects
	            // don't unbox dates, since will turn it into number
	            obj_part = obj_part.valueOf();
	        }
	        switch(typeof obj_part) {
	            case "boolean":
	                return obj_part.toString();

	            case "number":
	                if (isNaN(obj_part) || !isFinite(obj_part)) {
	                    return "null";
	                }
	                return obj_part.toString();

	            case "string":
	                return escapeString(obj_part.toString());

	            case "object":
	                if (obj_part === null) {
	                    return "null";
	                } else if (isArray(obj_part)) {
	                    checkForCircular(obj_part);
	                    buffer = "[";
	                    objStack.push(obj_part);

	                    for (var i = 0; i < obj_part.length; i++) {
	                        res = internalStringify(obj_part, i, false);
	                        buffer += makeIndent(indentStr, objStack.length);
	                        if (res === null || typeof res === "undefined") {
	                            buffer += "null";
	                        } else {
	                            buffer += res;
	                        }
	                        if (i < obj_part.length-1) {
	                            buffer += ",";
	                        } else if (indentStr) {
	                            buffer += "\n";
	                        }
	                    }
	                    objStack.pop();
	                    buffer += makeIndent(indentStr, objStack.length, true) + "]";
	                } else {
	                    checkForCircular(obj_part);
	                    buffer = "{";
	                    var nonEmpty = false;
	                    objStack.push(obj_part);
	                    for (var prop in obj_part) {
	                        if (obj_part.hasOwnProperty(prop)) {
	                            var value = internalStringify(obj_part, prop, false);
	                            isTopLevel = false;
	                            if (typeof value !== "undefined" && value !== null) {
	                                buffer += makeIndent(indentStr, objStack.length);
	                                nonEmpty = true;
	                                key = isWord(prop) ? prop : escapeString(prop);
	                                buffer += key + ":" + (indentStr ? ' ' : '') + value + ",";
	                            }
	                        }
	                    }
	                    objStack.pop();
	                    if (nonEmpty) {
	                        buffer = buffer.substring(0, buffer.length-1) + makeIndent(indentStr, objStack.length) + "}";
	                    } else {
	                        buffer = '{}';
	                    }
	                }
	                return buffer;
	            default:
	                // functions and undefined should be ignored
	                return undefined;
	        }
	    }

	    // special case...when undefined is used inside of
	    // a compound object/array, return null.
	    // but when top-level, return undefined
	    var topLevelHolder = {"":obj};
	    if (obj === undefined) {
	        return getReplacedValueOrUndefined(topLevelHolder, '', true);
	    }
	    return internalStringify(topLevelHolder, '', true);
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = [
	  "🀄",
	  "🃏",
	  "🅰",
	  "🅱",
	  "🅾",
	  "🅿",
	  "🆎",
	  "🆑",
	  "🆒",
	  "🆓",
	  "🆔",
	  "🆕",
	  "🆖",
	  "🆗",
	  "🆘",
	  "🆙",
	  "🆚",
	  "🇦🇨",
	  "🇦🇩",
	  "🇦🇪",
	  "🇦🇫",
	  "🇦🇬",
	  "🇦🇮",
	  "🇦🇱",
	  "🇦🇲",
	  "🇦🇴",
	  "🇦🇶",
	  "🇦🇷",
	  "🇦🇸",
	  "🇦🇹",
	  "🇦🇺",
	  "🇦🇼",
	  "🇦🇽",
	  "🇦🇿",
	  "🇦",
	  "🇧🇦",
	  "🇧🇧",
	  "🇧🇩",
	  "🇧🇪",
	  "🇧🇫",
	  "🇧🇬",
	  "🇧🇭",
	  "🇧🇮",
	  "🇧🇯",
	  "🇧🇱",
	  "🇧🇲",
	  "🇧🇳",
	  "🇧🇴",
	  "🇧🇶",
	  "🇧🇷",
	  "🇧🇸",
	  "🇧🇹",
	  "🇧🇻",
	  "🇧🇼",
	  "🇧🇾",
	  "🇧🇿",
	  "🇧",
	  "🇨🇦",
	  "🇨🇨",
	  "🇨🇩",
	  "🇨🇫",
	  "🇨🇬",
	  "🇨🇭",
	  "🇨🇮",
	  "🇨🇰",
	  "🇨🇱",
	  "🇨🇲",
	  "🇨🇳",
	  "🇨🇴",
	  "🇨🇵",
	  "🇨🇷",
	  "🇨🇺",
	  "🇨🇻",
	  "🇨🇼",
	  "🇨🇽",
	  "🇨🇾",
	  "🇨🇿",
	  "🇨",
	  "🇩🇪",
	  "🇩🇬",
	  "🇩🇯",
	  "🇩🇰",
	  "🇩🇲",
	  "🇩🇴",
	  "🇩🇿",
	  "🇩",
	  "🇪🇦",
	  "🇪🇨",
	  "🇪🇪",
	  "🇪🇬",
	  "🇪🇭",
	  "🇪🇷",
	  "🇪🇸",
	  "🇪🇹",
	  "🇪🇺",
	  "🇪",
	  "🇫🇮",
	  "🇫🇯",
	  "🇫🇰",
	  "🇫🇲",
	  "🇫🇴",
	  "🇫🇷",
	  "🇫",
	  "🇬🇦",
	  "🇬🇧",
	  "🇬🇩",
	  "🇬🇪",
	  "🇬🇫",
	  "🇬🇬",
	  "🇬🇭",
	  "🇬🇮",
	  "🇬🇱",
	  "🇬🇲",
	  "🇬🇳",
	  "🇬🇵",
	  "🇬🇶",
	  "🇬🇷",
	  "🇬🇸",
	  "🇬🇹",
	  "🇬🇺",
	  "🇬🇼",
	  "🇬🇾",
	  "🇬",
	  "🇭🇰",
	  "🇭🇲",
	  "🇭🇳",
	  "🇭🇷",
	  "🇭🇹",
	  "🇭🇺",
	  "🇭",
	  "🇮🇨",
	  "🇮🇩",
	  "🇮🇪",
	  "🇮🇱",
	  "🇮🇲",
	  "🇮🇳",
	  "🇮🇴",
	  "🇮🇶",
	  "🇮🇷",
	  "🇮🇸",
	  "🇮🇹",
	  "🇮",
	  "🇯🇪",
	  "🇯🇲",
	  "🇯🇴",
	  "🇯🇵",
	  "🇯",
	  "🇰🇪",
	  "🇰🇬",
	  "🇰🇭",
	  "🇰🇮",
	  "🇰🇲",
	  "🇰🇳",
	  "🇰🇵",
	  "🇰🇷",
	  "🇰🇼",
	  "🇰🇾",
	  "🇰🇿",
	  "🇰",
	  "🇱🇦",
	  "🇱🇧",
	  "🇱🇨",
	  "🇱🇮",
	  "🇱🇰",
	  "🇱🇷",
	  "🇱🇸",
	  "🇱🇹",
	  "🇱🇺",
	  "🇱🇻",
	  "🇱🇾",
	  "🇱",
	  "🇲🇦",
	  "🇲🇨",
	  "🇲🇩",
	  "🇲🇪",
	  "🇲🇫",
	  "🇲🇬",
	  "🇲🇭",
	  "🇲🇰",
	  "🇲🇱",
	  "🇲🇲",
	  "🇲🇳",
	  "🇲🇴",
	  "🇲🇵",
	  "🇲🇶",
	  "🇲🇷",
	  "🇲🇸",
	  "🇲🇹",
	  "🇲🇺",
	  "🇲🇻",
	  "🇲🇼",
	  "🇲🇽",
	  "🇲🇾",
	  "🇲🇿",
	  "🇲",
	  "🇳🇦",
	  "🇳🇨",
	  "🇳🇪",
	  "🇳🇫",
	  "🇳🇬",
	  "🇳🇮",
	  "🇳🇱",
	  "🇳🇴",
	  "🇳🇵",
	  "🇳🇷",
	  "🇳🇺",
	  "🇳🇿",
	  "🇳",
	  "🇴🇲",
	  "🇴",
	  "🇵🇦",
	  "🇵🇪",
	  "🇵🇫",
	  "🇵🇬",
	  "🇵🇭",
	  "🇵🇰",
	  "🇵🇱",
	  "🇵🇲",
	  "🇵🇳",
	  "🇵🇷",
	  "🇵🇸",
	  "🇵🇹",
	  "🇵🇼",
	  "🇵🇾",
	  "🇵",
	  "🇶🇦",
	  "🇶",
	  "🇷🇪",
	  "🇷🇴",
	  "🇷🇸",
	  "🇷🇺",
	  "🇷🇼",
	  "🇷",
	  "🇸🇦",
	  "🇸🇧",
	  "🇸🇨",
	  "🇸🇩",
	  "🇸🇪",
	  "🇸🇬",
	  "🇸🇭",
	  "🇸🇮",
	  "🇸🇯",
	  "🇸🇰",
	  "🇸🇱",
	  "🇸🇲",
	  "🇸🇳",
	  "🇸🇴",
	  "🇸🇷",
	  "🇸🇸",
	  "🇸🇹",
	  "🇸🇻",
	  "🇸🇽",
	  "🇸🇾",
	  "🇸🇿",
	  "🇸",
	  "🇹🇦",
	  "🇹🇨",
	  "🇹🇩",
	  "🇹🇫",
	  "🇹🇬",
	  "🇹🇭",
	  "🇹🇯",
	  "🇹🇰",
	  "🇹🇱",
	  "🇹🇲",
	  "🇹🇳",
	  "🇹🇴",
	  "🇹🇷",
	  "🇹🇹",
	  "🇹🇻",
	  "🇹🇼",
	  "🇹🇿",
	  "🇹",
	  "🇺🇦",
	  "🇺🇬",
	  "🇺🇲",
	  "🇺🇸",
	  "🇺🇾",
	  "🇺🇿",
	  "🇺",
	  "🇻🇦",
	  "🇻🇨",
	  "🇻🇪",
	  "🇻🇬",
	  "🇻🇮",
	  "🇻🇳",
	  "🇻🇺",
	  "🇻",
	  "🇼🇫",
	  "🇼🇸",
	  "🇼",
	  "🇽🇰",
	  "🇽",
	  "🇾🇪",
	  "🇾🇹",
	  "🇾",
	  "🇿🇦",
	  "🇿🇲",
	  "🇿🇼",
	  "🇿",
	  "🈁",
	  "🈂",
	  "🈚",
	  "🈯",
	  "🈲",
	  "🈳",
	  "🈴",
	  "🈵",
	  "🈶",
	  "🈷",
	  "🈸",
	  "🈹",
	  "🈺",
	  "🉐",
	  "🉑",
	  "🌀",
	  "🌁",
	  "🌂",
	  "🌃",
	  "🌄",
	  "🌅",
	  "🌆",
	  "🌇",
	  "🌈",
	  "🌉",
	  "🌊",
	  "🌋",
	  "🌌",
	  "🌍",
	  "🌎",
	  "🌏",
	  "🌐",
	  "🌑",
	  "🌒",
	  "🌓",
	  "🌔",
	  "🌕",
	  "🌖",
	  "🌗",
	  "🌘",
	  "🌙",
	  "🌚",
	  "🌛",
	  "🌜",
	  "🌝",
	  "🌞",
	  "🌟",
	  "🌠",
	  "🌡",
	  "🌤",
	  "🌥",
	  "🌦",
	  "🌧",
	  "🌨",
	  "🌩",
	  "🌪",
	  "🌫",
	  "🌬",
	  "🌭",
	  "🌮",
	  "🌯",
	  "🌰",
	  "🌱",
	  "🌲",
	  "🌳",
	  "🌴",
	  "🌵",
	  "🌶",
	  "🌷",
	  "🌸",
	  "🌹",
	  "🌺",
	  "🌻",
	  "🌼",
	  "🌽",
	  "🌾",
	  "🌿",
	  "🍀",
	  "🍁",
	  "🍂",
	  "🍃",
	  "🍄",
	  "🍅",
	  "🍆",
	  "🍇",
	  "🍈",
	  "🍉",
	  "🍊",
	  "🍋",
	  "🍌",
	  "🍍",
	  "🍎",
	  "🍏",
	  "🍐",
	  "🍑",
	  "🍒",
	  "🍓",
	  "🍔",
	  "🍕",
	  "🍖",
	  "🍗",
	  "🍘",
	  "🍙",
	  "🍚",
	  "🍛",
	  "🍜",
	  "🍝",
	  "🍞",
	  "🍟",
	  "🍠",
	  "🍡",
	  "🍢",
	  "🍣",
	  "🍤",
	  "🍥",
	  "🍦",
	  "🍧",
	  "🍨",
	  "🍩",
	  "🍪",
	  "🍫",
	  "🍬",
	  "🍭",
	  "🍮",
	  "🍯",
	  "🍰",
	  "🍱",
	  "🍲",
	  "🍳",
	  "🍴",
	  "🍵",
	  "🍶",
	  "🍷",
	  "🍸",
	  "🍹",
	  "🍺",
	  "🍻",
	  "🍼",
	  "🍽",
	  "🍾",
	  "🍿",
	  "🎀",
	  "🎁",
	  "🎂",
	  "🎃",
	  "🎄",
	  "🎅🏻",
	  "🎅🏼",
	  "🎅🏽",
	  "🎅🏾",
	  "🎅🏿",
	  "🎅",
	  "🎆",
	  "🎇",
	  "🎈",
	  "🎉",
	  "🎊",
	  "🎋",
	  "🎌",
	  "🎍",
	  "🎎",
	  "🎏",
	  "🎐",
	  "🎑",
	  "🎒",
	  "🎓",
	  "🎖",
	  "🎗",
	  "🎙",
	  "🎚",
	  "🎛",
	  "🎞",
	  "🎟",
	  "🎠",
	  "🎡",
	  "🎢",
	  "🎣",
	  "🎤",
	  "🎥",
	  "🎦",
	  "🎧",
	  "🎨",
	  "🎩",
	  "🎪",
	  "🎫",
	  "🎬",
	  "🎭",
	  "🎮",
	  "🎯",
	  "🎰",
	  "🎱",
	  "🎲",
	  "🎳",
	  "🎴",
	  "🎵",
	  "🎶",
	  "🎷",
	  "🎸",
	  "🎹",
	  "🎺",
	  "🎻",
	  "🎼",
	  "🎽",
	  "🎾",
	  "🎿",
	  "🏀",
	  "🏁",
	  "🏂🏻",
	  "🏂🏼",
	  "🏂🏽",
	  "🏂🏾",
	  "🏂🏿",
	  "🏂",
	  "🏃🏻",
	  "🏃🏼",
	  "🏃🏽",
	  "🏃🏾",
	  "🏃🏿",
	  "🏃",
	  "🏄🏻",
	  "🏄🏼",
	  "🏄🏽",
	  "🏄🏾",
	  "🏄🏿",
	  "🏄",
	  "🏅",
	  "🏆",
	  "🏇🏻",
	  "🏇🏼",
	  "🏇🏽",
	  "🏇🏾",
	  "🏇🏿",
	  "🏇",
	  "🏈",
	  "🏉",
	  "🏊🏻",
	  "🏊🏼",
	  "🏊🏽",
	  "🏊🏾",
	  "🏊🏿",
	  "🏊",
	  "🏋🏻",
	  "🏋🏼",
	  "🏋🏽",
	  "🏋🏾",
	  "🏋🏿",
	  "🏋",
	  "🏌",
	  "🏍",
	  "🏎",
	  "🏏",
	  "🏐",
	  "🏑",
	  "🏒",
	  "🏓",
	  "🏔",
	  "🏕",
	  "🏖",
	  "🏗",
	  "🏘",
	  "🏙",
	  "🏚",
	  "🏛",
	  "🏜",
	  "🏝",
	  "🏞",
	  "🏟",
	  "🏠",
	  "🏡",
	  "🏢",
	  "🏣",
	  "🏤",
	  "🏥",
	  "🏦",
	  "🏧",
	  "🏨",
	  "🏩",
	  "🏪",
	  "🏫",
	  "🏬",
	  "🏭",
	  "🏮",
	  "🏯",
	  "🏰",
	  "🏳",
	  "🏴",
	  "🏵",
	  "🏷",
	  "🏸",
	  "🏹",
	  "🏺",
	  "🏻",
	  "🏼",
	  "🏽",
	  "🏾",
	  "🏿",
	  "🐀",
	  "🐁",
	  "🐂",
	  "🐃",
	  "🐄",
	  "🐅",
	  "🐆",
	  "🐇",
	  "🐈",
	  "🐉",
	  "🐊",
	  "🐋",
	  "🐌",
	  "🐍",
	  "🐎",
	  "🐏",
	  "🐐",
	  "🐑",
	  "🐒",
	  "🐓",
	  "🐔",
	  "🐕",
	  "🐖",
	  "🐗",
	  "🐘",
	  "🐙",
	  "🐚",
	  "🐛",
	  "🐜",
	  "🐝",
	  "🐞",
	  "🐟",
	  "🐠",
	  "🐡",
	  "🐢",
	  "🐣",
	  "🐤",
	  "🐥",
	  "🐦",
	  "🐧",
	  "🐨",
	  "🐩",
	  "🐪",
	  "🐫",
	  "🐬",
	  "🐭",
	  "🐮",
	  "🐯",
	  "🐰",
	  "🐱",
	  "🐲",
	  "🐳",
	  "🐴",
	  "🐵",
	  "🐶",
	  "🐷",
	  "🐸",
	  "🐹",
	  "🐺",
	  "🐻",
	  "🐼",
	  "🐽",
	  "🐾",
	  "🐿",
	  "👀",
	  "👁‍🗨",
	  "👁",
	  "👂🏻",
	  "👂🏼",
	  "👂🏽",
	  "👂🏾",
	  "👂🏿",
	  "👂",
	  "👃🏻",
	  "👃🏼",
	  "👃🏽",
	  "👃🏾",
	  "👃🏿",
	  "👃",
	  "👄",
	  "👅",
	  "👆🏻",
	  "👆🏼",
	  "👆🏽",
	  "👆🏾",
	  "👆🏿",
	  "👆",
	  "👇🏻",
	  "👇🏼",
	  "👇🏽",
	  "👇🏾",
	  "👇🏿",
	  "👇",
	  "👈🏻",
	  "👈🏼",
	  "👈🏽",
	  "👈🏾",
	  "👈🏿",
	  "👈",
	  "👉🏻",
	  "👉🏼",
	  "👉🏽",
	  "👉🏾",
	  "👉🏿",
	  "👉",
	  "👊🏻",
	  "👊🏼",
	  "👊🏽",
	  "👊🏾",
	  "👊🏿",
	  "👊",
	  "👋🏻",
	  "👋🏼",
	  "👋🏽",
	  "👋🏾",
	  "👋🏿",
	  "👋",
	  "👌🏻",
	  "👌🏼",
	  "👌🏽",
	  "👌🏾",
	  "👌🏿",
	  "👌",
	  "👍🏻",
	  "👍🏼",
	  "👍🏽",
	  "👍🏾",
	  "👍🏿",
	  "👍",
	  "👎🏻",
	  "👎🏼",
	  "👎🏽",
	  "👎🏾",
	  "👎🏿",
	  "👎",
	  "👏🏻",
	  "👏🏼",
	  "👏🏽",
	  "👏🏾",
	  "👏🏿",
	  "👏",
	  "👐🏻",
	  "👐🏼",
	  "👐🏽",
	  "👐🏾",
	  "👐🏿",
	  "👐",
	  "👑",
	  "👒",
	  "👓",
	  "👔",
	  "👕",
	  "👖",
	  "👗",
	  "👘",
	  "👙",
	  "👚",
	  "👛",
	  "👜",
	  "👝",
	  "👞",
	  "👟",
	  "👠",
	  "👡",
	  "👢",
	  "👣",
	  "👤",
	  "👥",
	  "👦🏻",
	  "👦🏼",
	  "👦🏽",
	  "👦🏾",
	  "👦🏿",
	  "👦",
	  "👧🏻",
	  "👧🏼",
	  "👧🏽",
	  "👧🏾",
	  "👧🏿",
	  "👧",
	  "👨🏻",
	  "👨🏼",
	  "👨🏽",
	  "👨🏾",
	  "👨🏿",
	  "👨‍👨‍👦‍👦",
	  "👨‍👨‍👦",
	  "👨‍👨‍👧‍👦",
	  "👨‍👨‍👧‍👧",
	  "👨‍👨‍👧",
	  "👨‍👩‍👦‍👦",
	  "👨‍👩‍👦",
	  "👨‍👩‍👧‍👦",
	  "👨‍👩‍👧‍👧",
	  "👨‍👩‍👧",
	  "👨‍❤️‍👨",
	  "👨‍❤️‍💋‍👨",
	  "👨",
	  "👩🏻",
	  "👩🏼",
	  "👩🏽",
	  "👩🏾",
	  "👩🏿",
	  "👩‍👩‍👦‍👦",
	  "👩‍👩‍👦",
	  "👩‍👩‍👧‍👦",
	  "👩‍👩‍👧‍👧",
	  "👩‍👩‍👧",
	  "👩‍❤️‍👨",
	  "👩‍❤️‍👩",
	  "👩‍❤️‍💋‍👨",
	  "👩‍❤️‍💋‍👩",
	  "👩",
	  "👪",
	  "👫",
	  "👬",
	  "👭",
	  "👮🏻",
	  "👮🏼",
	  "👮🏽",
	  "👮🏾",
	  "👮🏿",
	  "👮",
	  "👯",
	  "👰🏻",
	  "👰🏼",
	  "👰🏽",
	  "👰🏾",
	  "👰🏿",
	  "👰",
	  "👱🏻",
	  "👱🏼",
	  "👱🏽",
	  "👱🏾",
	  "👱🏿",
	  "👱",
	  "👲🏻",
	  "👲🏼",
	  "👲🏽",
	  "👲🏾",
	  "👲🏿",
	  "👲",
	  "👳🏻",
	  "👳🏼",
	  "👳🏽",
	  "👳🏾",
	  "👳🏿",
	  "👳",
	  "👴🏻",
	  "👴🏼",
	  "👴🏽",
	  "👴🏾",
	  "👴🏿",
	  "👴",
	  "👵🏻",
	  "👵🏼",
	  "👵🏽",
	  "👵🏾",
	  "👵🏿",
	  "👵",
	  "👶🏻",
	  "👶🏼",
	  "👶🏽",
	  "👶🏾",
	  "👶🏿",
	  "👶",
	  "👷🏻",
	  "👷🏼",
	  "👷🏽",
	  "👷🏾",
	  "👷🏿",
	  "👷",
	  "👸🏻",
	  "👸🏼",
	  "👸🏽",
	  "👸🏾",
	  "👸🏿",
	  "👸",
	  "👹",
	  "👺",
	  "👻",
	  "👼🏻",
	  "👼🏼",
	  "👼🏽",
	  "👼🏾",
	  "👼🏿",
	  "👼",
	  "👽",
	  "👾",
	  "👿",
	  "💀",
	  "💁🏻",
	  "💁🏼",
	  "💁🏽",
	  "💁🏾",
	  "💁🏿",
	  "💁",
	  "💂🏻",
	  "💂🏼",
	  "💂🏽",
	  "💂🏾",
	  "💂🏿",
	  "💂",
	  "💃🏻",
	  "💃🏼",
	  "💃🏽",
	  "💃🏾",
	  "💃🏿",
	  "💃",
	  "💄",
	  "💅🏻",
	  "💅🏼",
	  "💅🏽",
	  "💅🏾",
	  "💅🏿",
	  "💅",
	  "💆🏻",
	  "💆🏼",
	  "💆🏽",
	  "💆🏾",
	  "💆🏿",
	  "💆",
	  "💇🏻",
	  "💇🏼",
	  "💇🏽",
	  "💇🏾",
	  "💇🏿",
	  "💇",
	  "💈",
	  "💉",
	  "💊",
	  "💋",
	  "💌",
	  "💍",
	  "💎",
	  "💏",
	  "💐",
	  "💑",
	  "💒",
	  "💓",
	  "💔",
	  "💕",
	  "💖",
	  "💗",
	  "💘",
	  "💙",
	  "💚",
	  "💛",
	  "💜",
	  "💝",
	  "💞",
	  "💟",
	  "💠",
	  "💡",
	  "💢",
	  "💣",
	  "💤",
	  "💥",
	  "💦",
	  "💧",
	  "💨",
	  "💩",
	  "💪🏻",
	  "💪🏼",
	  "💪🏽",
	  "💪🏾",
	  "💪🏿",
	  "💪",
	  "💫",
	  "💬",
	  "💭",
	  "💮",
	  "💯",
	  "💰",
	  "💱",
	  "💲",
	  "💳",
	  "💴",
	  "💵",
	  "💶",
	  "💷",
	  "💸",
	  "💹",
	  "💺",
	  "💻",
	  "💼",
	  "💽",
	  "💾",
	  "💿",
	  "📀",
	  "📁",
	  "📂",
	  "📃",
	  "📄",
	  "📅",
	  "📆",
	  "📇",
	  "📈",
	  "📉",
	  "📊",
	  "📋",
	  "📌",
	  "📍",
	  "📎",
	  "📏",
	  "📐",
	  "📑",
	  "📒",
	  "📓",
	  "📔",
	  "📕",
	  "📖",
	  "📗",
	  "📘",
	  "📙",
	  "📚",
	  "📛",
	  "📜",
	  "📝",
	  "📞",
	  "📟",
	  "📠",
	  "📡",
	  "📢",
	  "📣",
	  "📤",
	  "📥",
	  "📦",
	  "📧",
	  "📨",
	  "📩",
	  "📪",
	  "📫",
	  "📬",
	  "📭",
	  "📮",
	  "📯",
	  "📰",
	  "📱",
	  "📲",
	  "📳",
	  "📴",
	  "📵",
	  "📶",
	  "📷",
	  "📸",
	  "📹",
	  "📺",
	  "📻",
	  "📼",
	  "📽",
	  "📿",
	  "🔀",
	  "🔁",
	  "🔂",
	  "🔃",
	  "🔄",
	  "🔅",
	  "🔆",
	  "🔇",
	  "🔈",
	  "🔉",
	  "🔊",
	  "🔋",
	  "🔌",
	  "🔍",
	  "🔎",
	  "🔏",
	  "🔐",
	  "🔑",
	  "🔒",
	  "🔓",
	  "🔔",
	  "🔕",
	  "🔖",
	  "🔗",
	  "🔘",
	  "🔙",
	  "🔚",
	  "🔛",
	  "🔜",
	  "🔝",
	  "🔞",
	  "🔟",
	  "🔠",
	  "🔡",
	  "🔢",
	  "🔣",
	  "🔤",
	  "🔥",
	  "🔦",
	  "🔧",
	  "🔨",
	  "🔩",
	  "🔪",
	  "🔫",
	  "🔬",
	  "🔭",
	  "🔮",
	  "🔯",
	  "🔰",
	  "🔱",
	  "🔲",
	  "🔳",
	  "🔴",
	  "🔵",
	  "🔶",
	  "🔷",
	  "🔸",
	  "🔹",
	  "🔺",
	  "🔻",
	  "🔼",
	  "🔽",
	  "🕉",
	  "🕊",
	  "🕋",
	  "🕌",
	  "🕍",
	  "🕎",
	  "🕐",
	  "🕑",
	  "🕒",
	  "🕓",
	  "🕔",
	  "🕕",
	  "🕖",
	  "🕗",
	  "🕘",
	  "🕙",
	  "🕚",
	  "🕛",
	  "🕜",
	  "🕝",
	  "🕞",
	  "🕟",
	  "🕠",
	  "🕡",
	  "🕢",
	  "🕣",
	  "🕤",
	  "🕥",
	  "🕦",
	  "🕧",
	  "🕯",
	  "🕰",
	  "🕳",
	  "🕴",
	  "🕵🏻",
	  "🕵🏼",
	  "🕵🏽",
	  "🕵🏾",
	  "🕵🏿",
	  "🕵",
	  "🕶",
	  "🕷",
	  "🕸",
	  "🕹",
	  "🖇",
	  "🖊",
	  "🖋",
	  "🖌",
	  "🖍",
	  "🖐🏻",
	  "🖐🏼",
	  "🖐🏽",
	  "🖐🏾",
	  "🖐🏿",
	  "🖐",
	  "🖕🏻",
	  "🖕🏼",
	  "🖕🏽",
	  "🖕🏾",
	  "🖕🏿",
	  "🖕",
	  "🖖🏻",
	  "🖖🏼",
	  "🖖🏽",
	  "🖖🏾",
	  "🖖🏿",
	  "🖖",
	  "🖥",
	  "🖨",
	  "🖱",
	  "🖲",
	  "🖼",
	  "🗂",
	  "🗃",
	  "🗄",
	  "🗑",
	  "🗒",
	  "🗓",
	  "🗜",
	  "🗝",
	  "🗞",
	  "🗡",
	  "🗣",
	  "🗨",
	  "🗯",
	  "🗳",
	  "🗺",
	  "🗻",
	  "🗼",
	  "🗽",
	  "🗾",
	  "🗿",
	  "😀",
	  "😁",
	  "😂",
	  "😃",
	  "😄",
	  "😅",
	  "😆",
	  "😇",
	  "😈",
	  "😉",
	  "😊",
	  "😋",
	  "😌",
	  "😍",
	  "😎",
	  "😏",
	  "😐",
	  "😑",
	  "😒",
	  "😓",
	  "😔",
	  "😕",
	  "😖",
	  "😗",
	  "😘",
	  "😙",
	  "😚",
	  "😛",
	  "😜",
	  "😝",
	  "😞",
	  "😟",
	  "😠",
	  "😡",
	  "😢",
	  "😣",
	  "😤",
	  "😥",
	  "😦",
	  "😧",
	  "😨",
	  "😩",
	  "😪",
	  "😫",
	  "😬",
	  "😭",
	  "😮",
	  "😯",
	  "😰",
	  "😱",
	  "😲",
	  "😳",
	  "😴",
	  "😵",
	  "😶",
	  "😷",
	  "😸",
	  "😹",
	  "😺",
	  "😻",
	  "😼",
	  "😽",
	  "😾",
	  "😿",
	  "🙀",
	  "🙁",
	  "🙂",
	  "🙃",
	  "🙄",
	  "🙅🏻",
	  "🙅🏼",
	  "🙅🏽",
	  "🙅🏾",
	  "🙅🏿",
	  "🙅",
	  "🙆🏻",
	  "🙆🏼",
	  "🙆🏽",
	  "🙆🏾",
	  "🙆🏿",
	  "🙆",
	  "🙇🏻",
	  "🙇🏼",
	  "🙇🏽",
	  "🙇🏾",
	  "🙇🏿",
	  "🙇",
	  "🙈",
	  "🙉",
	  "🙊",
	  "🙋🏻",
	  "🙋🏼",
	  "🙋🏽",
	  "🙋🏾",
	  "🙋🏿",
	  "🙋",
	  "🙌🏻",
	  "🙌🏼",
	  "🙌🏽",
	  "🙌🏾",
	  "🙌🏿",
	  "🙌",
	  "🙍🏻",
	  "🙍🏼",
	  "🙍🏽",
	  "🙍🏾",
	  "🙍🏿",
	  "🙍",
	  "🙎🏻",
	  "🙎🏼",
	  "🙎🏽",
	  "🙎🏾",
	  "🙎🏿",
	  "🙎",
	  "🙏🏻",
	  "🙏🏼",
	  "🙏🏽",
	  "🙏🏾",
	  "🙏🏿",
	  "🙏",
	  "🚀",
	  "🚁",
	  "🚂",
	  "🚃",
	  "🚄",
	  "🚅",
	  "🚆",
	  "🚇",
	  "🚈",
	  "🚉",
	  "🚊",
	  "🚋",
	  "🚌",
	  "🚍",
	  "🚎",
	  "🚏",
	  "🚐",
	  "🚑",
	  "🚒",
	  "🚓",
	  "🚔",
	  "🚕",
	  "🚖",
	  "🚗",
	  "🚘",
	  "🚙",
	  "🚚",
	  "🚛",
	  "🚜",
	  "🚝",
	  "🚞",
	  "🚟",
	  "🚠",
	  "🚡",
	  "🚢",
	  "🚣🏻",
	  "🚣🏼",
	  "🚣🏽",
	  "🚣🏾",
	  "🚣🏿",
	  "🚣",
	  "🚤",
	  "🚥",
	  "🚦",
	  "🚧",
	  "🚨",
	  "🚩",
	  "🚪",
	  "🚫",
	  "🚬",
	  "🚭",
	  "🚮",
	  "🚯",
	  "🚰",
	  "🚱",
	  "🚲",
	  "🚳",
	  "🚴🏻",
	  "🚴🏼",
	  "🚴🏽",
	  "🚴🏾",
	  "🚴🏿",
	  "🚴",
	  "🚵🏻",
	  "🚵🏼",
	  "🚵🏽",
	  "🚵🏾",
	  "🚵🏿",
	  "🚵",
	  "🚶🏻",
	  "🚶🏼",
	  "🚶🏽",
	  "🚶🏾",
	  "🚶🏿",
	  "🚶",
	  "🚷",
	  "🚸",
	  "🚹",
	  "🚺",
	  "🚻",
	  "🚼",
	  "🚽",
	  "🚾",
	  "🚿",
	  "🛀🏻",
	  "🛀🏼",
	  "🛀🏽",
	  "🛀🏾",
	  "🛀🏿",
	  "🛀",
	  "🛁",
	  "🛂",
	  "🛃",
	  "🛄",
	  "🛅",
	  "🛋",
	  "🛌",
	  "🛍",
	  "🛎",
	  "🛏",
	  "🛐",
	  "🛠",
	  "🛡",
	  "🛢",
	  "🛣",
	  "🛤",
	  "🛥",
	  "🛩",
	  "🛫",
	  "🛬",
	  "🛰",
	  "🛳",
	  "🤐",
	  "🤑",
	  "🤒",
	  "🤓",
	  "🤔",
	  "🤕",
	  "🤖",
	  "🤗",
	  "🤘🏻",
	  "🤘🏼",
	  "🤘🏽",
	  "🤘🏾",
	  "🤘🏿",
	  "🤘",
	  "🦀",
	  "🦁",
	  "🦂",
	  "🦃",
	  "🦄",
	  "🧀",
	  "‼",
	  "⁉",
	  "™",
	  "ℹ",
	  "↔",
	  "↕",
	  "↖",
	  "↗",
	  "↘",
	  "↙",
	  "↩",
	  "↪",
	  "#⃣",
	  "⌚",
	  "⌛",
	  "⌨",
	  "⏏",
	  "⏩",
	  "⏪",
	  "⏫",
	  "⏬",
	  "⏭",
	  "⏮",
	  "⏯",
	  "⏰",
	  "⏱",
	  "⏲",
	  "⏳",
	  "⏸",
	  "⏹",
	  "⏺",
	  "Ⓜ",
	  "▪",
	  "▫",
	  "▶",
	  "◀",
	  "◻",
	  "◼",
	  "◽",
	  "◾",
	  "☀",
	  "☁",
	  "☂",
	  "☃",
	  "☄",
	  "☎",
	  "☑",
	  "☔",
	  "☕",
	  "☘",
	  "☝🏻",
	  "☝🏼",
	  "☝🏽",
	  "☝🏾",
	  "☝🏿",
	  "☝",
	  "☠",
	  "☢",
	  "☣",
	  "☦",
	  "☪",
	  "☮",
	  "☯",
	  "☸",
	  "☹",
	  "☺",
	  "♈",
	  "♉",
	  "♊",
	  "♋",
	  "♌",
	  "♍",
	  "♎",
	  "♏",
	  "♐",
	  "♑",
	  "♒",
	  "♓",
	  "♠",
	  "♣",
	  "♥",
	  "♦",
	  "♨",
	  "♻",
	  "♿",
	  "⚒",
	  "⚓",
	  "⚔",
	  "⚖",
	  "⚗",
	  "⚙",
	  "⚛",
	  "⚜",
	  "⚠",
	  "⚡",
	  "⚪",
	  "⚫",
	  "⚰",
	  "⚱",
	  "⚽",
	  "⚾",
	  "⛄",
	  "⛅",
	  "⛈",
	  "⛎",
	  "⛏",
	  "⛑",
	  "⛓",
	  "⛔",
	  "⛩",
	  "⛪",
	  "⛰",
	  "⛱",
	  "⛲",
	  "⛳",
	  "⛴",
	  "⛵",
	  "⛷",
	  "⛸",
	  "⛹🏻",
	  "⛹🏼",
	  "⛹🏽",
	  "⛹🏾",
	  "⛹🏿",
	  "⛹",
	  "⛺",
	  "⛽",
	  "✂",
	  "✅",
	  "✈",
	  "✉",
	  "✊🏻",
	  "✊🏼",
	  "✊🏽",
	  "✊🏾",
	  "✊🏿",
	  "✊",
	  "✋🏻",
	  "✋🏼",
	  "✋🏽",
	  "✋🏾",
	  "✋🏿",
	  "✋",
	  "✌🏻",
	  "✌🏼",
	  "✌🏽",
	  "✌🏾",
	  "✌🏿",
	  "✌",
	  "✍🏻",
	  "✍🏼",
	  "✍🏽",
	  "✍🏾",
	  "✍🏿",
	  "✍",
	  "✏",
	  "✒",
	  "✔",
	  "✖",
	  "✝",
	  "✡",
	  "✨",
	  "✳",
	  "✴",
	  "❄",
	  "❇",
	  "❌",
	  "❎",
	  "❓",
	  "❔",
	  "❕",
	  "❗",
	  "❣",
	  "❤",
	  "➕",
	  "➖",
	  "➗",
	  "➡",
	  "➰",
	  "➿",
	  "⤴",
	  "⤵",
	  "*⃣",
	  "⬅",
	  "⬆",
	  "⬇",
	  "⬛",
	  "⬜",
	  "⭐",
	  "⭕",
	  "0⃣",
	  "〰",
	  "〽",
	  "1⃣",
	  "2⃣",
	  "㊗",
	  "㊙",
	  "3⃣",
	  "4⃣",
	  "5⃣",
	  "6⃣",
	  "7⃣",
	  "8⃣",
	  "9⃣",
	  "©",
	  "®",
	  ""
	]

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
	;(function (global) {
	    'use strict';

	/*
	  big.js v3.1.3
	  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
	  https://github.com/MikeMcl/big.js/
	  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
	  MIT Expat Licence
	*/

	/***************************** EDITABLE DEFAULTS ******************************/

	    // The default values below must be integers within the stated ranges.

	    /*
	     * The maximum number of decimal places of the results of operations
	     * involving division: div and sqrt, and pow with negative exponents.
	     */
	    var DP = 20,                           // 0 to MAX_DP

	        /*
	         * The rounding mode used when rounding to the above decimal places.
	         *
	         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
	         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
	         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
	         * 3 Away from zero.                                  (ROUND_UP)
	         */
	        RM = 1,                            // 0, 1, 2 or 3

	        // The maximum value of DP and Big.DP.
	        MAX_DP = 1E6,                      // 0 to 1000000

	        // The maximum magnitude of the exponent argument to the pow method.
	        MAX_POWER = 1E6,                   // 1 to 1000000

	        /*
	         * The exponent value at and beneath which toString returns exponential
	         * notation.
	         * JavaScript's Number type: -7
	         * -1000000 is the minimum recommended exponent value of a Big.
	         */
	        E_NEG = -7,                   // 0 to -1000000

	        /*
	         * The exponent value at and above which toString returns exponential
	         * notation.
	         * JavaScript's Number type: 21
	         * 1000000 is the maximum recommended exponent value of a Big.
	         * (This limit is not enforced or checked.)
	         */
	        E_POS = 21,                   // 0 to 1000000

	/******************************************************************************/

	        // The shared prototype object.
	        P = {},
	        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
	        Big;


	    /*
	     * Create and return a Big constructor.
	     *
	     */
	    function bigFactory() {

	        /*
	         * The Big constructor and exported function.
	         * Create and return a new instance of a Big number object.
	         *
	         * n {number|string|Big} A numeric value.
	         */
	        function Big(n) {
	            var x = this;

	            // Enable constructor usage without new.
	            if (!(x instanceof Big)) {
	                return n === void 0 ? bigFactory() : new Big(n);
	            }

	            // Duplicate.
	            if (n instanceof Big) {
	                x.s = n.s;
	                x.e = n.e;
	                x.c = n.c.slice();
	            } else {
	                parse(x, n);
	            }

	            /*
	             * Retain a reference to this Big constructor, and shadow
	             * Big.prototype.constructor which points to Object.
	             */
	            x.constructor = Big;
	        }

	        Big.prototype = P;
	        Big.DP = DP;
	        Big.RM = RM;
	        Big.E_NEG = E_NEG;
	        Big.E_POS = E_POS;

	        return Big;
	    }


	    // Private functions


	    /*
	     * Return a string representing the value of Big x in normal or exponential
	     * notation to dp fixed decimal places or significant digits.
	     *
	     * x {Big} The Big to format.
	     * dp {number} Integer, 0 to MAX_DP inclusive.
	     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
	     */
	    function format(x, dp, toE) {
	        var Big = x.constructor,

	            // The index (normal notation) of the digit that may be rounded up.
	            i = dp - (x = new Big(x)).e,
	            c = x.c;

	        // Round?
	        if (c.length > ++dp) {
	            rnd(x, i, Big.RM);
	        }

	        if (!c[0]) {
	            ++i;
	        } else if (toE) {
	            i = dp;

	        // toFixed
	        } else {
	            c = x.c;

	            // Recalculate i as x.e may have changed if value rounded up.
	            i = x.e + i + 1;
	        }

	        // Append zeros?
	        for (; c.length < i; c.push(0)) {
	        }
	        i = x.e;

	        /*
	         * toPrecision returns exponential notation if the number of
	         * significant digits specified is less than the number of digits
	         * necessary to represent the integer part of the value in normal
	         * notation.
	         */
	        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

	          // Exponential notation.
	          (x.s < 0 && c[0] ? '-' : '') +
	            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
	              (i < 0 ? 'e' : 'e+') + i

	          // Normal notation.
	          : x.toString();
	    }


	    /*
	     * Parse the number or string value passed to a Big constructor.
	     *
	     * x {Big} A Big number instance.
	     * n {number|string} A numeric value.
	     */
	    function parse(x, n) {
	        var e, i, nL;

	        // Minus zero?
	        if (n === 0 && 1 / n < 0) {
	            n = '-0';

	        // Ensure n is string and check validity.
	        } else if (!isValid.test(n += '')) {
	            throwErr(NaN);
	        }

	        // Determine sign.
	        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

	        // Decimal point?
	        if ((e = n.indexOf('.')) > -1) {
	            n = n.replace('.', '');
	        }

	        // Exponential form?
	        if ((i = n.search(/e/i)) > 0) {

	            // Determine exponent.
	            if (e < 0) {
	                e = i;
	            }
	            e += +n.slice(i + 1);
	            n = n.substring(0, i);

	        } else if (e < 0) {

	            // Integer.
	            e = n.length;
	        }

	        // Determine leading zeros.
	        for (i = 0; n.charAt(i) == '0'; i++) {
	        }

	        if (i == (nL = n.length)) {

	            // Zero.
	            x.c = [ x.e = 0 ];
	        } else {

	            // Determine trailing zeros.
	            for (; n.charAt(--nL) == '0';) {
	            }

	            x.e = e - i - 1;
	            x.c = [];

	            // Convert string to array of digits without leading/trailing zeros.
	            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
	            }
	        }

	        return x;
	    }


	    /*
	     * Round Big x to a maximum of dp decimal places using rounding mode rm.
	     * Called by div, sqrt and round.
	     *
	     * x {Big} The Big to round.
	     * dp {number} Integer, 0 to MAX_DP inclusive.
	     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
	     * [more] {boolean} Whether the result of division was truncated.
	     */
	    function rnd(x, dp, rm, more) {
	        var u,
	            xc = x.c,
	            i = x.e + dp + 1;

	        if (rm === 1) {

	            // xc[i] is the digit after the digit that may be rounded up.
	            more = xc[i] >= 5;
	        } else if (rm === 2) {
	            more = xc[i] > 5 || xc[i] == 5 &&
	              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
	        } else if (rm === 3) {
	            more = more || xc[i] !== u || i < 0;
	        } else {
	            more = false;

	            if (rm !== 0) {
	                throwErr('!Big.RM!');
	            }
	        }

	        if (i < 1 || !xc[0]) {

	            if (more) {

	                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
	                x.e = -dp;
	                x.c = [1];
	            } else {

	                // Zero.
	                x.c = [x.e = 0];
	            }
	        } else {

	            // Remove any digits after the required decimal places.
	            xc.length = i--;

	            // Round up?
	            if (more) {

	                // Rounding up may mean the previous digit has to be rounded up.
	                for (; ++xc[i] > 9;) {
	                    xc[i] = 0;

	                    if (!i--) {
	                        ++x.e;
	                        xc.unshift(1);
	                    }
	                }
	            }

	            // Remove trailing zeros.
	            for (i = xc.length; !xc[--i]; xc.pop()) {
	            }
	        }

	        return x;
	    }


	    /*
	     * Throw a BigError.
	     *
	     * message {string} The error message.
	     */
	    function throwErr(message) {
	        var err = new Error(message);
	        err.name = 'BigError';

	        throw err;
	    }


	    // Prototype/instance methods


	    /*
	     * Return a new Big whose value is the absolute value of this Big.
	     */
	    P.abs = function () {
	        var x = new this.constructor(this);
	        x.s = 1;

	        return x;
	    };


	    /*
	     * Return
	     * 1 if the value of this Big is greater than the value of Big y,
	     * -1 if the value of this Big is less than the value of Big y, or
	     * 0 if they have the same value.
	    */
	    P.cmp = function (y) {
	        var xNeg,
	            x = this,
	            xc = x.c,
	            yc = (y = new x.constructor(y)).c,
	            i = x.s,
	            j = y.s,
	            k = x.e,
	            l = y.e;

	        // Either zero?
	        if (!xc[0] || !yc[0]) {
	            return !xc[0] ? !yc[0] ? 0 : -j : i;
	        }

	        // Signs differ?
	        if (i != j) {
	            return i;
	        }
	        xNeg = i < 0;

	        // Compare exponents.
	        if (k != l) {
	            return k > l ^ xNeg ? 1 : -1;
	        }

	        i = -1;
	        j = (k = xc.length) < (l = yc.length) ? k : l;

	        // Compare digit by digit.
	        for (; ++i < j;) {

	            if (xc[i] != yc[i]) {
	                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
	            }
	        }

	        // Compare lengths.
	        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
	    };


	    /*
	     * Return a new Big whose value is the value of this Big divided by the
	     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
	     * places using rounding mode Big.RM.
	     */
	    P.div = function (y) {
	        var x = this,
	            Big = x.constructor,
	            // dividend
	            dvd = x.c,
	            //divisor
	            dvs = (y = new Big(y)).c,
	            s = x.s == y.s ? 1 : -1,
	            dp = Big.DP;

	        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
	            throwErr('!Big.DP!');
	        }

	        // Either 0?
	        if (!dvd[0] || !dvs[0]) {

	            // If both are 0, throw NaN
	            if (dvd[0] == dvs[0]) {
	                throwErr(NaN);
	            }

	            // If dvs is 0, throw +-Infinity.
	            if (!dvs[0]) {
	                throwErr(s / 0);
	            }

	            // dvd is 0, return +-0.
	            return new Big(s * 0);
	        }

	        var dvsL, dvsT, next, cmp, remI, u,
	            dvsZ = dvs.slice(),
	            dvdI = dvsL = dvs.length,
	            dvdL = dvd.length,
	            // remainder
	            rem = dvd.slice(0, dvsL),
	            remL = rem.length,
	            // quotient
	            q = y,
	            qc = q.c = [],
	            qi = 0,
	            digits = dp + (q.e = x.e - y.e) + 1;

	        q.s = s;
	        s = digits < 0 ? 0 : digits;

	        // Create version of divisor with leading zero.
	        dvsZ.unshift(0);

	        // Add zeros to make remainder as long as divisor.
	        for (; remL++ < dvsL; rem.push(0)) {
	        }

	        do {

	            // 'next' is how many times the divisor goes into current remainder.
	            for (next = 0; next < 10; next++) {

	                // Compare divisor and remainder.
	                if (dvsL != (remL = rem.length)) {
	                    cmp = dvsL > remL ? 1 : -1;
	                } else {

	                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

	                        if (dvs[remI] != rem[remI]) {
	                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
	                            break;
	                        }
	                    }
	                }

	                // If divisor < remainder, subtract divisor from remainder.
	                if (cmp < 0) {

	                    // Remainder can't be more than 1 digit longer than divisor.
	                    // Equalise lengths using divisor with extra leading zero?
	                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

	                        if (rem[--remL] < dvsT[remL]) {
	                            remI = remL;

	                            for (; remI && !rem[--remI]; rem[remI] = 9) {
	                            }
	                            --rem[remI];
	                            rem[remL] += 10;
	                        }
	                        rem[remL] -= dvsT[remL];
	                    }
	                    for (; !rem[0]; rem.shift()) {
	                    }
	                } else {
	                    break;
	                }
	            }

	            // Add the 'next' digit to the result array.
	            qc[qi++] = cmp ? next : ++next;

	            // Update the remainder.
	            if (rem[0] && cmp) {
	                rem[remL] = dvd[dvdI] || 0;
	            } else {
	                rem = [ dvd[dvdI] ];
	            }

	        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

	        // Leading zero? Do not remove if result is simply zero (qi == 1).
	        if (!qc[0] && qi != 1) {

	            // There can't be more than one zero.
	            qc.shift();
	            q.e--;
	        }

	        // Round?
	        if (qi > digits) {
	            rnd(q, dp, Big.RM, rem[0] !== u);
	        }

	        return q;
	    };


	    /*
	     * Return true if the value of this Big is equal to the value of Big y,
	     * otherwise returns false.
	     */
	    P.eq = function (y) {
	        return !this.cmp(y);
	    };


	    /*
	     * Return true if the value of this Big is greater than the value of Big y,
	     * otherwise returns false.
	     */
	    P.gt = function (y) {
	        return this.cmp(y) > 0;
	    };


	    /*
	     * Return true if the value of this Big is greater than or equal to the
	     * value of Big y, otherwise returns false.
	     */
	    P.gte = function (y) {
	        return this.cmp(y) > -1;
	    };


	    /*
	     * Return true if the value of this Big is less than the value of Big y,
	     * otherwise returns false.
	     */
	    P.lt = function (y) {
	        return this.cmp(y) < 0;
	    };


	    /*
	     * Return true if the value of this Big is less than or equal to the value
	     * of Big y, otherwise returns false.
	     */
	    P.lte = function (y) {
	         return this.cmp(y) < 1;
	    };


	    /*
	     * Return a new Big whose value is the value of this Big minus the value
	     * of Big y.
	     */
	    P.sub = P.minus = function (y) {
	        var i, j, t, xLTy,
	            x = this,
	            Big = x.constructor,
	            a = x.s,
	            b = (y = new Big(y)).s;

	        // Signs differ?
	        if (a != b) {
	            y.s = -b;
	            return x.plus(y);
	        }

	        var xc = x.c.slice(),
	            xe = x.e,
	            yc = y.c,
	            ye = y.e;

	        // Either zero?
	        if (!xc[0] || !yc[0]) {

	            // y is non-zero? x is non-zero? Or both are zero.
	            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
	        }

	        // Determine which is the bigger number.
	        // Prepend zeros to equalise exponents.
	        if (a = xe - ye) {

	            if (xLTy = a < 0) {
	                a = -a;
	                t = xc;
	            } else {
	                ye = xe;
	                t = yc;
	            }

	            t.reverse();
	            for (b = a; b--; t.push(0)) {
	            }
	            t.reverse();
	        } else {

	            // Exponents equal. Check digit by digit.
	            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

	            for (a = b = 0; b < j; b++) {

	                if (xc[b] != yc[b]) {
	                    xLTy = xc[b] < yc[b];
	                    break;
	                }
	            }
	        }

	        // x < y? Point xc to the array of the bigger number.
	        if (xLTy) {
	            t = xc;
	            xc = yc;
	            yc = t;
	            y.s = -y.s;
	        }

	        /*
	         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
	         * as subtraction only needs to start at yc.length.
	         */
	        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

	            for (; b--; xc[i++] = 0) {
	            }
	        }

	        // Subtract yc from xc.
	        for (b = i; j > a;){

	            if (xc[--j] < yc[j]) {

	                for (i = j; i && !xc[--i]; xc[i] = 9) {
	                }
	                --xc[i];
	                xc[j] += 10;
	            }
	            xc[j] -= yc[j];
	        }

	        // Remove trailing zeros.
	        for (; xc[--b] === 0; xc.pop()) {
	        }

	        // Remove leading zeros and adjust exponent accordingly.
	        for (; xc[0] === 0;) {
	            xc.shift();
	            --ye;
	        }

	        if (!xc[0]) {

	            // n - n = +0
	            y.s = 1;

	            // Result must be zero.
	            xc = [ye = 0];
	        }

	        y.c = xc;
	        y.e = ye;

	        return y;
	    };


	    /*
	     * Return a new Big whose value is the value of this Big modulo the
	     * value of Big y.
	     */
	    P.mod = function (y) {
	        var yGTx,
	            x = this,
	            Big = x.constructor,
	            a = x.s,
	            b = (y = new Big(y)).s;

	        if (!y.c[0]) {
	            throwErr(NaN);
	        }

	        x.s = y.s = 1;
	        yGTx = y.cmp(x) == 1;
	        x.s = a;
	        y.s = b;

	        if (yGTx) {
	            return new Big(x);
	        }

	        a = Big.DP;
	        b = Big.RM;
	        Big.DP = Big.RM = 0;
	        x = x.div(y);
	        Big.DP = a;
	        Big.RM = b;

	        return this.minus( x.times(y) );
	    };


	    /*
	     * Return a new Big whose value is the value of this Big plus the value
	     * of Big y.
	     */
	    P.add = P.plus = function (y) {
	        var t,
	            x = this,
	            Big = x.constructor,
	            a = x.s,
	            b = (y = new Big(y)).s;

	        // Signs differ?
	        if (a != b) {
	            y.s = -b;
	            return x.minus(y);
	        }

	        var xe = x.e,
	            xc = x.c,
	            ye = y.e,
	            yc = y.c;

	        // Either zero?
	        if (!xc[0] || !yc[0]) {

	            // y is non-zero? x is non-zero? Or both are zero.
	            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
	        }
	        xc = xc.slice();

	        // Prepend zeros to equalise exponents.
	        // Note: Faster to use reverse then do unshifts.
	        if (a = xe - ye) {

	            if (a > 0) {
	                ye = xe;
	                t = yc;
	            } else {
	                a = -a;
	                t = xc;
	            }

	            t.reverse();
	            for (; a--; t.push(0)) {
	            }
	            t.reverse();
	        }

	        // Point xc to the longer array.
	        if (xc.length - yc.length < 0) {
	            t = yc;
	            yc = xc;
	            xc = t;
	        }
	        a = yc.length;

	        /*
	         * Only start adding at yc.length - 1 as the further digits of xc can be
	         * left as they are.
	         */
	        for (b = 0; a;) {
	            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
	            xc[a] %= 10;
	        }

	        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

	        if (b) {
	            xc.unshift(b);
	            ++ye;
	        }

	         // Remove trailing zeros.
	        for (a = xc.length; xc[--a] === 0; xc.pop()) {
	        }

	        y.c = xc;
	        y.e = ye;

	        return y;
	    };


	    /*
	     * Return a Big whose value is the value of this Big raised to the power n.
	     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
	     * places using rounding mode Big.RM.
	     *
	     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
	     */
	    P.pow = function (n) {
	        var x = this,
	            one = new x.constructor(1),
	            y = one,
	            isNeg = n < 0;

	        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
	            throwErr('!pow!');
	        }

	        n = isNeg ? -n : n;

	        for (;;) {

	            if (n & 1) {
	                y = y.times(x);
	            }
	            n >>= 1;

	            if (!n) {
	                break;
	            }
	            x = x.times(x);
	        }

	        return isNeg ? one.div(y) : y;
	    };


	    /*
	     * Return a new Big whose value is the value of this Big rounded to a
	     * maximum of dp decimal places using rounding mode rm.
	     * If dp is not specified, round to 0 decimal places.
	     * If rm is not specified, use Big.RM.
	     *
	     * [dp] {number} Integer, 0 to MAX_DP inclusive.
	     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
	     */
	    P.round = function (dp, rm) {
	        var x = this,
	            Big = x.constructor;

	        if (dp == null) {
	            dp = 0;
	        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
	            throwErr('!round!');
	        }
	        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

	        return x;
	    };


	    /*
	     * Return a new Big whose value is the square root of the value of this Big,
	     * rounded, if necessary, to a maximum of Big.DP decimal places using
	     * rounding mode Big.RM.
	     */
	    P.sqrt = function () {
	        var estimate, r, approx,
	            x = this,
	            Big = x.constructor,
	            xc = x.c,
	            i = x.s,
	            e = x.e,
	            half = new Big('0.5');

	        // Zero?
	        if (!xc[0]) {
	            return new Big(x);
	        }

	        // If negative, throw NaN.
	        if (i < 0) {
	            throwErr(NaN);
	        }

	        // Estimate.
	        i = Math.sqrt(x.toString());

	        // Math.sqrt underflow/overflow?
	        // Pass x to Math.sqrt as integer, then adjust the result exponent.
	        if (i === 0 || i === 1 / 0) {
	            estimate = xc.join('');

	            if (!(estimate.length + e & 1)) {
	                estimate += '0';
	            }

	            r = new Big( Math.sqrt(estimate).toString() );
	            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
	        } else {
	            r = new Big(i.toString());
	        }

	        i = r.e + (Big.DP += 4);

	        // Newton-Raphson iteration.
	        do {
	            approx = r;
	            r = half.times( approx.plus( x.div(approx) ) );
	        } while ( approx.c.slice(0, i).join('') !==
	                       r.c.slice(0, i).join('') );

	        rnd(r, Big.DP -= 4, Big.RM);

	        return r;
	    };


	    /*
	     * Return a new Big whose value is the value of this Big times the value of
	     * Big y.
	     */
	    P.mul = P.times = function (y) {
	        var c,
	            x = this,
	            Big = x.constructor,
	            xc = x.c,
	            yc = (y = new Big(y)).c,
	            a = xc.length,
	            b = yc.length,
	            i = x.e,
	            j = y.e;

	        // Determine sign of result.
	        y.s = x.s == y.s ? 1 : -1;

	        // Return signed 0 if either 0.
	        if (!xc[0] || !yc[0]) {
	            return new Big(y.s * 0);
	        }

	        // Initialise exponent of result as x.e + y.e.
	        y.e = i + j;

	        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
	        if (a < b) {
	            c = xc;
	            xc = yc;
	            yc = c;
	            j = a;
	            a = b;
	            b = j;
	        }

	        // Initialise coefficient array of result with zeros.
	        for (c = new Array(j = a + b); j--; c[j] = 0) {
	        }

	        // Multiply.

	        // i is initially xc.length.
	        for (i = b; i--;) {
	            b = 0;

	            // a is yc.length.
	            for (j = a + i; j > i;) {

	                // Current sum of products at this digit position, plus carry.
	                b = c[j] + yc[i] * xc[j - i - 1] + b;
	                c[j--] = b % 10;

	                // carry
	                b = b / 10 | 0;
	            }
	            c[j] = (c[j] + b) % 10;
	        }

	        // Increment result exponent if there is a final carry.
	        if (b) {
	            ++y.e;
	        }

	        // Remove any leading zero.
	        if (!c[0]) {
	            c.shift();
	        }

	        // Remove trailing zeros.
	        for (i = c.length; !c[--i]; c.pop()) {
	        }
	        y.c = c;

	        return y;
	    };


	    /*
	     * Return a string representing the value of this Big.
	     * Return exponential notation if this Big has a positive exponent equal to
	     * or greater than Big.E_POS, or a negative exponent equal to or less than
	     * Big.E_NEG.
	     */
	    P.toString = P.valueOf = P.toJSON = function () {
	        var x = this,
	            Big = x.constructor,
	            e = x.e,
	            str = x.c.join(''),
	            strL = str.length;

	        // Exponential notation?
	        if (e <= Big.E_NEG || e >= Big.E_POS) {
	            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
	              (e < 0 ? 'e' : 'e+') + e;

	        // Negative exponent?
	        } else if (e < 0) {

	            // Prepend zeros.
	            for (; ++e; str = '0' + str) {
	            }
	            str = '0.' + str;

	        // Positive exponent?
	        } else if (e > 0) {

	            if (++e > strL) {

	                // Append zeros.
	                for (e -= strL; e-- ; str += '0') {
	                }
	            } else if (e < strL) {
	                str = str.slice(0, e) + '.' + str.slice(e);
	            }

	        // Exponent zero.
	        } else if (strL > 1) {
	            str = str.charAt(0) + '.' + str.slice(1);
	        }

	        // Avoid '-0'
	        return x.s < 0 && x.c[0] ? '-' + str : str;
	    };


	    /*
	     ***************************************************************************
	     * If toExponential, toFixed, toPrecision and format are not required they
	     * can safely be commented-out or deleted. No redundant code will be left.
	     * format is used only by toExponential, toFixed and toPrecision.
	     ***************************************************************************
	     */


	    /*
	     * Return a string representing the value of this Big in exponential
	     * notation to dp fixed decimal places and rounded, if necessary, using
	     * Big.RM.
	     *
	     * [dp] {number} Integer, 0 to MAX_DP inclusive.
	     */
	    P.toExponential = function (dp) {

	        if (dp == null) {
	            dp = this.c.length - 1;
	        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
	            throwErr('!toExp!');
	        }

	        return format(this, dp, 1);
	    };


	    /*
	     * Return a string representing the value of this Big in normal notation
	     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
	     *
	     * [dp] {number} Integer, 0 to MAX_DP inclusive.
	     */
	    P.toFixed = function (dp) {
	        var str,
	            x = this,
	            Big = x.constructor,
	            neg = Big.E_NEG,
	            pos = Big.E_POS;

	        // Prevent the possibility of exponential notation.
	        Big.E_NEG = -(Big.E_POS = 1 / 0);

	        if (dp == null) {
	            str = x.toString();
	        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
	            str = format(x, x.e + dp);

	            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
	            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
	            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
	        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
	                str = '-' + str;
	            }
	        }
	        Big.E_NEG = neg;
	        Big.E_POS = pos;

	        if (!str) {
	            throwErr('!toFix!');
	        }

	        return str;
	    };


	    /*
	     * Return a string representing the value of this Big rounded to sd
	     * significant digits using Big.RM. Use exponential notation if sd is less
	     * than the number of digits necessary to represent the integer part of the
	     * value in normal notation.
	     *
	     * sd {number} Integer, 1 to MAX_DP inclusive.
	     */
	    P.toPrecision = function (sd) {

	        if (sd == null) {
	            return this.toString();
	        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
	            throwErr('!toPre!');
	        }

	        return format(this, sd - 1, 2);
	    };


	    // Export


	    Big = bigFactory();

	    //AMD.
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return Big;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	    // Node and other CommonJS-like environments that support module.exports.
	    } else if (typeof module !== 'undefined' && module.exports) {
	        module.exports = Big;

	    //Browser.
	    } else {
	        global.Big = Big;
	    }
	})(this);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(14)

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = __webpack_require__(16)

	exports.createHmac = __webpack_require__(28)

	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}

	var p = __webpack_require__(29)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync


	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(11)
	var ieee754 = __webpack_require__(12)
	var isArray = __webpack_require__(13)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer, (function() { return this; }())))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 12 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(15)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(10).Buffer))

/***/ },
/* 15 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(17)

	var md5 = toConstructor(__webpack_require__(25))
	var rmd160 = toConstructor(__webpack_require__(27))

	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}

	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}

	var Buffer = __webpack_require__(10).Buffer
	var Hash   = __webpack_require__(18)(Buffer)

	exports.sha1 = __webpack_require__(19)(Buffer, Hash)
	exports.sha256 = __webpack_require__(23)(Buffer, Hash)
	exports.sha512 = __webpack_require__(24)(Buffer, Hash)


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = function (Buffer) {

	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }

	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }

	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }

	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block

	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)

	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }

	      s += ch
	      f += ch

	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s

	    return this
	  }

	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8

	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80

	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)

	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }

	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)

	    var hash = this._update(this._block) || this._hash()

	    return enc ? hash.toString(enc) : hash
	  }

	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }

	  return Hash
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(20).inherits

	module.exports = function (Buffer, Hash) {

	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0

	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

	  var POOL = []

	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()

	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)

	    this._h = null
	    this.init()
	  }

	  inherits(Sha1, Hash)

	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0

	    Hash.prototype.init.call(this)
	    return this
	  }

	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {

	    var a, b, c, d, e, _a, _b, _c, _d, _e

	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e

	    var w = this._w

	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )

	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }

	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }

	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }

	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }

	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }

	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }

	  return Sha1
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(21);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(22);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(1)))

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 22 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(20).inherits

	module.exports = function (Buffer, Hash) {

	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]

	  var W = new Array(64)

	  function Sha256() {
	    this.init()

	    this._w = W //new Array(64)

	    Hash.call(this, 16*4, 14*4)
	  }

	  inherits(Sha256, Hash)

	  Sha256.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }

	  function R (X, n) {
	    return (X >>> n);
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }

	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }

	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }

	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }

	  Sha256.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }

	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0

	  };

	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)

	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)

	    return H
	  }

	  return Sha256

	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(20).inherits

	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]

	  var W = new Array(160)

	  function Sha512() {
	    this.init()
	    this._w = W

	    Hash.call(this, 128, 112)
	  }

	  inherits(Sha512, Hash)

	  Sha512.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  Sha512.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0

	    for (var i = 0; i < 80; i++) {
	      var j = i * 2

	      var Wi, Wil

	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]

	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]

	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

	        W[j] = Wi
	        W[j + 1] = Wil
	      }

	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)

	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]

	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)

	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }

	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0

	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }

	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)

	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }

	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)

	    return H
	  }

	  return Sha512

	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(26);

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};

	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};

	var processBlock = function (H, M, offset) {

	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];

	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }

	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;

	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;

	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};

	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}

	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}

	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}

	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}

	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}

	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}

	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');

	  var m = bytesToWords(message);

	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;

	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );

	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }

	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];

	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }

	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(16)

	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)

	module.exports = Hmac

	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg

	  var blocksize = (alg === 'sha512') ? 128 : 64

	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)

	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = createHash(alg).update(ipad)
	}

	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}

	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(30)

	module.exports = function (crypto, exports) {
	  exports = exports || {}

	  var exported = pbkdf2Export(crypto)

	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync

	  return exports
	}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }

	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')

	    setTimeout(function() {
	      var result

	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }

	      callback(undefined, result)
	    })
	  }

	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')

	    if (iterations < 0)
	      throw new TypeError('Bad iterations')

	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')

	    if (keylen < 0)
	      throw new TypeError('Bad key length')

	    digest = digest || 'sha1'

	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)

	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)

	      var U = crypto.createHmac(digest, password).update(block1).digest()

	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen

	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }

	      U.copy(T, 0, 0, hLen)

	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()

	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }

	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }

	    return DK
	  }

	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function (val) {
		if (val === null || val === undefined) {
			return [];
		}

		return Array.isArray(val) ? val : [val];
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// This file serves as a hacky workaround for the lack of "resolveSync" support in webpack.
	// We make our own resolver using a sync file system but using the same plugins & options
	// that webpack does.
	///<reference path="typings/node/node.d.ts" />
	var Resolver = __webpack_require__(34);
	var SyncNodeJsInputFileSystem = __webpack_require__(39);
	var CachedInputFileSystem = __webpack_require__(62);
	var UnsafeCachePlugin = __webpack_require__(63);
	var ModulesInDirectoriesPlugin = __webpack_require__(64);
	var ModulesInRootPlugin = __webpack_require__(66);
	var ModuleAsFilePlugin = __webpack_require__(67);
	var ModuleAsDirectoryPlugin = __webpack_require__(68);
	var ModuleAliasPlugin = __webpack_require__(69);
	var DirectoryDefaultFilePlugin = __webpack_require__(70);
	var DirectoryDescriptionFilePlugin = __webpack_require__(71);
	var DirectoryDescriptionFileFieldAliasPlugin = __webpack_require__(72);
	var FileAppendPlugin = __webpack_require__(73);
	var ResultSymlinkPlugin = __webpack_require__(74);
	function makeRootPlugin(name, root) {
	    if (typeof root === "string")
	        return new ModulesInRootPlugin(name, root);
	    else if (Array.isArray(root)) {
	        return function () {
	            root.forEach(function (root) {
	                this.apply(new ModulesInRootPlugin(name, root));
	            }, this);
	        };
	    }
	    return function () { };
	}
	function makeResolver(options) {
	    var fileSystem = new CachedInputFileSystem(new SyncNodeJsInputFileSystem(), 60000);
	    var resolver = new Resolver(fileSystem);
	    // apply the same plugins that webpack does, see webpack/lib/WebpackOptionsApply.js
	    resolver.apply(new UnsafeCachePlugin(options.resolve.unsafeCache), options.resolve.packageAlias ? new DirectoryDescriptionFileFieldAliasPlugin("package.json", options.resolve.packageAlias) : function () { }, new ModuleAliasPlugin(options.resolve.alias), makeRootPlugin("module", options.resolve.root), new ModulesInDirectoriesPlugin("module", options.resolve.modulesDirectories), makeRootPlugin("module", options.resolve.fallback), new ModuleAsFilePlugin("module"), new ModuleAsDirectoryPlugin("module"), new DirectoryDescriptionFilePlugin("package.json", options.resolve.packageMains), new DirectoryDefaultFilePlugin(["index"]), new FileAppendPlugin(options.resolve.extensions), new ResultSymlinkPlugin());
	    return resolver;
	}
	module.exports = makeResolver;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var Tapable = __webpack_require__(35);
	var createInnerCallback = __webpack_require__(36);

	function Resolver(fileSystem) {
		Tapable.call(this);
		this.fileSystem = fileSystem;
	}
	module.exports = Resolver;

	Resolver.prototype = Object.create(Tapable.prototype);

	Resolver.prototype.resolveSync = function resolveSync(context, request) {
		var err, result, sync = false;
		this.resolve(context, request, function(e, r) {
			err = e;
			result = r;
			sync = true;
		});
		if(!sync) throw new Error("Cannot 'resolveSync' because the fileSystem is not sync. Use 'resolve'!");
		if(err) throw err;
		return result;
	};

	Resolver.prototype.resolve = function resolve(context, request, callback) {
		if(typeof request === "string") request = this.parse(request);
		this.applyPlugins("resolve", context, request);
		var obj = {
			path: context,
			request: request.path,
			query: request.query,
			directory: request.directory
		};
		function onResolved(err, result) {
			if(err) return callback(err);
			return callback(null, result.path === false ? false : result.path + (result.query || ""));
		}
		onResolved.log = callback.log;
		onResolved.missing = callback.missing;
		if(request.module) return this.doResolve("module", obj, onResolved);
		if(request.directory) return this.doResolve("directory", obj, onResolved);
		return this.doResolve(["file", "directory"], obj, onResolved);
	};

	Resolver.prototype.doResolve = function doResolve(types, request, callback, noError) {
		if(!Array.isArray(types)) types = [types];
		var stackLine = types.join(" or ") + ": (" + request.path + ") " +
			(request.request || "") + (request.query || "") +
			(request.directory ? " directory" : "") +
			(request.module ? " module" : "");
		var newStack = [stackLine];
		if(callback.stack) {
			newStack = callback.stack.concat(newStack);
			if(callback.stack.indexOf(stackLine) >= 0) {
				// Prevent recursion
				var recursionError = new Error("Recursion in resolving\nStack:\n  " + newStack.join("\n  "));
				recursionError.recursion = true;
				if(callback.log) callback.log("abort resolving because of recursion");
				return callback(recursionError);
			}
		}
		this.applyPlugins("resolve-step", types, request);
		var localMissing = [];
		var missing = callback.missing ? {
			push: function(item) {
				callback.missing.push(item);
				localMissing.push(item);
			}
		} : localMissing;
		var log = [];
		function writeLog(msg) {
			log.push(msg);
		}
		function logAsString() {
			return log.join("\n");
		}
		var currentRequestString = request.request ? request.request + " in " + request.path : request.path;
		if(types.length == 1 && !noError) {
			// If only one type, we can pass the error.
			return this.applyPluginsParallelBailResult(types[0], request, createInnerCallback(function innerCallback(err, result) {
				if(callback.log) {
					for(var i = 0; i < log.length; i++)
						callback.log(log[i]);
				}
				if(err) return callback(err);
				if(result) return callback(null, result);
				if(types[0] === "result") return callback(null, request);
				var error = new Error("Cannot resolve " + types[0] + " '" + request.request + "' in " + request.path);
				error.details = logAsString();
				error.missing = localMissing;
				return callback(error);
			}, {
				log: writeLog,
				missing: missing,
				stack: newStack
			}, "resolve " + types[0] + " " + currentRequestString));
		}
		// For multiple type we list the errors in the details although some of them are not important
		this.forEachBail(types, function(type, callback) {
			this.applyPluginsParallelBailResult(type, request, createInnerCallback(function(err, result) {
				if(!err && result) return callback(result);
				if (err) {
					(err.message || "").split("\n").forEach(function(line) {
						log.push("  " + line);
					});
				}
				callback();
			}, {
				log: writeLog,
				missing: missing,
				stack: newStack
			}, "resolve " + type));
		}.bind(this), function(result) {
			if(callback.log) {
				callback.log("resolve '" + types.join("' or '") + "' " + currentRequestString);
				for(var i = 0; i < log.length; i++)
					callback.log("  " + log[i]);
			}
			if(noError && !result) return callback();
			if(result) return callback(null, result);
			var error = new Error("Cannot resolve '" + types.join("' or '") + "' " + currentRequestString);
			error.details = logAsString();
			error.missing = localMissing;
			return callback(error);
		});
	};

	Resolver.prototype.parse = function parse(identifier) {
		if(identifier === "") return null;
		var part = {
			path: null,
			query: null,
			module: false,
			directory: false,
			file: false
		};
		var idxQuery = identifier.indexOf("?");
		if(idxQuery == 0) {
			part.query = identifier;
		} else if(idxQuery > 0) {
			part.path = identifier.slice(0, idxQuery);
			part.query = identifier.slice(idxQuery);
		} else {
			part.path = identifier;
		}
		if(part.path) {
			part.module = this.isModule(part.path);
			if(part.directory = this.isDirectory(part.path)) {
				part.path = part.path.substr(0, part.path.length - 1);
			}
		}
		return part;
	};

	var notModuleRegExp = /^\.$|^\.[\\\/]|^\.\.$|^\.\.[\/\\]|^\/|^[A-Z]:[\\\/]/i;
	Resolver.prototype.isModule = function isModule(path) {
		return !notModuleRegExp.test(path);
	};

	var directoryRegExp = /[\/\\]$/i;
	Resolver.prototype.isDirectory = function isDirectory(path) {
		return directoryRegExp.test(path);
	};

	Resolver.prototype.join = __webpack_require__(37);

	Resolver.prototype.normalize = __webpack_require__(38);

	Resolver.prototype.forEachBail = function(array, iterator, callback) {
		if(array.length == 0) return callback();
		var currentPos = array.length;
		var currentError, currentResult;
		var done = [];
		for(var i = 0; i < array.length; i++) {
			var itCb = (function(i) {
				return function() {
					if(i >= currentPos) return; // ignore
					var args = Array.prototype.slice.call(arguments);
					done.push(i);
					if(args.length > 0) {
						currentPos = i + 1;
						done = done.filter(function(item) {
							return item <= i;
						});
						currentResult = args;
					}
					if(done.length == currentPos) {
						callback.apply(null, currentResult);
						currentPos = 0;
					}
				};
			}(i));
			iterator(array[i], itCb);
			if(currentPos == 0) break;
		}
	};



/***/ },
/* 35 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	function Tapable() {
		this._plugins = {};
	}
	module.exports = Tapable;

	function copyProperties(from, to) {
		for(var key in from)
			to[key] = from[key];
		return to;
	}

	Tapable.mixin = function mixinTapable(pt) {
		copyProperties(Tapable.prototype, pt);
	}

	Tapable.prototype.applyPlugins = function applyPlugins(name) {
		if(!this._plugins[name]) return;
		var args = Array.prototype.slice.call(arguments, 1);
		var plugins = this._plugins[name];
		var old = this._currentPluginApply;
		for(this._currentPluginApply = 0; this._currentPluginApply < plugins.length; this._currentPluginApply++)
			plugins[this._currentPluginApply].apply(this, args);
		this._currentPluginApply = old;
	};

	Tapable.prototype.applyPluginsWaterfall = function applyPlugins(name, init) {
		if(!this._plugins[name]) return init;
		var args = Array.prototype.slice.call(arguments, 2);
		var plugins = this._plugins[name];
		var current = init;
		var old = this._currentPluginApply;
		for(this._currentPluginApply = 0; this._currentPluginApply < plugins.length; this._currentPluginApply++)
			current = plugins[this._currentPluginApply].apply(this, [current].concat(args));
		this._currentPluginApply = old;
		return current;
	};

	Tapable.prototype.applyPluginsBailResult = function applyPluginsBailResult(name) {
		if(!this._plugins[name]) return;
		var args = Array.prototype.slice.call(arguments, 1);
		var plugins = this._plugins[name];
		var old = this._currentPluginApply
		for(this._currentPluginApply = 0; this._currentPluginApply < plugins.length; this._currentPluginApply++) {
			var result = plugins[this._currentPluginApply].apply(this, args);
			if(typeof result !== "undefined") {
				this._currentPluginApply = old;
				return result;
			}
		}
		this._currentPluginApply = old;
	};

	Tapable.prototype.applyPluginsAsyncSeries = Tapable.prototype.applyPluginsAsync = function applyPluginsAsync(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callback = args.pop();
		if(!this._plugins[name] || this._plugins[name].length == 0) return callback();
		var plugins = this._plugins[name];
		var i = 0;
		args.push(copyProperties(callback, function next(err) {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].apply(this, args);
		}.bind(this)));
		plugins[0].apply(this, args);
	};

	Tapable.prototype.applyPluginsAsyncWaterfall = function applyPluginsAsyncWaterfall(name, init, callback) {
		if(!this._plugins[name] || this._plugins[name].length == 0) return callback(null, init);
		var plugins = this._plugins[name];
		var i = 0;
		var next = copyProperties(callback, function(err, value) {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback(null, value);
			}
			plugins[i].call(this, value, next);
		}.bind(this));
		plugins[0].call(this, init, next);
	};

	Tapable.prototype.applyPluginsParallel = function applyPluginsParallel(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callback = args.pop();
		if(!this._plugins[name] || this._plugins[name].length == 0) return callback();
		var plugins = this._plugins[name];
		var remaining = plugins.length;
		args.push(copyProperties(callback, function(err) {
			if(remaining < 0) return; // ignore
			if(err) {
				remaining = -1;
				return callback(err);
			}
			remaining--;
			if(remaining == 0) {
				return callback();
			}
		}));
		for(var i = 0; i < plugins.length; i++) {
			plugins[i].apply(this, args);
			if(remaining < 0) return;
		}
	};

	Tapable.prototype.applyPluginsParallelBailResult = function applyPluginsParallelBailResult(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callback = args[args.length-1];
		if(!this._plugins[name] || this._plugins[name].length == 0) return callback();
		var plugins = this._plugins[name];
		var currentPos = plugins.length;
		var currentError, currentResult;
		var done = [];
		for(var i = 0; i < plugins.length; i++) {
			args[args.length-1] = (function(i) {
				return copyProperties(callback, function(err, result) {
					if(i >= currentPos) return; // ignore
					done.push(i);
					if(err || result) {
						currentPos = i + 1;
						done = done.filter(function(item) {
							return item <= i;
						});
						currentError = err;
						currentResult = result;
					}
					if(done.length == currentPos) {
						callback(currentError, currentResult);
						currentPos = 0;
					}
				});
			}(i));
			plugins[i].apply(this, args);
		}
	};


	Tapable.prototype.restartApplyPlugins = function restartApplyPlugins() {
		if(typeof this._currentPluginApply !== "number")
			throw new Error("Tapable.prototype.restartApplyPlugins can only be used inside of any sync plugins application");
		this._currentPluginApply = -1;
	};


	Tapable.prototype.plugin = function plugin(name, fn) {
		if(Array.isArray(name)) {
			name.forEach(function(name) {
				this.plugin(name, fn);
			}, this);
			return;
		}
		if(!this._plugins[name]) this._plugins[name] = [fn];
		else this._plugins[name].push(fn);
	};

	Tapable.prototype.apply = function apply() {
		for(var i = 0; i < arguments.length; i++) {
			arguments[i].apply(this);
		}
	};


/***/ },
/* 36 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function createInnerCallback(callback, options, message) {
		var log = options.log;
		if(!log) {
			if(options.stack !== callback.stack) {
				function callbackWrapper() {
					return callback.apply(this, arguments);
				}
				callbackWrapper.stack = options.stack;
				callbackWrapper.missing = options.missing;
			}
			return callback;
		}
		function loggingCallbackWrapper() {
			log(message);
			for(var i = 0; i < theLog.length; i++)
				log("  " + theLog[i]);
			return callback.apply(this, arguments);
		}
		var theLog = [];
		loggingCallbackWrapper.log = function writeLog(msg) {
			theLog.push(msg);
		};
		loggingCallbackWrapper.stack = options.stack;
		loggingCallbackWrapper.missing = options.missing;
		return loggingCallbackWrapper;
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var normalize = __webpack_require__(38);

	var absoluteWinRegExp = /^[A-Z]:([\\\/]|$)/i;
	var absoluteNixRegExp = /^\//i;

	module.exports = function join(path, request) {
		if(request == "") return normalize(path);
		if(absoluteWinRegExp.test(request)) return normalize(request.replace(/\//g, "\\"));
		if(absoluteNixRegExp.test(request)) return normalize(request);
		if(path == "/") return normalize(path + request);
		if(absoluteWinRegExp.test(path)) return normalize(path + "\\" + request.replace(/\//g, "\\"));
		if(absoluteNixRegExp.test(path)) return normalize(path + "/" + request);
		return normalize(path + "/" + request);
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	var doubleSlashWinRegExp = /\\+/g;
	var doubleSlashNixRegExp = /\/+/g;
	var currentDirectoryWinMiddleRegExp = /\\(\.\\)+/;
	var currentDirectoryWinEndRegExp = /\\\.$/;
	var parentDirectoryWinMiddleRegExp = /\\+[^\\]+\\+\.\.\\/;
	var parentDirectoryWinEndRegExp1 = /([A-Z]:\\)\\*[^\\]+\\+\.\.$/i;
	var parentDirectoryWinEndRegExp2 = /\\+[^\\]+\\+\.\.$/;
	var currentDirectoryNixMiddleRegExp = /\/+(\.\/)+/;
	var currentDirectoryNixEndRegExp1 = /^\/+\.$/;
	var currentDirectoryNixEndRegExp2 = /\/+\.$/;
	var parentDirectoryNixMiddleRegExp = /(^|\/[^\/]+)\/+\.\.\/+/;
	var parentDirectoryNixEndRegExp1 = /^\/[^\/]+\/+\.\.$/;
	var parentDirectoryNixEndRegExp2 = /\/+[^\/]+\/+\.\.$/;
	var parentDirectoryNixEndRegExp3 = /^\/+\.\.$/;

	// RegExp magic :)

	module.exports = function normalize(path) {
		while(currentDirectoryWinMiddleRegExp.test(path))
			path = path.replace(currentDirectoryWinMiddleRegExp, "\\");
		path = path.replace(currentDirectoryWinEndRegExp, "");
		while(parentDirectoryWinMiddleRegExp.test(path))
			path = path.replace(parentDirectoryWinMiddleRegExp, "\\");
		path = path.replace(parentDirectoryWinEndRegExp1, "$1");
		path = path.replace(parentDirectoryWinEndRegExp2, "");

		while(currentDirectoryNixMiddleRegExp.test(path))
			path = path.replace(currentDirectoryNixMiddleRegExp, "/");
		path = path.replace(currentDirectoryNixEndRegExp1, "/");
		path = path.replace(currentDirectoryNixEndRegExp2, "");
		while(parentDirectoryNixMiddleRegExp.test(path))
			path = path.replace(parentDirectoryNixMiddleRegExp, "/");
		path = path.replace(parentDirectoryNixEndRegExp1, "/");
		path = path.replace(parentDirectoryNixEndRegExp2, "");
		path = path.replace(parentDirectoryNixEndRegExp3, "/");

		return path.replace(doubleSlashWinRegExp, "\\").replace(doubleSlashNixRegExp, "/");
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var fs = __webpack_require__(40);

	function SyncNodeJsInputFileSystem() {}
	module.exports = SyncNodeJsInputFileSystem;

	SyncNodeJsInputFileSystem.prototype.isSync = function() {
		return true;
	};

	function asAsync(fn, context) {
		return function() {
			var args = Array.prototype.slice.call(arguments);
			var callback = args.pop();
			try {
				callback(null, fn.apply(context, args));
			} catch(e) {
				callback(e);
			}
		};
	}

	SyncNodeJsInputFileSystem.prototype.stat = asAsync(fs.statSync, fs);
	SyncNodeJsInputFileSystem.prototype.readdir = asAsync(function readdirSync(path) {
		var files = fs.readdirSync(path);
		return files && files.map(function (file) {
			return file.normalize ? file.normalize("NFC") : file;
		});
	}, fs);
	SyncNodeJsInputFileSystem.prototype.readFile = asAsync(fs.readFileSync, fs);
	SyncNodeJsInputFileSystem.prototype.readlink = asAsync(fs.readlinkSync, fs);

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var fs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"fs\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var polyfills = __webpack_require__(41)
	var legacy = __webpack_require__(44)
	var queue = []

	var util = __webpack_require__(20)

	function noop () {}

	var debug = noop
	if (util.debuglog)
	  debug = util.debuglog('gfs4')
	else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
	  debug = function() {
	    var m = util.format.apply(util, arguments)
	    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ')
	    console.error(m)
	  }

	if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
	  process.on('exit', function() {
	    debug(queue)
	    __webpack_require__(61).equal(queue.length, 0)
	  })
	}

	module.exports = patch(__webpack_require__(42))
	if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH) {
	  module.exports = patch(fs)
	}

	// Always patch fs.close/closeSync, because we want to
	// retry() whenever a close happens *anywhere* in the program.
	// This is essential when multiple graceful-fs instances are
	// in play at the same time.
	module.exports.close =
	fs.close = (function (fs$close) { return function (fd, cb) {
	  return fs$close.call(fs, fd, function (err) {
	    if (!err)
	      retry()

	    if (typeof cb === 'function')
	      cb.apply(this, arguments)
	  })
	}})(fs.close)

	module.exports.closeSync =
	fs.closeSync = (function (fs$closeSync) { return function (fd) {
	  // Note that graceful-fs also retries when fs.closeSync() fails.
	  // Looks like a bug to me, although it's probably a harmless one.
	  var rval = fs$closeSync.apply(fs, arguments)
	  retry()
	  return rval
	}})(fs.closeSync)

	function patch (fs) {
	  // Everything that references the open() function needs to be in here
	  polyfills(fs)
	  fs.gracefulify = patch
	  fs.FileReadStream = ReadStream;  // Legacy name.
	  fs.FileWriteStream = WriteStream;  // Legacy name.
	  fs.createReadStream = createReadStream
	  fs.createWriteStream = createWriteStream
	  var fs$readFile = fs.readFile
	  fs.readFile = readFile
	  function readFile (path, options, cb) {
	    if (typeof options === 'function')
	      cb = options, options = null

	    return go$readFile(path, options, cb)

	    function go$readFile (path, options, cb) {
	      return fs$readFile(path, options, function (err) {
	        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
	          enqueue([go$readFile, [path, options, cb]])
	        else {
	          if (typeof cb === 'function')
	            cb.apply(this, arguments)
	          retry()
	        }
	      })
	    }
	  }

	  var fs$writeFile = fs.writeFile
	  fs.writeFile = writeFile
	  function writeFile (path, data, options, cb) {
	    if (typeof options === 'function')
	      cb = options, options = null

	    return go$writeFile(path, data, options, cb)

	    function go$writeFile (path, data, options, cb) {
	      return fs$writeFile(path, data, options, function (err) {
	        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
	          enqueue([go$writeFile, [path, data, options, cb]])
	        else {
	          if (typeof cb === 'function')
	            cb.apply(this, arguments)
	          retry()
	        }
	      })
	    }
	  }

	  var fs$appendFile = fs.appendFile
	  if (fs$appendFile)
	    fs.appendFile = appendFile
	  function appendFile (path, data, options, cb) {
	    if (typeof options === 'function')
	      cb = options, options = null

	    return go$appendFile(path, data, options, cb)

	    function go$appendFile (path, data, options, cb) {
	      return fs$appendFile(path, data, options, function (err) {
	        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
	          enqueue([go$appendFile, [path, data, options, cb]])
	        else {
	          if (typeof cb === 'function')
	            cb.apply(this, arguments)
	          retry()
	        }
	      })
	    }
	  }

	  var fs$readdir = fs.readdir
	  fs.readdir = readdir
	  function readdir (path, cb) {
	    return go$readdir(path, cb)

	    function go$readdir () {
	      return fs$readdir(path, function (err, files) {
	        if (files && files.sort)
	          files.sort();  // Backwards compatibility with graceful-fs.

	        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
	          enqueue([go$readdir, [path, cb]])
	        else {
	          if (typeof cb === 'function')
	            cb.apply(this, arguments)
	          retry()
	        }
	      })
	    }
	  }


	  if (process.version.substr(0, 4) === 'v0.8') {
	    var legStreams = legacy(fs)
	    ReadStream = legStreams.ReadStream
	    WriteStream = legStreams.WriteStream
	  }

	  var fs$ReadStream = fs.ReadStream
	  ReadStream.prototype = Object.create(fs$ReadStream.prototype)
	  ReadStream.prototype.open = ReadStream$open

	  var fs$WriteStream = fs.WriteStream
	  WriteStream.prototype = Object.create(fs$WriteStream.prototype)
	  WriteStream.prototype.open = WriteStream$open

	  fs.ReadStream = ReadStream
	  fs.WriteStream = WriteStream

	  function ReadStream (path, options) {
	    if (this instanceof ReadStream)
	      return fs$ReadStream.apply(this, arguments), this
	    else
	      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
	  }

	  function ReadStream$open () {
	    var that = this
	    open(that.path, that.flags, that.mode, function (err, fd) {
	      if (err) {
	        if (that.autoClose)
	          that.destroy()

	        that.emit('error', err)
	      } else {
	        that.fd = fd
	        that.emit('open', fd)
	        that.read()
	      }
	    })
	  }

	  function WriteStream (path, options) {
	    if (this instanceof WriteStream)
	      return fs$WriteStream.apply(this, arguments), this
	    else
	      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
	  }

	  function WriteStream$open () {
	    var that = this
	    open(that.path, that.flags, that.mode, function (err, fd) {
	      if (err) {
	        that.destroy()
	        that.emit('error', err)
	      } else {
	        that.fd = fd
	        that.emit('open', fd)
	      }
	    })
	  }

	  function createReadStream (path, options) {
	    return new ReadStream(path, options)
	  }

	  function createWriteStream (path, options) {
	    return new WriteStream(path, options)
	  }

	  var fs$open = fs.open
	  fs.open = open
	  function open (path, flags, mode, cb) {
	    if (typeof mode === 'function')
	      cb = mode, mode = null

	    return go$open(path, flags, mode, cb)

	    function go$open (path, flags, mode, cb) {
	      return fs$open(path, flags, mode, function (err, fd) {
	        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
	          enqueue([go$open, [path, flags, mode, cb]])
	        else {
	          if (typeof cb === 'function')
	            cb.apply(this, arguments)
	          retry()
	        }
	      })
	    }
	  }

	  return fs
	}

	function enqueue (elem) {
	  debug('ENQUEUE', elem[0].name, elem[1])
	  queue.push(elem)
	}

	function retry () {
	  var elem = queue.shift()
	  if (elem) {
	    debug('RETRY', elem[0].name, elem[1])
	    elem[0].apply(null, elem[1])
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var fs = __webpack_require__(42)
	var constants = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"constants\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))

	var origCwd = process.cwd
	var cwd = null
	process.cwd = function() {
	  if (!cwd)
	    cwd = origCwd.call(process)
	  return cwd
	}
	try {
	  process.cwd()
	} catch (er) {}

	var chdir = process.chdir
	process.chdir = function(d) {
	  cwd = null
	  chdir.call(process, d)
	}

	module.exports = patch

	function patch (fs) {
	  // (re-)implement some things that are known busted or missing.

	  // lchmod, broken prior to 0.6.2
	  // back-port the fix here.
	  if (constants.hasOwnProperty('O_SYMLINK') &&
	      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
	    patchLchmod(fs)
	  }

	  // lutimes implementation, or no-op
	  if (!fs.lutimes) {
	    patchLutimes(fs)
	  }

	  // https://github.com/isaacs/node-graceful-fs/issues/4
	  // Chown should not fail on einval or eperm if non-root.
	  // It should not fail on enosys ever, as this just indicates
	  // that a fs doesn't support the intended operation.

	  fs.chown = chownFix(fs.chown)
	  fs.fchown = chownFix(fs.fchown)
	  fs.lchown = chownFix(fs.lchown)

	  fs.chmod = chownFix(fs.chmod)
	  fs.fchmod = chownFix(fs.fchmod)
	  fs.lchmod = chownFix(fs.lchmod)

	  fs.chownSync = chownFixSync(fs.chownSync)
	  fs.fchownSync = chownFixSync(fs.fchownSync)
	  fs.lchownSync = chownFixSync(fs.lchownSync)

	  fs.chmodSync = chownFix(fs.chmodSync)
	  fs.fchmodSync = chownFix(fs.fchmodSync)
	  fs.lchmodSync = chownFix(fs.lchmodSync)

	  // if lchmod/lchown do not exist, then make them no-ops
	  if (!fs.lchmod) {
	    fs.lchmod = function (path, mode, cb) {
	      process.nextTick(cb)
	    }
	    fs.lchmodSync = function () {}
	  }
	  if (!fs.lchown) {
	    fs.lchown = function (path, uid, gid, cb) {
	      process.nextTick(cb)
	    }
	    fs.lchownSync = function () {}
	  }

	  // on Windows, A/V software can lock the directory, causing this
	  // to fail with an EACCES or EPERM if the directory contains newly
	  // created files.  Try again on failure, for up to 1 second.
	  if (process.platform === "win32") {
	    fs.rename = (function (fs$rename) { return function (from, to, cb) {
	      var start = Date.now()
	      fs$rename(from, to, function CB (er) {
	        if (er
	            && (er.code === "EACCES" || er.code === "EPERM")
	            && Date.now() - start < 1000) {
	          return fs$rename(from, to, CB)
	        }
	        if (cb) cb(er)
	      })
	    }})(fs.rename)
	  }

	  // if read() returns EAGAIN, then just try it again.
	  fs.read = (function (fs$read) { return function (fd, buffer, offset, length, position, callback_) {
	    var callback
	    if (callback_ && typeof callback_ === 'function') {
	      var eagCounter = 0
	      callback = function (er, _, __) {
	        if (er && er.code === 'EAGAIN' && eagCounter < 10) {
	          eagCounter ++
	          return fs$read.call(fs, fd, buffer, offset, length, position, callback)
	        }
	        callback_.apply(this, arguments)
	      }
	    }
	    return fs$read.call(fs, fd, buffer, offset, length, position, callback)
	  }})(fs.read)

	  fs.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
	    var eagCounter = 0
	    while (true) {
	      try {
	        return fs$readSync.call(fs, fd, buffer, offset, length, position)
	      } catch (er) {
	        if (er.code === 'EAGAIN' && eagCounter < 10) {
	          eagCounter ++
	          continue
	        }
	        throw er
	      }
	    }
	  }})(fs.readSync)
	}

	function patchLchmod (fs) {
	  fs.lchmod = function (path, mode, callback) {
	    callback = callback || noop
	    fs.open( path
	           , constants.O_WRONLY | constants.O_SYMLINK
	           , mode
	           , function (err, fd) {
	      if (err) {
	        callback(err)
	        return
	      }
	      // prefer to return the chmod error, if one occurs,
	      // but still try to close, and report closing errors if they occur.
	      fs.fchmod(fd, mode, function (err) {
	        fs.close(fd, function(err2) {
	          callback(err || err2)
	        })
	      })
	    })
	  }

	  fs.lchmodSync = function (path, mode) {
	    var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)

	    // prefer to return the chmod error, if one occurs,
	    // but still try to close, and report closing errors if they occur.
	    var threw = true
	    var ret
	    try {
	      ret = fs.fchmodSync(fd, mode)
	      threw = false
	    } finally {
	      if (threw) {
	        try {
	          fs.closeSync(fd)
	        } catch (er) {}
	      } else {
	        fs.closeSync(fd)
	      }
	    }
	    return ret
	  }
	}

	function patchLutimes (fs) {
	  if (constants.hasOwnProperty("O_SYMLINK")) {
	    fs.lutimes = function (path, at, mt, cb) {
	      fs.open(path, constants.O_SYMLINK, function (er, fd) {
	        cb = cb || noop
	        if (er) return cb(er)
	        fs.futimes(fd, at, mt, function (er) {
	          fs.close(fd, function (er2) {
	            return cb(er || er2)
	          })
	        })
	      })
	    }

	    fs.lutimesSync = function (path, at, mt) {
	      var fd = fs.openSync(path, constants.O_SYMLINK)
	      var ret
	      var threw = true
	      try {
	        ret = fs.futimesSync(fd, at, mt)
	        threw = false
	      } finally {
	        if (threw) {
	          try {
	            fs.closeSync(fd)
	          } catch (er) {}
	        } else {
	          fs.closeSync(fd)
	        }
	      }
	      return ret
	    }

	  } else {
	    fs.lutimes = function (_a, _b, _c, cb) { process.nextTick(cb) }
	    fs.lutimesSync = function () {}
	  }
	}

	function chownFix (orig) {
	  if (!orig) return orig
	  return function (target, uid, gid, cb) {
	    return orig.call(fs, target, uid, gid, function (er, res) {
	      if (chownErOk(er)) er = null
	      cb(er, res)
	    })
	  }
	}

	function chownFixSync (orig) {
	  if (!orig) return orig
	  return function (target, uid, gid) {
	    try {
	      return orig.call(fs, target, uid, gid)
	    } catch (er) {
	      if (!chownErOk(er)) throw er
	    }
	  }
	}

	// ENOSYS means that the fs doesn't support the op. Just ignore
	// that, because it doesn't matter.
	//
	// if there's no getuid, or if getuid() is something other
	// than 0, and the error is EINVAL or EPERM, then just ignore
	// it.
	//
	// This specific case is a silent failure in cp, install, tar,
	// and most other unix tools that manage permissions.
	//
	// When running as root, or if other types of errors are
	// encountered, then it's strict.
	function chownErOk (er) {
	  if (!er)
	    return true

	  if (er.code === "ENOSYS")
	    return true

	  var nonroot = !process.getuid || process.getuid() !== 0
	  if (nonroot) {
	    if (er.code === "EINVAL" || er.code === "EPERM")
	      return true
	  }

	  return false
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var fs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"fs\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))

	module.exports = clone(fs)

	function clone (obj) {
	  if (obj === null || typeof obj !== 'object')
	    return obj

	  if (obj instanceof Object)
	    var copy = { __proto__: obj.__proto__ }
	  else
	    var copy = Object.create(null)

	  Object.getOwnPropertyNames(obj).forEach(function (key) {
	    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
	  })

	  return copy
	}


/***/ },
/* 43 */,
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var Stream = __webpack_require__(45).Stream

	module.exports = legacy

	function legacy (fs) {
	  return {
	    ReadStream: ReadStream,
	    WriteStream: WriteStream
	  }

	  function ReadStream (path, options) {
	    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

	    Stream.call(this);

	    var self = this;

	    this.path = path;
	    this.fd = null;
	    this.readable = true;
	    this.paused = false;

	    this.flags = 'r';
	    this.mode = 438; /*=0666*/
	    this.bufferSize = 64 * 1024;

	    options = options || {};

	    // Mixin options into this
	    var keys = Object.keys(options);
	    for (var index = 0, length = keys.length; index < length; index++) {
	      var key = keys[index];
	      this[key] = options[key];
	    }

	    if (this.encoding) this.setEncoding(this.encoding);

	    if (this.start !== undefined) {
	      if ('number' !== typeof this.start) {
	        throw TypeError('start must be a Number');
	      }
	      if (this.end === undefined) {
	        this.end = Infinity;
	      } else if ('number' !== typeof this.end) {
	        throw TypeError('end must be a Number');
	      }

	      if (this.start > this.end) {
	        throw new Error('start must be <= end');
	      }

	      this.pos = this.start;
	    }

	    if (this.fd !== null) {
	      process.nextTick(function() {
	        self._read();
	      });
	      return;
	    }

	    fs.open(this.path, this.flags, this.mode, function (err, fd) {
	      if (err) {
	        self.emit('error', err);
	        self.readable = false;
	        return;
	      }

	      self.fd = fd;
	      self.emit('open', fd);
	      self._read();
	    })
	  }

	  function WriteStream (path, options) {
	    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

	    Stream.call(this);

	    this.path = path;
	    this.fd = null;
	    this.writable = true;

	    this.flags = 'w';
	    this.encoding = 'binary';
	    this.mode = 438; /*=0666*/
	    this.bytesWritten = 0;

	    options = options || {};

	    // Mixin options into this
	    var keys = Object.keys(options);
	    for (var index = 0, length = keys.length; index < length; index++) {
	      var key = keys[index];
	      this[key] = options[key];
	    }

	    if (this.start !== undefined) {
	      if ('number' !== typeof this.start) {
	        throw TypeError('start must be a Number');
	      }
	      if (this.start < 0) {
	        throw new Error('start must be >= zero');
	      }

	      this.pos = this.start;
	    }

	    this.busy = false;
	    this._queue = [];

	    if (this.fd === null) {
	      this._open = fs.open;
	      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
	      this.flush();
	    }
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Stream;

	var EE = __webpack_require__(46).EventEmitter;
	var inherits = __webpack_require__(22);

	inherits(Stream, EE);
	Stream.Readable = __webpack_require__(47);
	Stream.Writable = __webpack_require__(57);
	Stream.Duplex = __webpack_require__(58);
	Stream.Transform = __webpack_require__(59);
	Stream.PassThrough = __webpack_require__(60);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};


/***/ },
/* 46 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {exports = module.exports = __webpack_require__(48);
	exports.Stream = __webpack_require__(45);
	exports.Readable = exports;
	exports.Writable = __webpack_require__(53);
	exports.Duplex = __webpack_require__(52);
	exports.Transform = __webpack_require__(55);
	exports.PassThrough = __webpack_require__(56);
	if (!process.browser && process.env.READABLE_STREAM === 'disable') {
	  module.exports = __webpack_require__(45);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(49);
	/*</replacement>*/


	/*<replacement>*/
	var Buffer = __webpack_require__(10).Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = __webpack_require__(46).EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	var Stream = __webpack_require__(45);

	/*<replacement>*/
	var util = __webpack_require__(50);
	util.inherits = __webpack_require__(22);
	/*</replacement>*/

	var StringDecoder;


	/*<replacement>*/
	var debug = __webpack_require__(51);
	if (debug && debug.debuglog) {
	  debug = debug.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/


	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  var Duplex = __webpack_require__(52);

	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = __webpack_require__(54).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  var Duplex = __webpack_require__(52);

	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (util.isString(chunk) && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (util.isNullOrUndefined(chunk)) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      if (!addToFront)
	        state.reading = false;

	      // if we want the data now, just emit it.
	      if (state.flowing && state.length === 0 && !state.sync) {
	        stream.emit('data', chunk);
	        stream.read(0);
	      } else {
	        // update the buffer info.
	        state.length += state.objectMode ? 1 : chunk.length;
	        if (addToFront)
	          state.buffer.unshift(chunk);
	        else
	          state.buffer.push(chunk);

	        if (state.needReadable)
	          emitReadable(stream);
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = __webpack_require__(54).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (isNaN(n) || util.isNull(n)) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  debug('read', n);
	  var state = this._readableState;
	  var nOrig = n;

	  if (!util.isNumber(n) || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended)
	      endReadable(this);
	    else
	      emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0)
	      endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  }

	  if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read pushed data synchronously, then `reading` will be false,
	  // and we need to re-evaluate how much data we can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  var ret;
	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (util.isNull(ret)) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we tried to read() past the EOF, then emit end on the next tick.
	  if (nOrig !== n && state.ended && state.length === 0)
	    endReadable(this);

	  if (!util.isNull(ret))
	    this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync)
	      process.nextTick(function() {
	        emitReadable_(stream);
	      });
	    else
	      emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain &&
	        (!dest._writableState || dest._writableState.needDrain))
	      ondrain();
	  }

	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    if (false === ret) {
	      debug('false write response, pause',
	            src._readableState.awaitDrain);
	      src._readableState.awaitDrain++;
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isArray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain)
	      state.awaitDrain--;
	    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  // If listening to data, and it has not explicitly been paused,
	  // then call resume to start the flow of data on the next tick.
	  if (ev === 'data' && false !== this._readableState.flowing) {
	    this.resume();
	  }

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        var self = this;
	        process.nextTick(function() {
	          debug('readable nexttick read 0');
	          self.read(0);
	        });
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    if (!state.reading) {
	      debug('resume read 0');
	      this.read(0);
	    }
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(function() {
	      resume_(stream, state);
	    });
	  }
	}

	function resume_(stream, state) {
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading)
	    stream.read(0);
	}

	Readable.prototype.pause = function() {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  if (state.flowing) {
	    do {
	      var chunk = stream.read();
	    } while (null !== chunk && state.flowing);
	  }
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    debug('wrapped data');
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);
	    if (!chunk || !state.objectMode && !chunk.length)
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 51 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	/*</replacement>*/


	/*<replacement>*/
	var util = __webpack_require__(50);
	util.inherits = __webpack_require__(22);
	/*</replacement>*/

	var Readable = __webpack_require__(48);
	var Writable = __webpack_require__(53);

	util.inherits(Duplex, Readable);

	forEach(objectKeys(Writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;

	/*<replacement>*/
	var Buffer = __webpack_require__(10).Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/
	var util = __webpack_require__(50);
	util.inherits = __webpack_require__(22);
	/*</replacement>*/

	var Stream = __webpack_require__(45);

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  var Duplex = __webpack_require__(52);

	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = __webpack_require__(52);

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (!util.isFunction(cb))
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function() {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function() {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing &&
	        !state.corked &&
	        !state.finished &&
	        !state.bufferProcessing &&
	        state.buffer.length)
	      clearBuffer(this, state);
	  }
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      util.isString(chunk)) {
	    chunk = new Buffer(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing || state.corked)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, false, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev)
	    stream._writev(chunk, state.onwrite);
	  else
	    stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      state.pendingcb--;
	      cb(er);
	    });
	  else {
	    state.pendingcb--;
	    cb(er);
	  }

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished &&
	        !state.corked &&
	        !state.bufferProcessing &&
	        state.buffer.length) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  if (stream._writev && state.buffer.length > 1) {
	    // Fast case, write everything using _writev()
	    var cbs = [];
	    for (var c = 0; c < state.buffer.length; c++)
	      cbs.push(state.buffer[c].callback);

	    // count the one we are adding, as well.
	    // TODO(isaacs) clean this up
	    state.pendingcb++;
	    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
	      for (var i = 0; i < cbs.length; i++) {
	        state.pendingcb--;
	        cbs[i](err);
	      }
	    });

	    // Clear buffer
	    state.buffer = [];
	  } else {
	    // Slow case, write chunks one-by-one
	    for (var c = 0; c < state.buffer.length; c++) {
	      var entry = state.buffer[c];
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);

	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        c++;
	        break;
	      }
	    }

	    if (c < state.buffer.length)
	      state.buffer = state.buffer.slice(c);
	    else
	      state.buffer.length = 0;
	  }

	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));

	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (util.isFunction(chunk)) {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (!util.isNullOrUndefined(chunk))
	    this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else
	      prefinish(stream, state);
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = __webpack_require__(10).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = __webpack_require__(52);

	/*<replacement>*/
	var util = __webpack_require__(50);
	util.inherits = __webpack_require__(22);
	/*</replacement>*/

	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (!util.isNullOrUndefined(data))
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('prefinish', function() {
	    if (util.isFunction(this._flush))
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = __webpack_require__(55);

	/*<replacement>*/
	var util = __webpack_require__(50);
	util.inherits = __webpack_require__(22);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(53)


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(52)


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(55)


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(56)


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	// when used in node, this will actually load the util module we depend on
	// versus loading the builtin util module as happens otherwise
	// this is a bug in node module loading as far as I am concerned
	var util = __webpack_require__(20);

	var pSlice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  if (options.message) {
	    this.message = options.message;
	    this.generatedMessage = false;
	  } else {
	    this.message = getMessage(this);
	    this.generatedMessage = true;
	  }
	  var stackStartFunction = options.stackStartFunction || fail;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  }
	  else {
	    // non v8 browsers so we can have a stacktrace
	    var err = new Error();
	    if (err.stack) {
	      var out = err.stack;

	      // try to strip useless frames
	      var fn_name = stackStartFunction.name;
	      var idx = out.indexOf('\n' + fn_name);
	      if (idx >= 0) {
	        // once we have located the function frame
	        // we need to strip out everything before it (and its line)
	        var next_line = out.indexOf('\n', idx + 1);
	        out = out.substring(next_line + 1);
	      }

	      this.stack = out;
	    }
	  }
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
	  if (util.isUndefined(value)) {
	    return '' + value;
	  }
	  if (util.isNumber(value) && !isFinite(value)) {
	    return value.toString();
	  }
	  if (util.isFunction(value) || util.isRegExp(value)) {
	    return value.toString();
	  }
	  return value;
	}

	function truncate(s, n) {
	  if (util.isString(s)) {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}

	function getMessage(self) {
	  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
	         self.operator + ' ' +
	         truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	  if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};

	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;

	  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
	    if (actual.length != expected.length) return false;

	    for (var i = 0; i < actual.length; i++) {
	      if (actual[i] !== expected[i]) return false;
	    }

	    return true;

	  // 7.2. If the expected value is a Date object, the actual value is
	  // equivalent if it is also a Date object that refers to the same time.
	  } else if (util.isDate(actual) && util.isDate(expected)) {
	    return actual.getTime() === expected.getTime();

	  // 7.3 If the expected value is a RegExp object, the actual value is
	  // equivalent if it is also a RegExp object with the same source and
	  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	    return actual.source === expected.source &&
	           actual.global === expected.global &&
	           actual.multiline === expected.multiline &&
	           actual.lastIndex === expected.lastIndex &&
	           actual.ignoreCase === expected.ignoreCase;

	  // 7.4. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (!util.isObject(actual) && !util.isObject(expected)) {
	    return actual == expected;

	  // 7.5 For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected);
	  }
	}

	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
	  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  // if one is a primitive, the other must be same
	  if (util.isPrimitive(a) || util.isPrimitive(b)) {
	    return a === b;
	  }
	  var aIsArgs = isArguments(a),
	      bIsArgs = isArguments(b);
	  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
	    return false;
	  if (aIsArgs) {
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  var ka = objectKeys(a),
	      kb = objectKeys(b),
	      key, i;
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};

	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }

	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }

	  return false;
	}

	function _throws(shouldThrow, block, expected, message) {
	  var actual;

	  if (util.isString(expected)) {
	    message = expected;
	    expected = null;
	  }

	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }

	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	            (message ? ' ' + message : '.');

	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }

	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }

	  if ((shouldThrow && actual && expected &&
	      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	    throw actual;
	  }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function(err) { if (err) {throw err;}};

	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) keys.push(key);
	  }
	  return keys;
	};


/***/ },
/* 62 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	function Storage(duration) {
		this.duration = duration;
		this.running = {};
		this.data = {};
		this.levels = [];
		if(duration > 0) {
			this.levels.push([], [], [], [], [], [], [], [], []);
			for(var i = 8000; i < duration; i+=500)
				this.levels.push([]);
		}
		this.count = 0;
		this.interval = null;
		this.needTickCheck = false;
		this.nextTick = null;
		this.passive = true;
	}

	Storage.prototype.ensureTick = function() {
		if(!this.interval && this.duration > 0 && !this.nextTick)
			this.interval = setInterval(this.tick.bind(this), Math.floor(this.duration / this.levels.length));
	};

	Storage.prototype.finished = function(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callbacks = this.running[name];
		delete this.running[name];
		if(this.duration > 0) {
			this.count++;
			this.data[name] = args;
			this.levels[0].push(name);
			this.ensureTick();
		}
		for(var i = 0; i < callbacks.length; i++) {
			callbacks[i].apply(null, args);
		}
	};

	Storage.prototype.provide = function(name, provider, callback) {
		var running = this.running[name];
		if(running) {
			running.push(callback);
			return;
		}
		if(this.duration > 0) {
			this.checkTicks();
			var data = this.data[name];
			if(data) {
				return callback.apply(null, data);
			}
		}
		this.running[name] = running = [callback];
		provider(name, this.finished.bind(this, name));
	};

	Storage.prototype.tick = function() {
		var decay = this.levels.pop();
		for(var i = decay.length - 1; i >= 0; i--) {
			delete this.data[decay[i]];
		}
		this.count -= decay.length;
		decay.length = 0;
		this.levels.unshift(decay);
		if(this.count == 0) {
			clearInterval(this.interval);
			this.interval = null;
			this.nextTick = null;
			return true;
		} else if(this.nextTick) {
			this.nextTick += Math.floor(this.duration / this.levels.length);
			var time = new Date().getTime();
			if(this.nextTick > time) {
				this.nextTick = null;
				this.interval = setInterval(this.tick.bind(this), Math.floor(this.duration / this.levels.length));
				return true;
			}
		} else if(this.passive) {
			clearInterval(this.interval);
			this.interval = null;
			this.nextTick = new Date().getTime() + Math.floor(this.duration / this.levels.length);
		} else {
			this.passive = true;
		}
	};

	Storage.prototype.checkTicks = function() {
		this.passive = false;
		if(this.nextTick) {
			while(!this.tick());
		}
	};

	Storage.prototype.purge = function(what) {
		if(!what) {
			this.count = 0;
			clearInterval(this.interval);
			this.nextTick = null;
			this.data = {};
			this.levels.forEach(function(level) {
				level.length = 0;
			});
		} else if(typeof what === "string") {
			Object.keys(this.data).forEach(function(key) {
				if(key.indexOf(what) === 0)
					delete this.data[key];
			}, this);
		} else {
			for(var i = what.length - 1; i >= 0; i--) {
				this.purge(what[i]);
			}
		}
	};


	function CachedInputFileSystem(fileSystem, duration) {
		this.fileSystem = fileSystem;
		this._statStorage = new Storage(duration);
		this._readdirStorage = new Storage(duration);
		this._readFileStorage = new Storage(duration);
		this._readlinkStorage = new Storage(duration);
	}
	module.exports = CachedInputFileSystem;

	CachedInputFileSystem.prototype.isSync = function() {
		return this.fileSystem.isSync();
	};

	CachedInputFileSystem.prototype.stat = function(path, callback) {
		this._statStorage.provide(path, this.fileSystem.stat.bind(this.fileSystem), callback);
	};

	CachedInputFileSystem.prototype.readdir = function(path, callback) {
		this._readdirStorage.provide(path, this.fileSystem.readdir.bind(this.fileSystem), callback);
	};

	CachedInputFileSystem.prototype.readFile = function(path, callback) {
		this._readFileStorage.provide(path, this.fileSystem.readFile.bind(this.fileSystem), callback);
	};

	CachedInputFileSystem.prototype.readlink = function(path, callback) {
		this._readlinkStorage.provide(path, this.fileSystem.readlink.bind(this.fileSystem), callback);
	};

	CachedInputFileSystem.prototype.purge = function(what) {
		this._statStorage.purge(what);
		this._readdirStorage.purge(what);
		this._readFileStorage.purge(what);
		this._readlinkStorage.purge(what);
	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	function UnsafeCachePlugin(regExps, cache) {
		this.regExps = regExps || [/./];
		if(this.regExps === true) this.regExps = [/./];
		else if(!Array.isArray(this.regExps)) this.regExps = [this.regExps];
		this.cache = cache || {};
	}
	module.exports = UnsafeCachePlugin;

	UnsafeCachePlugin.prototype.apply = function(resolver) {
		var oldResolve = resolver.resolve;
		var regExps = this.regExps;
		var cache = this.cache;
		resolver.resolve = function resolve(context, request, callback) {
			var id = context + "->" + request;
			if(cache[id]) {
				// From cache
				return callback(null, cache[id]);
			}
			oldResolve.call(resolver, context, request, function(err, result) {
				if(err) return callback(err);
				var doCache = regExps.some(function(regExp) {
					return regExp.test(result.path);
				});
				if(!doCache) return callback(null, result);
				callback(null, cache[id] = result);
			});
		};
	};


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var createInnerCallback = __webpack_require__(36);
	var popPathSeqment = __webpack_require__(65);

	function ModulesInDirectoriesPlugin(moduleType, directories) {
		this.moduleType = moduleType;
		this.directories = directories;
	}
	module.exports = ModulesInDirectoriesPlugin;

	ModulesInDirectoriesPlugin.prototype.apply = function(resolver) {
		var moduleType = this.moduleType;
		var directories = this.directories;
		resolver.plugin("module", function(request, callback) {
			var fs = this.fileSystem;
			var paths = [request.path];
			var addr = [request.path];
			var pathSeqment = popPathSeqment(addr);
			var topLevelCallback = callback;
			while(pathSeqment) {
				paths.push(addr[0]);
				pathSeqment = popPathSeqment(addr);
			}
			var addrs = paths.map(function(p) {
				return directories.map(function(d) {
					return this.join(p, d);
				}, this);
			}, this).reduce(function(array, p) {
				array.push.apply(array, p);
				return array;
			}, []);
			this.forEachBail(addrs, function(addr, callback) {
				fs.stat(addr, function(err, stat) {
					if(!err && stat && stat.isDirectory()) {
						this.applyPluginsParallelBailResult("module-" + moduleType, {
							path: addr,
							request: request.request,
							query: request.query,
							directory: request.directory
						}, createInnerCallback(function(err, result) {
							if(err) return callback(err);
							if(!result) return callback();
							return callback(null, result);
						}, topLevelCallback, "looking for modules in " + addr));
						return;
					}
					return callback();
				}.bind(this));
			}.bind(this), function(err, result) {
				if(err) return callback(err);
				if(!result) return callback();
				return callback(null, result);
			});
		});
	};


/***/ },
/* 65 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function popPathSeqment(pathInArray) {
		var i = pathInArray[0].lastIndexOf("/"),
			j = pathInArray[0].lastIndexOf("\\");
		var p = i < 0 ? j : j < 0 ? i : i < j ? j : i;
		if(p < 0) return null;
		var s = pathInArray[0].substr(p+1);
		pathInArray[0] = pathInArray[0].substr(0, p || 1);
		return s;
	};


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var createInnerCallback = __webpack_require__(36);

	function ModulesInRootPlugin(moduleType, path) {
		this.moduleType = moduleType;
		this.path = path;
	}
	module.exports = ModulesInRootPlugin;

	ModulesInRootPlugin.prototype.apply = function(resolver) {
		var moduleType = this.moduleType;
		var path = this.path;
		resolver.plugin("module", function(request, callback) {
			this.applyPluginsParallelBailResult("module-" + moduleType, {
				path: path,
				request: request.request,
				query: request.query,
				directory: request.directory
			}, createInnerCallback(function innerCallback(err, result) {
				if(err) return callback(err);
				if(!result) return callback();
				return callback(null, result);
			}, callback, "looking for modules in " + path));
		});
	};


/***/ },
/* 67 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	function ModuleAsFilePlugin(moduleType) {
		this.moduleType = moduleType;
	}
	module.exports = ModuleAsFilePlugin;

	ModuleAsFilePlugin.prototype.apply = function(resolver) {
		resolver.plugin("module-" + this.moduleType, function(request, callback) {
			var fs = this.fileSystem;
			var i = request.request.indexOf("/"),
				j = request.request.indexOf("\\");
			if(i >= 0 || j >= 0 || request.directory) return callback();
			return this.doResolve("file", request, callback, true);
		});
	};


/***/ },
/* 68 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	function ModuleAsDirectoryPlugin(moduleType) {
		this.moduleType = moduleType;
	}
	module.exports = ModuleAsDirectoryPlugin;

	ModuleAsDirectoryPlugin.prototype.apply = function(resolver) {
		resolver.plugin("module-" + this.moduleType, function(request, callback) {
			var fs = this.fileSystem;
			var i = request.request.indexOf("/"),
				j = request.request.indexOf("\\");
			var p = i < 0 ? j : j < 0 ? i : i < j ? i : j;
			var moduleName, remainingRequest;
			if(p < 0) {
				moduleName = request.request;
				remainingRequest = "";
			} else {
				moduleName = request.request.substr(0, p);
				remainingRequest = request.request.substr(p+1);
			}
			var modulePath = this.join(request.path, moduleName);
			fs.stat(modulePath, function(err, stat) {
				if(err || !stat) {
					if(callback.missing)
						callback.missing.push(modulePath);
					if(callback.log) callback.log(modulePath + " doesn't exist (module as directory)");
					return callback();
				}
				if(stat.isDirectory()) {
					return this.doResolve(request.directory ? "directory" : ["file", "directory"], {
						path: modulePath,
						request: remainingRequest,
						query: request.query
					}, callback, true);
				}
				if(callback.log) callback.log(modulePath + " is not a directory (module as directory)");
				return callback();
			}.bind(this));
		});
	};


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var createInnerCallback = __webpack_require__(36);

	function ModuleAliasPlugin(aliasMap) {
		this.aliasMap = aliasMap;
	}
	module.exports = ModuleAliasPlugin;

	ModuleAliasPlugin.prototype.apply = function(resolver) {
		var aliasMap = this.aliasMap;
		resolver.plugin("module", function(request, callback) {
			var fs = this.fileSystem;
			var keys = Object.keys(aliasMap);
			var i = 0;
			(function next() {
				for(;i < keys.length; i++) {
					var aliasName = keys[i];
					var onlyModule = /\$$/.test(aliasName);
					if(onlyModule) aliasName = aliasName.substr(0, aliasName.length-1);
					if((!onlyModule && request.request.indexOf(aliasName + "/") === 0) || request.request === aliasName) {
						var aliasValue = aliasMap[keys[i]];
						if(request.request.indexOf(aliasValue + "/") !== 0 && request.request != aliasValue) {
							var newRequestStr = aliasValue + request.request.substr(aliasName.length);
							var newRequest = this.parse(newRequestStr);
							var obj = {
								path: request.path,
								request: newRequest.path,
								query: newRequest.query,
								directory: newRequest.directory
							};
							var newCallback = createInnerCallback(callback, callback, "aliased with mapping " + JSON.stringify(aliasName) + ": " + JSON.stringify(aliasValue) + " to " + newRequestStr);
							if(newRequest.module) return this.doResolve("module", obj, newCallback);
							if(newRequest.directory) return this.doResolve("directory", obj, newCallback);
							return this.doResolve(["file", "directory"], obj, newCallback);
						}
					}
				}
				return callback();
			}.call(this));
		});
	};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var createInnerCallback = __webpack_require__(36);

	function DirectoryDefaultFilePlugin(files) {
		this.files = files;
	}
	module.exports = DirectoryDefaultFilePlugin;

	DirectoryDefaultFilePlugin.prototype.apply = function(resolver) {
		var files = this.files;
		resolver.plugin("directory", function(request, callback) {
			var fs = this.fileSystem;
			var topLevelCallback = callback;
			var directory = this.join(request.path, request.request);
			fs.stat(directory, function(err, stat) {
				if(err || !stat) {
					if(callback.log) callback.log(directory + " doesn't exist (directory default file)");
					return callback();
				}
				if(!stat.isDirectory()) {
					if(callback.log) callback.log(directory + " is not a directory (directory default file)");
					return callback();
				}
				this.forEachBail(files, function(file, callback) {
					this.doResolve("file", {
						path: directory,
						query: request.query,
						request: file
					}, createInnerCallback(function(err, result) {
						if(!err && result) return callback(result);
						return callback();
					}, topLevelCallback, "directory default file " + file));
				}.bind(this), function(result) {
					if(!result) return callback();
					return callback(null, result);
				});
			}.bind(this));
		});
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var createInnerCallback = __webpack_require__(36);

	function DirectoryDescriptionFilePlugin(filename, fields) {
		this.filename = filename;
		this.fields = fields;
	}
	module.exports = DirectoryDescriptionFilePlugin;

	DirectoryDescriptionFilePlugin.prototype.apply = function(resolver) {
		var filename = this.filename;
		var fields = this.fields;
		resolver.plugin("directory", function(request, callback) {
			var fs = this.fileSystem;
			var directory = this.join(request.path, request.request);
			var descriptionFilePath = this.join(directory, filename);
			fs.readFile(descriptionFilePath, function(err, content) {
				if(err) {
					if(callback.log)
						callback.log(descriptionFilePath + " doesn't exist (directory description file)");
					return callback();
				}
				content = content.toString("utf-8");
				try {
					content = JSON.parse(content);
				} catch(e) {
					if(callback.log)
						callback.log(descriptionFilePath + " (directory description file): " + e);
					else
						e.message = descriptionFilePath + " (directory description file): " + e;
					return callback(e);
				}
				var mainModules = [];
				for(var i = 0; i < fields.length; i++) {
					if(Array.isArray(fields[i])) {
						var current = content;
						for(var j = 0; j < fields[i].length; j++) {
							if(current === null || typeof current !== "object") {
								current = null;
								break;
							}
							var field = fields[i][j];
							current = current[field];
						}
						if(typeof current === "string") {
							mainModules.push(current);
							continue;
						}
					} else {
						var field = fields[i];
						if(typeof content[field] === "string") {
							mainModules.push(content[field]);
							continue;
						}
					}
				}
				(function next() {
					if(mainModules.length == 0) return callback();
					var mainModule = mainModules.shift();
					return this.doResolve(["file", "directory"], {
						path: directory,
						query: request.query,
						request: mainModule
					}, createInnerCallback(function(err, result) {
						if(!err && result) return callback(null, result);
						return next.call(this);
					}.bind(this), callback, "use " + mainModule + " from " + filename));
				}.call(this))
			}.bind(this));
		});
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var createInnerCallback = __webpack_require__(36);

	function DirectoryDescriptionFileFieldAliasPlugin(filename, field) {
		this.filename = filename;
		this.field = field;
	}
	module.exports = DirectoryDescriptionFileFieldAliasPlugin;

	function findDescriptionFileField(resolver, directory, filename, field, callback) {
		(function findDescriptionFile() {
			var descriptionFilePath = resolver.join(directory, filename);
			resolver.fileSystem.readFile(descriptionFilePath, function(err, content) {
				if(err) {
					directory = cdUp(directory);
					if(!directory) {
						return callback();
					} else {
						return findDescriptionFile();
					}
				}
				try {
					content = JSON.parse(content);
				} catch(e) {
					if(callback.log)
						callback.log(descriptionFilePath + " (directory description file): " + e);
					else
						e.message = descriptionFilePath + " (directory description file): " + e;
					return callback(e);
				}
				var fieldData;
				if(Array.isArray(field)) {
					var current = content;
					for(var j = 0; j < field.length; j++) {
						if(current === null || typeof current !== "object") {
							current = null;
							break;
						}
						current = current[field[j]];
					}
					if(typeof current === "object") {
						fieldData = current;
					}
				} else {
					if(typeof content[field] === "object") {
						fieldData = content[field];
					}
				}
				if(!fieldData) return callback();
				callback(null, fieldData, directory);
			});
		}());
	}

	function cdUp(directory) {
		if(directory === "/") return null;
		var i = directory.lastIndexOf("/"),
			j = directory.lastIndexOf("\\");
		var p = i < 0 ? j : j < 0 ? i : i < j ? j : i;
		if(p < 0) return null;
		return directory.substr(0, p || 1);
	}

	DirectoryDescriptionFileFieldAliasPlugin.prototype.apply = function(resolver) {
		var filename = this.filename;
		var field = this.field;
		resolver.plugin("module", function(request, callback) {
			var directory = request.path;
			var moduleName = request.request;
			findDescriptionFileField(this, directory, filename, field, function(err, fieldData, directory) {
				if(err) return callback(err);
				if(!fieldData) return callback();
				var data = fieldData[moduleName];
				if(data === moduleName) return callback();
				if(data === false) return callback(null, {
					path: false,
					resolved: true
				});
				if(!data) return callback();
				var newRequest = this.parse(data);
				var obj = {
					path: directory,
					request: newRequest.path,
					query: newRequest.query,
					directory: newRequest.directory
				};
				var newCallback = createInnerCallback(callback, callback, "aliased from directory description file " + this.join(directory, filename) + " with mapping " + JSON.stringify(moduleName));
				if(newRequest.module) return this.doResolve("module", obj, newCallback);
				if(newRequest.directory) return this.doResolve("directory", obj, newCallback);
				return this.doResolve(["file", "directory"], obj, newCallback);
			}.bind(this));
		});
		resolver.plugin("result", function(request, callback) {
			var directory = cdUp(request.path);
			var requestPath = request.path;
			findDescriptionFileField(this, directory, filename, field, function(err, fieldData, directory) {
				if(err) return callback(err);
				if(!fieldData) return callback();
				var relative = requestPath.substr(directory.length+1).replace(/\\/g, "/");
				if(typeof fieldData[relative] !== "undefined")
					var data = fieldData[relative];
				else if(typeof fieldData["./" + relative] !== "undefined")
					var data = fieldData["./" + relative];
				if(data === relative || data === "./" + relative) return callback();
				if(data === false) return callback(null, {
					path: false,
					resolved: true
				});
				if(!data) return callback();
				var newRequest = this.parse(data);
				var obj = {
					path: directory,
					request: newRequest.path,
					query: newRequest.query,
					directory: newRequest.directory
				};
				var newCallback = createInnerCallback(callback, callback, "aliased from directory description file " + this.join(directory, filename) + " with mapping " + JSON.stringify(relative));
				if(newRequest.module) return this.doResolve("module", obj, newCallback);
				if(newRequest.directory) return this.doResolve("directory", obj, newCallback);
				return this.doResolve(["file", "directory"], obj, newCallback);
			}.bind(this));
		});
	};


/***/ },
/* 73 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	function FileAppendPlugin(appendings) {
		this.appendings = appendings;
	}
	module.exports = FileAppendPlugin;

	FileAppendPlugin.prototype.apply = function(resolver) {
		var appendings = this.appendings;
		resolver.plugin("file", function(request, callback) {
			var fs = this.fileSystem;
			var addr = this.join(request.path, request.request);
			var addrs = appendings.map(function(a) { return addr + a });
			var log = callback.log;
			var missing = callback.missing;
			this.forEachBail(addrs, function(addr, callback) {
				fs.stat(addr, function(err, stat) {
					if(!err && stat && stat.isFile())
						return callback(addr);
					if(missing && err)
						missing.push(addr);
					if(log) {
						if(err) log(addr + " doesn't exist");
						else log(addr + " is not a file");
					}
					return callback();
				});
			}, function(validAddr) {
				if(!validAddr) return callback();
				return this.doResolve("result", {
					path: validAddr,
					query: request.query,
					file: true,
					resolved: true
				}, callback);
			}.bind(this));
		});
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var popPathSeqment = __webpack_require__(65);

	function ResultSymlinkPlugin(appendings) {
	}
	module.exports = ResultSymlinkPlugin;

	ResultSymlinkPlugin.prototype.apply = function(resolver) {
		resolver.plugin("result", function pluginMethod(request, callback) {
			var fs = this.fileSystem;
			var paths = [request.path];
			var pathSeqments = [];
			var addr = [request.path];
			var pathSeqment = popPathSeqment(addr);
			while(pathSeqment) {
				pathSeqments.push(pathSeqment);
				paths.push(addr[0]);
				pathSeqment = popPathSeqment(addr);
			}
			pathSeqments.push(paths[paths.length-1]);
			var log = callback.log;
			var missing = callback.missing;
			var containsSymlink = false;
			this.forEachBail(paths.map(function(_, i) { return i; }), function(idx, callback) {
				fs.readlink(paths[idx], function(err, result) {
					if(!err && result) {
						pathSeqments[idx] = result;
						containsSymlink = true;
						// Shortcut when absolute symlink found
						if(/^(\/|[a-zA-z]:($|\\))/.test(result))
							return callback(null, idx);
					}
					callback();
				});
			}, function(err, idx) {
				if(!containsSymlink) return callback();
				var resultSeqments = typeof idx === "number" ? pathSeqments.slice(0, idx+1) : pathSeqments.slice();
				var result = resultSeqments.reverse().reduce(function(a, b) {
					return this.join(a, b);
				}.bind(this));
				log("resolved symlink to " + result);
				request.path = result;
				pluginMethod.call(this, request, callback);
			}.bind(this));
		});
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {exports = module.exports = SemVer;

	// The debug function is excluded entirely from the minified version.
	/* nomin */ var debug;
	/* nomin */ if (typeof process === 'object' &&
	    /* nomin */ process.env &&
	    /* nomin */ process.env.NODE_DEBUG &&
	    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
	  /* nomin */ debug = function() {
	    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
	    /* nomin */ args.unshift('SEMVER');
	    /* nomin */ console.log.apply(console, args);
	    /* nomin */ };
	/* nomin */ else
	  /* nomin */ debug = function() {};

	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	exports.SEMVER_SPEC_VERSION = '2.0.0';

	var MAX_LENGTH = 256;
	var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

	// The actual regexps go on exports.re
	var re = exports.re = [];
	var src = exports.src = [];
	var R = 0;

	// The following Regular Expressions can be used for tokenizing,
	// validating, and parsing SemVer version strings.

	// ## Numeric Identifier
	// A single `0`, or a non-zero digit followed by zero or more digits.

	var NUMERICIDENTIFIER = R++;
	src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
	var NUMERICIDENTIFIERLOOSE = R++;
	src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


	// ## Non-numeric Identifier
	// Zero or more digits, followed by a letter or hyphen, and then zero or
	// more letters, digits, or hyphens.

	var NONNUMERICIDENTIFIER = R++;
	src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


	// ## Main Version
	// Three dot-separated numeric identifiers.

	var MAINVERSION = R++;
	src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
	                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
	                   '(' + src[NUMERICIDENTIFIER] + ')';

	var MAINVERSIONLOOSE = R++;
	src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
	                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
	                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

	// ## Pre-release Version Identifier
	// A numeric identifier, or a non-numeric identifier.

	var PRERELEASEIDENTIFIER = R++;
	src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
	                            '|' + src[NONNUMERICIDENTIFIER] + ')';

	var PRERELEASEIDENTIFIERLOOSE = R++;
	src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
	                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


	// ## Pre-release Version
	// Hyphen, followed by one or more dot-separated pre-release version
	// identifiers.

	var PRERELEASE = R++;
	src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
	                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

	var PRERELEASELOOSE = R++;
	src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
	                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

	// ## Build Metadata Identifier
	// Any combination of digits, letters, or hyphens.

	var BUILDIDENTIFIER = R++;
	src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

	// ## Build Metadata
	// Plus sign, followed by one or more period-separated build metadata
	// identifiers.

	var BUILD = R++;
	src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
	             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


	// ## Full Version String
	// A main version, followed optionally by a pre-release version and
	// build metadata.

	// Note that the only major, minor, patch, and pre-release sections of
	// the version string are capturing groups.  The build metadata is not a
	// capturing group, because it should not ever be used in version
	// comparison.

	var FULL = R++;
	var FULLPLAIN = 'v?' + src[MAINVERSION] +
	                src[PRERELEASE] + '?' +
	                src[BUILD] + '?';

	src[FULL] = '^' + FULLPLAIN + '$';

	// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
	// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
	// common in the npm registry.
	var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
	                 src[PRERELEASELOOSE] + '?' +
	                 src[BUILD] + '?';

	var LOOSE = R++;
	src[LOOSE] = '^' + LOOSEPLAIN + '$';

	var GTLT = R++;
	src[GTLT] = '((?:<|>)?=?)';

	// Something like "2.*" or "1.2.x".
	// Note that "x.x" is a valid xRange identifer, meaning "any version"
	// Only the first item is strictly required.
	var XRANGEIDENTIFIERLOOSE = R++;
	src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
	var XRANGEIDENTIFIER = R++;
	src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

	var XRANGEPLAIN = R++;
	src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:' + src[PRERELEASE] + ')?' +
	                   src[BUILD] + '?' +
	                   ')?)?';

	var XRANGEPLAINLOOSE = R++;
	src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:' + src[PRERELEASELOOSE] + ')?' +
	                        src[BUILD] + '?' +
	                        ')?)?';

	var XRANGE = R++;
	src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
	var XRANGELOOSE = R++;
	src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

	// Tilde ranges.
	// Meaning is "reasonably at or greater than"
	var LONETILDE = R++;
	src[LONETILDE] = '(?:~>?)';

	var TILDETRIM = R++;
	src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
	re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
	var tildeTrimReplace = '$1~';

	var TILDE = R++;
	src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
	var TILDELOOSE = R++;
	src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

	// Caret ranges.
	// Meaning is "at least and backwards compatible with"
	var LONECARET = R++;
	src[LONECARET] = '(?:\\^)';

	var CARETTRIM = R++;
	src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
	re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
	var caretTrimReplace = '$1^';

	var CARET = R++;
	src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
	var CARETLOOSE = R++;
	src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

	// A simple gt/lt/eq thing, or just "" to indicate "any version"
	var COMPARATORLOOSE = R++;
	src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
	var COMPARATOR = R++;
	src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


	// An expression to strip any whitespace between the gtlt and the thing
	// it modifies, so that `> 1.2.3` ==> `>1.2.3`
	var COMPARATORTRIM = R++;
	src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
	                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

	// this one has to use the /g flag
	re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
	var comparatorTrimReplace = '$1$2$3';


	// Something like `1.2.3 - 1.2.4`
	// Note that these all use the loose form, because they'll be
	// checked against either the strict or loose comparator form
	// later.
	var HYPHENRANGE = R++;
	src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
	                   '\\s+-\\s+' +
	                   '(' + src[XRANGEPLAIN] + ')' +
	                   '\\s*$';

	var HYPHENRANGELOOSE = R++;
	src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
	                        '\\s+-\\s+' +
	                        '(' + src[XRANGEPLAINLOOSE] + ')' +
	                        '\\s*$';

	// Star ranges basically just allow anything at all.
	var STAR = R++;
	src[STAR] = '(<|>)?=?\\s*\\*';

	// Compile to actual regexp objects.
	// All are flag-free, unless they were created above with a flag.
	for (var i = 0; i < R; i++) {
	  debug(i, src[i]);
	  if (!re[i])
	    re[i] = new RegExp(src[i]);
	}

	exports.parse = parse;
	function parse(version, loose) {
	  if (version instanceof SemVer)
	    return version;

	  if (typeof version !== 'string')
	    return null;

	  if (version.length > MAX_LENGTH)
	    return null;

	  var r = loose ? re[LOOSE] : re[FULL];
	  if (!r.test(version))
	    return null;

	  try {
	    return new SemVer(version, loose);
	  } catch (er) {
	    return null;
	  }
	}

	exports.valid = valid;
	function valid(version, loose) {
	  var v = parse(version, loose);
	  return v ? v.version : null;
	}


	exports.clean = clean;
	function clean(version, loose) {
	  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
	  return s ? s.version : null;
	}

	exports.SemVer = SemVer;

	function SemVer(version, loose) {
	  if (version instanceof SemVer) {
	    if (version.loose === loose)
	      return version;
	    else
	      version = version.version;
	  } else if (typeof version !== 'string') {
	    throw new TypeError('Invalid Version: ' + version);
	  }

	  if (version.length > MAX_LENGTH)
	    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')

	  if (!(this instanceof SemVer))
	    return new SemVer(version, loose);

	  debug('SemVer', version, loose);
	  this.loose = loose;
	  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

	  if (!m)
	    throw new TypeError('Invalid Version: ' + version);

	  this.raw = version;

	  // these are actually numbers
	  this.major = +m[1];
	  this.minor = +m[2];
	  this.patch = +m[3];

	  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
	    throw new TypeError('Invalid major version')

	  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
	    throw new TypeError('Invalid minor version')

	  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
	    throw new TypeError('Invalid patch version')

	  // numberify any prerelease numeric ids
	  if (!m[4])
	    this.prerelease = [];
	  else
	    this.prerelease = m[4].split('.').map(function(id) {
	      if (/^[0-9]+$/.test(id)) {
	        var num = +id
	        if (num >= 0 && num < MAX_SAFE_INTEGER)
	          return num
	      }
	      return id;
	    });

	  this.build = m[5] ? m[5].split('.') : [];
	  this.format();
	}

	SemVer.prototype.format = function() {
	  this.version = this.major + '.' + this.minor + '.' + this.patch;
	  if (this.prerelease.length)
	    this.version += '-' + this.prerelease.join('.');
	  return this.version;
	};

	SemVer.prototype.toString = function() {
	  return this.version;
	};

	SemVer.prototype.compare = function(other) {
	  debug('SemVer.compare', this.version, this.loose, other);
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  return this.compareMain(other) || this.comparePre(other);
	};

	SemVer.prototype.compareMain = function(other) {
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  return compareIdentifiers(this.major, other.major) ||
	         compareIdentifiers(this.minor, other.minor) ||
	         compareIdentifiers(this.patch, other.patch);
	};

	SemVer.prototype.comparePre = function(other) {
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  // NOT having a prerelease is > having one
	  if (this.prerelease.length && !other.prerelease.length)
	    return -1;
	  else if (!this.prerelease.length && other.prerelease.length)
	    return 1;
	  else if (!this.prerelease.length && !other.prerelease.length)
	    return 0;

	  var i = 0;
	  do {
	    var a = this.prerelease[i];
	    var b = other.prerelease[i];
	    debug('prerelease compare', i, a, b);
	    if (a === undefined && b === undefined)
	      return 0;
	    else if (b === undefined)
	      return 1;
	    else if (a === undefined)
	      return -1;
	    else if (a === b)
	      continue;
	    else
	      return compareIdentifiers(a, b);
	  } while (++i);
	};

	// preminor will bump the version up to the next minor release, and immediately
	// down to pre-release. premajor and prepatch work the same way.
	SemVer.prototype.inc = function(release, identifier) {
	  switch (release) {
	    case 'premajor':
	      this.prerelease.length = 0;
	      this.patch = 0;
	      this.minor = 0;
	      this.major++;
	      this.inc('pre', identifier);
	      break;
	    case 'preminor':
	      this.prerelease.length = 0;
	      this.patch = 0;
	      this.minor++;
	      this.inc('pre', identifier);
	      break;
	    case 'prepatch':
	      // If this is already a prerelease, it will bump to the next version
	      // drop any prereleases that might already exist, since they are not
	      // relevant at this point.
	      this.prerelease.length = 0;
	      this.inc('patch', identifier);
	      this.inc('pre', identifier);
	      break;
	    // If the input is a non-prerelease version, this acts the same as
	    // prepatch.
	    case 'prerelease':
	      if (this.prerelease.length === 0)
	        this.inc('patch', identifier);
	      this.inc('pre', identifier);
	      break;

	    case 'major':
	      // If this is a pre-major version, bump up to the same major version.
	      // Otherwise increment major.
	      // 1.0.0-5 bumps to 1.0.0
	      // 1.1.0 bumps to 2.0.0
	      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
	        this.major++;
	      this.minor = 0;
	      this.patch = 0;
	      this.prerelease = [];
	      break;
	    case 'minor':
	      // If this is a pre-minor version, bump up to the same minor version.
	      // Otherwise increment minor.
	      // 1.2.0-5 bumps to 1.2.0
	      // 1.2.1 bumps to 1.3.0
	      if (this.patch !== 0 || this.prerelease.length === 0)
	        this.minor++;
	      this.patch = 0;
	      this.prerelease = [];
	      break;
	    case 'patch':
	      // If this is not a pre-release version, it will increment the patch.
	      // If it is a pre-release it will bump up to the same patch version.
	      // 1.2.0-5 patches to 1.2.0
	      // 1.2.0 patches to 1.2.1
	      if (this.prerelease.length === 0)
	        this.patch++;
	      this.prerelease = [];
	      break;
	    // This probably shouldn't be used publicly.
	    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
	    case 'pre':
	      if (this.prerelease.length === 0)
	        this.prerelease = [0];
	      else {
	        var i = this.prerelease.length;
	        while (--i >= 0) {
	          if (typeof this.prerelease[i] === 'number') {
	            this.prerelease[i]++;
	            i = -2;
	          }
	        }
	        if (i === -1) // didn't increment anything
	          this.prerelease.push(0);
	      }
	      if (identifier) {
	        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	        if (this.prerelease[0] === identifier) {
	          if (isNaN(this.prerelease[1]))
	            this.prerelease = [identifier, 0];
	        } else
	          this.prerelease = [identifier, 0];
	      }
	      break;

	    default:
	      throw new Error('invalid increment argument: ' + release);
	  }
	  this.format();
	  this.raw = this.version;
	  return this;
	};

	exports.inc = inc;
	function inc(version, release, loose, identifier) {
	  if (typeof(loose) === 'string') {
	    identifier = loose;
	    loose = undefined;
	  }

	  try {
	    return new SemVer(version, loose).inc(release, identifier).version;
	  } catch (er) {
	    return null;
	  }
	}

	exports.diff = diff;
	function diff(version1, version2) {
	  if (eq(version1, version2)) {
	    return null;
	  } else {
	    var v1 = parse(version1);
	    var v2 = parse(version2);
	    if (v1.prerelease.length || v2.prerelease.length) {
	      for (var key in v1) {
	        if (key === 'major' || key === 'minor' || key === 'patch') {
	          if (v1[key] !== v2[key]) {
	            return 'pre'+key;
	          }
	        }
	      }
	      return 'prerelease';
	    }
	    for (var key in v1) {
	      if (key === 'major' || key === 'minor' || key === 'patch') {
	        if (v1[key] !== v2[key]) {
	          return key;
	        }
	      }
	    }
	  }
	}

	exports.compareIdentifiers = compareIdentifiers;

	var numeric = /^[0-9]+$/;
	function compareIdentifiers(a, b) {
	  var anum = numeric.test(a);
	  var bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return (anum && !bnum) ? -1 :
	         (bnum && !anum) ? 1 :
	         a < b ? -1 :
	         a > b ? 1 :
	         0;
	}

	exports.rcompareIdentifiers = rcompareIdentifiers;
	function rcompareIdentifiers(a, b) {
	  return compareIdentifiers(b, a);
	}

	exports.major = major;
	function major(a, loose) {
	  return new SemVer(a, loose).major;
	}

	exports.minor = minor;
	function minor(a, loose) {
	  return new SemVer(a, loose).minor;
	}

	exports.patch = patch;
	function patch(a, loose) {
	  return new SemVer(a, loose).patch;
	}

	exports.compare = compare;
	function compare(a, b, loose) {
	  return new SemVer(a, loose).compare(b);
	}

	exports.compareLoose = compareLoose;
	function compareLoose(a, b) {
	  return compare(a, b, true);
	}

	exports.rcompare = rcompare;
	function rcompare(a, b, loose) {
	  return compare(b, a, loose);
	}

	exports.sort = sort;
	function sort(list, loose) {
	  return list.sort(function(a, b) {
	    return exports.compare(a, b, loose);
	  });
	}

	exports.rsort = rsort;
	function rsort(list, loose) {
	  return list.sort(function(a, b) {
	    return exports.rcompare(a, b, loose);
	  });
	}

	exports.gt = gt;
	function gt(a, b, loose) {
	  return compare(a, b, loose) > 0;
	}

	exports.lt = lt;
	function lt(a, b, loose) {
	  return compare(a, b, loose) < 0;
	}

	exports.eq = eq;
	function eq(a, b, loose) {
	  return compare(a, b, loose) === 0;
	}

	exports.neq = neq;
	function neq(a, b, loose) {
	  return compare(a, b, loose) !== 0;
	}

	exports.gte = gte;
	function gte(a, b, loose) {
	  return compare(a, b, loose) >= 0;
	}

	exports.lte = lte;
	function lte(a, b, loose) {
	  return compare(a, b, loose) <= 0;
	}

	exports.cmp = cmp;
	function cmp(a, op, b, loose) {
	  var ret;
	  switch (op) {
	    case '===':
	      if (typeof a === 'object') a = a.version;
	      if (typeof b === 'object') b = b.version;
	      ret = a === b;
	      break;
	    case '!==':
	      if (typeof a === 'object') a = a.version;
	      if (typeof b === 'object') b = b.version;
	      ret = a !== b;
	      break;
	    case '': case '=': case '==': ret = eq(a, b, loose); break;
	    case '!=': ret = neq(a, b, loose); break;
	    case '>': ret = gt(a, b, loose); break;
	    case '>=': ret = gte(a, b, loose); break;
	    case '<': ret = lt(a, b, loose); break;
	    case '<=': ret = lte(a, b, loose); break;
	    default: throw new TypeError('Invalid operator: ' + op);
	  }
	  return ret;
	}

	exports.Comparator = Comparator;
	function Comparator(comp, loose) {
	  if (comp instanceof Comparator) {
	    if (comp.loose === loose)
	      return comp;
	    else
	      comp = comp.value;
	  }

	  if (!(this instanceof Comparator))
	    return new Comparator(comp, loose);

	  debug('comparator', comp, loose);
	  this.loose = loose;
	  this.parse(comp);

	  if (this.semver === ANY)
	    this.value = '';
	  else
	    this.value = this.operator + this.semver.version;

	  debug('comp', this);
	}

	var ANY = {};
	Comparator.prototype.parse = function(comp) {
	  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
	  var m = comp.match(r);

	  if (!m)
	    throw new TypeError('Invalid comparator: ' + comp);

	  this.operator = m[1];
	  if (this.operator === '=')
	    this.operator = '';

	  // if it literally is just '>' or '' then allow anything.
	  if (!m[2])
	    this.semver = ANY;
	  else
	    this.semver = new SemVer(m[2], this.loose);
	};

	Comparator.prototype.toString = function() {
	  return this.value;
	};

	Comparator.prototype.test = function(version) {
	  debug('Comparator.test', version, this.loose);

	  if (this.semver === ANY)
	    return true;

	  if (typeof version === 'string')
	    version = new SemVer(version, this.loose);

	  return cmp(version, this.operator, this.semver, this.loose);
	};


	exports.Range = Range;
	function Range(range, loose) {
	  if ((range instanceof Range) && range.loose === loose)
	    return range;

	  if (!(this instanceof Range))
	    return new Range(range, loose);

	  this.loose = loose;

	  // First, split based on boolean or ||
	  this.raw = range;
	  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
	    return this.parseRange(range.trim());
	  }, this).filter(function(c) {
	    // throw out any that are not relevant for whatever reason
	    return c.length;
	  });

	  if (!this.set.length) {
	    throw new TypeError('Invalid SemVer Range: ' + range);
	  }

	  this.format();
	}

	Range.prototype.format = function() {
	  this.range = this.set.map(function(comps) {
	    return comps.join(' ').trim();
	  }).join('||').trim();
	  return this.range;
	};

	Range.prototype.toString = function() {
	  return this.range;
	};

	Range.prototype.parseRange = function(range) {
	  var loose = this.loose;
	  range = range.trim();
	  debug('range', range, loose);
	  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
	  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
	  range = range.replace(hr, hyphenReplace);
	  debug('hyphen replace', range);
	  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
	  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
	  debug('comparator trim', range, re[COMPARATORTRIM]);

	  // `~ 1.2.3` => `~1.2.3`
	  range = range.replace(re[TILDETRIM], tildeTrimReplace);

	  // `^ 1.2.3` => `^1.2.3`
	  range = range.replace(re[CARETTRIM], caretTrimReplace);

	  // normalize spaces
	  range = range.split(/\s+/).join(' ');

	  // At this point, the range is completely trimmed and
	  // ready to be split into comparators.

	  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
	  var set = range.split(' ').map(function(comp) {
	    return parseComparator(comp, loose);
	  }).join(' ').split(/\s+/);
	  if (this.loose) {
	    // in loose mode, throw out any that are not valid comparators
	    set = set.filter(function(comp) {
	      return !!comp.match(compRe);
	    });
	  }
	  set = set.map(function(comp) {
	    return new Comparator(comp, loose);
	  });

	  return set;
	};

	// Mostly just for testing and legacy API reasons
	exports.toComparators = toComparators;
	function toComparators(range, loose) {
	  return new Range(range, loose).set.map(function(comp) {
	    return comp.map(function(c) {
	      return c.value;
	    }).join(' ').trim().split(' ');
	  });
	}

	// comprised of xranges, tildes, stars, and gtlt's at this point.
	// already replaced the hyphen ranges
	// turn into a set of JUST comparators.
	function parseComparator(comp, loose) {
	  debug('comp', comp);
	  comp = replaceCarets(comp, loose);
	  debug('caret', comp);
	  comp = replaceTildes(comp, loose);
	  debug('tildes', comp);
	  comp = replaceXRanges(comp, loose);
	  debug('xrange', comp);
	  comp = replaceStars(comp, loose);
	  debug('stars', comp);
	  return comp;
	}

	function isX(id) {
	  return !id || id.toLowerCase() === 'x' || id === '*';
	}

	// ~, ~> --> * (any, kinda silly)
	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
	function replaceTildes(comp, loose) {
	  return comp.trim().split(/\s+/).map(function(comp) {
	    return replaceTilde(comp, loose);
	  }).join(' ');
	}

	function replaceTilde(comp, loose) {
	  var r = loose ? re[TILDELOOSE] : re[TILDE];
	  return comp.replace(r, function(_, M, m, p, pr) {
	    debug('tilde', comp, _, M, m, p, pr);
	    var ret;

	    if (isX(M))
	      ret = '';
	    else if (isX(m))
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    else if (isX(p))
	      // ~1.2 == >=1.2.0- <1.3.0-
	      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	    else if (pr) {
	      debug('replaceTilde pr', pr);
	      if (pr.charAt(0) !== '-')
	        pr = '-' + pr;
	      ret = '>=' + M + '.' + m + '.' + p + pr +
	            ' <' + M + '.' + (+m + 1) + '.0';
	    } else
	      // ~1.2.3 == >=1.2.3 <1.3.0
	      ret = '>=' + M + '.' + m + '.' + p +
	            ' <' + M + '.' + (+m + 1) + '.0';

	    debug('tilde return', ret);
	    return ret;
	  });
	}

	// ^ --> * (any, kinda silly)
	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
	// ^1.2.3 --> >=1.2.3 <2.0.0
	// ^1.2.0 --> >=1.2.0 <2.0.0
	function replaceCarets(comp, loose) {
	  return comp.trim().split(/\s+/).map(function(comp) {
	    return replaceCaret(comp, loose);
	  }).join(' ');
	}

	function replaceCaret(comp, loose) {
	  debug('caret', comp, loose);
	  var r = loose ? re[CARETLOOSE] : re[CARET];
	  return comp.replace(r, function(_, M, m, p, pr) {
	    debug('caret', comp, _, M, m, p, pr);
	    var ret;

	    if (isX(M))
	      ret = '';
	    else if (isX(m))
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    else if (isX(p)) {
	      if (M === '0')
	        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	      else
	        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
	    } else if (pr) {
	      debug('replaceCaret pr', pr);
	      if (pr.charAt(0) !== '-')
	        pr = '-' + pr;
	      if (M === '0') {
	        if (m === '0')
	          ret = '>=' + M + '.' + m + '.' + p + pr +
	                ' <' + M + '.' + m + '.' + (+p + 1);
	        else
	          ret = '>=' + M + '.' + m + '.' + p + pr +
	                ' <' + M + '.' + (+m + 1) + '.0';
	      } else
	        ret = '>=' + M + '.' + m + '.' + p + pr +
	              ' <' + (+M + 1) + '.0.0';
	    } else {
	      debug('no pr');
	      if (M === '0') {
	        if (m === '0')
	          ret = '>=' + M + '.' + m + '.' + p +
	                ' <' + M + '.' + m + '.' + (+p + 1);
	        else
	          ret = '>=' + M + '.' + m + '.' + p +
	                ' <' + M + '.' + (+m + 1) + '.0';
	      } else
	        ret = '>=' + M + '.' + m + '.' + p +
	              ' <' + (+M + 1) + '.0.0';
	    }

	    debug('caret return', ret);
	    return ret;
	  });
	}

	function replaceXRanges(comp, loose) {
	  debug('replaceXRanges', comp, loose);
	  return comp.split(/\s+/).map(function(comp) {
	    return replaceXRange(comp, loose);
	  }).join(' ');
	}

	function replaceXRange(comp, loose) {
	  comp = comp.trim();
	  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
	  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
	    debug('xRange', comp, ret, gtlt, M, m, p, pr);
	    var xM = isX(M);
	    var xm = xM || isX(m);
	    var xp = xm || isX(p);
	    var anyX = xp;

	    if (gtlt === '=' && anyX)
	      gtlt = '';

	    if (xM) {
	      if (gtlt === '>' || gtlt === '<') {
	        // nothing is allowed
	        ret = '<0.0.0';
	      } else {
	        // nothing is forbidden
	        ret = '*';
	      }
	    } else if (gtlt && anyX) {
	      // replace X with 0
	      if (xm)
	        m = 0;
	      if (xp)
	        p = 0;

	      if (gtlt === '>') {
	        // >1 => >=2.0.0
	        // >1.2 => >=1.3.0
	        // >1.2.3 => >= 1.2.4
	        gtlt = '>=';
	        if (xm) {
	          M = +M + 1;
	          m = 0;
	          p = 0;
	        } else if (xp) {
	          m = +m + 1;
	          p = 0;
	        }
	      } else if (gtlt === '<=') {
	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
	        gtlt = '<'
	        if (xm)
	          M = +M + 1
	        else
	          m = +m + 1
	      }

	      ret = gtlt + M + '.' + m + '.' + p;
	    } else if (xm) {
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    } else if (xp) {
	      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	    }

	    debug('xRange return', ret);

	    return ret;
	  });
	}

	// Because * is AND-ed with everything else in the comparator,
	// and '' means "any version", just remove the *s entirely.
	function replaceStars(comp, loose) {
	  debug('replaceStars', comp, loose);
	  // Looseness is ignored here.  star is always as loose as it gets!
	  return comp.trim().replace(re[STAR], '');
	}

	// This function is passed to string.replace(re[HYPHENRANGE])
	// M, m, patch, prerelease, build
	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
	// 1.2 - 3.4 => >=1.2.0 <3.5.0
	function hyphenReplace($0,
	                       from, fM, fm, fp, fpr, fb,
	                       to, tM, tm, tp, tpr, tb) {

	  if (isX(fM))
	    from = '';
	  else if (isX(fm))
	    from = '>=' + fM + '.0.0';
	  else if (isX(fp))
	    from = '>=' + fM + '.' + fm + '.0';
	  else
	    from = '>=' + from;

	  if (isX(tM))
	    to = '';
	  else if (isX(tm))
	    to = '<' + (+tM + 1) + '.0.0';
	  else if (isX(tp))
	    to = '<' + tM + '.' + (+tm + 1) + '.0';
	  else if (tpr)
	    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
	  else
	    to = '<=' + to;

	  return (from + ' ' + to).trim();
	}


	// if ANY of the sets match ALL of its comparators, then pass
	Range.prototype.test = function(version) {
	  if (!version)
	    return false;

	  if (typeof version === 'string')
	    version = new SemVer(version, this.loose);

	  for (var i = 0; i < this.set.length; i++) {
	    if (testSet(this.set[i], version))
	      return true;
	  }
	  return false;
	};

	function testSet(set, version) {
	  for (var i = 0; i < set.length; i++) {
	    if (!set[i].test(version))
	      return false;
	  }

	  if (version.prerelease.length) {
	    // Find the set of versions that are allowed to have prereleases
	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
	    // That should allow `1.2.3-pr.2` to pass.
	    // However, `1.2.4-alpha.notready` should NOT be allowed,
	    // even though it's within the range set by the comparators.
	    for (var i = 0; i < set.length; i++) {
	      debug(set[i].semver);
	      if (set[i].semver === ANY)
	        continue;

	      if (set[i].semver.prerelease.length > 0) {
	        var allowed = set[i].semver;
	        if (allowed.major === version.major &&
	            allowed.minor === version.minor &&
	            allowed.patch === version.patch)
	          return true;
	      }
	    }

	    // Version has a -pre, but it's not one of the ones we like.
	    return false;
	  }

	  return true;
	}

	exports.satisfies = satisfies;
	function satisfies(version, range, loose) {
	  try {
	    range = new Range(range, loose);
	  } catch (er) {
	    return false;
	  }
	  return range.test(version);
	}

	exports.maxSatisfying = maxSatisfying;
	function maxSatisfying(versions, range, loose) {
	  return versions.filter(function(version) {
	    return satisfies(version, range, loose);
	  }).sort(function(a, b) {
	    return rcompare(a, b, loose);
	  })[0] || null;
	}

	exports.validRange = validRange;
	function validRange(range, loose) {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new Range(range, loose).range || '*';
	  } catch (er) {
	    return null;
	  }
	}

	// Determine if version is less than all the versions possible in the range
	exports.ltr = ltr;
	function ltr(version, range, loose) {
	  return outside(version, range, '<', loose);
	}

	// Determine if version is greater than all the versions possible in the range.
	exports.gtr = gtr;
	function gtr(version, range, loose) {
	  return outside(version, range, '>', loose);
	}

	exports.outside = outside;
	function outside(version, range, hilo, loose) {
	  version = new SemVer(version, loose);
	  range = new Range(range, loose);

	  var gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt;
	      ltefn = lte;
	      ltfn = lt;
	      comp = '>';
	      ecomp = '>=';
	      break;
	    case '<':
	      gtfn = lt;
	      ltefn = gte;
	      ltfn = gt;
	      comp = '<';
	      ecomp = '<=';
	      break;
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"');
	  }

	  // If it satisifes the range it is not outside
	  if (satisfies(version, range, loose)) {
	    return false;
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (var i = 0; i < range.set.length; ++i) {
	    var comparators = range.set[i];

	    var high = null;
	    var low = null;

	    comparators.forEach(function(comparator) {
	      if (comparator.semver === ANY) {
	        comparator = new Comparator('>=0.0.0')
	      }
	      high = high || comparator;
	      low = low || comparator;
	      if (gtfn(comparator.semver, high.semver, loose)) {
	        high = comparator;
	      } else if (ltfn(comparator.semver, low.semver, loose)) {
	        low = comparator;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false;
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false;
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false;
	    }
	  }
	  return true;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(78);
	module['exports'] = colors;

	// Remark: By default, colors will add style properties to String.prototype
	//
	// If you don't wish to extend String.prototype you can do this instead and native String will not be touched
	//
	//   var colors = require('colors/safe);
	//   colors.red("foo")
	//
	//
	__webpack_require__(84)();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/*

	The MIT License (MIT)

	Original Library 
	  - Copyright (c) Marak Squires

	Additional functionality
	 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var colors = {};
	module['exports'] = colors;

	colors.themes = {};

	var ansiStyles = colors.styles = __webpack_require__(79);
	var defineProps = Object.defineProperties;

	colors.supportsColor = __webpack_require__(80);

	if (typeof colors.enabled === "undefined") {
	  colors.enabled = colors.supportsColor;
	}

	colors.stripColors = colors.strip = function(str){
	  return ("" + str).replace(/\x1B\[\d+m/g, '');
	};


	var stylize = colors.stylize = function stylize (str, style) {
	  if (!colors.enabled) {
	    return str+'';
	  }

	  return ansiStyles[style].open + str + ansiStyles[style].close;
	}

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	var escapeStringRegexp = function (str) {
	  if (typeof str !== 'string') {
	    throw new TypeError('Expected a string');
	  }
	  return str.replace(matchOperatorsRe,  '\\$&');
	}

	function build(_styles) {
	  var builder = function builder() {
	    return applyStyle.apply(builder, arguments);
	  };
	  builder._styles = _styles;
	  // __proto__ is used because we must return a function, but there is
	  // no way to create a function with a different prototype.
	  builder.__proto__ = proto;
	  return builder;
	}

	var styles = (function () {
	  var ret = {};
	  ansiStyles.grey = ansiStyles.gray;
	  Object.keys(ansiStyles).forEach(function (key) {
	    ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
	    ret[key] = {
	      get: function () {
	        return build(this._styles.concat(key));
	      }
	    };
	  });
	  return ret;
	})();

	var proto = defineProps(function colors() {}, styles);

	function applyStyle() {
	  var args = arguments;
	  var argsLen = args.length;
	  var str = argsLen !== 0 && String(arguments[0]);
	  if (argsLen > 1) {
	    for (var a = 1; a < argsLen; a++) {
	      str += ' ' + args[a];
	    }
	  }

	  if (!colors.enabled || !str) {
	    return str;
	  }

	  var nestedStyles = this._styles;

	  var i = nestedStyles.length;
	  while (i--) {
	    var code = ansiStyles[nestedStyles[i]];
	    str = code.open + str.replace(code.closeRe, code.open) + code.close;
	  }

	  return str;
	}

	function applyTheme (theme) {
	  for (var style in theme) {
	    (function(style){
	      colors[style] = function(str){
	        if (typeof theme[style] === 'object'){
	          var out = str;
	          for (var i in theme[style]){
	            out = colors[theme[style][i]](out);
	          }
	          return out;
	        }
	        return colors[theme[style]](str);
	      };
	    })(style)
	  }
	}

	colors.setTheme = function (theme) {
	  if (typeof theme === 'string') {
	    try {
	      colors.themes[theme] = __webpack_require__(81)(theme);
	      applyTheme(colors.themes[theme]);
	      return colors.themes[theme];
	    } catch (err) {
	      console.log(err);
	      return err;
	    }
	  } else {
	    applyTheme(theme);
	  }
	};

	function init() {
	  var ret = {};
	  Object.keys(styles).forEach(function (name) {
	    ret[name] = {
	      get: function () {
	        return build([name]);
	      }
	    };
	  });
	  return ret;
	}

	var sequencer = function sequencer (map, str) {
	  var exploded = str.split(""), i = 0;
	  exploded = exploded.map(map);
	  return exploded.join("");
	};

	// custom formatter methods
	colors.trap = __webpack_require__(82);
	colors.zalgo = __webpack_require__(83);

	// maps
	colors.maps = {};
	colors.maps.america = __webpack_require__(85);
	colors.maps.zebra = __webpack_require__(88);
	colors.maps.rainbow = __webpack_require__(86);
	colors.maps.random = __webpack_require__(87)

	for (var map in colors.maps) {
	  (function(map){
	    colors[map] = function (str) {
	      return sequencer(colors.maps[map], str);
	    }
	  })(map)
	}

	defineProps(colors, init());
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var styles = {};
	module['exports'] = styles;

	var codes = {
	  reset: [0, 0],

	  bold: [1, 22],
	  dim: [2, 22],
	  italic: [3, 23],
	  underline: [4, 24],
	  inverse: [7, 27],
	  hidden: [8, 28],
	  strikethrough: [9, 29],

	  black: [30, 39],
	  red: [31, 39],
	  green: [32, 39],
	  yellow: [33, 39],
	  blue: [34, 39],
	  magenta: [35, 39],
	  cyan: [36, 39],
	  white: [37, 39],
	  gray: [90, 39],
	  grey: [90, 39],

	  bgBlack: [40, 49],
	  bgRed: [41, 49],
	  bgGreen: [42, 49],
	  bgYellow: [43, 49],
	  bgBlue: [44, 49],
	  bgMagenta: [45, 49],
	  bgCyan: [46, 49],
	  bgWhite: [47, 49],

	  // legacy styles for colors pre v1.0.0
	  blackBG: [40, 49],
	  redBG: [41, 49],
	  greenBG: [42, 49],
	  yellowBG: [43, 49],
	  blueBG: [44, 49],
	  magentaBG: [45, 49],
	  cyanBG: [46, 49],
	  whiteBG: [47, 49]

	};

	Object.keys(codes).forEach(function (key) {
	  var val = codes[key];
	  var style = styles[key] = [];
	  style.open = '\u001b[' + val[0] + 'm';
	  style.close = '\u001b[' + val[1] + 'm';
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var argv = process.argv;

	module.exports = (function () {
	  if (argv.indexOf('--no-color') !== -1 ||
	    argv.indexOf('--color=false') !== -1) {
	    return false;
	  }

	  if (argv.indexOf('--color') !== -1 ||
	    argv.indexOf('--color=true') !== -1 ||
	    argv.indexOf('--color=always') !== -1) {
	    return true;
	  }

	  if (process.stdout && !process.stdout.isTTY) {
	    return false;
	  }

	  if (process.platform === 'win32') {
	    return true;
	  }

	  if ('COLORTERM' in process.env) {
	    return true;
	  }

	  if (process.env.TERM === 'dumb') {
	    return false;
	  }

	  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
	    return true;
	  }

	  return false;
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./colors": 78,
		"./colors.js": 78,
		"./custom/trap": 82,
		"./custom/trap.js": 82,
		"./custom/zalgo": 83,
		"./custom/zalgo.js": 83,
		"./extendStringPrototype": 84,
		"./extendStringPrototype.js": 84,
		"./index": 76,
		"./index.js": 76,
		"./maps/america": 85,
		"./maps/america.js": 85,
		"./maps/rainbow": 86,
		"./maps/rainbow.js": 86,
		"./maps/random": 87,
		"./maps/random.js": 87,
		"./maps/zebra": 88,
		"./maps/zebra.js": 88,
		"./styles": 79,
		"./styles.js": 79,
		"./system/supports-colors": 80,
		"./system/supports-colors.js": 80
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 81;


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {module['exports'] = function runTheTrap (text, options) {
	  var result = "";
	  text = text || "Run the trap, drop the bass";
	  text = text.split('');
	  var trap = {
	    a: ["\u0040", "\u0104", "\u023a", "\u0245", "\u0394", "\u039b", "\u0414"],
	    b: ["\u00df", "\u0181", "\u0243", "\u026e", "\u03b2", "\u0e3f"],
	    c: ["\u00a9", "\u023b", "\u03fe"],
	    d: ["\u00d0", "\u018a", "\u0500" , "\u0501" ,"\u0502", "\u0503"],
	    e: ["\u00cb", "\u0115", "\u018e", "\u0258", "\u03a3", "\u03be", "\u04bc", "\u0a6c"],
	    f: ["\u04fa"],
	    g: ["\u0262"],
	    h: ["\u0126", "\u0195", "\u04a2", "\u04ba", "\u04c7", "\u050a"],
	    i: ["\u0f0f"],
	    j: ["\u0134"],
	    k: ["\u0138", "\u04a0", "\u04c3", "\u051e"],
	    l: ["\u0139"],
	    m: ["\u028d", "\u04cd", "\u04ce", "\u0520", "\u0521", "\u0d69"],
	    n: ["\u00d1", "\u014b", "\u019d", "\u0376", "\u03a0", "\u048a"],
	    o: ["\u00d8", "\u00f5", "\u00f8", "\u01fe", "\u0298", "\u047a", "\u05dd", "\u06dd", "\u0e4f"],
	    p: ["\u01f7", "\u048e"],
	    q: ["\u09cd"],
	    r: ["\u00ae", "\u01a6", "\u0210", "\u024c", "\u0280", "\u042f"],
	    s: ["\u00a7", "\u03de", "\u03df", "\u03e8"],
	    t: ["\u0141", "\u0166", "\u0373"],
	    u: ["\u01b1", "\u054d"],
	    v: ["\u05d8"],
	    w: ["\u0428", "\u0460", "\u047c", "\u0d70"],
	    x: ["\u04b2", "\u04fe", "\u04fc", "\u04fd"],
	    y: ["\u00a5", "\u04b0", "\u04cb"],
	    z: ["\u01b5", "\u0240"]
	  }
	  text.forEach(function(c){
	    c = c.toLowerCase();
	    var chars = trap[c] || [" "];
	    var rand = Math.floor(Math.random() * chars.length);
	    if (typeof trap[c] !== "undefined") {
	      result += trap[c][rand];
	    } else {
	      result += c;
	    }
	  });
	  return result;

	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {// please no
	module['exports'] = function zalgo(text, options) {
	  text = text || "   he is here   ";
	  var soul = {
	    "up" : [
	      '̍', '̎', '̄', '̅',
	      '̿', '̑', '̆', '̐',
	      '͒', '͗', '͑', '̇',
	      '̈', '̊', '͂', '̓',
	      '̈', '͊', '͋', '͌',
	      '̃', '̂', '̌', '͐',
	      '̀', '́', '̋', '̏',
	      '̒', '̓', '̔', '̽',
	      '̉', 'ͣ', 'ͤ', 'ͥ',
	      'ͦ', 'ͧ', 'ͨ', 'ͩ',
	      'ͪ', 'ͫ', 'ͬ', 'ͭ',
	      'ͮ', 'ͯ', '̾', '͛',
	      '͆', '̚'
	    ],
	    "down" : [
	      '̖', '̗', '̘', '̙',
	      '̜', '̝', '̞', '̟',
	      '̠', '̤', '̥', '̦',
	      '̩', '̪', '̫', '̬',
	      '̭', '̮', '̯', '̰',
	      '̱', '̲', '̳', '̹',
	      '̺', '̻', '̼', 'ͅ',
	      '͇', '͈', '͉', '͍',
	      '͎', '͓', '͔', '͕',
	      '͖', '͙', '͚', '̣'
	    ],
	    "mid" : [
	      '̕', '̛', '̀', '́',
	      '͘', '̡', '̢', '̧',
	      '̨', '̴', '̵', '̶',
	      '͜', '͝', '͞',
	      '͟', '͠', '͢', '̸',
	      '̷', '͡', ' ҉'
	    ]
	  },
	  all = [].concat(soul.up, soul.down, soul.mid),
	  zalgo = {};

	  function randomNumber(range) {
	    var r = Math.floor(Math.random() * range);
	    return r;
	  }

	  function is_char(character) {
	    var bool = false;
	    all.filter(function (i) {
	      bool = (i === character);
	    });
	    return bool;
	  }
	  

	  function heComes(text, options) {
	    var result = '', counts, l;
	    options = options || {};
	    options["up"] =   typeof options["up"]   !== 'undefined' ? options["up"]   : true;
	    options["mid"] =  typeof options["mid"]  !== 'undefined' ? options["mid"]  : true;
	    options["down"] = typeof options["down"] !== 'undefined' ? options["down"] : true;
	    options["size"] = typeof options["size"] !== 'undefined' ? options["size"] : "maxi";
	    text = text.split('');
	    for (l in text) {
	      if (is_char(l)) {
	        continue;
	      }
	      result = result + text[l];
	      counts = {"up" : 0, "down" : 0, "mid" : 0};
	      switch (options.size) {
	      case 'mini':
	        counts.up = randomNumber(8);
	        counts.mid = randomNumber(2);
	        counts.down = randomNumber(8);
	        break;
	      case 'maxi':
	        counts.up = randomNumber(16) + 3;
	        counts.mid = randomNumber(4) + 1;
	        counts.down = randomNumber(64) + 3;
	        break;
	      default:
	        counts.up = randomNumber(8) + 1;
	        counts.mid = randomNumber(6) / 2;
	        counts.down = randomNumber(8) + 1;
	        break;
	      }

	      var arr = ["up", "mid", "down"];
	      for (var d in arr) {
	        var index = arr[d];
	        for (var i = 0 ; i <= counts[index]; i++) {
	          if (options[index]) {
	            result = result + soul[index][randomNumber(soul[index].length)];
	          }
	        }
	      }
	    }
	    return result;
	  }
	  // don't summon him
	  return heComes(text, options);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(78);

	module['exports'] = function () {

	  //
	  // Extends prototype of native string object to allow for "foo".red syntax
	  //
	  var addProperty = function (color, func) {
	    String.prototype.__defineGetter__(color, func);
	  };

	  var sequencer = function sequencer (map, str) {
	      return function () {
	        var exploded = this.split(""), i = 0;
	        exploded = exploded.map(map);
	        return exploded.join("");
	      }
	  };

	  addProperty('strip', function () {
	    return colors.strip(this);
	  });

	  addProperty('stripColors', function () {
	    return colors.strip(this);
	  });

	  addProperty("trap", function(){
	    return colors.trap(this);
	  });

	  addProperty("zalgo", function(){
	    return colors.zalgo(this);
	  });

	  addProperty("zebra", function(){
	    return colors.zebra(this);
	  });

	  addProperty("rainbow", function(){
	    return colors.rainbow(this);
	  });

	  addProperty("random", function(){
	    return colors.random(this);
	  });

	  addProperty("america", function(){
	    return colors.america(this);
	  });

	  //
	  // Iterate through all default styles and colors
	  //
	  var x = Object.keys(colors.styles);
	  x.forEach(function (style) {
	    addProperty(style, function () {
	      return colors.stylize(this, style);
	    });
	  });

	  function applyTheme(theme) {
	    //
	    // Remark: This is a list of methods that exist
	    // on String that you should not overwrite.
	    //
	    var stringPrototypeBlacklist = [
	      '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'charAt', 'constructor',
	      'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf', 'charCodeAt',
	      'indexOf', 'lastIndexof', 'length', 'localeCompare', 'match', 'replace', 'search', 'slice', 'split', 'substring',
	      'toLocaleLowerCase', 'toLocaleUpperCase', 'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight'
	    ];

	    Object.keys(theme).forEach(function (prop) {
	      if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
	        console.log('warn: '.red + ('String.prototype' + prop).magenta + ' is probably something you don\'t want to override. Ignoring style name');
	      }
	      else {
	        if (typeof(theme[prop]) === 'string') {
	          colors[prop] = colors[theme[prop]];
	          addProperty(prop, function () {
	            return colors[theme[prop]](this);
	          });
	        }
	        else {
	          addProperty(prop, function () {
	            var ret = this;
	            for (var t = 0; t < theme[prop].length; t++) {
	              ret = colors[theme[prop][t]](ret);
	            }
	            return ret;
	          });
	        }
	      }
	    });
	  }

	  colors.setTheme = function (theme) {
	    if (typeof theme === 'string') {
	      try {
	        colors.themes[theme] = __webpack_require__(81)(theme);
	        applyTheme(colors.themes[theme]);
	        return colors.themes[theme];
	      } catch (err) {
	        console.log(err);
	        return err;
	      }
	    } else {
	      applyTheme(theme);
	    }
	  };

	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(78);

	module['exports'] = (function() {
	  return function (letter, i, exploded) {
	    if(letter === " ") return letter;
	    switch(i%3) {
	      case 0: return colors.red(letter);
	      case 1: return colors.white(letter)
	      case 2: return colors.blue(letter)
	    }
	  }
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(78);

	module['exports'] = (function () {
	  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; //RoY G BiV
	  return function (letter, i, exploded) {
	    if (letter === " ") {
	      return letter;
	    } else {
	      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
	    }
	  };
	})();


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(78);

	module['exports'] = (function () {
	  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
	  return function(letter, i, exploded) {
	    return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 1))]](letter);
	  };
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(78);

	module['exports'] = function (letter, i, exploded) {
	  return i % 2 === 0 ? letter : colors.inverse(letter);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(77)(module)))

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./resolver": 33,
		"./resolver.js": 33
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 89;


/***/ }
]);