from typer.testing import CliRunner

from cli import app

runner = CliRunner()


def test_hello_default() -> None:
    result = runner.invoke(app, ["hello"])
    assert result.exit_code == 0
    assert "Hello" in result.stdout


def test_hello_with_name() -> None:
    result = runner.invoke(app, ["hello", "Daniel"])
    assert result.exit_code == 0
    assert "Daniel" in result.stdout
