SRCS    := $(shell find cmd/kifu-notebook -type f -name '*.go')

.PHONY: all get-build-deps clean npm-build gox package release

all: get-build-deps clean npm-build kifu-notebook

get-build-deps:
	go get github.com/jessevdk/go-assets-builder

clean:
	rm -rf build kifu-notebook cmd/kifu-notebook/bindata.go

npm-build:
	npm run build

cmd/kifu-notebook/bindata.go:
	go generate

kifu-notebook: cmd/kifu-notebook/bindata.go $(SRCS)
	go build -o kifu-notebook ./cmd/kifu-notebook

GOX_OPTS=-osarch "linux/amd64 linux/386 linux/arm darwin/amd64 darwin/386 windows/amd64 windows/386"
VERSION_NAME=master

gox: cmd/kifu-notebook/bindata.go $(SRCS)
	gox $(GOX_OPTS) -output "build/cli/${VERSION_NAME}/{{.Dir}}_${VERSION_NAME}_{{.OS}}_{{.Arch}}/{{.Dir}}" ./cmd/kifu-notebook

package: gox
	./scripts/package.sh build/cli/${VERSION_NAME} build/archives/${VERSION_NAME}

release:
	ghr -u orangain --prerelease --delete --replace pre-release build/archives/${VERSION_NAME}
