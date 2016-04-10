(function() {

    function extend(dst, src) {
        for (var k in src)
            dst[k] = dst[k] || src[k];
    }

    function ensureFunction(x, y) {
        return typeof x == 'function' ? x : y;
    };

    // For the Default Refresh Icon
    //****************************************************************************************************//
    var default_refreshIcon_style = {
    	refreshMedia: refreshMedia,
    	showRefreshIconInBrowser: true,
    	showRefreshIconInDevice: true,
        refreshIconContainerStyle: 'text-align:center;position:relative;top:50%;transform: translateY(-50%);font-size:60px;color:#B3B4B6;'
    };
    
    // For the Default Progress Circle
    //****************************************************************************************************//
    var default_circle_style = {
        color: '#FFFFFF',
        bgcolor: '#B3B4B6',
        semi: false,
        rounded: false,
        clockwise: true,
        radius: '40',
        stroke: '15',
        responsive: true,
        max: 100,
        iterations: 50,
        animation: 'easeOutCubic',
        interval: 200,
        showProgressCircleInBrowser: true,
        showProgressCircleInDevice: true,
        circleContainerStyle: 'text-align:center;position:relative;top:50%;transform: translateY(-50%);'
    };
    function getElement(element){
        switch(element[0].nodeName){
        case 'SOURCE':                        
            return element.parent();
            
        default:
            return element;
        }
    }
    
    function makeProgressCircle($scope, $compile) {
        return angular.element($compile('<div style="{{circleContainerStyle}}"><div round-progress  max="max"  current="progress"  color="{{color}}" bgcolor="{{bgcolor}}" radius="{{radius}}"  stroke="{{stroke}}"  rounded="rounded" clockwise="clockwise" iterations="{{iterations}}"  animation="{{animation}}"></div></div>')($scope));
    };
    
    function makeRefreshIcon($scope, $compile, $rootScope) {
        return angular.element($compile('<div ng-click="refreshClicked()" style="{{refreshIconContainerStyle}}"><i class="ion-refresh"></i></div>')($scope));
    };

    var uiOnProgress = function(scope, element, $compile, uiData) {
        scope.progress = uiData.progress;
    };
    var uiOnStart = function(scope, element, $compile, uiData) {
        // debugger;
        var elm = getElement(element);
        
        //if (uiData.loadFailed && scope.srcIs != 'background' && (element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO'))  {
        if (uiData.loadFailed && scope.srcIs != 'background' && (element[0].nodeName != 'AUDIO'))  {
            function rmRefreshIcon() {
                elm.css('display', uiData.display);
                uiData.refreshIcon.remove();
            }
            if (window.cordova) {
                if (scope.showRefreshIconInDevice) {
                    rmRefreshIcon();
                }
            } else {
                if (scope.showRefreshIconInBrowser) {
                    rmRefreshIcon();
                }
            }
        }        
        
        
        
        if (scope.srcIs == 'background') {
            elm.css('background',scope.backgroundLoadingStyle);            
        }
        //else if(element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO')
        else if(element[0].nodeName != 'AUDIO')
        {
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
        //if (scope.srcIs != 'background' && (element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO'))  {
        if (scope.srcIs != 'background' && (element[0].nodeName != 'AUDIO'))  {
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
    var onError = function(error, scope, element, $compile, uiData, $rootScope) {
    
    	//if (scope.srcIs != 'background' && (element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO'))  {
    	if (scope.srcIs != 'background' && (element[0].nodeName != 'AUDIO'))  {
    	
    		console.log('error is');
			console.log(error);
			// display refresh icon here and set load error variable to true
			
			// set download error true
			downloadError = true;
			
			// remove spinner
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
            
		// add refresh icon
		if (scope.srcIs == 'background') {
			elm.css('background',scope.backgroundRefreshStyle);            
		}
		//else if(element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO')
		else if(element[0].nodeName != 'AUDIO')
		{
			extend(scope, default_refreshIcon_style);
			var refreshIcon;            
			function addRefreshIcon() {
				refreshIcon = makeRefreshIcon(scope, $compile, $rootScope);
				uiData.display = elm.css('display');
				elm.css('display', 'none');
				elm.after(refreshIcon);
			};

			if (window.cordova) {
				if (scope.showRefreshIconInDevice) {
					addRefreshIcon();
				}
			} else {
				if (scope.showRefreshIconInBrowser) {
					addRefreshIcon();
				}
			}
			uiData.refreshIcon = refreshIcon;
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
        backgroundRefreshStyle: "url('lib/ionic-cache-src/img/refresh.gif') no-repeat center", ///////////// need to add this in
        uiOnStart: uiOnStart,
        uiOnFinish: uiOnFinish,
        uiOnProgress: uiOnProgress,
        onError: onError,
        expire: Infinity
    };
    var getCacheDir = function(){};
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
                if(needDownload(url)){
                    var cache_url = c._cache[url] && (getCacheDir() + c._cache[url]);
                    return cache_url || url;                        
                }
                return undefined;                
            };
            c.set = function(url, localUrl) {
                c._cache[url] = localUrl;
                return c;
            };
            c.reset = function(url){
                if(url != undefined)
                    delete $localStorage.cache_src[url];
                else
                    $localStorage.cache_src = {};                
            };
                        
            return c;
        })
        .directive('cacheSrc', function($ionicPlatform, $window, $interval, $timeout, $compile, $cacheSrc, $cordovaFileTransfer, $localStorage, $rootScope, $cordovaGoogleAnalytics) {
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

					var uiData = {}
                    
                    // debugger;
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
                    
                    var loadFailed = false;
                    
                    scope.refreshClicked = function () {
                    
                    	$rootScope.$broadcast("refreshFailedMediaLoads");
                    
                    };
                    
                    
                    function addSrcWithoutFinish(result) {
                        if (scope.srcIs == 'background') {
                            getElement(element).css('background',"url('" + result + "') " + scope.backgroundStyle);
                        } else {                            
                            getElement(element).attr(scope.srcIs || 'src',result);                                                       
                        }
                    }
                    function addSrc(result) {
                    
                    	// need to do a tag check here to determine if cache is video or image
                    	
                    	if(element[0].nodeName != 'VIDEO' && element[0].nodeName != 'AUDIO') {
                    	
                    	
							var img = new Image();
							img.onload = function () {
						
								addSrcWithoutFinish(result);
								scope.onFinish(result);

							
							}
							img.onerror = function () {
						
								loadFailed = true;
							
								var err = 'Device stored image load error, setting element to refresh';
							
								if ($localStorage.cache_src[result] != undefined) {
							
									// remove cache entry as device url result no good then show refresh
								
									delete $localStorage.cache_src[result];
								
									scope.onError(err, scope, element, $compile, uiData, $rootScope);
								
								}
								else {
							
									// no cache entry for this, re-attempt download
								
									scope.onError(err, scope, element, $compile, uiData, $rootScope);
							
							
								}
							
												   
							}
							img.src = result;
							
						}
						else {
                    
							addSrcWithoutFinish(result);
							scope.onFinish(result);
                     
                        }
                    };
                    if ($window.cordova) {
                        var getCacheDir = function () {
                            switch (device.platform) {
                                case 'iOS':
                                    return $window.cordova.file.documentsDirectory;
                                case 'Android':
                                    return $window.cordova.file.dataDirectory;
                                case 'windows':		
                                    return $window.cordova.file.dataDirectory;
                            }
                            return '';
                        };
                        var cache = $localStorage.cache_src = $localStorage.cache_src || {};
                        var create_time = $localStorage.cache_src_create_time = $localStorage.cache_src_create_time || {};
                        function fetchRemoteWithoutLoading(){
                        	uiData.loadFailed = loadFailed;
                        	
                        		// example code mod to allow for split+pop on complex URLs 
                        	
//                             if(attrs.cacheSrc.includes('fbcdn') || attrs.cacheSrc.includes('facebook')) {
//                             	var ext = '.' + attrs.cacheSrc.split('ext=').pop();
//                             	var encoded = false;
//                             }
//                             else {
//                             	var ext = '.' + attrs.cacheSrc.split('.').pop();
//                             	var encoded = true;
//                             }

								// simple split+pop
								
                            	var ext = '.' + attrs.cacheSrc.split('.').pop();
                            	var encoded = true;
								
                            var fileName = id() + ext;

                            $cordovaFileTransfer
                                .download(attrs.cacheSrc, getCacheDir() + fileName, {encodeURI: encoded}, true)
                                .then(function() {

                                	loadFailed = false;
                                    cache[attrs.cacheSrc] = fileName;
                                    if (scope.expire !== Infinity) {
                                        create_time[attrs.cacheSrc] = Date.now();
                                    }
                                    addSrc(getCacheDir() + fileName);
                                }, function(err) {
									// Error
									loadFailed = true;
									scope.onError(err, scope, element, $compile, uiData, $rootScope);
    
								}, angular.noop);
                        }                        
                        function fetchRemote() {
                            uiData.loadFailed = loadFailed;
                            scope.onStart(attrs.cacheSrc);
                            scope.uiOnStart(scope, element, $compile, uiData);
                            
                            // example code mod to allow for split+pop on complex URLs 
                            
//                             if (attrs.cacheSrc.includes('fbcdn') || attrs.cacheSrc.includes('facebook')) {
//                             	var ext = '.' + attrs.cacheSrc.split('ext=').pop();
//                             	var encoded = false;
//                             }
//                             else {
//                             	var ext = '.' + attrs.cacheSrc.split('.').pop();
//                             	var encoded = true;
//                             }

								// simple split+pop
								
                            	var ext = '.' + attrs.cacheSrc.split('.').pop();
                            	var encoded = true;

                            var fileName = id() + ext;
                 
                            $cordovaFileTransfer
                                .download(attrs.cacheSrc, getCacheDir() + fileName, {encodeURI: encoded}, true)
                                .then(function() {
	
                                	loadFailed = false;
                                    cache[attrs.cacheSrc] = fileName;
                                    if (scope.expire !== Infinity) {
                                        create_time[attrs.cacheSrc] = Date.now();
                                    }
                                    scope.uiOnFinish(scope, element, $compile, uiData);
                                    addSrc(getCacheDir() + fileName);
                                },  function(err) {
									// Error
									loadFailed = true;
                                	scope.onError(err, scope, element, $compile, uiData, $rootScope)
                    
                                }, function(progress) {
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
                                               
                                    $rootScope.$on("refreshFailedMediaLoads", function(){
                                    	if(loadFailed) {
                                                   // debugger;
                                                   if (attrs.cacheSrc) {
                                                       if (needDownload(attrs.cacheSrc)) {
                                                           if (cache[attrs.cacheSrc]) {
                                                               var now = Date.now();
                                                               var create = create_time[attrs.cacheSrc] || Infinity;
                                                               if (now - create < scope.expire * 1000) {
                                                                   fetchCache();
                                                               } else {
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
										}
									});
                            });
                    } else {
                        // in browser       
                         attrs.$observe('cacheSrc',       
                        function() {
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
						$rootScope.$on("refreshFailedMediaLoads", function(){
							if(loadFailed) {
							
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
							
							
							}
						});

                    }

                }
            };
        });
}());
