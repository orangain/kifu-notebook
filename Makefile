SRCS    := $(shell find . -type f -name '*.go')

.PHONY: all get-build-deps clean npm-build gox package

all: get-build-deps clean kifu-notebook

get-build-deps:
	go get github.com/jessevdk/go-assets-builder

clean:
	rm -rf build kifu-notebook bindata.go

npm-build:
	npm run build

bindata.go:
	go generate

kifu-notebook: $(SRCS)
	go build -o kifu-notebook

GOX_OPTS=-osarch "linux/amd64 linux/386 linux/arm darwin/amd64 darwin/386 windows/amd64 windows/386"
VERSION_NAME=master

gox: $(SRCS)
	gox $(GOX_OPTS) -output "out/${VERSION_NAME}/{{.Dir}}_${VERSION_NAME}_{{.OS}}_{{.Arch}}/{{.Dir}}"

package: gox
	./package.sh out/${VERSION_NAME} dist/${VERSION_NAME}

release:
	ghr --prerelease --replace pre-release dist/${VERSION_NAME}
