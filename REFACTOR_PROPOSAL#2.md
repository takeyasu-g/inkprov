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
- Show sessions user contributed to:
  - That are available contributions (not locked, new snippet since last contribution).
- Show recently completed stories (reactions, views).
- If no activity, prompt user to create, join, or read sessions.
- Join new sessions made by others that the current user is not part of (new , popular, not locked, recent activity).
- Use improved session cards.

#### 2. Session Card & Lock System Improvements

- Redesign session cards for Home & Sessions page:
  - Add progress bar (Intro, Body, Conclusion, % complete).
  - Add tags ("Fresh/New," "Needs Ending," "Hot").
  - Add lock indicators (who locked it/someone is writing...).
  - Clear call-to-action if user can contribute.
- Refactor lock system of sessions:
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

### Conclusion & Implementation Status

#### Completed Work

**1. Personalized Home Page**

- **What:** A new, dynamic Home Page was created to replace the previous generic session list. It now serves as a personalized dashboard for users, featuring several new sections to drive engagement.
- **Completed Sections:**
  - **"Ready to Write":** Displays sessions the user has contributed to and can write in next.
  - **"Active Stories":** Showcases popular and recently completed stories from the community.
  - **"Fresh Sessions":** Highlights new sessions available for the user to join.
- **Backend Support:** New optimized backend endpoints were created in the `backend-v2` service to efficiently fetch the data required for these new sections, ensuring performance and scalability.
- **Frontend Implementation:** The `HomePage.tsx` component was built with dedicated sub-components for each new section, complete with data fetching, loading, and error states. The layout is fully responsive, following a mobile-first design.

**2. Enhanced Session & Project Cards**

- **What:** The `SessionCard` and `ProjectCard` components were significantly redesigned to provide richer, at-a-glance information.
- **Key Enhancements:**
  - **`SessionCard`:** Now includes a progress bar for story phase, status badges ("New," "Hot"), and indicators for contributor status and locks.
  - **`ProjectCard`:** Updated to show reaction counts, shifting focus to community engagement.

#### Scope & Future Work

- **Enhanced Lock System:** The full real-time lock system to prevent consecutive contributions and manage drafts via `localStorage` was not implemented.
- **Guest Access & Sharing:** Features to allow non-logged-in users to read stories and share content via links were not developed.

---

*End of Refactor Proposal #2 summary.*
