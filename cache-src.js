(function() {


    var module = angular.module('ionic-cache-src', [
        'angular-svg-round-progress',
        'ngCordova',
        'ngStorage'
    ]);

    var startsWith = function(str, arr) {
        for (var i = 0; i < arr.length; i++) {
            var sub_str = arr[i];
            if (str.indexOf(sub_str) === 0) {
                return true;
            }
        }
        return false;
    };

    var default_config = {
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
        showProgressCircleInDevice: true
    };


    var needDownload = function(path) {
        if (startsWith(path, ['http://', 'https://', 'ftp://'])) {
            return true;
        } else {
            return false;
        }
    };

    var cacheSrc;

    var makeProgressCircle = function($scope, $compile) {
        return angular.element($compile('<div style="text-align:{{textAlign}}"><div round-progress  max="max"  current="progress"  color="{{color}}" bgcolor="{{bgcolor}}"  radius="{{radius}}"  stroke="{{stroke}}"  rounded="rounded" clockwise="clockwise" iterations="{{iterations}}"  animation="{{animation}}"></div></div>')($scope));
    };

    var id = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };

    var attrToScope = function(scope, attrs) {
        scope.progress = 0;
        scope.max = 100;
        scope.radius = attrs.radius;
        scope.stroke = attrs.stroke;
        scope.animation = attrs.animation;
        scope.clockwise = attrs.clockwise;
        scope.color = attrs.color;
        scope.bgcolor = attrs.bgcolor;
        scope.rounded = attrs.rounded;
        scope.iterations = attrs.iterations;
        scope.textAlign = 'center';
    };



    if (!window.cordova) {
        // inbrowser
        cacheSrc = function($timeout, $compile, $cacheSrc, $interval) {
            return {
                restrict: 'A',
                scope: {
                    'onProgress': '=?',
                    'onFinish': '=?',
                    'onError': '=?'
                },
                link: function(scope, element, attrs) {
                    var progress_circle = makeProgressCircle(scope, $compile);
                    var config = {};
                    angular.extend(config, $cacheSrc);
                    angular.extend(config, attrs);
                    attrToScope(scope, config);
                    scope.onProgress = scope.onProgress || function() {};
                    scope.onFinish = scope.onFinish || function() {};
                    attrs.$observe('cacheSrc', function() {
                        if (attrs.cacheSrc) {
                            if (needDownload(attrs.cacheSrc)) {
                                if (config.showProgressCircleInBrowser) {
                                    var display = element.css('display');
                                    element.css('display', 'none');
                                    element
                                        .after(progress_circle);
                                }
                                var promise = $interval(function() {
                                    scope.progress += 10;
                                    scope.onProgress(scope.progress);
                                    if (scope.progress == 100) {
                                        $interval.cancel(promise);
                                        if (config.showProgressCircleInBrowser) {
                                            element.css('display', display);
                                            progress_circle.remove();
                                        }
                                        element[0][config.srcIs || 'src'] = attrs.cacheSrc;
                                        scope.onFinish(attrs.cacheSrc);
                                    }
                                }, config.interval);
                            } else {
                                element[0][config.srcIs || 'src'] = attrs.cacheSrc;
                                scope.onFinish(attrs.cacheSrc);
                            }
                        }
                    });
                }
            };
        };
    } else {
        // real device

        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();

        var getCacheDir = function() {
            switch (device.platform) {
                case 'iOS':
                    return window.cordova.file.documentsDirectory;
                case 'Android':
                    return window.cordova.file.dataDirectory;
            }
            return '';
        };

        var cacheDir;

        cacheSrc = function($ionicPlatform, $timeout, $compile, $cacheSrc, $cordovaFileTransfer, $localStorage, $cordovaNetwork) {
            return {
                restrict: 'A',
                scope: {
                    'onProgress': '=?',
                    'onFinish': '=?',
                    'onError': '=?'
                },
                link: function(scope, element, attrs) {
                    var progress_circle;
                    var display;
                    var config = {};
                    angular.extend(config, $cacheSrc);
                    angular.extend(config, attrs);
                    attrToScope(scope, config);
                    scope.onProgress = scope.onProgress || function() {};
                    scope.onFinish = scope.onFinish || function() {};
                    scope.onError = scope.onError || function() {};
                    var cache = $localStorage.cache_src = $localStorage.cache_src || {};
                    //**********//                    
                    var finish = function(result) {
                        if (config.showProgressCircleInDevice) {
                            element.css('display', display);
                            progress_circle.remove();
                        }
                        addSrc(result);
                    };
                    var addSrc = function(result){                       
                        element[0][config.srcIs || 'src'] = result;
                        scope.onFinish(result);
                    };

                    
                    attrs.$observe('cacheSrc',
                        function() {
                            if (attrs.cacheSrc) {
                                if (needDownload(attrs.cacheSrc)) {
                                    if (cache[attrs.cacheSrc]) { //if cached
                                        var hit = function() {
                                            addSrc(getCacheDir() + cache[attrs.cacheSrc]);
                                        };
                                        ionic.Platform.ready(hit);
                                    } else {
                                        if (config.showProgressCircleInDevice) {
                                            progress_circle = makeProgressCircle(scope, $compile);
                                            display = element.css('display');
                                            element.css('display', 'none');
                                            element
                                                .after(progress_circle);
                                        }
                                        // $ionicPlatform.ready().then(function() {
                                        var fetch = function() {
                                            var ext = '.' + attrs.cacheSrc.split('.').pop();
                                            var fileName = id() + ext;
                                            $cordovaFileTransfer.download(attrs.cacheSrc, getCacheDir() + fileName, {}, true)
                                                .then(function(result) {
                                                    cache[attrs.cacheSrc] = fileName;
                                                    finish(getCacheDir() + fileName);
                                                }, scope.onError, function(progress) {
                                                    scope.progress = (progress.loaded / progress.total) * 100;
                                                    scope.onProgress(scope.progress);
                                                });
                                        };
                                        ionic.Platform.ready(fetch);
                                    }
                                } else {
                                    addSrc(attrs.cacheSrc);
                                }
                            }
                        });

                }
            };
        };
    }


    module.provider('$cacheSrc', function() {
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
    });

    module.factory('cacheSrcStorage', function($localStorage) {
        var c = {};
        c._cache = $localStorage.cache_src;
        c.get = function(url){
            return c._cache[url] && (getCacheDir() + c._cache[url]);
        };
        c.set = function(url,localUrl){
            c._cache[url] = localUrl;
            return c;
        };
        return c;
    });


    module.directive('cacheSrc', cacheSrc);
}());
