(function() {
    var module = angular.module('cacheSrc', [
        'angular-svg-round-progress',
        'ngCordova',
        'ngStorage'
    ]);



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
        interval: 200
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
                    var display = element.css('display');
                    element.css('display', 'none');
                    attrToScope(scope, config);
                    scope.onProgress = scope.onProgress || function() {};
                    scope.onFinish = scope.onFinish || function() {};
                    element
                        .after(progress_circle);
                    var promise = $interval(function() {
                        scope.progress += 10;
                        scope.onProgress(scope.progress);
                        if (scope.progress == 100) {
                            element.css('display', display);
                            element[0][config.src || 'src'] = attrs.cacheSrc;
                            progress_circle.remove();
                            $interval.cancel(promise);
                            scope.onFinish(attrs.cacheSrc);
                        }
                    }, config.interval);
                }
            };
        };
    } else {
        // real device
        cacheSrc = function($ionicPlatform, $timeout, $compile, $cacheSrc, $cordovaFileTransfer, $localStorage) {
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
                    var display = element.css('display');
                    element.css('display', 'none');
                    attrToScope(scope, config);
                    scope.onProgress = scope.onProgress || function() {};
                    scope.onFinish = scope.onFinish || function() {};
                    scope.onError = scope.onError || function() {};
                    element
                        .after(progress_circle);
                    var ext = '.' + attrs.cacheSrc.split('.').pop();                    
                    //**********//
                    var cache = $localStorage.cache_src = $localStorage.cache_src || {};
                    var finish = function(result) {
                        element[0][config.src || 'src'] = result;
                        element.css('display', display);
                        scope.onFinish(result);
                        progress_circle.remove();
                    };

                    if (cache[attrs.cacheSrc]) {
                        finish(cache[attrs.cacheSrc]);
                    } else {
                        $ionicPlatform.ready(function() {
                            alert(window.cordova.file.documentsDirectory + id() + ext);
                            $cordovaFileTransfer.download(attrs.cacheSrc, window.cordova.file.documentsDirectory + id() + ext, {}, true)
                                .then(function(result) {
                                    debugger;                                    
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
                }
            };
        };
    }


    module.provider('$cacheSrc', function() {
        this.config = default_config;
        this.set = function(obj) {
            angular.extend(this.config, obj);
        };
        this.$get = function() {
            return this.config;
        };
    });




    module.directive('cacheSrc', cacheSrc);
}());
