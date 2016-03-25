(function() {
    function extend(dst, src) {
        for (var k in src)
            dst[k] = dst[k] || src[k];
    }

    function ensureFunction(x, y) {
        return typeof x == 'function' ? x : y;
    };


    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL();
    }
    
    // For the Default Progress Circle
    //****************************************************************************************************//
    var default_circle_style = {
        color: '#1D5ECE',
        bgcolor: '#eaeaea',
        semi: false,
        rounded: false,
        clockwise: true,
        radius: '15',
        stroke: '5',
        max: 100,
        iterations: 50,
        animation: 'easeOutCubic',
        interval: 200,
        showProgressCircleInBrowser: true,
        showProgressCircleInDevice: true,
        circleContainerStyle: 'text-align:center'
    };

    function getElement(element) {
        switch (element[0].nodeName) {
            case 'SOURCE':
                return element.parent();

            default:
                return element;
        }
    }

    function makeProgressCircle($scope, $compile) {
        return angular.element($compile('<div style="{{circleContainerStyle}}"><div round-progress  max="max"  current="progress"  color="{{color}}" bgcolor="{{bgcolor}}"  radius="{{radius}}"  stroke="{{stroke}}"  rounded="rounded" clockwise="clockwise" iterations="{{iterations}}"  animation="{{animation}}"></div></div>')($scope));
    };

    var uiOnProgress = function(scope, element, $compile, uiData) {
        scope.progress = uiData.progress;
    };
    var uiOnStart = function(scope, element, $compile, uiData) {
        // debugger;
        var elm = getElement(element);
        if (scope.srcIs == 'background') {
            elm.css('background', scope.backgroundLoadingStyle);
        } else if (element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO') {
            extend(scope, default_circle_style);
            var progress_circle;

            function addCircle() {
                progress_circle = makeProgressCircle(scope, $compile);
                uiData.display = elm.css('display');
                elm.css('display', 'none');
                elm.after(progress_circle);
            };

            if (window.cordova) {
                if (scope.showProgressCircleInDevice) {
                    addCircle();
                }
            } else {
                if (scope.showProgressCircleInBrowser) {
                    addCircle();
                }
            }
            uiData.progress_circle = progress_circle;
        }
    };
    var uiOnFinish = function(scope, element, $compile, uiData) {
        if (scope.srcIs != 'background' && (element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO')) {
            var elm = getElement(element);

            function rmCircle() {
                elm.css('display', uiData.display);
                uiData.progress_circle.remove();
            }
            if (window.cordova) {
                if (scope.showProgressCircleInDevice) {
                    rmCircle();
                }
            } else {
                if (scope.showProgressCircleInBrowser) {
                    rmCircle();
                }
            }
        }
    };
    //****************************************************************************************************//
    function id() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };

    function startsWith(str, arr) {
        for (var i = 0; i < arr.length; i++) {
            var sub_str = arr[i];
            if (str.indexOf(sub_str) === 0) {
                return true;
            }
        }
        return false;
    };

    function needDownload(path) {
        if (startsWith(path, [
                'http://',
                'https://',
                'ftp://'
            ])) {
            return true;
        } else {
            return false;
        }
    };


    var default_config = {
        interval: 200,
        backgroundStyle: '',
        backgroundLoadingStyle: "url('lib/ionic-cache-src/img/loader.gif') no-repeat center",
        uiOnStart: uiOnStart,
        uiOnFinish: uiOnFinish,
        uiOnProgress: uiOnProgress,
        encodeUri: true,
        expire: Infinity
    };
    var getCacheDir = function() {};
    angular
        .module('ionic-cache-src', [
            'ionic',
            'angular-svg-round-progress',
            'ngCordova',
            'ngStorage'
        ])
        .provider('$cacheSrc', function() {
            this.config = default_config;
            this.set = function(obj, val) {
                var t = typeof obj;
                if (t == 'object') {
                    angular.extend(this.config, obj);
                } else if (t == 'string') {
                    this.config[obj] = val;
                }
                return this;
            };
            this.$get = function() {
                return this.config;
            };
        })
        .factory('cacheSrcStorage', function($localStorage) {
            var c = {};
            c._cache = $localStorage.cache_src || {};
            c.get = function(url) {
                if (needDownload(url)) {
                    var cache_url = c._cache[url] && (getCacheDir() + c._cache[url]);
                    return cache_url || url;
                }
                return undefined;
            };
            c.set = function(url, localUrl) {
                c._cache[url] = localUrl;
                return c;
            };
            c.reset = function(url) {
                if (url != undefined)
                    delete $localStorage.cache_src[url];
                else
                    $localStorage.cache_src = {};
            };

            return c;
        })
        .directive('cacheSrc', function($ionicPlatform, $window, $interval, $timeout, $compile, $cacheSrc, $cordovaFileTransfer, $localStorage,$cordovaFile) {
            return {
                restrict: 'A',
                priority: 99,
                scope: {
                    'onProgress': '=?',
                    'onFinish': '=?',
                    'onError': '=?',
                    'onStart': '=?',
                    // 
                    'uiOnStart': '=?',
                    'uiOnProgress': '=?',
                    'uiOnFinish': '=?'
                },
                link: function(scope, element, attrs) {


                    // debugger;
                    extend(scope, $cacheSrc);
                    for (var k in attrs) {
                        if (!angular.isFunction(scope[k])) {
                            scope[k] = attrs[k];
                        }
                    }

                    scope.expire = parseInt(scope.expire) || $cacheSrc.expire;

                    if (scope.encodeUri === "false")
                        scope.encodeUri = false;
                    else
                        scope.encodeUri = $cacheSrc.encodeUri;
                    // console.log("encodeURI:"+scope.encodeUri);
                    scope.onProgress = ensureFunction(scope.onProgress, angular.noop);
                    scope.onFinish = ensureFunction(scope.onFinish, angular.noop);
                    scope.onError = ensureFunction(scope.onError, angular.noop);
                    scope.onStart = ensureFunction(scope.onStart, angular.noop);
                    scope.uiOnProgress = ensureFunction(scope.uiOnProgress, angular.noop); //use default ones
                    scope.uiOnFinish = ensureFunction(scope.uiOnFinish, angular.noop);
                    scope.uiOnStart = ensureFunction(scope.uiOnStart, angular.noop);


                    

                    function addSrcWithoutFinish(result) {
                        if (scope.srcIs == 'background') {
                            getElement(element).css('background', "url('" + result + "') " + scope.backgroundStyle);
                        } else {
                            getElement(element).attr(scope.srcIs || 'src', result);
                        }
                    }

                    function addSrc(result) {
                        addSrcWithoutFinish(result);
                        scope.onFinish(result);
                    };
                    if ($window.cordova) {
                        var getCacheDir = function() {
                            if (window.device)
                                if (window.cordova.file) {
                                    switch (device.platform) {
                                        case 'iOS':
                                            return $window.cordova.file.documentsDirectory;
                                        case 'Android':
                                            return $window.cordova.file.dataDirectory;
                                        case 'windows':
                                            return $window.cordova.file.dataDirectory;
                                    }
                                } else
                                    throw new Error("window.cordova.file is not defined! Maybe you should install cordova-plugin-file first!");
                            else
                                throw new Error("window.device is not defined! Maybe you should install cordova-plugin-device first!");
                            return '';
                        };                        
                        
                        var cache = $localStorage.cache_src = $localStorage.cache_src || {};
                        var create_time = $localStorage.cache_src_create_time = $localStorage.cache_src_create_time || {};
                        function scopeOnError(fileName,uiData) {
                            return function(E) {
                                if (E.code == 3) {
                                    console.log('Error Occurs: ' + E.exception + "\nCode:" + E.code + "\nSrc:" + E.source);
                                    if(uiData)
                                        scope.uiOnFinish(scope, element, $compile, uiData);
                                    addSrcWithoutFinish(E.source);                                    
                                    // var b64 = getBase64Image(getElement(element));
                                    // if(b64.length > 200)
                                    //     $cordovaFile
                                    //     .writeFile(getCacheDir(), fileName, b64, true)
                                    //     .then(function(){
                                    //         cache[attrs.cacheSrc] = fileName;
                                    //         if (scope.expire !== Infinity) {
                                    //             create_time[attrs.cacheSrc] = Date.now();
                                    //         }                                        
                                    //         addSrc(getCacheDir() + fileName);
                                    //     },scope.onError);                                                       
                                } else {
                                    scope.onError(E);
                                }
                            };
                        }

                        function fetchRemoteWithoutLoading() {
                            var ext = '.' + attrs.cacheSrc.split('.').pop();
                            var fileName = id() + ext;
                            $cordovaFileTransfer
                                .download(attrs.cacheSrc, getCacheDir() + fileName, {
                                    encodeURI: scope.encodeUri,
                                    chunkedMode: false,
                                    headers: {
                                        Connection: "close"
                                    }
                                }, true)
                                .then(function() {
                                    cache[attrs.cacheSrc] = fileName;
                                    if (scope.expire !== Infinity) {
                                        create_time[attrs.cacheSrc] = Date.now();
                                    }
                                    addSrc(getCacheDir() + fileName);
                                }, scopeOnError(fileName), angular.noop);
                        }

                        function fetchRemote() {
                            var uiData = {};
                            scope.onStart(attrs.cacheSrc);
                            // var elem = getElement(element);
                            scope.uiOnStart(scope, element, $compile, uiData);


                            var ext = '.' + attrs.cacheSrc.split('.').pop();
                            var fileName = id() + ext;
                            $cordovaFileTransfer
                                .download(attrs.cacheSrc, getCacheDir() + fileName, {
                                    encodeURI: scope.encodeUri,
                                    chunkedMode: false,
                                    headers: {

                                        Connection: "close"
                                    }
                                }, true)
                                .then(function() {
                                    cache[attrs.cacheSrc] = fileName;
                                    if (scope.expire !== Infinity) {
                                        create_time[attrs.cacheSrc] = Date.now();
                                    }
                                    scope.uiOnFinish(scope, element, $compile, uiData);
                                    addSrc(getCacheDir() + fileName);
                                }, scopeOnError(fileName,uiData), function(progress) {
                                    uiData.progress = (progress.loaded / progress.total) * 100;
                                    scope.uiOnProgress(scope, element, $compile, uiData);
                                    scope.onProgress(uiData.progress);
                                });

                        }

                        function fetchCache() {
                            addSrc(getCacheDir() + cache[attrs.cacheSrc]);
                        }



                        $ionicPlatform
                            .ready(function() {
                                attrs.$observe('cacheSrc',
                                    function() {
                                        // debugger;
                                        if (attrs.cacheSrc) {
                                            if (needDownload(attrs.cacheSrc)) {
                                                if (cache[attrs.cacheSrc]) {
                                                    var now = Date.now();
                                                    var create = create_time[attrs.cacheSrc] || Infinity;
                                                    if (now - create < scope.expire * 1000) {
                                                        fetchCache();
                                                    } else {
                                                        // alert('Cache expired');
                                                        addSrcWithoutFinish(getCacheDir() + cache[attrs.cacheSrc]);
                                                        fetchRemoteWithoutLoading();
                                                    }
                                                } else {
                                                    fetchRemote();
                                                }
                                            } else {
                                                addSrc(attrs.cacheSrc);
                                            }
                                        }
                                    });
                            });
                    } else {
                        // in browser                        
                        attrs.$observe('cacheSrc', function() {
                            if (attrs.cacheSrc) {
                                if (needDownload(attrs.cacheSrc)) {
                                    // var elem = getElement(element);
                                    var uiData = {};
                                    scope.onStart(attrs.cacheSrc);
                                    scope.uiOnStart(scope, element, $compile, uiData);
                                    element[0].onerror = scope.onError;
                                    uiData.progress = scope.progress || 0;
                                    // debugger;
                                    var promise = $interval(function() {
                                        uiData.progress += 10;
                                        scope.uiOnProgress(scope, element, $compile, uiData);
                                        scope.onProgress(uiData.progress);

                                        if (uiData.progress == 100) {
                                            $interval.cancel(promise);
                                            scope.uiOnFinish(scope, element, $compile, uiData);
                                            addSrc(attrs.cacheSrc);
                                        }
                                    }, scope.interval);
                                } else {
                                    addSrc(attrs.cacheSrc);
                                }
                            }
                        });

                    }

                }
            };
        });
}());
