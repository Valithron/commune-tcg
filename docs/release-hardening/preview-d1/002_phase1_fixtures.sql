-- Minimum disposable Phase 1 fixtures
-- Target only: com-tcg-db-preview
-- No credentials and no R2 objects are seeded by this script.

INSERT OR IGNORE INTO user_resources (
  user_id, pull_tickets, gold, daily_ticket_claimed_on,
  energy, energy_updated_at, created_at, updated_at
) VALUES
  ('sterling', 12, 0, NULL, 10, '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('cydney',   12, 0, NULL, 10, '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z');

-- Five unowned Library templates provide one pull candidate per rarity.
INSERT OR IGNORE INTO cards (
  id, owner_user_id, character_id, card_json, created_at, updated_at
) VALUES
  ('phase1_library_common', '', 'phase1-common',
   '{"id":"phase1_library_common","name":"Phase 1 Common","character":"Preview Sentinel","character_id":"phase1-common","type":"neutral","approvedTypePool":["neutral"],"approvedTypeOdds":[{"type":"neutral","weight":100}],"rarity":"common","raritySource":"phase1_fixture","statsSource":"phase1_fixture","traitSource":"phase1_fixture","baseStats":{"pow":9,"def":10,"spd":9},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture","flavor":"Disposable Phase 1 preview template."}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_library_uncommon', '', 'phase1-uncommon',
   '{"id":"phase1_library_uncommon","name":"Phase 1 Uncommon","character":"Preview Warden","character_id":"phase1-uncommon","type":"bloom","approvedTypePool":["bloom"],"approvedTypeOdds":[{"type":"bloom","weight":100}],"rarity":"uncommon","raritySource":"phase1_fixture","statsSource":"phase1_fixture","traitSource":"phase1_fixture","baseStats":{"pow":10,"def":11,"spd":9},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture","flavor":"Disposable Phase 1 preview template."}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_library_rare', '', 'phase1-rare',
   '{"id":"phase1_library_rare","name":"Phase 1 Rare","character":"Preview Vanguard","character_id":"phase1-rare","type":"tide","approvedTypePool":["tide"],"approvedTypeOdds":[{"type":"tide","weight":100}],"rarity":"rare","raritySource":"phase1_fixture","statsSource":"phase1_fixture","traitSource":"phase1_fixture","baseStats":{"pow":11,"def":11,"spd":10},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture","flavor":"Disposable Phase 1 preview template."}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_library_legendary', '', 'phase1-legendary',
   '{"id":"phase1_library_legendary","name":"Phase 1 Legendary","character":"Preview Champion","character_id":"phase1-legendary","type":"radiant","approvedTypePool":["radiant"],"approvedTypeOdds":[{"type":"radiant","weight":100}],"rarity":"legendary","raritySource":"phase1_fixture","statsSource":"phase1_fixture","traitSource":"phase1_fixture","baseStats":{"pow":12,"def":12,"spd":11},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture","flavor":"Disposable Phase 1 preview template."}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_library_mythic', '', 'phase1-mythic',
   '{"id":"phase1_library_mythic","name":"Phase 1 Mythic","character":"Preview Paragon","character_id":"phase1-mythic","type":"shadow","approvedTypePool":["shadow"],"approvedTypeOdds":[{"type":"shadow","weight":100}],"rarity":"mythic","raritySource":"phase1_fixture","statsSource":"phase1_fixture","traitSource":"phase1_fixture","baseStats":{"pow":13,"def":12,"spd":12},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture","flavor":"Disposable Phase 1 preview template."}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z');

-- Three battle-eligible owned copies per validation account.
INSERT OR IGNORE INTO cards (
  id, owner_user_id, character_id, card_json, created_at, updated_at
) VALUES
  ('phase1_owned_sterling_1', 'sterling', 'phase1-sterling-1',
   '{"id":"phase1_owned_sterling_1","name":"Sterling Preview Left","character":"Sterling","character_id":"phase1-sterling-1","type":"flame","rarity":"common","baseStats":{"pow":10,"def":9,"spd":10},"copyTraits":{"foil":false,"holo":false,"variant":"standard","statBonus":{"pow":0,"def":0,"spd":0}},"progression":{"level":1,"xp":0,"copies":1},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture"}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_owned_sterling_2', 'sterling', 'phase1-sterling-2',
   '{"id":"phase1_owned_sterling_2","name":"Sterling Preview Center","character":"Sterling","character_id":"phase1-sterling-2","type":"volt","rarity":"uncommon","baseStats":{"pow":10,"def":10,"spd":10},"copyTraits":{"foil":false,"holo":false,"variant":"standard","statBonus":{"pow":0,"def":0,"spd":0}},"progression":{"level":1,"xp":0,"copies":1},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture"}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_owned_sterling_3', 'sterling', 'phase1-sterling-3',
   '{"id":"phase1_owned_sterling_3","name":"Sterling Preview Right","character":"Sterling","character_id":"phase1-sterling-3","type":"shadow","rarity":"rare","baseStats":{"pow":11,"def":10,"spd":10},"copyTraits":{"foil":false,"holo":false,"variant":"standard","statBonus":{"pow":0,"def":0,"spd":0}},"progression":{"level":1,"xp":0,"copies":1},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture"}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_owned_cydney_1', 'cydney', 'phase1-cydney-1',
   '{"id":"phase1_owned_cydney_1","name":"Cydney Preview Left","character":"Cydney","character_id":"phase1-cydney-1","type":"bloom","rarity":"common","baseStats":{"pow":9,"def":10,"spd":10},"copyTraits":{"foil":false,"holo":false,"variant":"standard","statBonus":{"pow":0,"def":0,"spd":0}},"progression":{"level":1,"xp":0,"copies":1},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture"}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_owned_cydney_2', 'cydney', 'phase1-cydney-2',
   '{"id":"phase1_owned_cydney_2","name":"Cydney Preview Center","character":"Cydney","character_id":"phase1-cydney-2","type":"tide","rarity":"uncommon","baseStats":{"pow":10,"def":10,"spd":10},"copyTraits":{"foil":false,"holo":false,"variant":"standard","statBonus":{"pow":0,"def":0,"spd":0}},"progression":{"level":1,"xp":0,"copies":1},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture"}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z'),
  ('phase1_owned_cydney_3', 'cydney', 'phase1-cydney-3',
   '{"id":"phase1_owned_cydney_3","name":"Cydney Preview Right","character":"Cydney","character_id":"phase1-cydney-3","type":"radiant","rarity":"rare","baseStats":{"pow":10,"def":11,"spd":10},"copyTraits":{"foil":false,"holo":false,"variant":"standard","statBonus":{"pow":0,"def":0,"spd":0}},"progression":{"level":1,"xp":0,"copies":1},"progressionRules":{"levelCap":30,"maxLevel":30,"growthPerLevel":2},"source":"phase1_fixture"}',
   '2026-07-12T00:00:00.000Z', '2026-07-12T00:00:00.000Z');

