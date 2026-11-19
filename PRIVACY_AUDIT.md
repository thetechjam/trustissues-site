# Trust Issues: Privacy & Data Audit (internal)

- **Audited repo:** `~/Projects/trust-issues`, read-only. HEAD = `6622906` ("Add App Store submission prep…").
- **Audit date:** 2026-11-19
- **Firebase project:** `trust-issues-581ae` (`.firebaserc:3`)
- **Method:** static read of every config file, every Swift file under `Trust Issues/` and `TrustIssuesEngine/`, plus `README.md`, `SUBMISSION.md` and `Trust Issues/Multiplayer/README.md`. I made no builds and no network calls, and I did not look at the live Firebase console. Anything that depends on the console (deployed rules, enabled providers, TTL policies) is marked **UNVERIFIED**.

All paths below are relative to `~/Projects/trust-issues/`. When a claim and the docs disagree, the code wins.

---

## 1. Summary

| Topic | Finding |
|---|---|
| Third-party SDKs linked | **FirebaseAuth** and **FirebaseFirestore** only (firebase-ios-sdk `from: 12.0.0`). FirebaseCore comes in transitively. Nothing else. |
| Analytics / Crashlytics / Messaging / RTDB / AppCheck / Remote Config | **Not linked and not imported.** |
| Ads, IDFA, ATT, StoreKit/IAP | **None.** |
| Auth | **Firebase Anonymous Auth** only, triggered only by Host or Join. No Sign in with Apple, email or phone. |
| Server-side data | Firestore `rooms/{code}` plus subcollections `private/{uid}` and `actions/{autoID}`. Holds display names, the anonymous UID, game state, the event log with names, roles (private, and public at game over), night/vote targets (transient), and server timestamps. |
| Chat / free text beyond the name | None. The only free text a user types is their display name. |
| Retention | **No automatic deletion anywhere.** No TTL field, no Cloud Functions, and the app never deletes a room. `endRoom()` exists but is **never called**. Rooms persist indefinitely. |
| On-device storage | No first-party persistence in Release builds. The Firebase SDKs persist the anonymous Auth credential (Keychain) and, by default, a Firestore local cache. |
| Permissions / usage strings | None. No entitlements file, no background modes, no push. |
| Privacy manifest | `NSPrivacyTracking=false`, everything else empty. Consistent with first-party code. Firebase ships its own manifests. |
| Pass-and-play | Fully offline in first-party code. It makes no Auth or Firestore calls. `FirebaseApp.configure()` still runs at launch (see §3.3). |

---

## 2. Dependencies / SDKs

### 2.1 Package declarations
- `project.yml:10-18` declares two packages:
  - `TrustIssuesEngine`: a local path package (`project.yml:11-12`).
  - `firebase-ios-sdk` from `https://github.com/firebase/firebase-ios-sdk`, `from: 12.0.0` (`project.yml:16-18`). This is an "up to next major" range, not an exact pin.
- The app target `Trust Issues` links exactly three products (`project.yml:29-34`):
  - `TrustIssuesEngine`
  - `firebase-ios-sdk` → **`FirebaseAuth`** (`project.yml:31-32`)
  - `firebase-ios-sdk` → **`FirebaseFirestore`** (`project.yml:33-34`)
- `TrustIssuesEngine/Package.swift:16-22` has **no dependencies**. It is pure Swift with one library and one test target.
- **No `Package.resolved` is committed.** The `.xcodeproj`, which would hold it, is gitignored (`.gitignore:16`). The exact resolved Firebase version therefore cannot be determined from the repo. **No `Podfile`, no Carthage, no `functions/` directory.**

### 2.2 Swift imports (whole repo)
The only non-Apple, non-engine imports are:
- `import FirebaseAuth`: `Trust Issues/Multiplayer/AnonymousAuthService.swift:1`
- `import FirebaseCore`: `Trust Issues/Multiplayer/FirebaseBootstrap.swift:1` (available transitively)
- `import FirebaseFirestore`: six files in `Trust Issues/Multiplayer/`: `HostLobbyModel.swift:1`, `JoinLobbyModel.swift:1`, `RemoteGuestGameSession.swift:1`, `RemoteHostGameSession.swift:1`, `RoomModels.swift:1`, `RoomRepository.swift:1`

Apple frameworks used: SwiftUI, Foundation, Observation, and UIKit. UIKit appears only in `Screens/GameFlowView.swift:3` and is used solely for `isIdleTimerDisabled` at lines 158-159. The test target uses `Testing`.

### 2.3 Firebase products: linked vs mentioned
| Product | Linked? | Evidence |
|---|---|---|
| Auth | **Yes** | `project.yml:32`; used in `AnonymousAuthService.swift:18-22` |
| Firestore | **Yes** | `project.yml:34`; used in `RoomRepository.swift:31` |
| Core | Transitive | `FirebaseBootstrap.swift:1,33` |
| Realtime Database | No | No product, no import |
| Analytics | No | No product, no import. A grep for `Analytics` in Swift returns nothing. |
| Crashlytics | No | Same |
| Messaging (FCM) | No | Same. There is also no push entitlement. |
| App Check | No | Same. Auth carries an internal `FirebaseAppCheckInterop` shim, but App Check itself is not linked. |
| Installations | Not directly linked | `SUBMISSION.md:161` mentions a "Firebase Installation ID". Neither linked product depends on FirebaseInstallations as far as the repo shows. **Unverifiable without Package.resolved.** Confirm with Xcode → Archive → Generate Privacy Report. |
| Performance, Remote Config, Storage, Functions | No | Not linked or imported. `firebase.json:1-6` configures Firestore only. |

---

## 3. Authentication & identifiers

### 3.1 Auth type
- **Anonymous only.** `Auth.auth().signInAnonymously()` is in `AnonymousAuthService.swift:21`. An existing user is reused at line 18.
- The call happens only from `HostLobbyModel.createRoom` (`HostLobbyModel.swift:40`) and `JoinLobbyModel.join` (`JoinLobbyModel.swift:37`), so a user is signed in only after tapping Host → "Create room" or Join → "Join".
- There is no Sign in with Apple, email, phone, Google or any other provider anywhere in the code.

### 3.2 Identifiers
| Identifier | Present? | Notes |
|---|---|---|
| Firebase anonymous UID | **Yes** | Stored server-side as `hostUID`, as the `members` map key and `members.*.uid`, as the `private/{uid}` doc ID, and as `actions.*.actorUID`. Per the comment at `AnonymousAuthService.swift:4-8` it is stable for as long as the app is installed. The Firebase SDK persists the credential in the Keychain, and Keychain items may survive deletion and reinstall on iOS (SDK behaviour, not app code). |
| Engine `Player.id` | Yes | A random `UUID()` generated per room join (`RoomRepository.swift:52, 86`). It is not a device identifier, and a fresh one is made for every room. |
| `matchID` | Yes | A random UUID per match (`Game.swift:75`). |
| identifierForVendor | **No** | Not referenced. A grep for `UIDevice` and `identifierForVendor` finds nothing. |
| IDFA / ATT | **No** | No `AdSupport`, `ASIdentifierManager` or `AppTrackingTransparency` anywhere. |

### 3.3 Firebase initialisation at launch
`TrustIssuesApp.swift:10` calls `FirebaseBootstrap.configureIfNeeded()` in `App.init`. That function runs `FirebaseApp.configure()` whenever `GoogleService-Info.plist` is bundled (`FirebaseBootstrap.swift:27-34`), so the SDK is configured on every launch, including pass-and-play sessions.

First-party code does not touch Auth or Firestore until Host or Join is used. `RoomRepository` (which owns `Firestore.firestore()` at `RoomRepository.swift:31`) is only instantiated by the lobby models and RootView's guest path (`HostLobbyModel.swift:18`, `JoinLobbyModel.swift:12`, `RootView.swift:105`).

Whether `FirebaseApp.configure()` alone makes any network request (for example SDK heartbeat or metadata) cannot be confirmed statically. To claim that pass-and-play "never touches the network" (`SUBMISSION.md:154`), verify it with a proxy or Instruments network trace on a Release build.

---

## 4. Exactly what goes to Firestore

The layout is documented at `RoomRepository.swift:9-14` and `Multiplayer/README.md:24-29`. **Firestore only; no RTDB.**

```
rooms/{code}                                  RoomDocument   (RoomModels.swift:42-52)
├── code: string                              5-char room code, same as doc ID
├── hostUID: string                           Firebase anonymous UID of the host
├── status: string                            "lobby" | "active" | "ended"  (RoomModels.swift:25-34)
├── createdAt: timestamp                      @ServerTimestamp (RoomModels.swift:51)
├── members: map<uid, RoomMember>             (RoomModels.swift:17-23)
│     └── {uid}: map
│           ├── uid: string                   Firebase anonymous UID
│           ├── playerID: string (UUID)       random per join
│           ├── name: string                  USER-ENTERED display name (no length limit)
│           └── isHost: bool
└── publicState: map | null                   PublicGameState (PublicGameState.swift:27-51), host-written
      ├── matchID: string (UUID)
      ├── phase: map/enum                     e.g. night, vote, hunterRevenge{hunter: Player}, gameOver{winner}
      ├── players: array<Player>              Player = {id: UUID string, name: string}  (Player.swift:5-7)
      ├── events: array<GameEvent>            {id: UUID, kind: enum (may embed Player + revealedRole),
      │                                         announcement: string e.g. "The sun rises. Sam was found dead."}
      │                                         (GameEvent.swift:4-33; Game.swift:479)
      ├── nightNumber: int
      ├── deadPlayerIDs: array<string UUID>
      ├── lastVoteTally: map<UUID string, int>   counts only, never who voted for whom (PublicGameState.swift:40-44)
      ├── roleCounts: map {werewolves, seers, doctors, villagers, minions, jesters, hunters: int}
      └── revealedRoles: map<UUID string, string role>   empty until gameOver, then every role (PublicGameState.swift:67-77)

rooms/{code}/private/{uid}                    PrivateInfo (PrivateInfo.swift:17-42), host-written, one per player
├── matchID: string (UUID)
├── role: string                              villager|werewolf|seer|doctor|minion|jester|hunter
├── fellowWerewolves: array<Player>           {id, name}, wolves and Minion only
├── seerFindings: array<{night: int, target: Player{id,name}, verdict: "werewolf"|"notWerewolf"}>
└── ghostRoles: map<UUID string, role> | absent   only once this player is dead

rooms/{code}/actions/{autoID}                 GameActionRecord (RoomModels.swift:65-71), guest-written
├── actorUID: string                          Firebase anonymous UID
├── playerID: string (UUID)
├── kind: map                                 single-key enum, e.g. {castVote: {accusedID: UUID}},
│                                              {submitWerewolfAttack: {victimID}}, {submitDoctorProtection: {targetID}},
│                                              {submitSeerInvestigation: {targetID}}, {submitHunterRevenge: {victimID}}
└── createdAt: timestamp                      @ServerTimestamp
```

Write paths:
- **Create room.** The host writes the full `RoomDocument`, with the host as the first member, at `RoomRepository.swift:51-72`.
- **Join.** The guest writes `members.{uid}` at `RoomRepository.swift:77-91`. Joining is only possible while `status == lobby` (lines 83-85).
- **Start.** `status` is set to `active` at `HostLobbyModel.swift:155`.
- **Every state change.** The host overwrites `publicState` and every `private/{uid}` doc at `RemoteHostGameSession.swift:287-304` and `RoomRepository.swift:101-105, 133-137`.
- **Guest actions.** Guests add a doc under `actions/` (`RoomRepository.swift:158-163`). The host **deletes each action after applying it** (`RemoteHostGameSession.swift:183-186`, `RoomRepository.swift:184-189`). This is best-effort: a failed delete is silently ignored (`try?`, line 188).
- **Rematch.** Overwrites the same room doc and the same private docs in place (`RemoteHostGameSession.swift:155-163`).

Not stored anywhere: who voted for whom (only counts are published, `PublicGameState.swift:40-44`; the per-voter map stays in host memory, `RemoteHostGameSession.swift:44`), chat, photos, location, contacts, email, phone, device model and IP. IP and device model are not stored by first-party code, though Google receives the IP as part of any network request.

**Code/comment mismatch:** `RoomModels.swift:46-48` says `members` mirrors a "`members/{uid}` subcollection". No such subcollection is ever written. Members live only in the map on the room doc (`RoomRepository.swift:65, 88`).

---

## 5. Retention & deletion

- **No TTL field and no TTL policy in the repo.** The only timestamps are `createdAt` on rooms (`RoomModels.swift:51`) and on actions (`RoomModels.swift:70`). `PrivateInfo` has no timestamp at all (`PrivateInfo.swift:17-42`).
- **No Cloud Functions.** There is no `functions/` directory, and `firebase.json:1-6` declares only Firestore rules and indexes.
- **`firestore.indexes.json`** is empty (`firestore.indexes.json:1-4`).
- **The app never deletes a room or a private doc.** `RoomRepository.endRoom()` (`RoomRepository.swift:121-127`) only sets `status = ended`. Despite its doc comment, it does **not** delete actions, and it is **never called anywhere**: a grep for `endRoom` finds only its definition.
  - Rooms therefore stay in `lobby` or `active` status forever.
  - "Leave room" on the game-over screen just navigates locally (`GameFlowView.swift:402-407`, `RootView.swift:59-69`).
  - A host who taps **Cancel** in the lobby leaves a joinable `lobby` room behind (`HostLobbyView.swift:244`, `RootView.swift:94`).
- The only automatic deletion is of processed `actions/*` docs (§4).
- The anonymous Auth user is never deleted. Anonymous accounts persist in Firebase Auth unless the project enables Identity Platform's auto-cleanup of anonymous users, which is **UNVERIFIED**.
- The docs already acknowledge the gap: `Multiplayer/README.md` "Known gaps" item 5 ("Room cleanup is manual… add a scheduled Cloud Function (or a TTL policy on `createdAt`) before this is ever public"). See also the comment at `RoomModels.swift:30-32`.

**Conclusion: names, game logs, and roles currently persist in Firestore indefinitely.** The privacy policy must not state a retention period until one is implemented.

**Recommendation** (pick one and implement it before stating a retention period publicly):
1. Add `expiresAt: Timestamp` (for example createdAt + 24h) to `rooms/{code}` **and** to every `private/{uid}` and `actions/{id}` doc, then enable Firestore TTL policies on each collection group (`rooms`, `private`, `actions`).
   - Do **not** put TTL on `createdAt` itself. TTL deletes documents whose timestamp is already in the past, so every room would become eligible immediately.
   - TTL does **not** cascade to subcollections, which is why each collection group needs its own policy.
   - TTL deletion typically runs within about 24h after expiry, and is not instant.
2. Or add a scheduled Cloud Function (for example hourly) that recursively deletes rooms older than N hours (`firestore.recursiveDelete`).
3. Either way, also call `endRoom` or delete the room when the host leaves, cancels, or the game ends.
4. Consider enabling automatic cleanup of anonymous Auth users (Identity Platform), or document that anonymous UIDs persist.

---

## 6. Firestore security rules (`firestore.rules`)

**Deployment status is UNVERIFIED.** The header says "NOT YET DEPLOYED… a template" (`firestore.rules:5-7`). Git history shows later fixes ("Fix Firebase project wiring: real project ID, rules typo", commit `d66bcc0`) and a TestFlight remote playtest, which suggests some ruleset is live. Confirm in the Firebase console that the live rules match this file and that the database is not in test mode.

**Summary:**
| Path | Read | Create | Update | Delete |
|---|---|---|---|---|
| `rooms/{code}` | any signed-in user (`:29`) | signed-in, `hostUID == auth.uid`, `status == 'lobby'` (`:32-34`) | host: anything. Guest: only `members.{own uid}`, only while `lobby` (`:40-47`) | host only (`:49`) |
| `rooms/{code}/private/{uid}` | that uid, or the host (`:55-58`) | host only (`:59`) | host only | host only |
| `rooms/{code}/actions/{id}` | host only (`:83`) | signed-in member, `actorUID == auth.uid`, `kind` limited to 5 player actions (`:84-94`) | host only (`:95`) | host only (`:95`) |

Everything else is denied by default. There is no catch-all match.

**Weaknesses:**
1. **Collection listing is allowed.** `allow read` at `firestore.rules:29` covers `list` as well as `get`. Any anonymously signed-in client can therefore query the whole `rooms` collection and read every room's player names, event logs and game-over roles. Fix: split into `allow get: if signedIn();` and remove `list`.
2. **Any signed-in user can read any room by code, member or not.** Codes are 5 characters from a 32-character alphabet (`RoomCode.swift:7-11`), about 33.5M possibilities, so they can be guessed or enumerated. Codes are also never retired.
3. **Member self-writes are not validated** (`:43-46`). A guest can set `isHost: true`, an arbitrary or colliding `playerID`, an arbitrary-length `name`, or a `uid` field different from the map key. There is no schema or size check, so a user could write up to about 1 MiB of junk.
4. **Room create is not validated** beyond `hostUID` and `status`, so the members map and publicState are unchecked. Any anonymous user can create unlimited rooms, which is a cost and abuse risk. Consider App Check plus rate limits.
5. **Guests cannot remove themselves** from `members` (no rule permits deleting their key, and the app has no leave-lobby write). Their name stays on the room doc.
6. **Host sees everything.** The host can read every `private/{uid}` (`:55-58`) and holds the full `Game` in memory. This is inherent to the host-authoritative design: the host device could cheat. It is a game-integrity issue, not a privacy leak beyond the room.
7. **Actions payload is only partially validated.** Only `actorUID` and `kind` keys are checked. `playerID` impersonation is caught host-side (`RemoteHostGameSession.swift:198-201`). Extra fields and sizes are unchecked, and there is no rate limit.
8. **Comment drift.** The rules comment at `:9-12` and `RoomModels.swift:11-13` talk about `members/{uid}` docs. The actual mechanism is a map field.

---

## 7. Info.plist, entitlements, permissions

- The Info.plist is generated by Xcode (`project.yml:51`, `GENERATE_INFOPLIST_FILE: true`). The only keys set are:
  - `UILaunchScreen_Generation` (`:53`)
  - Portrait orientation (`:54`)
  - `UIUserInterfaceStyle: Dark` (`:56`)
  - `ITSAppUsesNonExemptEncryption: NO` (`:61`)
  - iPhone-only via `TARGETED_DEVICE_FAMILY "1"` (`:57`)
- **No usage-description keys:** no camera, microphone, contacts, location, photos, local network, Bonjour, Bluetooth, motion or notifications. No code requests any of these permissions.
- **No `.entitlements` file** in the repo, so no Push, iCloud, App Groups, Sign in with Apple or Associated Domains.
- **No `UIBackgroundModes`.** The game relies on keeping the screen awake instead (`GameFlowView.swift:151-159`).
- No URL schemes or universal links.

---

## 8. Privacy manifest (`Trust Issues/PrivacyInfo.xcprivacy`)

- `NSPrivacyTracking` = false (`:27-28`)
- `NSPrivacyTrackingDomains` = [] (`:29-30`)
- `NSPrivacyCollectedDataTypes` = [] (`:31-32`)
- `NSPrivacyAccessedAPITypes` = [] (`:33-34`)

**Consistency with code:**
- The only first-party required-reason API is `UserDefaults.standard` at `Preview Content/PreviewData.swift:197`. That file is wrapped entirely in `#if DEBUG` (lines 1 and 313), and its call site in `RootView.swift:30-38` is also DEBUG-only. Release builds therefore contain no first-party required-reason API, and the empty `NSPrivacyAccessedAPITypes` is **consistent**.
- There is no other `UserDefaults`, `@AppStorage`, `FileManager`, file-timestamp, disk-space or uptime use in first-party code.
- `NSPrivacyCollectedDataTypes` is empty. That is acceptable for an app-level manifest when collection is declared in App Store Connect, but Apple aggregates manifests into the Privacy Report. **Optional improvement:** declare the same data types as the App Privacy label (Name, Gameplay Content, User ID; purpose App Functionality; linked; not tracking) so the two surfaces agree.
- **Firebase SDK manifests:** firebase-ios-sdk ships its own `PrivacyInfo.xcprivacy` files for FirebaseAuth, FirebaseFirestore and their dependencies (GoogleUtilities, gRPC, abseil, etc.). Those declare the SDKs' required-reason API use, such as UserDefaults. The comments at `PrivacyInfo.xcprivacy:6-9` and `project.yml:25-27` say the same. **Action:** run Xcode → Archive → *Generate Privacy Report* and reconcile its output with the label.

---

## 9. Local storage on device

- **First-party code: none in Release.** No UserDefaults, AppStorage, files or Keychain. Pass-and-play rosters live in memory only (`RootView.swift:26`, `carriedPlayers`) and are lost when the app is killed.
- **Firebase SDK (not app code):**
  - Firebase Auth persists the anonymous user and refresh token in the **Keychain**.
  - Firestore's iOS default is a **persistent on-disk cache**. No `FirestoreSettings` override exists in code (`RoomRepository.swift:31` uses the default instance), so room docs the device has read, including other players' names, may be cached in the app container.
  - Firebase Core may store small items in UserDefaults or app support, such as the heartbeat store.

---

## 10. Analytics, crash reporting, ads, purchases

- Analytics: **none.** Crash reporting: **none** (no Crashlytics or Sentry). Logging is `print` only, inside `#if DEBUG` (`RemoteGuestGameSession.swift:237-239`, `RemoteHostGameSession.swift:306-310`, `RoomRepository.swift:193-197`).
- Ads: **none.** No StoreKit, IAP or subscriptions.
- Apple's own App Store Connect crash reports, if users opt in, are Apple's collection and are not declared by the developer.

---

## 11. Docs vs code reconciliation (code wins)

| # | Doc claim | Code reality |
|---|---|---|
| 1 | `README.md:16-18`: "Sync layer (future)… Not wired up yet". `README.md:50`: "Firestore-backed one replaces it next milestone" | **Stale.** Firestore multiplayer is fully wired (`Trust Issues/Multiplayer/*`). |
| 2 | `SUBMISSION.md:161`: User ID includes "+ Firebase Installation ID" | FirebaseInstallations is not linked (§2.3). Declaring User ID for the Auth UID alone is correct. Drop the Installation ID mention unless the Privacy Report shows it. |
| 3 | `SUBMISSION.md:162`: names as "User Content → Other User Content" | Better fits: **Contact Info → Name** (conservative, for display names) plus **User Content → Gameplay Content** (game state, actions). See APP_PRIVACY_NOTES.md. |
| 4 | `SUBMISSION.md:154`: "Pass-and-play… never touches the network" | True for first-party code, but `FirebaseApp.configure()` runs at every launch (`TrustIssuesApp.swift:10`). Verify with a network trace before stating it as fact. |
| 5 | `SUBMISSION.md:215`: tells the reviewer to choose **"Play locally"** | The button is titled **"Pass-and-play on this device"** (`HostOrJoinView.swift:67`). Fix the review notes. |
| 6 | `RoomRepository.swift:121-124`: `endRoom` "deletes the `actions` subcollection" | It only sets status. It is also never called (§5). |
| 7 | `RoomModels.swift:46-48`, `firestore.rules:9-12`: `members/{uid}` subcollection | It is a map field on the room doc. |
| 8 | `SUBMISSION.md:186`: "no user-to-user open chat" | Correct. However, user-entered **display names are shown to other players**, which is a small amount of user-generated content. Relevant to the age-rating UGC question. |
| 9 | `SUBMISSION.md:118`: "Best with 5–10 players". `RoomRepository.swift:24`: "≤8-player party game" | The engine has **no maximum** (`GameConfiguration.swift:153-155` enforces min 4 only), and the UI has no cap either (`SetupView.swift:375-383`). Marketing copy is fine as guidance. Don't claim a hard max. |
| 10 | `project.yml:37-40`, `README.md:85-87`: bundle ID "placeholder" | Already used for TestFlight (`SUBMISSION.md:15-17`). The comments are stale. |
| 11 | `firestore.rules:5-7`: "NOT YET DEPLOYED" | Probably stale. Verify in the console. |
| 12 | `PrivacyInfo.xcprivacy:20-23` mentions "Firebase diagnostics" | No diagnostics SDK is linked. Harmless comment. |

---

## 12. App identity & age notes

- **Bundle ID:** `com.jessemorrison.trust-issues` (`project.yml:40`)
- **Display name:** target name "Trust Issues" (`project.yml:4, 21`). No `CFBundleDisplayName` override, so the home-screen name is "Trust Issues".
- **Version:** 0.3.0, build 3 (`project.yml:41-42`)
- **Minimum iOS:** **17.0** (`project.yml:7`; engine `Package.swift:10`)
- **Device and display:** iPhone only (`project.yml:57`), portrait (`:54`), dark (`:56`)
- **Age-appropriateness:**
  - Fantasy werewolf themes, with "eliminated" and "found dead" narration (`Game.swift:479`).
  - No gore. The copy guideline is "wry, no gore" (`Role+Presentation.swift:6`).
  - No profanity, sexual content or gambling.
  - No chat. The only user-generated content is display names, visible to others in the same room, and there is no moderation, reporting or blocking.
  - No accounts, purchases, links to the web, or ads.

---

## Appendix: Facts for the website

**Player count**
- **Minimum 4 players**, enforced by the engine (`GameConfiguration.swift:153-155`). The setup screen shows "Four's playable — but the lying gets better at five or more." at exactly 4 (`SetupView.swift:92-94`).
- **No maximum** in the engine or UI. Marketing copy suggests "Best with 5–10 players" (`SUBMISSION.md:118`). Don't advertise a hard cap.
- Hunter, Minion and Jester unlock at **5+ players** (`GameConfiguration.swift:137`). Using both Minion and Jester together needs **6+** (`:141`). Every deal keeps at least one plain Villager (`:208-210`).
- Werewolves must be a strict minority (`:163`). Seer, Doctor, Hunter, Minion and Jester are limited to 0 or 1 each (`:172-178`).
- The default deal is 1 werewolf per 4 players, a Seer at 4+, a Doctor at 5+, and the rest Villagers. Hunter, Minion and Jester are opt-in toggles (`GameConfiguration.swift:114-124`).

**Roles implemented** (`Role.swift:15-33`). Names come from `Role.displayName` (`Role.swift:61-70`). The blurbs are verbatim from `Role+Presentation.swift:46-58` (reveal card) and `:66-75` (How to Play). Minion, Jester and Hunter blurbs are marked "Placeholder — Jesse voice pass" in code.

| Role | Team | Reveal-card line (verbatim) | How to Play line (verbatim) |
|---|---|---|---|
| Villager | Village team | "No powers. Just your wits and your vote." | "No night powers — just a vote and a hunch. Wins when every werewolf is gone." |
| Werewolf | Wolf team | "Pick a victim each night. Look shocked each morning." | "Picks a victim with the pack each night. The wolves win the moment they match the rest of the table in number." |
| Seer | Village team | "Once a night, peek at one player's card." | "Each night, checks one player and learns one thing: werewolf, or not. The Minion reads clean — that's the trap." |
| Doctor | Village team | "Once a night, shield one player from the wolves." | "Each night, shields one player from the wolves — themselves included. Guess right and the morning news is quiet." |
| Minion | Wolf team | "You know the wolves. They don't know you. Help them win anyway." | "Knows the wolves; the wolves don't know the Minion back. No night action, reads clean to the Seer, and counts as a villager for parity — but wins right alongside the pack." |
| Jester | Team of one | "You win if the village votes you out. Act guilty. Not too guilty." | "Wins alone, and only one way: get the village to vote them out in daylight. A night kill — or a Hunter's shot — is just a death. Act guilty. Not too guilty." |
| Hunter | Village team | "If you die, you don't die alone. Someone comes with you." | "Doesn't go quietly. The moment the Hunter dies — night kill or day vote — they take one living player down with them. A Doctor save means no death, so no shot." |

Team labels come from `Role+Presentation.swift:82-89`. Team assignments come from `Role.swift:42-47`.

**Win conditions** (`HowToPlayView.swift:92-97`):
- "Village wins: When the last werewolf is gone."
- "Wolves win: When the werewolves match the rest of the table in number."
- "Jester wins: Alone — by conning the village into voting them out. Act guilty. Not too guilty."

**Game loop** (`HowToPlayView.swift:76-86`): Night → Morning → Discussion → Vote → Repeat. Votes are plurality, and a tie eliminates nobody (`README.md:27`, `Game.swift:312`). A voted-out player's role is revealed (`GameEvent.swift:63`). After game over the host can start an instant **rematch** with the same roster (`RemoteHostGameSession.swift:155-163`). Dead players get a "ghost" view of every role (`PrivateInfo.swift:33-42`).

**Ways to play** (main menu, `HostOrJoinView.swift:53-68`):
- **"Host a game"** / **"Join a game"**: one phone per player over the internet (Firestore). Works in the same room or remotely; nothing in the code requires players to be co-located. Needs an internet connection.
- **"Pass-and-play on this device"**: one shared phone, fully offline, with pass-the-phone interstitials (`Screens/PassPhoneView.swift`).

**How players join (remote)**
1. The host taps "Host a game", enters a name, and taps "Create room" (`HostLobbyView.swift:59-71, 203-218`).
2. A **5-character room code** appears in large type (`HostLobbyView.swift:74-89`). The alphabet is `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, so codes contain uppercase letters and digits but never 0/O or 1/I (`RoomCode.swift:7`). Input is case-insensitive and trimmed (`RoomCode.swift:22-24`).
3. Guests tap "Join a game", enter a name and the code, and tap "Join" (`JoinLobbyView.swift:57-86, 115-131`). There is no account or sign-up.
4. Joining is only possible **before** the host starts (`RoomRepository.swift:83-85`; error message "That game already started.", `JoinLobbyModel.swift:74`).
5. The host chooses the werewolf count and toggles the Seer, Doctor, Hunter, Minion and Jester (`HostLobbyView.swift:111-160`), then taps Start. Every phone advances together.

**If the host leaves**
- The host's phone *is* the game server. The whole game state lives only in the host app's memory (`Multiplayer/README.md` §Architecture; `RemoteHostGameSession.swift:6-9`).
- There is no host migration, no presence or disconnect detection, and no resume. If the host closes the app, loses connection or locks the phone, the game stalls for everyone and can't be recovered. The app keeps screens awake to reduce this (`GameFlowView.swift:151-159`).
- Guests also can't rejoin a started game after killing the app, because join is lobby-only.
- Website wording suggestion: "The host's phone runs the game, so keep it open until the end."

**Pricing**
- No in-app purchases, subscriptions or ads in code (no StoreKit).
- `SUBMISSION.md:41` says "presumably Free". Confirm with Jesse.

**Requirements**
- iOS 17.0 or later, iPhone only, portrait (`project.yml:7, 54, 57`).
- Dark theme only.
- No account required. Anonymous sign-in happens silently, and only for online play.
