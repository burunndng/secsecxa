#!/bin/bash

cd "$(dirname "$0")"

mkdir -p logs

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
