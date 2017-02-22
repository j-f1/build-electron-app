#!/usr/bin/env node

var packager = require('electron-packager')
var fs = require('fs')
var path = require('path')
var zip = require('zip-dir')

// Promisified, based on http://stackoverflow.com/a/14387791/5244995

function copy (src, dst) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(src)
      .on('error', reject)
      .pipe(fs.createWriteStream(dst)
              .on('error', reject)
              .on('close', resolve)
      )
  })
}

/**
 * USAGE:
 * ./build.js # will prompt for values
 * ./build.js --auto # defaults
 * ./build.js --plat <plat> # no prompt
 * ./build.js --arch <arch> # no prompt
 * ./build.js --plat # no prompt, default
 * ./build.js --arch # no prompt, default
 * ./build.js <options?> --install # Install to /Applications
 * ./build.js <options?> --icon icon # Add an icon. Adds a .png, .ico, or.icns extension depending on the platform
 * ./build.js --all # All!
 */

function prompt (arg, promptStr, defaultValue) {
  if (process.argv.indexOf('--auto') > -1) {
    return Promise.resolve(defaultValue)
  }
  if (process.argv.indexOf('--all') > -1) {
    return Promise.resolve('all')
  }

  let idx = process.argv.indexOf(arg)
  if (idx > -1) {
    let val = process.argv[idx + 1]
    if (!val || val.match(/^-+/)) {
      val = defaultValue
    }
    return Promise.resolve(val)
  }

  return new Promise((resolve, reject) => {
    process.stdout.write(`${promptStr}: [${defaultValue}] `)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.once('data', val => {
      resolve(val.replace('\n', '') || defaultValue)
      process.stdin.pause()
    })
  })
}

let fail = err => {
  console.error('ERR!', err)
}

if (process.argv.indexOf('--compress') > -1 && !fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}
prompt('--plat', 'Platform (linux/win32/darwin/all)', process.platform).then(platform => {
  prompt('--arch', 'Architecture (ia32/x64/all)', process.arch).then(arch => {
    const pkg = require(path.join(process.cwd(), 'package.json'))
    let icon = 'img/icon'
    if (process.argv.indexOf('--icon') !== -1) {
      icon = process.argv[process.argv.indexOf('--icon') + 1]
    }
    packager({
      arch,
      dir: process.cwd(),
      platform,
      icon,
      ignore: [
        /.*\.blend\d+/
      ],
      name: pkg.productName,
      overwrite: true,
      prune: true,
      out: 'build/',
      'app-version': pkg.version
    }, (err, paths) => {
      if (err) {
        console.error('ERR!', err)
      } else {
        paths.forEach(file => {
          var destination = path.relative(path.join(process.cwd()), file)
          console.log('executable:', destination)
          if (process.argv.indexOf('--compress') > -1) {
            console.log('zipping to', path.relative(path.join(process.cwd()), path.join(process.cwd(), 'dist', file.replace('build/', '') + '.zip')))
            zip(destination, {
              saveTo: path.join(process.cwd(), 'dist', file.replace('build/', '') + '.zip')
            }, err => {
              if (err) {
                console.log('Failed to create zip:')
                console.error(err)
              } else {
                console.log('zipped executable to', path.relative(path.join(process.cwd()), path.join(process.cwd(), 'dist', file.replace('build/', '') + '.zip')))
              }
            })
          }
          if (process.argv.indexOf('--install') !== -1) {
            copy(file, path.join('/Applications', destination)).then(() => {
              console.log(file, 'copied to', path.join('/Applications', destination))
            }, err => {
              console.log('ERR!', err)
            })
          }
        })
      }
    })
  }, fail)
}, fail)
