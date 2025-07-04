## Refactor Proposal #2: UI/UX Improvements for Home Page & Session Experience (inkprov)

### Background & Rationale

- Current Sessions page is generic, lacks personalization and social features.
- No central place for users to see their own activity or others' engagement.
- Session cards lack progress and lock clarity.
- Guest users blocked from reading stories, limiting sharing and onboarding.
- Goal: Make the app more engaging, social, and user-friendly.

---

### Proposed Implementation Plan

#### 1. New Home Page

- Create a personalized Home page as default after login.
- Show sessions user contributed to with indicators:
  - Available contributions (not locked, new snippet since last contribution).
  - Recent activity on completed stories (reactions, views).
- If no activity, prompt user to create, join, or read sessions.
- Use improved session cards.

#### 2. Session Card & Lock System Improvements

- Redesign session cards for Home & Sessions page:
  - Add progress bar (Intro, Body, Conclusion, % complete).
  - Add tags (“Fresh/New,” “Needs Ending,” “Hot”).
  - Add lock indicators (who locked it).
  - Clear call-to-action if user can contribute.
- Refactor lock system:
  - One user writes at a time with real-time presence.
  - Prevent consecutive contributions by same user.
  - Warn when on last or near-last snippet.

#### 3. Guest Access & Sharing

- Allow guests to read completed stories (with tooltip for login-required actions).
- Add shareable links for sessions and stories.
- Enable private sessions via invite-by-link with access controls.

---

### Notes

- This proposal is currently in progress and being implemented.
- Some features/improvements might emerge beyond this plan as new ideas come up during work.

---

### Action Items Checklist

- [ ] Build new Home page with personalized session/activity feed.
- [ ] Redesign session cards with progress bars, tags, and lock indicators.
- [ ] Implement improved lock system rules and presence indicators.
- [ ] Enable guest read access and sharing features.
- [ ] Add private session invite-by-link functionality.

---

*End of Refactor Proposal #2 summary.*
