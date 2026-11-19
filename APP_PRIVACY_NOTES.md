# App Store Connect: App Privacy answers for Trust Issues

A fill-in guide for **App Store Connect → Trust Issues → App Privacy**. It is based on a code audit of `~/Projects/trust-issues` at commit `6622906`; full evidence is in `PRIVACY_AUDIT.md`. Code references are relative to that repo.

> **If the app changes, re-check this.** That includes adding Analytics or Crashlytics, App Check, push, a TTL or cleanup job, accounts, or chat. Also run Xcode → Archive → *Generate Privacy Report* before submitting, and make sure nothing in Firebase's bundled manifests contradicts these answers.

---

## URLs

| Field | Value |
|---|---|
| Privacy Policy URL | https://trustissues.thetechjam.com/privacy/ |
| Support URL | https://trustissues.thetechjam.com/support/ |
| Marketing URL | https://trustissues.thetechjam.com/ |

---

## Step 1: "Do you or your third-party partners collect data from this app?"

**Yes.**

Apple counts data as "collected" when it is transmitted off the device and can be accessed for longer than needed to service the request in real time.

- Online games (Host/Join) write display names, an anonymous user ID and game state to Google Cloud Firestore.
- **Nothing deletes those records today** (see `PRIVACY_AUDIT.md` §5), so this cannot be treated as transient processing.
- Pass-and-play collects nothing. The label covers the app as a whole, though, so the answer is still Yes.

### Why the "optional disclosure" exemption does NOT apply
Apple's optional-disclosure exemption requires **all** of the following:
1. The data is not used for tracking.
2. It is not used for third-party advertising.
3. Collection is infrequent, **not part of the app's primary functionality**, and optional for the user.
4. The user provides it in the interface, clearly knowing what is collected, with their name or account name prominently shown in the submission form.

Online multiplayer is a primary feature, and the name entry is a required part of hosting or joining. Point 3 fails, so declare everything below.

---

## Step 2: Category-by-category answers

Columns: **Collected** | **Apple data type** | **Linked to user** | **Used for tracking** | **Purposes**

### Contact Info
- **Collected: YES**, conservatively.
  - **Type:** Contact Info → **Name**
  - **Linked:** **Yes**
  - **Tracking:** No
  - **Purpose:** App Functionality
- **Justification:**
  - Players type a free-form "Your name" when hosting or joining (`Screens/HostLobbyView.swift:65`, `Screens/JoinLobbyView.swift:64`).
  - It is stored in `rooms/{code}.members.{uid}.name` and repeated in `publicState.players[].name`, in event announcements ("Sam was found dead."), and in other players' private docs (`Multiplayer/RoomRepository.swift:53, 86-88`; `TrustIssuesEngine/.../Game.swift:479`).
  - It sits in the same document as the Firebase UID, so it is linked.
- **Why Name rather than "Other User Content":**
  - The field is literally labelled "Your name", and most people will type their real first name.
  - Apple's Name type covers "first or last name".
  - Declaring Name is the conservative, review-safe choice. Calling it "Other User Content" understates it if users enter real names, and the cost of over-disclosing here is negligible.
  - The previous draft (`SUBMISSION.md:162`) used Other User Content. **Recommend switching to Name.**
  - Optionally, also tick User Content → Other User Content to cover nicknames. It is harmless but not required.
- Email, phone, physical address and other contact info: **not collected.**

### Health & Fitness
**Not collected.**

### Financial Info
**Not collected.** No payments or StoreKit.

### Location
**Not collected.** Neither precise nor coarse location. There are no location APIs and no usage strings. The IP address is not stored by the app; see the note at the end.

### Sensitive Info
**Not collected.**

### Contacts
**Not collected.** The app makes no address-book access.

### User Content
- **Collected: YES**
  - **Type:** User Content → **Gameplay Content**
  - **Linked:** **Yes**
  - **Tracking:** No
  - **Purpose:** App Functionality
- **Justification:**
  - Apple defines Gameplay Content as including "multiplayer matching or gameplay logic".
  - The app stores room state, the phase, the event log, each player's role, Seer findings, and night-action and vote targets: `rooms/{code}.publicState`, `rooms/{code}/private/{uid}`, `rooms/{code}/actions/*` (`Multiplayer/RoomModels.swift:42-71`, `Multiplayer/PublicGameState.swift:27-51`, `TrustIssuesEngine/.../PrivateInfo.swift:17-42`).
  - All of it is keyed to the anonymous UID.
- Emails, texts, photos, videos, audio and customer support: **not collected.** There is no chat or media.
- Other User Content: optional, see the Contact Info note above.

### Browsing History
**Not collected.**

### Search History
**Not collected.**

### Identifiers
- **Collected: YES**
  - **Type:** Identifiers → **User ID**
  - **Linked:** **Yes**
  - **Tracking:** No
  - **Purpose:** App Functionality
- **Justification:**
  - Firebase Anonymous Auth creates a UID (`Multiplayer/AnonymousAuthService.swift:21`).
  - It is stored as `hostUID`, as the `members` map key, as `private/{uid}` and as `actorUID`. It is used to authorize writes in `firestore.rules`.
  - **Why "Linked":** Apple treats any account-level ID as linked to the user unless it is de-identified. This UID is stored alongside the player's name, and it persists across launches. It carries no email or phone number, but it ties that device's game data together. Mark it **Linked**.
- **Device ID: Not collected.**
  - The app uses no IDFA or identifierForVendor (no AdSupport or ATT).
  - FirebaseInstallations is **not** linked, so drop the "Firebase Installation ID" mention from `SUBMISSION.md:161`.
  - Verify with the Privacy Report. If it lists Device ID, add it as Linked, not tracking, purpose App Functionality.

### Purchases
**Not collected.** No IAP or StoreKit.

### Usage Data
**Not collected.** No analytics SDK. The app records no product interaction or advertising data. The in-game event log is gameplay content, not analytics.

### Diagnostics
**Not collected.** No Crashlytics, Performance Monitoring or other crash SDK, and logging is DEBUG-only `print`.

Apple's own opt-in crash reports are not your collection. If Firebase Analytics, Crashlytics or Performance is added later, re-file this category with Crash Data / Performance Data / Other Diagnostic Data.

### Other Data
**Not collected.**

---

## Step 3: Summary to enter

| Data type | Linked | Tracking | Purpose |
|---|---|---|---|
| Contact Info → Name | Yes | No | App Functionality |
| User Content → Gameplay Content | Yes | No | App Functionality |
| Identifiers → User ID | Yes | No | App Functionality |

**"Data Used to Track You": None.** Answer "No" to tracking for every type. The app has no ad SDKs, no IDFA and no ATT prompt, does no data brokering, and does not combine data with third-party data. `NSPrivacyTracking` is `false` in `Trust Issues/PrivacyInfo.xcprivacy:27-28`.

The resulting label shows **"Data Linked to You": Contact Info, User Content, Identifiers.** Nothing appears under "Data Used to Track You" or "Data Not Linked to You".

> **About IP addresses and Google:** Firebase, as Google, receives the device's IP address and SDK and platform metadata as part of every request. Firebase Authentication in particular may use the IP for abuse prevention. The app does not store or use this itself, and Google processes it as a service provider, so it is not normally a separate label entry. **Do mention it in the privacy policy:** Google Firebase is the processor, data is stored on Google Cloud, and IP addresses are processed by Google.

---

## Age rating questionnaire notes

Apple's current tiers are 4+, 9+, 13+, 16+ and 18+, and its questionnaire is authoritative. Suggested answers:

| Question | Suggested answer |
|---|---|
| Cartoon or Fantasy Violence | **Infrequent/Mild.** Werewolves "pick a victim"; there is "found dead" and "eliminated" narration, text-only, no gore (`Game/Role+Presentation.swift:6`). |
| Realistic Violence | None |
| Horror/Fear Themes | None, or Infrequent/Mild if you want to be cautious, given the werewolf and night theme |
| Profanity, Sexual Content/Nudity, Mature/Suggestive Themes, Alcohol/Tobacco/Drugs, Medical, Gambling, Contests | None |
| Unrestricted web access | No |
| User-generated content / messaging between users | **Answer carefully.** There is no chat, but **player-entered display names are visible to other players in the same room**, so names count as a small amount of user-generated content. Answer honestly if the questionnaire asks whether users can share content with each other. There are no in-app reporting or blocking tools. Rooms are private and code-only, but codes can be guessed (see the fixes list). |
| Age assurance / parental controls | None |

Expected outcome: about **9+**. It could land 13+ if the user-generated content answer pushes it up. Don't pre-commit to a rating on the website.

---

## Things to fix before submission (recommendations only, nothing changed)

1. **Retention: add automatic deletion.** Rooms, names, roles and event logs currently persist forever.
   - `endRoom()` is never called (`Multiplayer/RoomRepository.swift:125`).
   - No TTL policy or Cloud Function exists.
   - Add an `expiresAt` timestamp (for example now + 24h) to `rooms`, `private` and `actions` docs and enable Firestore TTL on each collection group. TTL doesn't cascade to subcollections, and you should not set TTL on `createdAt` itself. Alternatively, write a scheduled recursive-delete function.
   - Then state the real window in the privacy policy, for example "deleted automatically within ~48 hours".
2. **Delete or end the room when the host cancels or leaves**, and at game over. Today, Cancel in the host lobby leaves a joinable empty room (`Screens/HostLobbyView.swift:244`).
3. **Firestore rules: block listing.** Change `allow read` on `rooms/{code}` (`firestore.rules:29`) to `allow get`. Today any anonymous client can list every room with all its names.
4. **Firestore rules: validate member writes.** Check field types, `uid == key`, `isHost == false` for guests, a name length cap (also cap it in the UI, for example 20 characters), and payload size. Also validate room creation.
5. **Confirm the deployed rules** match `firestore.rules` and that the database is not in test mode. The file header still says "NOT YET DEPLOYED".
6. **Consider App Check** and a per-UID rate limit to prevent anonymous abuse and cost spikes.
7. **Anonymous user cleanup.** Enable automatic deletion of anonymous Auth accounts (Identity Platform), or disclose that the anonymous ID persists.
8. **Add an in-app privacy link**, for example on the How to Play or main menu screen. A link from the website is optional but good practice. Also consider a one-line notice at name entry: "Your name is shared with players in this room."
9. **Data deletion requests.** There are no accounts, so give users a route: email support with the room code, or rely on auto-deletion once it's implemented. Say this in the policy.
10. **Fix `SUBMISSION.md` review notes.** The button is "Pass-and-play on this device", not "Play locally" (`Screens/HostOrJoinView.swift:67`).
11. **Update `SUBMISSION.md` §5 label draft** to match this file: Name plus Gameplay Content plus User ID, with no Installation ID.
12. **Generate the Xcode Privacy Report** from the Release archive and confirm the Firebase manifests don't introduce extra data types. Optionally mirror the three data types in `PrivacyInfo.xcprivacy` `NSPrivacyCollectedDataTypes`.
13. **Verify the "pass-and-play is offline" claim** with a network trace before putting it in the policy. `FirebaseApp.configure()` runs at every launch (`TrustIssuesApp.swift:10`).
14. **Remove stale comments** (cosmetic): "placeholder" bundle ID (`project.yml:37-39`), "Not wired up yet" (`README.md:16-18`), "members subcollection" (`Multiplayer/RoomModels.swift:46-48`).
