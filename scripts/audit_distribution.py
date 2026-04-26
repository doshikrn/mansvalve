#!/usr/bin/env python3
"""Print catalog distribution report after rebuild."""
from __future__ import annotations

import collections
import json
import sys
from pathlib import Path


def main() -> int:
    data = json.loads(
        Path(__file__).resolve().parent.parent.joinpath("data", "catalog-products.json").read_text(encoding="utf-8")
    )
    prods = data["products"]

    print("=" * 64)
    print(f"Total products: {len(prods)}")
    print(f"Source files: {', '.join(data['meta']['sourceFiles'])}")
    print(f"Raw rows: {data['meta']['rawRows']}")
    print("=" * 64)

    by_cat = collections.Counter(p["category"] for p in prods)
    by_sub = collections.Counter(p["subcategory"] for p in prods)

    for cat in data["categories"]:
        total = by_cat.get(cat["id"], 0)
        print(f"\n[ {cat['name']} ]  total = {total}")
        for sub in cat["subcategories"]:
            n = by_sub.get(sub["id"], 0)
            mark = "OK   " if n > 0 else "EMPTY"
            print(f"  {mark}  {sub['name']:<40} ({sub['id']}) = {n}")

    print("\n" + "=" * 64)
    print("CRITICAL CHECKS")
    print("=" * 64)
    checks = [
        ("krany-flantsevy > 0",      by_sub.get("krany-flantsevy", 0) > 0),
        ("klapany-obratnye > 0",     by_sub.get("klapany-obratnye", 0) > 0),
        ("zadvizhki-shibernye > 0",  by_sub.get("zadvizhki-shibernye", 0) > 0),
        ("zadvizhki-klinovye > 0",   by_sub.get("zadvizhki-klinovye", 0) > 0),
        ("krany-tselnosvarnye > 0",  by_sub.get("krany-tselnosvarnye", 0) > 0),
        ("zatvory-diskovye > 0",     by_sub.get("zatvory-diskovye", 0) > 0),
        ("zatvory-s-uplotneniem > 0", by_sub.get("zatvory-s-uplotneniem", 0) > 0),
    ]
    all_passed = True
    for label, ok in checks:
        tag = "PASS" if ok else "FAIL"
        if not ok:
            all_passed = False
        print(f"  {tag}  {label}")

    print()
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
