import sys
lines = open('App.tsx','r',encoding='utf-8').read().splitlines()
stack = []
in_single = in_double = in_backtick = False
block_comment = False
escape = False
for lineno, line in enumerate(lines, start=1):
    i = 0
    while i < len(line):
        ch = line[i]
        lookahead = line[i+1] if i+1 < len(line) else ''
        if block_comment:
            if ch == '*' and lookahead == '/':
                block_comment = False
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
            elif ch == '$' and lookahead == '{':
                stack.append(('${', lineno))
                i += 2
                continue
            i += 1
            continue
        if ch == '/' and lookahead == '/':
            break
        if ch == '/' and lookahead == '*':
            block_comment = True
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
            stack.append((ch, lineno))
        elif ch == '}':
            if stack and stack[-1][0] == '${':
                stack.pop()
            elif stack:
                stack.pop()
            else:
                print('Extra } at', lineno)
        i += 1
print('Remaining stack length:', len(stack))
print('Last entries:', stack[-10:])
