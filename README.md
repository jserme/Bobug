#Bobug

A pure javascript console without dependence of other javascript lib
****

##Declaration
The UI and css file copy from [YUI](http://yuilibrary.com/yui/docs/console/console-basic.html), this will be changed later.

##Useage
include the js and css file in your file
```html
    <link type="text/css" rel="stylesheet" href="bobug.css" />
    <script type="text/javascript" charset="utf-8" src="bobug.js"> </script>
```
use the apis below

##API

###log struct
```javascript
{
  msg : xxxxx
  _time : xxxx
  catalog : xxx
  source : xxxx
}
```



###set UI language, default is English
```javascript
Bobug.setLang( 'zh' ); 
```

###show UI
```javascript
Bobug.show();
```

###basic usage, looks like console in browser
```javascript
Bobug.log(123);
Bobug.info(123);
Bobug.warn(123);
Bobug.error(123);
```

###custom catalog and source
```javascript
Bobug.log(123, 'model', 'Bobug');

info, warn, error can also do this
Bobug.info(123, 'test');
Bobug.warn(123, 'photo');
Bobug.error(123, 'blog');
```

###run a javascript code, ctrl + enter shortcut is also can do this
```javascript
Bobug.run('alert(1)');
```


###get lastest logs, your can also give a filter function, the filter function will invoke and pass a log as argument
```javascript
//get 3 logs
console.log( Bobug.getLogs( 3 ) );

//filter by catalog
console.log( Bobug.getLogs( 3, 'warn' ) );

//fiter by catalog and source
console.log( Bobug.getLogs( 3, 'warn', 'photo' ) );

//custom a get filter
Bobug.log( 'entry test oooo' );

console.log( Bobug.getLogs( 2, function( log ){
    if( log.msg.indexOf('entry') > -1 )  {
       return true;
    }

    return false;
}) );
```

###load a javascript file by url
```javascript
Bobug.loadJs('http://code.jquery.com/jquery-1.7.2.min.js');
```





##site
* [demo] (http://jserme.github.com/Bobug/)
* [source code](http://github.com/jserme/Bobug)
* [author site](http://jser.me)


***
##License
(The MIT License)

Copyright (c) 2009-2012 jserme <dev.hubo@ gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


