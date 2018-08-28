/**
 * @基于gulp-fontmin修改
 */

/* eslint-env node */

'use strict';
var path = require('path');
var fancyLog = require('fancy-log');
var pluginError = require('plugin-error');
var through = require('through2-concurrent');
var assign = require('object-assign');
var prettyBytes = require('pretty-bytes');
var chalk = require('chalk');
var Fontmin = require('fez-fontmin');

/**
 * rename
 *
 * @param  {Object} opts opts
 * @return {stream.Transform}      rename transform
 */
function rename(opts) {
  opts = opts || {};

  return through.obj(function(file, enc, cb) {
    file.path = opts.path;
    cb(null, file);
  });
}

/**
 * fontmin transform
 *
 * @param  {Object} opts opts
 * @return {stream.Transform}      fontmin transform
 */
module.exports = function(opts) {
  opts = assign({
    // TODO: remove this when gulp get's a real logger with levels
    verbose: true,
    cssExt: 'css'
  }, opts);

  var totalFiles = 0;
  var validExts = ['.ttf'];

  function printMsg(originalFile, optimizedFile, verbose) {
    var originalSize = originalFile.contents.length;
    var optimizedSize = optimizedFile.contents.length;
    var saved = originalSize - optimizedSize;
    var percent = originalSize > 0 ? (saved / originalSize) * 100 : 0;
    var savedMsg = 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%';
    var msg = saved > 0 ? savedMsg : 'already optimized';

    if (verbose) {
      msg = chalk.green('✔ ') + originalFile.relative + ' -> ' + path.posix.basename(optimizedFile.relative.replace('.css', '.' + opts.cssExt)) + chalk.gray(' (' + msg + ')');
      fancyLog(msg);
    }

  }

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new pluginError('Streaming not supported'));
      return;
    }

    if (validExts.indexOf(path.extname(file.path).toLowerCase()) === -1) {
      if (opts.verbose) {
        fancyLog('Skipping unsupported font ' + chalk.blue(file.relative));
      }

      cb(null, file);
      return;
    }

    var text = opts.text || '';

    if (text && opts.chineseOnly) {
      text = text.replace(/[^\u4e00-\u9fa5]/g, '');
    }

    opts.text = text;

    var fontmin = new Fontmin()
      .src(file.contents)
      .use(rename({
        path: file.path
      }))
      .use(Fontmin.glyph(opts))
      .use(Fontmin.ttf2eot())
      .use(Fontmin.ttf2woff())
      .use(Fontmin.ttf2woff2())
      .use(Fontmin.ttf2svg())
      .use(Fontmin.css(opts));

    if (opts.use) {
      opts.use.forEach(fontmin.use.bind(fontmin));
    }

    var fileStream = this;

    fontmin.run(function(err, files) {
      if (err) {
        cb(new pluginError(err, { fileName: file.path }));
        return;
      }

      var gulpFile;

      files.forEach(function(optimizedFile, index) {

        if (index === 0) { // ttf
          file.contents = optimizedFile.contents;
        } else { // other
          gulpFile = file.clone();
          gulpFile.path = gulpFile.path.replace(/.ttf$/, path.extname(optimizedFile.path));
          gulpFile.contents = optimizedFile.contents;
          fileStream.push(gulpFile);
        }

        printMsg(file, optimizedFile, opts.verbose);

      });

      totalFiles++;

      cb(null, file);
    });

  }, function(cb) {
    cb();
  });
};
