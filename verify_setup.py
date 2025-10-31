#!/usr/bin/env python3
"""
Verification script for CyberSec Toolkit Backend setup
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    print("Checking Python version...")
    if sys.version_info < (3, 10):
        print(f"  ❌ Python 3.10+ required, found {sys.version}")
        return False
    print(f"  ✅ Python {sys.version_info.major}.{sys.version_info.minor}")
    return True

def check_directories():
    """Check required directories exist"""
    print("\nChecking directory structure...")
    required_dirs = [
        "app",
        "app/api",
        "app/services",
        "app/services/tools",
        "app/services/tools/network",
        "app/models",
        "app/schemas",
        "app/db",
        "app/core",
        "app/data",
        "app/tests",
        "app/tests/unit",
        "app/tests/integration"
    ]
    
    all_exist = True
    for directory in required_dirs:
        if os.path.isdir(directory):
            print(f"  ✅ {directory}")
        else:
            print(f"  ❌ {directory} not found")
            all_exist = False
    
    return all_exist

def check_files():
    """Check required files exist"""
    print("\nChecking required files...")
    required_files = [
        "requirements.txt",
        "app/main.py",
        "app/data/tool_definitions.json",
        "app/core/config.py",
        "app/services/execution_engine.py",
        "app/services/tools/base.py",
        "app/services/tools/network/port_scanner.py",
        "app/services/tools/network/dns_lookup.py",
        "app/services/tools/network/whois_lookup.py",
        "app/services/tools/network/ping_tool.py",
        "app/services/tools/network/ssl_analyzer.py",
        "app/services/tools/network/traceroute.py",
        "app/api/tools.py",
        "app/api/executions.py",
        "app/models/tool.py",
        "app/models/execution.py",
    ]
    
    all_exist = True
    for file in required_files:
        if os.path.isfile(file):
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} not found")
            all_exist = False
    
    return all_exist

def check_tool_definitions():
    """Check tool_definitions.json is valid"""
    print("\nChecking tool definitions...")
    try:
        import json
        with open("app/data/tool_definitions.json", "r") as f:
            data = json.load(f)
        
        tools = data.get("tools", [])
        print(f"  ✅ Found {len(tools)} tools defined:")
        for tool in tools:
            print(f"     - {tool['id']}: {tool['name']}")
        return True
    except Exception as e:
        print(f"  ❌ Error reading tool_definitions.json: {e}")
        return False

def main():
    print("=" * 60)
    print("CyberSec Toolkit Backend - Setup Verification")
    print("=" * 60)
    
    results = []
    
    results.append(check_python_version())
    results.append(check_directories())
    results.append(check_files())
    results.append(check_tool_definitions())
    
    print("\n" + "=" * 60)
    if all(results):
        print("✅ All checks passed! Setup is complete.")
        print("\nNext steps:")
        print("  1. Install dependencies: pip install -r requirements.txt")
        print("  2. Start the server: ./run_backend.sh")
        print("  3. Access API docs: http://localhost:8000/docs")
        return 0
    else:
        print("❌ Some checks failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
