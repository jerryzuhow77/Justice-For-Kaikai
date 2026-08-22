#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  exec python3 run_animation.py
elif command -v python >/dev/null 2>&1; then
  exec python run_animation.py
else
  printf '\n[無法啟動] 此電腦尚未安裝 Python 3。\n'
  printf '請安裝 Python 3 後，再執行本檔案。\n\n'
  read -r -p '按 Enter 關閉……'
fi
