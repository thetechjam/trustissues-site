/**
 * Home-page screenshot gallery. These are real pre-release captures from the
 * app's DEBUG demo mode (copied from ~/Projects/trust-issues/design/app-store-screenshots/,
 * 1320x2868, 6.9" iPhone).
 *
 * To swap in final App Store screenshots: drop the new PNGs into
 * src/assets/screenshots/, update the imports below, and keep `alt` accurate.
 * Set `image: null` on any slot to render the "Screenshot coming soon"
 * placeholder phone instead.
 */
import type { ImageMetadata } from 'astro';
import role from '../assets/screenshots/role.png';
import nightWolf from '../assets/screenshots/nightWolf.png';
import day from '../assets/screenshots/day.png';
import discussion from '../assets/screenshots/discussion.png';
import vote from '../assets/screenshots/vote.png';
import gameover from '../assets/screenshots/gameover.png';

export interface Shot {
  image: ImageMetadata | null;
  alt: string;
  /** Narrator-voice caption shown under the phone. */
  caption: string;
  /** Short label for the step, e.g. "Night". */
  label: string;
  phase: 'night' | 'day';
}

export const SCREENSHOTS: Shot[] = [
  {
    image: role,
    label: 'Your role',
    phase: 'night',
    caption: 'Hold to see your role. No screen-peeking.',
    alt: 'Role reveal screen showing the Werewolf card: “Pick a victim each night. Look shocked each morning.”',
  },
  {
    image: nightWolf,
    label: 'Night',
    phase: 'night',
    caption: 'Choose your victim. Quietly.',
    alt: 'Night 1 werewolf screen: “Choose your victim.” with a grid of player chips and one selected.',
  },
  {
    image: day,
    label: 'Morning',
    phase: 'day',
    caption: 'The sun rises. Alex didn’t. Try to look surprised.',
    alt: 'Day announcement: “The sun rises. Alex didn’t. Try to look surprised.” with Alex’s chip marked eliminated.',
  },
  {
    image: discussion,
    label: 'Discussion',
    phase: 'day',
    caption: 'Somebody in this room is very good at eye contact.',
    alt: 'Day 1 discussion screen with a gold countdown ring at 2:59 and the living players below.',
  },
  {
    image: vote,
    label: 'The vote',
    phase: 'day',
    caption: 'Point fingers. Officially, this time.',
    alt: 'Voting screen: “Point fingers. Officially, this time.” with vote cards for Sam, Riley, Morgan and Quinn.',
  },
  {
    image: gameover,
    label: 'Game over',
    phase: 'night',
    caption: 'Trust: partially restored.',
    alt: 'Game over screen: “The Village Wins” with every player’s role revealed.',
  },
];
