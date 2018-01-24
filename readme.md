# gulp-fez-fontmin

压缩ttf并生成网页字体svg,eot,woff

## Install

```
$ npm install --save-dev gulp-fez-fontmin
```

## Usage

```js
var gulp = require('gulp');
var fontmin = require('gulp-fez-fontmin');

gulp.task('default', function () {
  return gulp.src('src/fonts/*.ttf')
    .pipe(fontmin({
      text: '天地玄黄 宇宙洪荒',
    }))
    .pipe(gulp.dest('dist/fonts'));
});
```


## API

### fontmin(options)

Options:

* `text`: A string corresponding glyphs of ttf
* `onlyChinese`: {boolean} keep chinese only, exclude Latin, number and symbol. Default = false
* `fontPath`: {string=} location of font file.
* `hinting`: {boolean=} keep hint info, defaults true.
* `quiet`: {boolean=} print how many fonts were effected, defaults false.
