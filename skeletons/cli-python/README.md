# Python CLI Skeleton

Typer-based CLI. Single-file entrypoint for small tools, can grow into a multi-command package.

## Layout

```
src/{{project_name}}/
├── __init__.py
├── __main__.py        # python -m {{project_name}}
├── cli.py             # Typer app definition
├── commands/          # One file per top-level command (grow into this)
│   └── hello.py
└── lib/               # Pure-logic helpers (testable without the CLI shell)
pyproject.template.toml
tests/
└── test_hello.py
```

## During init

- Rename `{{project_name}}` to your slug (snake_case for Python).
- Rename `pyproject.template.toml` → `pyproject.toml`.
- Choose distribution: pip install (default), pipx, or build standalone with `pyinstaller`.
- Add the entry-point name in `[project.scripts]`.

## Dev commands

```bash
pip install -e ".[dev]"
{{project_name}} --help
pytest -q
ruff check . && ruff format .
```
