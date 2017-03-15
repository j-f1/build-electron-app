# build-electron-app

[![bitHound Overall Score](https://www.bithound.io/github/j-f1/build-electron-app/badges/score.svg)](https://www.bithound.io/github/j-f1/build-electron-app)

Build your Electron app with a nice CLI interface

## Install

```
$ npm i -D j-f1/build-electron-app
```

## Usage

Add `./node_modules/.bin/` to your `PATH`

```
$ build-electron-app
Platform (linux/win32/darwin/all): [darwin] darwin
Architecture (ia32/x64/all): [x64] x64
Packaging app for platform darwin x64 using electron v1.4.15...
executable: build/name-darwin-x64
$ build-electron-app --auto
Packaging app for platform darwin x64 using electron v1.4.15...
executable: build/name-darwin-x64
$ build-electron-app --arch x64 --plat darwin
Packaging app for platform darwin x64 using electron v1.4.15...
executable: build/name-darwin-x64
```
