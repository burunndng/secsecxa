#!/usr/bin/env python3
"""Simple port scanner tool"""
import sys
import socket
from datetime import datetime

def scan_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: port_scanner.py <host> [start_port] [end_port]")
        sys.exit(1)
    
    host = sys.argv[1]
    start_port = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end_port = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
    
    print(f"Scanning {host} from port {start_port} to {end_port}")
    print(f"Started at: {datetime.now()}")
    print("-" * 50)
    
    open_ports = []
    for port in range(start_port, min(end_port + 1, start_port + 100)):
        if scan_port(host, port):
            open_ports.append(port)
            print(f"Port {port}: OPEN")
    
    print("-" * 50)
    print(f"Scan complete. Found {len(open_ports)} open ports")
    print(f"Finished at: {datetime.now()}")
