#!/usr/bin/env python3
"""Simple static file server for the 雾中宅 game.
Serves all game files (HTML, CSS, JS, images) on port 8080.
"""
import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class GameHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Serves files from the game directory with proper MIME types and no caching."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Disable caching for all files so changes are always reflected
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def guess_type(self, path):
        """Ensure correct MIME types for all game assets."""
        mimetype = super().guess_type(path)
        # Ensure JavaScript is served with correct MIME type
        if path.endswith('.js'):
            return 'application/javascript'
        return mimetype


def main():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), GameHTTPRequestHandler) as httpd:
        print(f"雾中宅 game server running at http://localhost:{PORT}/")
        print(f"Serving files from: {DIRECTORY}")
        print(f"Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)


if __name__ == '__main__':
    main()
