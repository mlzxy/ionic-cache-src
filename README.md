# NOTICE

- Several bugs fixed in 0.4.2, consider to update.
- Demo and Playground: https://github.com/BenBBear/ionic-cache-src-demo


# ionic-cache-src

Just change `src` to `cache-src`
```html
    <img alt="" cache-src="http://a1.att.hudong.com/03/23/01300000332400125809239727476.jpg"/>

```

and it will take the rest work for you.

![](./img/cache.gif)



## Install


- bower 

```shell
bower install ionic-cache-src
```

- it depends on [ngStorage](https://github.com/gsklee/ngStorage), [ngCordova](http://ngcordova.com/), [angular-svg-round-progress](https://github.com/crisbeto/angular-svg-round-progressbar) so you have to load them both in you `index.html`


```html
<script src="lib/ngCordova/dist/ng-cordova.min.js"></script>
<script src="cordova.js"></script>
<script src="cordova_plugins.js"></script>
<script src="lib/ngstorage/ngStorage.min.js"></script>
<script src="lib/angular-svg-round-progressbar/build/roundProgress.min.js"></script>
<script src="lib/ionic-cache-src/cache-src.js"></script>
```

- and it use [cordova-plugin-file-transfer](https://github.com/apache/cordova-plugin-file-transfer) and [cordova-plugin-file](https://github.com/apache/cordova-plugin-file), so

```shell
cordova plugin add cordova-plugin-file cordova-plugin-file-transfer
```

- add `ionic-cache-src` to your angular module declaration dependencies

- Done


## How it Work

very simple strategy

![](./img/how-it-work.jpg)




## Usage

### custom the progress circle

it accepts all options for [angular-svg-round-progressbar](https://github.com/crisbeto/angular-svg-round-progressbar) , except for `current`

### change src

```html
<img cache-src="" src-is="alt" />
```
will be rendered to

```html
<img alt="file://xxx/xx/xxx.jpg" />
```

not so useful though.

### callback

```html
<img cache-src="" on-error="onError" on-finish="onFinish" on-progress="fun" />
```

```js
function onError(err){}
function onFinish(naiveUrl){}
function onProgress(number){}
```


### inbroswer

It will works in browser

```js
if(!window.cordova){
   //skip the checking
   // and use $interval to mock a progress circle download
}
```

### for local file path

> The plugin will download and cache the file if the url is `http`, `https` or `ftp`, otherwise it won't.

So it works for local file path, or base64 etc...


### service

```js
module.controller(function(cacheSrcService){
    cacheSrcService.set(url, localUrl);
    var localUrl = cacheSrcService.get(url); // get localpath of url if exists
    cacheSrcService.reset(); // remove all localcache (from localstorage)
    
})

```

### config

```js
module.config(function($cacheSrcProvider){
    $cacheSrcProvider
              .set('key',value)
              .set({key:value}); // set option

})

```
Key, Value for options like

- `srcIs`
- `onError` etc...
- `showProgressCircleInBrowser` whether show progress circle in browser
- `showProgressCircleInDevice` whether show progress circle in device
- `interval` browser mock progress circle period, by default 200.
-  options for progress circle  [angular-svg-round-progressbar](https://github.com/crisbeto/angular-svg-round-progressbar)






## Attention


### cordova_plugins.js

Because of https://github.com/driftyco/ionic-plugin-keyboard/issues/82 , the `ionicPlatform.ready` may fail from exception. Add 

```html
<script src="cordova_plugins.js"></script>
```

solve the problem.


### $localstorage.cache_src

This plugin store cache info as  `$localstorage.cache_src = {RemoteUrl:LocalUrl}`, and there is a factory defined:

```js
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
```
which you can use to access the cached file


