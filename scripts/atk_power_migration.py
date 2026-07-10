#!/usr/bin/env python3
from __future__ import annotations

import re
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {
    ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
    ".md", ".html", ".css", ".json", ".txt", ".toml",
    ".yml", ".yaml", ".sql",
}
EXCLUDED_PARTS = {".git", "node_modules", "dist", ".wrangler"}
SELF = Path(__file__).resolve()
WORKFLOW = ROOT / ".github" / "workflows" / "atk-power-migration.yml"
changed_files: set[str] = set()


def tracked_text_files() -> list[Path]:
    output = subprocess.check_output(["git", "ls-files"], cwd=ROOT, text=True)
    paths: list[Path] = []
    for relative in output.splitlines():
        path = ROOT / relative
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue
        if path.resolve() in {SELF, WORKFLOW.resolve()}:
            continue
        paths.append(path)
    return paths


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    old = read(path)
    if old == text:
        return
    path.write_text(text, encoding="utf-8")
    changed_files.add(path.relative_to(ROOT).as_posix())


def replace_exact(path: str, old: str, new: str, *, required: bool = True) -> None:
    target = ROOT / path
    text = read(target)
    if old not in text:
        if required:
            raise RuntimeError(f"Expected text not found in {path}: {old[:120]!r}")
        return
    write(target, text.replace(old, new))


def replace_regex(path: str, pattern: str, replacement: str, *, count: int = 0, required: bool = True, flags: int = 0) -> None:
    target = ROOT / path
    text = read(target)
    updated, matches = re.subn(pattern, replacement, text, count=count, flags=flags)
    if required and matches == 0:
        raise RuntimeError(f"Expected pattern not found in {path}: {pattern!r}")
    write(target, updated)


def apply_repository_wide_visible_copy_cleanup() -> None:
    phrase_rules = [
        (re.compile(r"\bmatchup-adjusted squad power\b", re.I), "Effective Squad Power"),
        (re.compile(r"\badjusted squad power\b", re.I), "Effective Squad Power"),
        (re.compile(r"\bmatchup-adjusted battle power\b", re.I), "Effective Power"),
        (re.compile(r"\badjusted battle power\b", re.I), "Effective Power"),
        (re.compile(r"\beffective battle power\b", re.I), "Effective Power"),
        (re.compile(r"\bbase battle power\b", re.I), "Power"),
        (re.compile(r"\bcombined battle power\b", re.I), "Power"),
        (re.compile(r"\btotal battle power\b", re.I), "Power"),
        (re.compile(r"\bbattle power\b", re.I), "Power"),
    ]

    for path in tracked_text_files():
        text = read(path)
        updated = text.replace("POW", "ATK")
        for pattern, replacement in phrase_rules:
            updated = pattern.sub(replacement, updated)
        write(path, updated)


def update_card_frame() -> None:
    path = "src/components/CardFrame.js"
    old = """function renderStats(stats = {}) {
  return [
    ['ATK', stats.pow ?? 1],
    ['DEF', stats.def ?? 1],
    ['SPD', stats.spd ?? 1],
  ].map(([label, value]) => `
    <span class="card-stat">
      <span class="card-stat-label">${label}</span>
      <span class="card-stat-value">${escapeHtml(String(value))}</span>
    </span>
  `).join('');
}"""
    new = """function renderStats(stats = {}) {
  return [
    ['ATK', 'Attack', stats.pow ?? 1],
    ['DEF', 'Defense', stats.def ?? 1],
    ['SPD', 'Speed', stats.spd ?? 1],
  ].map(([label, spokenLabel, value]) => `
    <span class="card-stat" aria-label="${escapeHtml(`${spokenLabel} ${value}`)}">
      <span class="card-stat-label" aria-hidden="true">${label}</span>
      <span class="card-stat-value" aria-hidden="true">${escapeHtml(String(value))}</span>
    </span>
  `).join('');
}"""
    replace_exact(path, old, new)


def update_home() -> None:
    replace_exact(
        "src/routes/Home.js",
        '<span class="status-pill">${strongestTotal} Total</span>',
        '<span class="status-pill">Power ${strongestTotal}</span>',
    )


def update_battle_hub() -> None:
    replace_exact(
        "src/routes/BattleHub.js",
        '<span class="status-pill">Power ${squadPower}</span>',
        '<span class="status-pill">Squad Power ${squadPower}</span>',
    )
    replace_exact(
        "src/routes/BattleHub.js",
        '<span>Power ${encounter.enemyPower}</span>',
        '<span>Enemy PWR ${encounter.enemyPower}</span>',
    )


def update_encounter_select() -> None:
    replace_exact(
        "src/routes/EncounterSelect.js",
        '<div><span>Rec.</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>',
        '<div><span>Enemy PWR</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>',
    )
    replace_exact(
        "src/routes/EncounterSelect.js",
        '<div><span>Your</span><strong>${escapeHtml(squadPower)}</strong></div>',
        '<div><span>Squad PWR</span><strong>${escapeHtml(squadPower)}</strong></div>',
    )


def update_squad_builder() -> None:
    path = "src/routes/SquadBuilder.js"
    replace_exact(
        path,
        '<span>P${escapeHtml(card.stats?.pow ?? 0)} D${escapeHtml(card.stats?.def ?? 0)} S${escapeHtml(card.stats?.spd ?? 0)}</span>',
        '<span aria-label="Attack ${escapeHtml(card.stats?.pow ?? 0)}, Defense ${escapeHtml(card.stats?.def ?? 0)}, Speed ${escapeHtml(card.stats?.spd ?? 0)}">A${escapeHtml(card.stats?.pow ?? 0)} · D${escapeHtml(card.stats?.def ?? 0)} · S${escapeHtml(card.stats?.spd ?? 0)}</span>',
    )
    replace_exact(
        path,
        '<strong>${escapeHtml(card.battlePower || 0)}</strong>',
        '<strong aria-label="Power ${escapeHtml(card.battlePower || 0)}">PWR ${escapeHtml(card.battlePower || 0)}</strong>',
    )
    replace_exact(
        path,
        '<small>Lv ${escapeHtml(card.level)} · ${escapeHtml(card.battlePower || 0)} Power</small>',
        '<small>Lv ${escapeHtml(card.level)} · PWR ${escapeHtml(card.battlePower || 0)}</small>',
    )


def update_battle_results() -> None:
    path = "src/routes/BattleResults.js"
    replace_exact(
        path,
        "? ` · ${card.matchupResult} matchup ${card.baseBattlePower || card.battlePower}→${card.battlePower}`",
        "? ` · ${card.matchupResult} matchup · Power ${card.baseBattlePower || card.battlePower} → Effective Power ${card.battlePower}`",
    )
    replace_exact(
        path,
        '<p>Led the squad with ${escapeHtml(card.battlePower || 0)} Effective Power${escapeHtml(matchupText)}.</p>',
        '<p>Led the squad with Effective Power ${escapeHtml(card.battlePower || 0)}${escapeHtml(matchupText)}.</p>',
        required=False,
    )
    replace_exact(
        path,
        '<p>Led the squad with ${escapeHtml(card.battlePower || 0)} effective power${escapeHtml(matchupText)}.</p>',
        '<p>Led the squad with Effective Power ${escapeHtml(card.battlePower || 0)}${escapeHtml(matchupText)}.</p>',
        required=False,
    )
    replace_exact(
        path,
        '<div class="battle-lead-stat"><span>Power</span><strong>${escapeHtml(card.battlePower || 0)}</strong></div>',
        '<div class="battle-lead-stat"><span>Effective Power</span><strong>${escapeHtml(card.battlePower || 0)}</strong></div>',
    )
    replace_exact(
        path,
        "? `${card.matchupResult}: ${card.baseBattlePower || card.battlePower}→${card.battlePower}`",
        "? `${card.matchupResult}: Power ${card.baseBattlePower || card.battlePower} → Effective Power ${card.battlePower}`",
    )
    replace_exact(
        path,
        '<span>P${escapeHtml(card.stats?.pow ?? 0)} D${escapeHtml(card.stats?.def ?? 0)} S${escapeHtml(card.stats?.spd ?? 0)}</span>',
        '<span aria-label="Attack ${escapeHtml(card.stats?.pow ?? 0)}, Defense ${escapeHtml(card.stats?.def ?? 0)}, Speed ${escapeHtml(card.stats?.spd ?? 0)}">A${escapeHtml(card.stats?.pow ?? 0)} · D${escapeHtml(card.stats?.def ?? 0)} · S${escapeHtml(card.stats?.spd ?? 0)}</span>',
    )
    replace_exact(
        path,
        '<strong>${escapeHtml(card.battlePower || 0)}</strong>',
        '<strong aria-label="Effective Power ${escapeHtml(card.battlePower || 0)}">Eff. PWR ${escapeHtml(card.battlePower || 0)}</strong>',
    )
    replace_exact(
        path,
        '<div>Your Effective Squad Power was ${escapeHtml(squadPower)} against enemy power ${escapeHtml(encounter.enemyPower)}.</div>',
        '<div>Your Effective Squad Power was ${escapeHtml(squadPower)} against Enemy Power ${escapeHtml(encounter.enemyPower)}.</div>',
        required=False,
    )
    replace_exact(
        path,
        '<div>${victory ? `Your squad won by ${margin} power.` : `Your squad fell short by ${Math.abs(margin)} power.`}</div>',
        '<div>${victory ? `Your squad won with a Power margin of ${margin}.` : `Your squad fell short by a Power margin of ${Math.abs(margin)}.`}</div>',
    )


def update_admin_card_editor() -> None:
    path = "src/routes/AdminCardEditor.js"
    replace_exact(
        path,
        "function cardStat(card, key) { return Number(card?.stats?.[key] ?? 0) || 0; }",
        "function cardStat(card, key) { return Number(card?.stats?.[key] ?? 0) || 0; }\nfunction cardPower(card) { return cardStat(card, 'pow') + cardStat(card, 'def') + cardStat(card, 'spd'); }",
    )
    replace_exact(
        path,
        "function sortValue(card, key) { if (key === 'pow') return cardStat(card, 'pow'); if (key === 'def') return cardStat(card, 'def'); if (key === 'spd') return cardStat(card, 'spd');",
        "function sortValue(card, key) { if (key === 'power') return cardPower(card); if (key === 'pow') return cardStat(card, 'pow'); if (key === 'def') return cardStat(card, 'def'); if (key === 'spd') return cardStat(card, 'spd');",
    )
    replace_exact(
        path,
        """      <td class="admin-number-cell">${escapeHtml(cardStat(card, 'spd'))}</td>
      <td class="admin-card-creator-cell">${escapeHtml(creatorName(card))}</td>""",
        """      <td class="admin-number-cell">${escapeHtml(cardStat(card, 'spd'))}</td>
      <td class="admin-number-cell"><strong>${escapeHtml(cardPower(card))}</strong></td>
      <td class="admin-card-creator-cell">${escapeHtml(creatorName(card))}</td>""",
    )
    replace_exact(
        path,
        "<th>${renderSortButton('SPD', 'spd')}</th><th>${renderSortButton('Creator', 'creatorDisplayName')}</th>",
        "<th>${renderSortButton('SPD', 'spd')}</th><th>${renderSortButton('Power', 'power')}</th><th>${renderSortButton('Creator', 'creatorDisplayName')}</th>",
    )
    replace_exact(path, 'colspan="11"', 'colspan="12"', required=False)
    replace_exact(
        path,
        '<span>SPD <b data-preview-spd>${escapeHtml(stats.spd ?? 1)}</b></span></div>',
        '<span>SPD <b data-preview-spd>${escapeHtml(stats.spd ?? 1)}</b></span><span>PWR <b data-preview-power>${escapeHtml(cardPower(card))}</b></span></div>',
    )
    replace_exact(
        path,
        """  const spd = modal.querySelector('[data-preview-spd]');
  if (previewName)""",
        """  const spd = modal.querySelector('[data-preview-spd]');
  const power = modal.querySelector('[data-preview-power]');
  if (previewName)""",
    )
    replace_exact(
        path,
        """  if (spd) spd.textContent = form.querySelector('[name="spd"]')?.value || '1';
}""",
        """  if (spd) spd.textContent = form.querySelector('[name="spd"]')?.value || '1';
  if (power) {
    const attackValue = Number(form.querySelector('[name="pow"]')?.value || 0);
    const defenseValue = Number(form.querySelector('[name="def"]')?.value || 0);
    const speedValue = Number(form.querySelector('[name="spd"]')?.value || 0);
    power.textContent = String(attackValue + defenseValue + speedValue);
  }
}""",
    )


def update_admin_card_mechanics() -> None:
    path = "src/routes/AdminCardMechanics.js"
    replace_exact(
        path,
        "function statLine(stats = {}) { return `ATK ${escapeHtml(stats.pow ?? 1)} / DEF ${escapeHtml(stats.def ?? 1)} / SPD ${escapeHtml(stats.spd ?? 1)}`; }",
        "function statLine(stats = {}) { return `ATK ${escapeHtml(stats.pow ?? 1)} / DEF ${escapeHtml(stats.def ?? 1)} / SPD ${escapeHtml(stats.spd ?? 1)}`; }\nfunction statTotal(stats = {}) { return Number(stats.pow ?? 0) + Number(stats.def ?? 0) + Number(stats.spd ?? 0); }",
    )
    replace_exact(
        path,
        "${renderMetric('Power', `${sim.baseBattlePower} → ${sim.adjustedBattlePower}`)}",
        "${renderMetric('Power → Effective Power', `${sim.baseBattlePower} → ${sim.adjustedBattlePower}`)}",
    )
    replace_exact(
        path,
        '<td class="admin-number-cell">${escapeHtml(card.statBudget ?? 0)}</td>\n      <td>${escapeHtml(statLine(card.stats))}</td>',
        '<td class="admin-number-cell">${escapeHtml(card.statBudget ?? 0)}</td>\n      <td class="admin-number-cell">${escapeHtml(card.stats?.pow ?? 1)}</td>\n      <td class="admin-number-cell">${escapeHtml(card.stats?.def ?? 1)}</td>\n      <td class="admin-number-cell">${escapeHtml(card.stats?.spd ?? 1)}</td>\n      <td class="admin-number-cell"><strong>${escapeHtml(statTotal(card.stats))}</strong></td>',
    )
    replace_exact(
        path,
        '<thead><tr><th>Card</th><th>Founder Rarity</th><th>Type</th><th>Creator</th><th>Budget</th><th>Stats</th><th>Status</th></tr></thead>',
        '<thead><tr><th>Card</th><th>Founder Rarity</th><th>Type</th><th>Creator</th><th>Stat Budget</th><th>ATK</th><th>DEF</th><th>SPD</th><th>Power</th><th>Status</th></tr></thead>',
    )
    replace_exact(path, 'colspan="7"', 'colspan="10"', required=False)
    replace_exact(
        path,
        "legacy pow/def/spd fields.",
        "legacy <code>pow</code>/<code>def</code>/<code>spd</code> fields.",
    )
    replace_exact(
        path,
        "effective stats, and battle matchup power.",
        "effective stats, Power, and matchup-adjusted Effective Power.",
    )
    replace_exact(
        path,
        "Battle currently compares Effective Squad Power against encounter enemy power.",
        "Battle currently compares Effective Squad Power against encounter Enemy Power.",
    )


def append_section(path: str, marker: str, section: str) -> None:
    target = ROOT / path
    text = read(target)
    if marker in text:
        return
    write(target, text.rstrip() + "\n\n" + section.strip() + "\n")


def update_primary_documentation() -> None:
    append_section(
        "README.md",
        "## Stat terminology",
        """
## Stat terminology

Player-facing card stats use the following canonical language:

- **ATK**: offensive output. The existing implementation and stored-data key remains `pow`.
- **DEF**: durability or damage resistance.
- **SPD**: initiative and speed-focused mechanics.
- **Power**: ATK + DEF + SPD for one card. Use **PWR** only where space is constrained.
- **Squad Power**: the sum of the selected cards' Power.
- **Effective Power** or **Matchup Power**: an encounter-adjusted value after temporary type or battle modifiers.

Compatibility parsers may continue accepting `pow`, `power`, `attack`, `atk`, and `strength` as legacy offensive-stat aliases. New UI copy must not expose the internal `pow` key as a player-facing label.
""",
    )
    append_section(
        "docs/game-design.md",
        "## Canonical Stat Terminology",
        """
## Canonical Stat Terminology

The three permanent core stats are:

- **ATK** controls offensive output.
- **DEF** controls durability or damage resistance, pending the final combat formula.
- **SPD** controls initiative and potential speed-focused mechanics.
- **Power** is the combined ATK + DEF + SPD total for one card.
- **PWR** is the compact abbreviation for Power when space is limited.
- **Squad Power** is the combined Power of all selected cards.
- **Effective Power** or **Matchup Power** is a temporary encounter-adjusted value after type modifiers or other temporary effects.

A card's permanent Power must remain distinct from its temporary Effective Power. The UI must not present an encounter-adjusted result as though the permanent card value changed.

### Internal compatibility

Existing code, D1 payloads, generated card JSON, normalizers, progression systems, simulations, and API responses may continue using `pow`, `stats.pow`, `baseStats.pow`, and `effectiveStats.pow`. The internal `pow` key is the canonical compatibility field for the offensive stat; **ATK** is the official player-facing term. Existing aliases such as `power`, `attack`, `atk`, and `strength` remain accepted where normalization already supports them.
""",
    )
    append_section(
        "docs/battle-design.md",
        "## Battle Stat Terminology",
        """
## Battle Stat Terminology

Battle presentation uses these terms consistently:

- **ATK**, **DEF**, and **SPD** are the three permanent core stats.
- **Power** or compact **PWR** means ATK + DEF + SPD for one card.
- **Squad Power** means the sum of the selected cards' Power.
- **Effective Power** or **Matchup Power** means a card's temporary encounter-adjusted Power after type modifiers or other temporary effects.
- **Effective Squad Power** means the sum of encounter-adjusted card values used for that matchup.
- **Enemy Power** means the encounter benchmark or the enemy card's permanent combined total, as context requires.

Power is not damage. ATK is not the combined total. A temporary matchup modifier must never silently overwrite the permanent Power shown in the collection, Library, Vault, or ordinary card detail.
""",
    )
    append_section(
        "docs/card-mechanics-contract.md",
        "## Player-facing stat names and compatibility",
        """
## Player-facing stat names and compatibility

The official display labels are **ATK**, **DEF**, and **SPD**. A card's **Power** is `ATK + DEF + SPD`; **PWR** is permitted only as a compact display abbreviation.

This terminology change does not authorize a data migration. Stored cards and internal mechanics continue to use `pow` as the canonical offensive-stat key. Normalizers must keep accepting existing `pow`, `power`, `attack`, `atk`, and `strength` aliases and resolve them into the compatible internal field. No stat value, budget, growth rule, rarity rule, type bias, or battle formula changes as part of this display migration.
""",
    )


def create_migration_report() -> None:
    report = ROOT / "docs" / "atk-power-terminology-migration.md"
    text = f"""# ATK / Power Terminology Migration

Completed: {date.today().isoformat()}

## Canonical terms

- ATK is the offensive stat stored internally as `pow`.
- DEF is defense.
- SPD is speed.
- Power is ATK + DEF + SPD.
- PWR is the compact abbreviation for Power.
- Squad Power is the sum of the selected cards' Power.
- Effective Power or Matchup Power is temporary encounter-adjusted Power.

## Implementation boundaries

This migration changes display labels, accessibility copy, admin presentation, and documentation. It does not change stored values, card balance, rarity budgets, level growth, type weights, battle formulas, D1 columns, card JSON contracts, or compatibility parsing.

The following internal contracts intentionally remain supported:

- `pow`
- `stats.pow`
- `baseStats.pow`
- `effectiveStats.pow`
- `battlePower`
- `baseBattlePower`
- `adjustedBattlePower`
- `effectiveBattlePower`

Compatibility aliases such as `power`, `attack`, `atk`, and `strength` remain accepted where existing normalizers already support them.

## Updated surfaces

- Canonical standard, showcase, thumbnail, Library, Vault, Pull, submission, and admin card rendering
- Home strongest-card Power summary
- Battle Hub, encounter selection, Squad Builder, battle-result rows, lead-card summary, and combat summary
- Admin card editor, preview, audit table, Founder Pool mechanics table, and mechanics simulator
- Screen-reader stat descriptions and compact battle stat rows
- README, game design, battle design, mechanics contract, phase notes, inventories, fixtures, and source comments containing player-facing terminology

## Validation

The migration workflow performs:

1. Repository-wide stale visible-label checks.
2. Compact attack-shorthand checks.
3. Compatibility assertions for internal `pow` normalization.
4. `git diff --check`.
5. The production Vite build.
"""
    report.write_text(text, encoding="utf-8")
    changed_files.add(report.relative_to(ROOT).as_posix())


def validate() -> None:
    stale: list[str] = []
    compact: list[str] = []
    for path in tracked_text_files() + [ROOT / "docs" / "atk-power-terminology-migration.md"]:
        text = read(path)
        relative = path.relative_to(ROOT).as_posix()
        if "POW" in text:
            stale.append(relative)
        if re.search(r"P\$\{[^}\n]*stats\?*\.?pow", text):
            compact.append(relative)

    if stale:
        raise RuntimeError("Stale uppercase offensive labels remain: " + ", ".join(sorted(set(stale))))
    if compact:
        raise RuntimeError("Legacy compact P attack shorthand remains: " + ", ".join(sorted(set(compact))))

    frame = read(ROOT / "src/components/CardFrame.js")
    if "['ATK', 'Attack', stats.pow ?? 1]" not in frame:
        raise RuntimeError("Canonical CardFrame no longer maps stats.pow to the ATK display label.")
    if 'aria-label="${escapeHtml(`${spokenLabel} ${value}`)}"' not in frame:
        raise RuntimeError("Canonical CardFrame accessibility labels were not updated.")

    api_cards = read(ROOT / "functions/api/cards.js")
    for alias in ["'pow'", "'power'", "'attack'", "'atk'", "'strength'"]:
        if alias not in api_cards:
            raise RuntimeError(f"Offensive-stat compatibility alias disappeared: {alias}")
    if "stats: { pow:" not in api_cards:
        raise RuntimeError("API normalization no longer resolves the offensive stat into stats.pow.")

    for path, marker in [
        ("README.md", "## Stat terminology"),
        ("docs/game-design.md", "## Canonical Stat Terminology"),
        ("docs/battle-design.md", "## Battle Stat Terminology"),
        ("docs/card-mechanics-contract.md", "## Player-facing stat names and compatibility"),
    ]:
        if marker not in read(ROOT / path):
            raise RuntimeError(f"Missing documentation section {marker!r} in {path}")


def main() -> None:
    apply_repository_wide_visible_copy_cleanup()
    update_card_frame()
    update_home()
    update_battle_hub()
    update_encounter_select()
    update_squad_builder()
    update_battle_results()
    update_admin_card_editor()
    update_admin_card_mechanics()
    update_primary_documentation()
    create_migration_report()
    validate()

    print("Changed files:")
    for path in sorted(changed_files):
        print(f" - {path}")


if __name__ == "__main__":
    main()
