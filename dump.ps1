from pathlib import Path
lines = Path("backend/server/index.js").read_text().splitlines()
for i in range(1760, 1820):
    print(i+1, lines[i])
