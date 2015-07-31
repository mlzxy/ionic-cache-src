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
        animation: 'easeInOutQuart',
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

    module.factory('cacheSrcService', function($localStorage) {
        var r = {};
        $localStorage.cache_src = $localStorage.cache_src || {};
        r.storage = $localStorage.cache_src;
        r.set = function(k, v) {
            r.storage[k] = v;
        };
        r.get = function(k) {
            return r.storage[k];
        };

        r.reset = function() {
            $localStorage.cache_src = {};
            r.storage = $localStorage.cache_src;
        };
        return r;
    });

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
            };
        };
    } else {
        // real device

        var getCacheDir = function(plt) {
            switch (plt) {
                case 'iOS':
                return window.cordova.file.cacheDirectory;
                case 'Android':
                    return window.cordova.file.externalDataDirectory;
            }
            return '';
        };
        var network = {};
        if (document.addEventListener) {
            document.addEventListener("offline",
                                      function() {
                                          network.onLine = false;
                                      }, false);
            document.addEventListener("online", function() {
                network.onLine = true;
            }, false);
        }




        cacheSrc = function($ionicPlatform, $timeout, $compile, $cacheSrc, $cordovaFileTransfer, $localStorage) {
            return {
                restrict: 'A',
                scope: {
                    'onProgress': '=?',
                    'onFinish': '=?',
                    'onError': '=?'
                },
                link: function(scope, element, attrs) {
                    var progress_circle;
                    var config = {};
                    angular.extend(config, $cacheSrc);
                    angular.extend(config, attrs);
                    attrToScope(scope, config);
                    scope.onProgress = scope.onProgress || function() {};
                    scope.onFinish = scope.onFinish || function() {};
                    scope.onError = scope.onError || function() {};
                    var cache = $localStorage.cache_src = $localStorage.cache_src || {};

                    if (needDownload(attrs.cacheSrc)) {
                        var ext = '.' + attrs.cacheSrc.split('.').pop();
                        if (config.showProgressInDevice) {
                            progress_circle = makeProgressCircle(scope, $compile);
                            var display = element.css('display');
                            element.css('display', 'none');
                            element
                                .after(progress_circle);
                        }
                        //**********//                        
                        var finish = function(result) {
                            if (config.showProgressInDevice) {
                                element.css('display', display);
                                progress_circle.remove();
                            }
                            element[0][config.srcIs || 'src'] = result;
                            scope.onFinish(result);
                        };
                        if (cache[attrs.cacheSrc] && !network.onLine) {
                            finish(cache[attrs.cacheSrc]);
                        } else {
                            $ionicPlatform.ready(function() {
                                $cordovaFileTransfer.download(attrs.cacheSrc, getCacheDir(device.platform) + id() + ext, {}, true)
                                    .then(function(result) {
                                        console.dir(result);
                                        cache[attrs.cacheSrc] = result.nativeURL;
                                        finish(result.nativeURL);
                                    }, function(err) {
                                        console.dir(err);
                                        scope.onError(err);
                                    }, function(progress) {
                                        scope.onProgress((progress.loaded / progress.total) * 100);
                                    });
                            });
                        }
                    } else {
                        element[0][config.srcIs || 'src'] = attrs.cacheSrc;
                        scope.onFinish(attrs.cacheSrc);
                    }
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




    module.directive('cacheSrc', cacheSrc);
}());
