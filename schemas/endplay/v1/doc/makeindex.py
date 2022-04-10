import os
from pathlib import Path

with open("index.html", "w") as f:
    f.write("<html><head><title>endplay v1 schema</title></head><body><h1>Documentation for endplay v1 JSON Schema</h1><ul>")
    for file in os.listdir("."):
        if file.endswith(".schema.html"):
            name = Path(file).stem
            f.write(f'<li>{name.title()[:-7]} (<a href="{name}.html">doc</a>) (<a href="https://dominicprice.github.io/schemas/endplay/v1/{name}.json">schema</a>)</li>')
    f.write("</ul></body></html>")