#!/bin/bash
# Base64 encoder/decoder tool

if [ $# -lt 2 ]; then
    echo "Usage: base64_tool.sh <encode|decode> <text>"
    exit 1
fi

ACTION=$1
shift
TEXT="$@"

if [ "$ACTION" = "encode" ]; then
    echo "Encoding: $TEXT"
    echo "Result:"
    echo "$TEXT" | base64
elif [ "$ACTION" = "decode" ]; then
    echo "Decoding: $TEXT"
    echo "Result:"
    echo "$TEXT" | base64 -d
    echo
else
    echo "Invalid action. Use 'encode' or 'decode'"
    exit 1
fi
