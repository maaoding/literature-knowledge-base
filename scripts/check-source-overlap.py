from __future__ import annotations

import re
import sys
from pathlib import Path

WINDOW = 80
CHINESE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")


def normalize(text: str) -> str:
    return "".join(CHINESE.findall(text))


def source_files(root: Path) -> list[Path]:
    docs = root / "docs"
    return [
        path
        for path in docs.rglob("*")
        if path.is_file()
        and path.suffix in {".md", ".ts", ".vue"}
        and ".vitepress/dist" not in path.as_posix()
        and ".vitepress/cache" not in path.as_posix()
    ]


def read_source(path: Path) -> tuple[str, str]:
    if path.suffix.lower() == ".pdf":
        try:
            from pypdf import PdfReader
        except ModuleNotFoundError as error:
            raise RuntimeError("pypdf is required when checking a PDF source") from error
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages), f"{len(reader.pages)} PDF pages"
    return path.read_text(encoding="utf-8"), path.name


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: check-source-overlap.py <source.pdf|source.txt|source.md> [...]", file=sys.stderr)
        return 2

    root = Path(__file__).resolve().parents[1]
    source_paths = [Path(value).resolve() for value in sys.argv[1:]]
    for source_path in source_paths:
        if not source_path.is_file():
            print(f"source file not found: {source_path}", file=sys.stderr)
            return 2

    source_windows: list[tuple[Path, set[str], str]] = []
    for source_path in source_paths:
        text, description = read_source(source_path)
        normalized = normalize(text)
        windows = {normalized[index : index + WINDOW] for index in range(len(normalized) - WINDOW + 1)}
        source_windows.append((source_path, windows, description))

    matches: list[tuple[Path, Path, str]] = []
    checked_characters = 0
    for path in source_files(root):
        public_text = normalize(path.read_text(encoding="utf-8"))
        checked_characters += len(public_text)
        for index in range(len(public_text) - WINDOW + 1):
            excerpt = public_text[index : index + WINDOW]
            matched_source = next((source for source, windows, _ in source_windows if excerpt in windows), None)
            if matched_source:
                matches.append((path.relative_to(root), matched_source, excerpt))
                break

    if matches:
        for path, source, excerpt in matches:
            print(f"overlap >= {WINDOW} Chinese characters: {path} / {source.name}: {excerpt}", file=sys.stderr)
        return 1

    source_summary = ", ".join(description for _, _, description in source_windows)
    print(
        f"checked {source_summary} against {checked_characters} public Chinese characters; "
        f"no exact {WINDOW}-character overlap"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
