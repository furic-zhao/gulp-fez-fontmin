# gulp-fez-fontmin

使用gulp压缩TTF并生成woff2,woff,ttf,eot等格式的网页字体。

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
      text: '一朝暖日伴晴风，号呼浪涛涌峦峰，公论最美海蓝线，路入梅尔各不同。——忆加州《一号公路》',
    }))
    .pipe(gulp.dest('dist/fonts'));
});
```


## API

### fontmin(options)

Options:

* `text`: A string corresponding glyphs of ttf
* `chineseOnly`: {boolean} keep chinese only, exclude Latin, number and symbol. Default = false