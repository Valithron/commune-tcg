/* ============================================================================
   Mock Admin Data
   Phase 4 responsibility: static moderation/admin summaries for the Admin route.
   Real admin permissions, database reads, and mutations belong to backend phases.
   ============================================================================ */

import { mockCards } from './mockCards.js';
import { mockEncounters } from './mockBattle.js';

export const mockAdminStats = {
  totalCards: mockCards.length,
  approvedCards: mockCards.length,
  pendingSubmissions: 3,
  encounters: mockEncounters.length,
  imageBucket: 'CARD_IMAGES',
  databaseBinding: 'DB',
};

export const mockSubmissions = [
  {
    id: 'submission-001',
    name: 'Lantern Orchard Keeper',
    submitter: 'Sterling',
    category: 'Support',
    rarity: 'uncommon',
    status: 'Pending Art Review',
  },
  {
    id: 'submission-002',
    name: 'Sable Bridge Watcher',
    submitter: 'Cydney',
    category: 'Defense',
    rarity: 'rare',
    status: 'Needs Stats',
  },
  {
    id: 'submission-003',
    name: 'Copper Kettle Familiar',
    submitter: 'Kenly',
    category: 'Alchemy',
    rarity: 'common',
    status: 'Ready to Approve',
  },
];

export const adminChecklist = [
  'Review uploaded art crop and image safety.',
  'Confirm card name, category, rarity, and flavor text.',
  'Validate stat spread before the card enters the Library.',
  'Approve card template before it becomes eligible for Pull results.',
];
