## Refactor Proposal #2 UI/UX: Home Page & Session Experience Improvements (inkprov)

### Background & Rationale

Currently, after login, inkprov users land on a generic Sessions page that is not personalized or social. There is no central place to see their own activity, recent contributions, or engagement from others. Session cards lack clear indicators of progress and lock status, and the lock system can be confusing. Guests are also blocked from reading stories, which limits sharing and onboarding.

For a collaborative writing platform, users should feel connected and engaged—not just with content, but with activity and community. Improving the home experience and session cards will make the app more inviting, social, and user-friendly.

---

---

### Proposed Implementation Plan

#### 1. New Home Page

- Build a new Home page as the default after login.
- Display sessions the user has contributed to, with indicators for available contributions (not locked, new snippet made since last contribution).
- Show recent activity on completed stories the user contributed to (reactions, views).
- If no activity, prompt the user to create a session, join an in-progress session, or read completed stories.
- Use improved session cards (see below).

  _Why:_ This creates a personalized, engaging entry point that surfaces relevant activity and opportunities, making the platform feel alive and encouraging continued participation.

#### 2. Session Card & Lock System Improvements

- Redesign session cards (used in Home and Sessions page):
  - Add progress bar (e.g., Intro, Body, Conclusion, or percent complete).
  - Add tags (“Fresh/New,” “Needs Ending/Conclusion,” “Hot”).
  - Add lock indicator (show if session is locked for writing, and by whom).
  - Show clear call-to-action if user can contribute.
- Refactor lock system:

  - Only one user can write at a time, with real-time presence indicator.
  - Prevent back-to-back contributions by the same user.
  - Show warnings when on last/near-last snippet.

  _Why:_ These improvements make the collaborative writing process clearer, fairer, and more engaging by providing visibility into session status and preventing frustration from conflicts or unclear participation rules.

#### 3. Guest Access & Sharing

- Allow guests to read completed stories (with tooltip if login is required for actions).
- Add shareable links for sessions and stories.
- Enable private sessions with invite-by-link and clear access controls.

  _Why:_ These changes lower the barrier to entry, support organic growth through sharing, and enable flexible collaboration—balancing openness with controlled access where needed.
