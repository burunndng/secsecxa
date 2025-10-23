#!/bin/bash
# Network information gatherer

echo "=== Network Information ==="
echo ""
echo "Hostname:"
hostname
echo ""
echo "IP Addresses:"
hostname -I || echo "N/A"
echo ""
echo "DNS Info:"
cat /etc/resolv.conf 2>/dev/null | grep nameserver || echo "N/A"
echo ""
echo "Network Interfaces:"
ip link show 2>/dev/null || ifconfig -a 2>/dev/null || echo "N/A"
