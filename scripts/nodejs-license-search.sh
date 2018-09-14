#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

function search {
	local image="$1"
	local search="$2"
	docker run --rm \
		-e LICENSE_SEARCH_MUST_CONTAIN="$search" \
		-v $DIR/nodejs-license-search:/nodejs-license-search \
		--entrypoint=/nodejs-license-search/license-finder.js \
		$image
}

function main {
	if [ "$#" -ne 2 ]; then
		echo "Illegal number of parameters."
		echo "Usage: ./nodejs-license-search.sh [file] [image]"
		exit 1
	fi
	local txtfile="$1"
	local image="$2"
	while read p; do
		search="$(echo $p | cut -d@ -f1)"
		result="$(search "$2" "$search")"
		if [[ "$result" != "" ]]; then
			echo "$p: $image $result"
		fi
	done < "$txtfile"
}

main "$@"
