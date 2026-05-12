"""CLI entry point. Rename the package folder to your project slug during init."""
from __future__ import annotations

import logging
import sys

import typer
from rich.console import Console

app = typer.Typer(
    name="{{PROJECT_NAME}}",
    help="{{PROJECT_DESCRIPTION}}",
    no_args_is_help=True,
)
console = Console()
err_console = Console(stderr=True)


@app.callback()
def main(
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Verbose logging."),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Errors only."),
) -> None:
    level = logging.DEBUG if verbose else (logging.ERROR if quiet else logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        stream=sys.stderr,
    )


@app.command()
def hello(name: str = typer.Argument("world", help="Who to greet.")) -> None:
    """Print a greeting. Replace with your real commands."""
    console.print(f"Hello, [bold cyan]{name}[/bold cyan]!")


if __name__ == "__main__":
    app()
