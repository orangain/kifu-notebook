package main

import (
	"errors"
	"flag"
)

type Opts struct {
	path      string
	host      string
	port      int
	noBrowser bool
}

func ParseOpts() (result Opts, err error) {
	var opts Opts
	var help bool

	flag.BoolVar(&help, "h", false, "")
	flag.BoolVar(&help, "help", false, "")
	flag.StringVar(&opts.host, "host", "localhost", "")
	flag.IntVar(&opts.port, "p", 8888, "")
	flag.IntVar(&opts.port, "port", 8888, "")
	flag.BoolVar(&opts.noBrowser, "no-browser", false, "")
	flag.Parse()

	opts.path = flag.Arg(0)
	if opts.path == "" {
		opts.path = "joseki.jkf"
	}

	if help {
		return opts, errors.New(
			`Usage:
    kifu-notebook [options] [JKF_FILE]

Options:
    -h, --help
        Show this help message
    --host HOST
        Host to bind (default: localhost)
    -p PORT, --port PORT
        Port to listen on (default: 8888)
    --no-browser
        Don't open browser`)
	} else {
		return opts, nil
	}
}
