import os

files = ["index.html", "whole-life.html", "universal-life.html", "term-life.html", "disability-insurance.html", "mortgage-protection.html"]
for f in files:
    if os.path.exists(f):
        content = open(f, encoding='utf8').read()
        content = content.replace('data-key="social-', 'data-admin-key="social-')
        open(f, 'w', encoding='utf8').write(content)
        print("Fixed", f)
