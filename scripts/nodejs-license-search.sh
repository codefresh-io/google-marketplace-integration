#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

function search {
	local image="$1"
	local search="$2"
	docker run --rm -it \
		-e LICENSE_SEARCH_MUST_CONTAIN="$search" \
		-v $DIR/nodejs-license-search:/nodejs-license-search \
		--entrypoint=/nodejs-license-search/license-finder.js \
		$image
}

function main {
	if [ "$#" -ne 2 ]; then
	    echo "Illegal number of parameters."
	    echo "Usage: ./nodejs-license-search.sh [image] [package]"
	    exit 1
	fi
	search "$1" "$2"
}

main "$@"
