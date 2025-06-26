# Inkprov: Refactor & Enhancement Proposal

## 1. Project Overview

Inkprov is a modern web application that enables users to collaboratively create and share stories in real-time. The platform combines the spontaneity of improvisation with structured story-writing, allowing multiple contributors to work together on creative writing projects.

## 2. Code Review: Key Findings & Analysis

### Architecture & Security

- **Finding:** Direct Client-Side Communication with Database

  - **Analysis:** The frontend application makes direct calls to the Supabase database for all data operations.
  - **Why it Matters:** (Technical) This creates a tight coupling between the frontend and the database schema, making changes difficult and fragile. It also presents a potential security risk if Row Level Security (RLS) policies are ever misconfigured. (Product) From a product perspective, this fragility slows down the development of new features and a single security mistake could expose user data, destroying trust in the platform.

- **Finding:** Inconsistent Foreign Key Strategy

  - **Analysis:** Key tables like `projects` use the internal `auth.id` for foreign keys instead of the public-facing `users_ext.id`.
  - **Why it Matters:** (Technical) This couples the application's data structure to the authentication system's internal details, which is poor architectural practice. (Product) This technical debt makes it significantly harder to add new sign-in options like Google or Facebook in the future, limiting the product's growth and accessibility for new users.

### Frontend Structure & Code Quality

- **Finding:** Monolithic, Multi-Responsibility Components

  - **Analysis:** Large components like `Header.tsx` and pages like `WritingEditor.tsx` handle many different tasks, including state management, data fetching, and rendering multiple sub-components.
  - **Why it Matters:** (Technical) This makes components difficult to read, test, and reuse, which harms maintainability. (Product) For the user, this leads to a buggier experience as complexity makes it easier for developers to make mistakes. For the business, it slows down "developer velocity," meaning it takes longer to ship new features.

- **Finding:** Lack of a Centralized Data Fetching Strategy

  - **Analysis:** Data fetching logic, including `loading` and `error` state management, is duplicated in `useEffect` hooks across many different components.
  - **Why it Matters:** (Technical) This leads to boilerplate code and potential inconsistencies in how loading and error states are managed. (Product) For the user, this can result in a jarring and unpredictable experience, where some parts of the app show loading spinners and others don't. For the business, this duplicated effort slows down development time for new features.

### Testing & Reliability

- **Finding:** Absence of Automated Tests

  - **Analysis:** The codebase currently has no unit, integration, or end-to-end tests.
  - **Why it Matters:** (Technical) This makes it risky to add new features or refactor existing code, as there is no automated way to verify that changes haven't introduced regressions. (Product) This directly impacts the user by increasing the likelihood of bugs making it into production. It also hurts the business by creating a "culture of fear" around shipping changes, which slows down innovation.

## 3. Proposed Implementation Plan

To address the most critical findings within a realistic timeframe.

### **Priority 1 (Core Task): Backend API Migration**

- **What:** We will refactor the feature for fetching projects. This involves creating a new, secure backend endpoint and updating the frontend to call this endpoint instead of Supabase directly.
- **Why:** This is the highest priority because it solves the most critical architectural and security issue. It establishes a scalable pattern that the rest of the application can adopt over time.

### **Priority 2 (Bonus): Unit Testing for Security Middleware**

- **What:** We will write automated unit tests for the new authentication middleware that will protect our backend endpoints.
- **Why:** To guarantee our security mechanism is robust and to prevent future changes from accidentally introducing vulnerabilities.

## 4. Implementation Status

### Completed Work

#### Backend API Migration (Profile Feature MVP)

As a strategic MVP implementation, we focused on migrating the profile management functionality from direct Supabase calls to our new secure backend API. This serves as a proof of concept for the larger migration plan.

**Completed Components:**

1. **Backend Infrastructure**

   - Established secure backend API architecture with Express.js
   - Implemented authentication middleware
   - Created modular structure with controllers, services, and routes
   - Set up proper error handling and response formatting

2. **Profile API Endpoints**

   - GET /api/profile/:userId (public route)
   - PUT /api/profile/:userId (protected route with auth)
   - Proper authorization checks for protected routes

3. **Frontend Integration**
   - Migrated Profile page components from direct Supabase calls to new API
   - Implemented centralized API service layer
   - Added proper error handling and loading states

**Scope Considerations:**

Given the 8-hour time constraint for this task, we made strategic decisions about scope:

1. **Core Implementation Priority**

   - Focused on delivering a fully functional, secure profile feature migration
   - Prioritized proper architecture and security implementation over test coverage
   - Successfully demonstrated the viability of the backend API approach

2. **Testing (Priority 2)**
   - While unit tests for the authentication middleware were planned
   - Given time constraints, we prioritized delivering working functionality
   - The current implementation provides a solid foundation for adding tests later
