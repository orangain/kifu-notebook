.PHONY: all get-build-deps clean npm-build

all: get-build-deps clean kifu-notebook

get-build-deps:
	go get github.com/jessevdk/go-assets-builder

clean:
	rm -rf build kifu-notebook bindata.go

npm-build:
	npm run build

bindata.go: npm-build
	go generate

kifu-notebook: bindata.go
	go build -o kifu-notebook
