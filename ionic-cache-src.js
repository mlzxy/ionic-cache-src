(function() {




    function extend(dst, src) {
        for (var k in src)
            dst[k] = dst[k] || src[k];
    }

    function ensureFunction(x, y) {
        return typeof x == 'function' ? x : y;
    };

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

    function makeProgressCircle($scope, $compile) {
        return angular.element($compile('<div style="{{circleContainerStyle}}"><div round-progress  max="max"  current="progress"  color="{{color}}" bgcolor="{{bgcolor}}"  radius="{{radius}}"  stroke="{{stroke}}"  rounded="rounded" clockwise="clockwise" iterations="{{iterations}}"  animation="{{animation}}"></div></div>')($scope));
    };

    var uiOnProgress = function(scope, element, $compile, uiData) {
        scope.progress = uiData.progress;
    };
    var uiOnStart = function(scope, element, $compile, uiData) {
        if (scope.srcIs == 'background') {
            element[0].style.background = scope.backgroundLoadingStyle;
        } else {
            extend(scope, default_circle_style);
            var progress_circle;

            function addCircle() {
                progress_circle = makeProgressCircle(scope, $compile);
                uiData.display = element.css('display');
                element.css('display', 'none');
                element.after(progress_circle);
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
        if (scope.srcIs != 'background') {
            function rmCircle() {
                element.css('display', uiData.display);
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


    var default_config = {
        interval: 200,
        backgroundStyle: '',
        backgroundLoadingStyle: "url('lib/ionic-cache-src/img/loader.gif') no-repeat center",
        uiOnStart: uiOnStart,
        uiOnFinish: uiOnFinish,
        uiOnProgress: uiOnProgress,
        expire: Infinity
    };

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
            c._cache = $localStorage.cache_src;
            c.get = function(url) {
                return c._cache[url] && (getCacheDir() + c._cache[url]);
            };
            c.set = function(url, localUrl) {
                c._cache[url] = localUrl;
                return c;
            };
            return c;
        })
        .directive('cacheSrc', function($ionicPlatform, $window, $interval, $timeout, $compile, $cacheSrc, $cordovaFileTransfer, $localStorage) {
            return {
                restrict: 'A',
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


                    extend(scope, $cacheSrc);                    
                    for (var k in attrs) {
                        if (!angular.isFunction(scope[k])) {
                            scope[k] = attrs[k];
                        }
                    }
                    
                    scope.expire = parseInt(scope.expire) || $cacheSrc.expire;

                    scope.onProgress = ensureFunction(scope.onProgress, angular.noop);
                    scope.onFinish = ensureFunction(scope.onFinish, angular.noop);
                    scope.onError = ensureFunction(scope.onError, angular.noop);
                    scope.onStart = ensureFunction(scope.onStart, angular.noop);
                    scope.uiOnProgress = ensureFunction(scope.uiOnProgress, angular.noop); //use default ones
                    scope.uiOnFinish = ensureFunction(scope.uiOnFinish, angular.noop);
                    scope.uiOnStart = ensureFunction(scope.uiOnStart, angular.noop);


                    function addSrcWithoutFinish(result) {
                        if (scope.srcIs == 'background') {
                            element[0].style.background = "url('" + result + "') " + scope.backgroundStyle;
                        } else {
                            element[0][scope.srcIs || 'src'] = result;
                        }
                    }

                    function addSrc(result) {
                        addSrcWithoutFinish(result);
                        scope.onFinish(result);
                    };



                    if ($window.cordova) {
                        function getCacheDir() {
                            switch (device.platform) {
                                case 'iOS':
                                    return $window.cordova.file.documentsDirectory;
                                case 'Android':
                                    return $window.cordova.file.dataDirectory;
                            }
                            return '';
                        };

                        var cache = $localStorage.cache_src = $localStorage.cache_src || {};
                        var create_time = $localStorage.cache_src_create_time = $localStorage.cache_src_create_time || {};

                        function fetchRemoteWithoutLoading(){
                            var ext = '.' + attrs.cacheSrc.split('.').pop();
                            var fileName = id() + ext;
                            $cordovaFileTransfer
                                .download(attrs.cacheSrc, getCacheDir() + fileName, {}, true)
                                .then(function() {
                                    cache[attrs.cacheSrc] = fileName;
                                    if (scope.expire !== Infinity) {
                                        create_time[attrs.cacheSrc] = Date.now();
                                    }
                                    addSrc(getCacheDir() + fileName);
                                }, scope.onError, angular.noop);
                        }
                        
                        function fetchRemote() {
                            var uiData = {};
                            scope.onStart(attrs.cacheSrc);
                            scope.uiOnStart(scope, element, $compile, uiData);

                            var ext = '.' + attrs.cacheSrc.split('.').pop();
                            var fileName = id() + ext;
                            $cordovaFileTransfer
                                .download(attrs.cacheSrc, getCacheDir() + fileName, {}, true)
                                .then(function() {
                                    cache[attrs.cacheSrc] = fileName;
                                    // debugger;
                                    if (scope.expire !== Infinity) {
                                        create_time[attrs.cacheSrc] = Date.now();
                                    }
                                    scope.uiOnFinish(scope, element, $compile, uiData);
                                    addSrc(getCacheDir() + fileName);
                                }, scope.onError, function(progress) {
                                    uiData.progress = (progress.loaded / progress.total) * 100;
                                    scope.uiOnProgress(scope, element, $compile, uiData);
                                    scope.onProgress(uiData.progress);
                                });

                        }

                        function fetchCache() {
                            addSrc(getCacheDir() + cache[attrs.cacheSrc]);
                        }
                        $ionicPlatform
                            .ready()
                            .then(function() {
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

                                    var uiData = {};
                                    scope.onStart(attrs.cacheSrc);
                                    scope.uiOnStart(scope, element, $compile, uiData);
                                    
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
