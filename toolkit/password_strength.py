#!/usr/bin/env python3
"""Password strength checker"""
import sys
import re

def check_password_strength(password):
    score = 0
    feedback = []
    
    if len(password) >= 8:
        score += 1
        feedback.append("✓ Length >= 8 characters")
    else:
        feedback.append("✗ Length < 8 characters (weak)")
    
    if len(password) >= 12:
        score += 1
        feedback.append("✓ Length >= 12 characters")
    
    if re.search(r'[a-z]', password):
        score += 1
        feedback.append("✓ Contains lowercase letters")
    else:
        feedback.append("✗ Missing lowercase letters")
    
    if re.search(r'[A-Z]', password):
        score += 1
        feedback.append("✓ Contains uppercase letters")
    else:
        feedback.append("✗ Missing uppercase letters")
    
    if re.search(r'[0-9]', password):
        score += 1
        feedback.append("✓ Contains numbers")
    else:
        feedback.append("✗ Missing numbers")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
        feedback.append("✓ Contains special characters")
    else:
        feedback.append("✗ Missing special characters")
    
    print(f"Password: {'*' * len(password)}")
    print(f"Score: {score}/6")
    print("-" * 50)
    for item in feedback:
        print(item)
    print("-" * 50)
    
    if score <= 2:
        print("Strength: WEAK")
    elif score <= 4:
        print("Strength: MEDIUM")
    else:
        print("Strength: STRONG")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: password_strength.py <password>")
        sys.exit(1)
    
    password = sys.argv[1]
    check_password_strength(password)
