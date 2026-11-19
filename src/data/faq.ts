/**
 * Support FAQ — single source for /support/ (accordions + FAQPage JSON-LD)
 * and the home-page teaser. Answers must stay consistent with PRIVACY_AUDIT.md
 * and the app's engine (min players, roles, min iOS). Plain text only: the
 * same strings feed JSON-LD.
 */
export interface Faq {
  id: string;
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    id: 'players',
    q: 'How many players do you need?',
    a: 'At least 4. There is no hard maximum. Five or more players unlocks the Hunter, Minion and Jester (Minion and Jester together need 6). The bigger the table, the messier it gets, in a good way.',
  },
  {
    id: 'everyone-needs-app',
    q: 'Does everyone need the app?',
    a: 'For the full experience, yes: each player joins the host’s room from their own iPhone with a 5-character room code, and their role stays private on their own screen. No account or sign-up is needed. If not everyone has the app, pass-and-play runs a whole game on one iPhone passed around the table.',
  },
  {
    id: 'remote',
    q: 'Can we play remotely?',
    a: 'Yes. Rooms run over the internet, so players can be anywhere. Get everyone on a video or voice call for the discussion, and the app handles the rest. Online rooms need an internet connection on every phone; pass-and-play works offline.',
  },
  {
    id: 'price',
    q: 'Is it free?',
    a: 'Pricing will be announced at launch. During the beta, Trust Issues is free to test through Apple’s TestFlight app. The current build has no ads and no in-app purchases.',
  },
  {
    id: 'requirements',
    q: 'What do I need to play?',
    a: 'An iPhone running iOS 17 or later. Online rooms need an internet connection. The app does not ask for access to your camera, microphone, contacts, photos or location.',
  },
  {
    id: 'rules',
    q: 'How do the roles work?',
    a: 'Werewolves pick a victim each night. The Seer checks one player a night (werewolf or not), the Doctor shields one player, and Villagers have their wits and their vote. The Hunter takes someone down with them when they die, the Minion secretly helps the wolves, and the Jester wins alone by getting voted out. The village wins when every werewolf is gone; the wolves win when they match the rest of the table in number. There is a full How to play guide inside the app.',
  },
  {
    id: 'stuck',
    q: 'A game got stuck, or the host left. What now?',
    a: 'In online rooms the host’s phone runs the game, so if the host closes the app, loses connection or leaves, the game can’t continue for everyone else. Keep the host’s phone awake, charged and online. If a game stalls, the host can start a fresh room and everyone rejoins with the new code. If it keeps happening, email jam@thetechjam.com with what happened and your iOS version.',
  },
  {
    id: 'data',
    q: 'What data does Trust Issues collect?',
    a: 'Very little. There are no accounts, ads, analytics or tracking. For online games the app stores the nickname you type, an anonymous ID and the game itself (roles, the narrator’s log, vote counts) in Google Firebase so phones can stay in sync. Pass-and-play games stay on your device. The Privacy Policy has the details.',
  },
  {
    id: 'delete',
    q: 'How do I delete my data?',
    a: 'Email jam@thetechjam.com from any address with the room code (if you remember it) and the nickname you used, and we’ll delete the matching game data. There is no account to close. Uninstalling the app does not remove data already stored for past online games, so email us.',
  },
  {
    id: 'nickname',
    q: 'What should I use as a nickname?',
    a: 'Anything your friends will recognize. Your nickname is visible to everyone in the room and appears in the narrator’s log (“The sun rises. Sam didn’t.”), so skip your full name or anything you wouldn’t say out loud at a party.',
  },
];

const pick = (ids: string[]) => ids.map((id) => FAQ.find((f) => f.id === id)!).filter(Boolean);
export const HOME_FAQ = pick(['players', 'everyone-needs-app', 'remote', 'price', 'data']);
