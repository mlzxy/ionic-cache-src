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
<script src="lib/ngstorage/ngStorage.min.js"></script>
<script src="lib/angular-svg-round-progressbar/build/roundProgress.min.js"></script>
```

- and it use [cordova-plugin-file-transfer](https://github.com/apache/cordova-plugin-file-transfer) and [cordova-plugin-file](https://github.com/apache/cordova-plugin-file), so

```shell
cordova plugin add cordova-plugin-file cordova-plugin-file-transfer
```

- add `ionic-cache-src` to your angular module declaration dependencies




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
- options for progress circle











## Attention


### Any tags

Literally I think it will work for any tags, like `video`, `audio`, `img`... But I only test it on img.


### Reinstall Issues

During development, reinstall app on devices without uninstall/install, the localstorage seems to retain, but the image gone. Maybe later I should choose another directory to save the downloaded image

