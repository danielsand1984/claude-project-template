# During init, replace `_PROJECT_NAME_` (and the folder name {{project_name}}) with
# your actual package slug (snake_case). The import will then resolve correctly
# because pyproject.toml has `pythonpath = ["src"]` for pytest.
from typer.testing import CliRunner

# from {{project_name}}.cli import app  # noqa: ERA001  ← uncomment after rename
# runner = CliRunner()


# def test_hello_default() -> None:
#     result = runner.invoke(app, ["hello"])
#     assert result.exit_code == 0
#     assert "Hello" in result.stdout
