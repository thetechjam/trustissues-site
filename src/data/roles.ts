/**
 * Roles implemented in the app (TrustIssuesEngine/Sources/TrustIssuesEngine/Role.swift).
 * Names, blurbs and details are lifted from the app's
 * `Trust Issues/Game/Role+Presentation.swift` (`blurb` + `howToPlayDetail`).
 * Colors are the app's role tokens (design-system.md §1.5): a role color
 * always means that role and is never used as decoration.
 */
export type RoleKey = 'villager' | 'werewolf' | 'seer' | 'doctor' | 'minion' | 'jester' | 'hunter';

export interface RoleInfo {
  key: RoleKey;
  name: string;
  team: 'Village team' | 'Wolf team' | 'Team of one';
  blurb: string;
  detail: string;
  /** Minimum table size for the role to be dealt, if any. */
  unlock?: string;
}

export const ROLES: RoleInfo[] = [
  {
    key: 'villager',
    name: 'Villager',
    team: 'Village team',
    blurb: 'No powers. Just your wits and your vote.',
    detail: 'No night powers — just a vote and a hunch. Wins when every werewolf is gone.',
  },
  {
    key: 'werewolf',
    name: 'Werewolf',
    team: 'Wolf team',
    blurb: 'Pick a victim each night. Look shocked each morning.',
    detail: 'Picks a victim with the pack each night. The wolves win the moment they match the rest of the table in number.',
  },
  {
    key: 'seer',
    name: 'Seer',
    team: 'Village team',
    blurb: "Once a night, peek at one player's card.",
    detail: 'Each night, checks one player and learns one thing: werewolf, or not. The Minion reads clean — that’s the trap.',
  },
  {
    key: 'doctor',
    name: 'Doctor',
    team: 'Village team',
    blurb: 'Once a night, shield one player from the wolves.',
    detail: 'Shields one player each night — themselves included. Guess right and the morning news is quiet.',
  },
  {
    key: 'hunter',
    name: 'Hunter',
    team: 'Village team',
    blurb: "If you die, you don't die alone. Someone comes with you.",
    detail: 'The moment the Hunter dies — night kill or day vote — they take one living player down with them.',
    unlock: '5+ players',
  },
  {
    key: 'minion',
    name: 'Minion',
    team: 'Wolf team',
    blurb: "You know the wolves. They don't know you. Help them win anyway.",
    detail: 'Reads clean to the Seer and counts as a villager for parity, but wins right alongside the pack.',
    unlock: '5+ players',
  },
  {
    key: 'jester',
    name: 'Jester',
    team: 'Team of one',
    blurb: 'You win if the village votes you out. Act guilty. Not too guilty.',
    detail: 'Wins alone, and only one way: get voted out in daylight. A night kill is just a death.',
    unlock: '5+ players',
  },
];
