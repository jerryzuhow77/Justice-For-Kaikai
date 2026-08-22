#!/usr/bin/env python3
"""Launch the offline Justice for Kaikai computer-animation package."""

from __future__ import annotations

import contextlib
import http.server
import os
import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

HOST = "127.0.0.1"
START_PORT = 8787
END_PORT = 8807
START_PATH = "/?reel=1"


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Serve the animation files locally without stale browser caching."""

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        # Keep the launcher window readable while still showing errors.
        if args and str(args[1]).startswith(("4", "5")):
            super().log_message(format, *args)


def find_available_port() -> int:
    for port in range(START_PORT, END_PORT + 1):
        with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError(f"找不到可用連接埠（{START_PORT}–{END_PORT}）。")


def main() -> int:
    package_root = Path(__file__).resolve().parent
    index_file = package_root / "index.html"
    if not index_file.is_file():
        print("錯誤：找不到 index.html，請勿將啟動檔單獨移出資料夾。")
        return 1

    os.chdir(package_root)

    try:
        port = find_available_port()
    except RuntimeError as exc:
        print(f"錯誤：{exc}")
        return 1

    server = http.server.ThreadingHTTPServer((HOST, port), NoCacheHandler)
    url = f"http://{HOST}:{port}{START_PATH}"

    print("剴剴案四幕電腦動畫已啟動。")
    print(f"瀏覽器網址：{url}")
    print("關閉本視窗或按 Ctrl+C，即可停止離線伺服器。")

    def open_browser() -> None:
        time.sleep(0.45)
        webbrowser.open(url, new=2)

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        print("\n正在關閉動畫伺服器……")
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
