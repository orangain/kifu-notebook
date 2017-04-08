package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type Server struct {
	path string
}

func NewServer(path string) *Server {
	return &Server{
		path,
	}
}

func (s *Server) HandleJKF(w http.ResponseWriter, r *http.Request) {
	log.Printf("%s %s", r.Method, r.URL)
	if r.Method == "GET" {
		s.handleGetJKF(w, r)
	} else if r.Method == "PUT" {
		s.handlePutJKF(w, r)
	} else {
		w.Header().Set("Allow", "GET, PUT")
		w.WriteHeader(405)
	}
}

func (s *Server) handleGetJKF(w http.ResponseWriter, r *http.Request) {
	dat, err := ioutil.ReadFile(s.path)
	if err != nil {
		log.Print(err)
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(dat)
}

func (s *Server) handlePutJKF(w http.ResponseWriter, r *http.Request) {
	dat, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
		w.WriteHeader(400)
		return
	}

	err = ioutil.WriteFile(s.path, dat, os.ModePerm)
	if err != nil {
		w.WriteHeader(500)
		return
	}
}
