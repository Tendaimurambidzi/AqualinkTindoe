from pathlib import Path
text = Path('App.tsx').read_text(encoding='utf-8')
start = text.index('Feature Section - Bottom')
snippet = text[start:start+900]
print(snippet.encode('unicode_escape'))
