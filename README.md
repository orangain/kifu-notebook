# Kifu Notebook

The Kifu Notebook is a web-based app to take a note of Kifu in Shogi.

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
