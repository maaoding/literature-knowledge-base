from __future__ import annotations

import re
import sys
from pathlib import Path

from pypdf import PdfReader


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


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: check-source-overlap.py <source.pdf>", file=sys.stderr)
        return 2

    root = Path(__file__).resolve().parents[1]
    pdf_path = Path(sys.argv[1]).resolve()
    if not pdf_path.is_file():
        print(f"source PDF not found: {pdf_path}", file=sys.stderr)
        return 2

    reader = PdfReader(str(pdf_path))
    pdf_text = normalize("\n".join(page.extract_text() or "" for page in reader.pages))
    pdf_windows = {pdf_text[index : index + WINDOW] for index in range(len(pdf_text) - WINDOW + 1)}

    matches: list[tuple[Path, str]] = []
    checked_characters = 0
    for path in source_files(root):
        public_text = normalize(path.read_text(encoding="utf-8"))
        checked_characters += len(public_text)
        for index in range(len(public_text) - WINDOW + 1):
            excerpt = public_text[index : index + WINDOW]
            if excerpt in pdf_windows:
                matches.append((path.relative_to(root), excerpt))
                break

    if matches:
        for path, excerpt in matches:
            print(f"overlap >= {WINDOW} Chinese characters: {path}: {excerpt}", file=sys.stderr)
        return 1

    print(
        f"checked {len(reader.pages)} PDF pages against {checked_characters} public Chinese characters; "
        f"no exact {WINDOW}-character overlap"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
