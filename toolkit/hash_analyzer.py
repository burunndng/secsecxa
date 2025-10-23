#!/usr/bin/env python3
"""Hash analyzer and generator"""
import sys
import hashlib

def analyze_hash(text):
    print(f"Input: {text}")
    print("-" * 50)
    print(f"MD5:    {hashlib.md5(text.encode()).hexdigest()}")
    print(f"SHA1:   {hashlib.sha1(text.encode()).hexdigest()}")
    print(f"SHA256: {hashlib.sha256(text.encode()).hexdigest()}")
    print(f"SHA512: {hashlib.sha512(text.encode()).hexdigest()}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: hash_analyzer.py <text>")
        sys.exit(1)
    
    text = " ".join(sys.argv[1:])
    analyze_hash(text)
