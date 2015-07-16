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

### config

```js
module.config(function($cacheSrcProvider){
   $cacheSrcProvider.set('key',value); // set option
})

```
Key, Value for options like

- `srcIs`
- `onError`
- options for progress circle
- etc..




### inbroswer

it will works in browser (simply skip the caching)





## Attention


### Any tags

Literally I think it will work for any tags, like `video`, `audio`, `img`... But I only test it on img.




