# Commit

Analyzes staged changes and creates a commit with a message following project conventions.

## Arguments

Use `$ARGUMENTS` to provide a commit message hint. If omitted, the message is derived from the changes.

- `/commit` → auto-derive from changes
- `/commit add button component` → use hint to compose message

Read `.claude/rules/git-workflow.md` first for protected branches, staging and authorization.

## Workflow (follow in order)

### 1. Check changes

```bash
git status
git diff --staged
```

- If no files are staged, **stop** and notify the user
- Direct commits to `main` or `develop` are forbidden — check the current branch and abort if on `main` or `develop`

```bash
git branch --show-current
```

### 2. Select commit type

Choose one type based on the nature of the change.

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `style` | UI/CSS change (no logic change) |
| `refactor` | Refactoring (no feature or bug change) |
| `test` | Add or update tests |
| `ci` | CI/CD configuration change |
| `chore` | Build config, dependencies, misc |
| `docs` | Documentation update |
| `remove` | File or code removal |

### 3. Message format

```
<type>: <summary in Korean>
```

- Write the summary in **Korean**
- Keep it under 50 characters
- End with a noun or verb root ("추가", "수정", "제거")
- Include issue number from branch name if present (`WTH-123`)

**Good:**
```
feat: 버튼 컴포넌트 variant 추가
fix: 페이지네이션 0 렌더링 버그 수정
style: 헤더 레이아웃 간격 조정
refactor: useAuth 훅 의존성 정리
```

**Bad:**
```
fix: fixed bug        ← English not allowed
feat: 여러 가지 수정  ← too vague
update: 업데이트      ← invalid type
```

### 4. Commit within the authorized scope

If the user requested a commit or a completed PR, commit the reviewed task-owned changes.
Ask only if commit authority or ownership of staged changes is unresolved.

```bash
git commit -m "<type>: <message>"
```

- If the user requests changes, revise within the existing authorization
- On success, print the commit hash and message

## Rules

- **Never** commit directly to `main` or `develop`
- Never use `--no-verify` (hook bypass is forbidden)
- Use `--amend` only when explicitly requested by the user
- Stage only explicit task-owned paths when staging is authorized by the commit/PR request
