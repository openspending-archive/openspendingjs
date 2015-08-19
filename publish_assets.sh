#!/bin/bash

VERSION=`git describe --always`
s3cmd -P -M -f --delete-removed --rexclude '.git/.*' --rexclude 'flash/.*' --rexclude '.DS_Store' sync . s3://assets.openspending.org/openspendingjs/$VERSION/

