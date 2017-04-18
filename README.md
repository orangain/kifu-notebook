# Kifu Notebook

The Kifu Notebook is a web-based app to take a note of Kifu in Shogi.

## Installation

Download the latest zip archive for your architecture from [Releases](https://github.com/orangain/kifu-notebook/releases), then unzip it.

Copy `kifu-notebook` executable to some directory in your PATH.

## Usage

Open JKF_FILE as a notebook.

```
$ kifu-notebook JKF_FILE
```

Full usage:

```
Usage:
    kifu-notebook [options] JKF_FILE

Options:
    -h, --help
        Show this help message
    --host HOST
        Host to bind (default: localhost)
    -p PORT, --port PORT
        Port to listen on (default: 8888)
    --no-browser
        Don't open browser
```

## Development of SPA

### Requirements

* Node.js

### Install dependencies

```
$ npm install
```

### Run

Launch API server.

```
$ kifu-notebook --no-browser JKF_FILE
```

Then start webpack dev server.

```
$ npm start
```

## Development of Command

### Requirements

* Go
* Make

### Build

```
$ make
```

### Deploy

```
$ docker-compose -f docker-compose.ci.yml build
$ docker-compose -f docker-compose.ci.yml run --rm npm_build
$ docker-compose -f docker-compose.ci.yml run --rm go_build
$ make release
```
