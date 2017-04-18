#!/bin/bash

BINARY_DIR=$1
ARCHIVE_DIR=$2

mkdir -p $ARCHIVE_DIR

# Make absolute
ARCHIVE_DIR=$(cd $ARCHIVE_DIR && pwd)

for TARGET in $(find ${BINARY_DIR} -type d -mindepth 1 -maxdepth 1 ); do
	ARCHIVE_NAME=$(basename ${TARGET})
	pushd ${TARGET}
	zip -r ${ARCHIVE_DIR}/${ARCHIVE_NAME}.zip ./*
	popd
done

pushd ${ARCHIVE_DIR}
shasum * > ./SHASUMS
popd
