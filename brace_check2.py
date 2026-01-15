import sys
text = open('App.tsx','r',encoding='utf-8').read()
line = 1
stack = []
in_single = in_double = in_backtick = False
in_line_comment = in_block_comment = False
escape = False
i = 0
N = len(text)
while i < N:
    ch = text[i]
    nxt = text[i+1] if i+1 < N else ''
    if ch == '\n':
        line += 1
        if in_line_comment:
            in_line_comment = False
        i += 1
        continue
    if in_line_comment:
        i += 1
        continue
    if in_block_comment:
        if ch == '*' and nxt == '/':
            in_block_comment = False
            i += 2
        else:
            i += 1
        continue
    if in_single:
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == "'":
            in_single = False
        i += 1
        continue
    if in_double:
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == '"':
            in_double = False
        i += 1
        continue
    if in_backtick:
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == '`':
            in_backtick = False
        elif ch == '$' and nxt == '{':
            stack.append((line, i, '${'))
            i += 2
            continue
        i += 1
        continue
    if ch == '/' and nxt == '/':
        in_line_comment = True
        i += 2
        continue
    if ch == '/' and nxt == '*':
        in_block_comment = True
        i += 2
        continue
    if ch == "'":
        in_single = True
        escape = False
        i += 1
        continue
    if ch == '"':
        in_double = True
        escape = False
        i += 1
        continue
    if ch == '`':
        in_backtick = True
        escape = False
        i += 1
        continue
    if ch == '{':
        stack.append((line, i, '{'))
    elif ch == '}':
        if stack and stack[-1][2] == '${':
            stack.pop()
        elif stack:
            stack.pop()
        else:
            print('extra } at', line)
    i += 1
print('remaining', len(stack))
print('top entry', stack[-1] if stack else None)
