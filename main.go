package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
)

//go:generate go-assets-builder --strip-prefix="/build" -o bindata.go build

func main() {
	opts, err := ParseOpts()
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	addr := fmt.Sprintf("%s:%d", opts.host, opts.port)
	url := fmt.Sprintf("http://%s/", addr)

	server := NewServer(opts.path)
	log.Print(server.path)
	http.HandleFunc("/jkf", server.HandleJKF)
	http.Handle("/", http.FileServer(Assets))

	// See: http://stackoverflow.com/questions/32738188/go-how-can-i-start-the-browser-after-the-server-started-listening
	l, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}

	log.Println("Kifu Notebook is running at:", url)
	if !opts.noBrowser {
		open(url)
	}

	if err := http.Serve(l, nil); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}

// See: http://stackoverflow.com/questions/39320371/how-start-web-server-to-open-page-in-browser-in-golang
func open(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
	}
	args = append(args, url)
	return exec.Command(cmd, args...).Start()
}
