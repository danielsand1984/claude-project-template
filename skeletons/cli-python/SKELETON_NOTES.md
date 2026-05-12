# cli-python skeleton — notes for the init flow

> **Delete this file** after scaffolding. It exists only to guide `START_HERE.md` Phase 2.

## Layout after init

```
src/<package_slug>/      ← rename the {{project_name}} folder to your snake_case slug
├── __init__.py
├── __main__.py          # python -m <package_slug>
├── cli.py               # Typer app definition
├── commands/            # (add when you have >1 command) one file per top-level command
└── lib/                 # (add later) pure-logic helpers
pyproject.toml           ← renamed from pyproject.template.toml
tests/
└── test_<command>.py    ← rename test_hello.py + fix the import
```

## During init (these are reminders for `START_HERE.md`)

1. **Rename folder** `src/{{project_name}}/` → `src/<your-snake_case-slug>/` (e.g. `mssql_healthcheck`).
2. **Rename** `pyproject.template.toml` → `pyproject.toml`. Replace `{{PROJECT_NAME}}` (kebab-case), `{{project_name}}` (snake_case), `{{PROJECT_DESCRIPTION}}`, `{{AUTHOR_NAME}}`, `{{AUTHOR_EMAIL}}`.
3. **Add real dependencies** (anything beyond Typer + Rich) to `pyproject.toml`.
4. **Rewrite `tests/test_hello.py`** for your actual command — fix the import to `from <package_slug>.cli import app`.
5. **Write a fresh `README.md`** based on the interview. The template's root README was replaced by `skeletons/cli-python/README.md` (which is what this file used to be) — but it described the skeleton, not your project. Replace it.
6. Choose distribution: `pip install` (default), `pipx`, or `pyinstaller` for a standalone binary.

## Dev commands (after init)

```bash
pip install -e ".[dev]"
<your-cli-name> --help
pytest -q
ruff check . && ruff format .
```
