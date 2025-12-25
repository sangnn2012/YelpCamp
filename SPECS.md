# YelpCamp - Complete System Specification

> **Purpose**: This document provides a complete, technology-agnostic specification for the YelpCamp application. It can be used to recreate the system in any programming language, framework, or technology stack.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Concepts](#2-core-concepts)
3. [Data Models](#3-data-models)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [API Endpoints](#5-api-endpoints)
6. [Validation Rules](#6-validation-rules)
7. [Business Logic & Workflows](#7-business-logic--workflows)
8. [User Interface Specifications](#8-user-interface-specifications)
9. [Security Requirements](#9-security-requirements)
10. [Error Handling](#10-error-handling)
11. [Seed Data](#11-seed-data)
12. [Configuration & Environment](#12-configuration--environment)

---

## 1. System Overview

### 1.1 Application Purpose

YelpCamp is a full-stack web application that allows users to discover, review, and share campgrounds. It functions as a community-driven platform where:

- Anyone can browse campgrounds
- Registered users can add new campgrounds
- Users can leave comments/reviews on campgrounds
- Users can manage their own content (edit/delete)

### 1.2 Core Features

| Feature | Description |
|---------|-------------|
| **Campground Catalog** | Browse all campgrounds with images, prices, and descriptions |
| **User Accounts** | Register, login, logout with session-based authentication |
| **Campground Management** | Create, read, update, delete campgrounds (owner only) |
| **Comment System** | Add, edit, delete comments on campgrounds (owner only) |
| **Authorization** | Resource ownership controls who can modify content |

### 1.3 User Roles

| Role | Capabilities |
|------|--------------|
| **Anonymous User** | View landing page, browse campgrounds, view campground details and comments |
| **Authenticated User** | All anonymous capabilities + create campgrounds, add comments |
| **Resource Owner** | Edit and delete resources they created (campgrounds or comments) |

---

## 2. Core Concepts

### 2.1 Resource Ownership

Every campground and comment has an **author**. The author is the user who created the resource.

- Only the author can edit or delete their resource
- Author information is stored with the resource (denormalized)
- Ownership is verified by comparing user IDs

### 2.2 Session-Based Authentication

- Users authenticate with username and password
- Session is maintained server-side
- Session persists across page navigations
- Logout destroys the session

### 2.3 Flash Messaging

The system uses flash messages to communicate with users:

- **Success messages**: Confirmation of completed actions
- **Error messages**: Validation failures, authorization denials, system errors
- Messages persist for exactly one redirect, then disappear

### 2.4 RESTful Design

The application follows REST conventions:

- Resources are nouns (campgrounds, comments, users)
- HTTP methods indicate actions (GET=read, POST=create, PUT=update, DELETE=destroy)
- Nested resources for relationships (comments nested under campgrounds)

---

## 3. Data Models

### 3.1 User

Represents a registered user account.

```
User {
    id:         UniqueIdentifier    (auto-generated)
    username:   String              (unique, required)
    password:   String              (hashed, required)
    createdAt:  Timestamp           (auto-generated)
    updatedAt:  Timestamp           (auto-generated)
}
```

**Constraints:**
- `username`: 3-30 characters, alphanumeric only, must be unique
- `password`: Minimum 6 characters, stored as secure hash (never plain text)

**Password Hashing:**
- Use PBKDF2, bcrypt, or Argon2
- Store salt alongside hash
- Never store or log plain-text passwords

---

### 3.2 Campground

Represents a campground listing.

```
Campground {
    id:          UniqueIdentifier   (auto-generated)
    name:        String             (required, max 100 chars)
    price:       String             (required, displayed as currency)
    image:       String             (required, valid URL)
    description: String             (required, max 5000 chars)
    author: {
        id:       Reference<User>   (required)
        username: String            (denormalized from User)
    }
    comments:    Array<Reference<Comment>>  (default: empty array)
    createdAt:   Timestamp          (auto-generated)
    updatedAt:   Timestamp          (auto-generated)
}
```

**Relationships:**
- `author.id` references a User (one-to-many: one user can create many campgrounds)
- `comments` is an array of references to Comment documents (one-to-many)

**Notes:**
- Author username is stored directly (denormalized) for display without joins
- Price is stored as string for flexible formatting (e.g., "$10.00")

---

### 3.3 Comment

Represents a user's comment on a campground.

```
Comment {
    id:         UniqueIdentifier    (auto-generated)
    text:       String              (required, max 500 chars)
    author: {
        id:       Reference<User>   (required)
        username: String            (denormalized from User)
    }
    createdAt:  Timestamp           (auto-generated)
    updatedAt:  Timestamp           (auto-generated)
}
```

**Relationships:**
- `author.id` references a User
- Comment is referenced by a Campground's `comments` array
- Comments are "owned" by both the author (who can edit/delete) and the campground (for display)

---

### 3.4 Entity Relationship Diagram

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│   User   │       │  Campground │       │  Comment │
├──────────┤       ├─────────────┤       ├──────────┤
│ id       │◄──────│ author.id   │       │ id       │
│ username │       │ author.user │       │ text     │
│ password │       │ name        │       │ author.id│──────►│ User.id  │
└──────────┘       │ price       │       │ author.  │       └──────────┘
      │            │ image       │       │ username │
      │            │ description │       └──────────┘
      │            │ comments[]  │──────────────┘
      │            └─────────────┘
      │                  ▲
      └──────────────────┘
         (author.id)
```

---

### 3.5 Cascading Behavior

| Action | Behavior |
|--------|----------|
| Delete User | **No cascade** - Campgrounds and comments remain with orphaned author references |
| Delete Campground | **No cascade** - Associated comments remain in database (orphaned) |
| Delete Comment | Remove comment reference from parent Campground's comments array |

**Note:** Orphaned comments (where parent campground is deleted) become inaccessible through the UI but remain in the database.

---

## 4. Authentication & Authorization

### 4.1 Authentication Flow

#### 4.1.1 Registration

```
INPUT:
  - username: string
  - password: string

PROCESS:
  1. Validate username (3-30 chars, alphanumeric)
  2. Validate password (min 6 chars)
  3. Check if username already exists
  4. Hash password with salt
  5. Create User record
  6. Create session for new user (auto-login)

OUTPUT:
  - Success: Redirect to campgrounds list, flash "Welcome to YelpCamp {username}"
  - Validation Error: Redirect to register form, flash error message
  - Username Exists: Redirect to register form, flash "Username already exists"
```

#### 4.1.2 Login

```
INPUT:
  - username: string
  - password: string

PROCESS:
  1. Find user by username
  2. Verify password hash matches
  3. Create session with user ID

OUTPUT:
  - Success: Redirect to campgrounds list
  - Invalid Credentials: Redirect to login form, flash error message
```

#### 4.1.3 Logout

```
INPUT:
  - Valid session

PROCESS:
  1. Destroy server-side session
  2. Clear session cookie

OUTPUT:
  - Redirect to campgrounds list, flash "Logged you out!"
```

---

### 4.2 Session Management

```
Session Data Structure:
{
    userId:    UniqueIdentifier  // Reference to authenticated user
    username:  String            // Cached for display
}
```

**Session Requirements:**
- Sessions stored server-side (not in cookies)
- Session secret must be configurable via environment
- Session expires on browser close (no persistent "remember me")
- `resave: false` - Don't save session if unchanged
- `saveUninitialized: false` - Don't create session until data stored

---

### 4.3 Authorization Rules

#### 4.3.1 Route Protection Levels

| Protection Level | Description | Routes |
|------------------|-------------|--------|
| **Public** | No authentication required | Landing, campground list, campground details, login form, register form |
| **Authenticated** | Must be logged in | Create campground, create comment, logout |
| **Owner** | Must be resource owner | Edit/delete campground, edit/delete comment |

#### 4.3.2 Middleware Definitions

**isLoggedIn:**
```
CHECK: Is user authenticated (session exists with valid user)?
  YES: Allow request to proceed
  NO:  Flash "You need to be logged in to do that"
       Redirect to /login
```

**checkCampgroundOwnership:**
```
REQUIRES: isLoggedIn check passed

CHECK: Does campground exist?
  NO:  Flash "Campground not found"
       Redirect to /campgrounds

CHECK: Is current user the campground author?
  (Compare session.userId with campground.author.id)
  YES: Allow request to proceed
  NO:  Flash "You don't have permission to do that"
       Redirect to previous page
```

**checkCommentOwnership:**
```
REQUIRES: isLoggedIn check passed

CHECK: Does comment exist?
  NO:  Flash "Comment not found"
       Redirect to previous page

CHECK: Is current user the comment author?
  (Compare session.userId with comment.author.id)
  YES: Allow request to proceed
  NO:  Flash "You do not have permission to do that"
       Redirect to previous page
```

---

### 4.4 Authorization Matrix

| Resource | Action | Anonymous | Authenticated | Owner |
|----------|--------|-----------|---------------|-------|
| Campground | List | ✓ | ✓ | ✓ |
| Campground | View | ✓ | ✓ | ✓ |
| Campground | Create | ✗ | ✓ | ✓ |
| Campground | Edit | ✗ | ✗ | ✓ |
| Campground | Delete | ✗ | ✗ | ✓ |
| Comment | View | ✓ | ✓ | ✓ |
| Comment | Create | ✗ | ✓ | ✓ |
| Comment | Edit | ✗ | ✗ | ✓ |
| Comment | Delete | ✗ | ✗ | ✓ |

---

## 5. API Endpoints

### 5.1 Public Routes

#### GET /
**Landing Page**

| Aspect | Details |
|--------|---------|
| Authentication | None |
| Response | HTML landing page |
| Features | Welcome message, link to campgrounds |

---

#### GET /register
**Registration Form**

| Aspect | Details |
|--------|---------|
| Authentication | None (redirect if logged in - optional) |
| Response | HTML form with username and password fields |

---

#### POST /register
**Create User Account**

| Aspect | Details |
|--------|---------|
| Authentication | None |
| Request Body | `username`, `password` |
| Validation | See [Section 6.4](#64-user-validation) |
| Success | 302 → /campgrounds, flash success, auto-login |
| Validation Error | 302 → /register, flash error |
| Duplicate Username | 302 → /register, flash error |

---

#### GET /login
**Login Form**

| Aspect | Details |
|--------|---------|
| Authentication | None |
| Response | HTML form with username and password fields |

---

#### POST /login
**Authenticate User**

| Aspect | Details |
|--------|---------|
| Authentication | None |
| Request Body | `username`, `password` |
| Success | 302 → /campgrounds, create session |
| Invalid Credentials | 302 → /login, flash error |

---

#### GET /logout
**End Session**

| Aspect | Details |
|--------|---------|
| Authentication | Implicit (no-op if not logged in) |
| Success | 302 → /campgrounds, flash "Logged you out!", destroy session |

---

### 5.2 Campground Routes

#### GET /campgrounds
**List All Campgrounds**

| Aspect | Details |
|--------|---------|
| Authentication | None |
| Response | HTML page with grid of campground cards |
| Data | All campgrounds (no pagination) |
| Card Contents | Image thumbnail, name, "More Info" link |

---

#### GET /campgrounds/new
**New Campground Form**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Response | HTML form |
| Form Fields | name, price, image URL, description |
| Auth Failure | 302 → /login, flash error |

---

#### POST /campgrounds
**Create Campground**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Request Body | `name`, `price`, `image`, `description` |
| Validation | See [Section 6.2](#62-campground-validation) |
| Author Assignment | Set to current user (id + username) |
| Success | 302 → /campgrounds |
| Validation Error | 302 → back, flash first error |
| Auth Failure | 302 → /login, flash error |

---

#### GET /campgrounds/:id
**View Campground Details**

| Aspect | Details |
|--------|---------|
| Authentication | None |
| Parameters | `id` - Campground identifier |
| Validation | `id` must be valid identifier format |
| Response | HTML page with full details + comments |
| Data Population | Load all associated comments |
| Conditional UI | Show edit/delete buttons only for owner |
| Invalid ID | 302 → /campgrounds, flash error |
| Not Found | 302 → /campgrounds, flash "Campground not found" |

---

#### GET /campgrounds/:id/edit
**Edit Campground Form**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Authorization | Required (checkCampgroundOwnership) |
| Parameters | `id` - Campground identifier |
| Response | HTML form pre-filled with current values |
| Auth Failure | 302 → /login, flash error |
| Not Owner | 302 → back, flash "You don't have permission" |
| Not Found | 302 → /campgrounds, flash error |

---

#### PUT /campgrounds/:id
**Update Campground**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Authorization | Required (checkCampgroundOwnership) |
| Parameters | `id` - Campground identifier |
| Request Body | `name`, `price`, `image`, `description` (nested as campground[field]) |
| Validation | See [Section 6.2](#62-campground-validation) |
| Preserved Fields | author, comments (not modifiable) |
| Success | 302 → /campgrounds/:id |
| Validation Error | 302 → back, flash first error |
| Auth Failure | 302 → /login, flash error |
| Not Owner | 302 → back, flash error |

**Note:** This endpoint typically requires method override (e.g., `_method=PUT` parameter) since HTML forms only support GET/POST.

---

#### DELETE /campgrounds/:id
**Delete Campground**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Authorization | Required (checkCampgroundOwnership) |
| Parameters | `id` - Campground identifier |
| Cascade | Comments are NOT deleted (become orphaned) |
| Success | 302 → /campgrounds, flash "Campground deleted" |
| Auth Failure | 302 → /login, flash error |
| Not Owner | 302 → back, flash error |

**Note:** Requires method override (`_method=DELETE`).

---

### 5.3 Comment Routes

All comment routes are nested under campgrounds: `/campgrounds/:id/comments/*`

#### GET /campgrounds/:id/comments/new
**New Comment Form**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Parameters | `id` - Parent campground identifier |
| Response | HTML form with text field |
| Data | Include campground name in heading |
| Auth Failure | 302 → /login, flash error |
| Campground Not Found | 302 → /campgrounds, flash error |

---

#### POST /campgrounds/:id/comments
**Create Comment**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Parameters | `id` - Parent campground identifier |
| Request Body | `comment[text]` |
| Validation | See [Section 6.3](#63-comment-validation) |
| Process | 1. Create comment with author info |
|         | 2. Add comment reference to campground.comments array |
|         | 3. Save campground |
| Success | 302 → /campgrounds/:id, flash "Successfully added comment" |
| Validation Error | 302 → back, flash first error |
| Auth Failure | 302 → /login, flash error |
| Campground Not Found | 302 → /campgrounds, flash error |

---

#### GET /campgrounds/:id/comments/:comment_id/edit
**Edit Comment Form**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Authorization | Required (checkCommentOwnership) |
| Parameters | `id` - Campground ID, `comment_id` - Comment ID |
| Response | HTML form pre-filled with current text |
| Auth Failure | 302 → back, flash error |
| Not Owner | 302 → back, flash error |
| Not Found | 302 → back, flash error |

---

#### PUT /campgrounds/:id/comments/:comment_id
**Update Comment**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Authorization | Required (checkCommentOwnership) |
| Parameters | `id` - Campground ID, `comment_id` - Comment ID |
| Request Body | `comment[text]` |
| Validation | See [Section 6.3](#63-comment-validation) |
| Preserved Fields | author (not modifiable) |
| Success | 302 → /campgrounds/:id |
| Validation Error | 302 → back, flash first error |
| Auth Failure | 302 → back, flash error |
| Not Owner | 302 → back, flash error |

---

#### DELETE /campgrounds/:id/comments/:comment_id
**Delete Comment**

| Aspect | Details |
|--------|---------|
| Authentication | Required (isLoggedIn) |
| Authorization | Required (checkCommentOwnership) |
| Parameters | `id` - Campground ID, `comment_id` - Comment ID |
| Process | 1. Delete comment document |
|         | 2. Remove reference from campground.comments array |
| Success | 302 → /campgrounds/:id, flash "Comment deleted" |
| Auth Failure | 302 → back, flash error |
| Not Owner | 302 → back, flash error |

---

## 6. Validation Rules

### 6.1 General Validation Behavior

- Validation runs before any business logic
- On failure: redirect back to form with first error message
- All string inputs should be trimmed of whitespace
- Validation errors are flashed for user display

---

### 6.2 Campground Validation

| Field | Rules | Error Messages |
|-------|-------|----------------|
| `name` | Required, Max 100 chars, Trim, Escape HTML | "Campground name is required", "Name must be less than 100 characters" |
| `price` | Required | "Price is required" |
| `image` | Required, Valid URL format, Trim | "Image URL is required", "Must be a valid URL" |
| `description` | Required, Max 5000 chars, Trim | "Description is required", "Description must be less than 5000 characters" |

---

### 6.3 Comment Validation

| Field | Rules | Error Messages |
|-------|-------|----------------|
| `text` | Required, Max 500 chars, Trim | "Comment text is required", "Comment must be less than 500 characters" |

---

### 6.4 User Validation

| Field | Rules | Error Messages |
|-------|-------|----------------|
| `username` | Required, 3-30 chars, Alphanumeric only, Trim | "Username is required", "Username must be 3-30 characters", "Username must contain only letters and numbers" |
| `password` | Required, Min 6 chars | "Password is required", "Password must be at least 6 characters" |

---

### 6.5 URL Parameter Validation

| Parameter | Rules | Error Messages |
|-----------|-------|----------------|
| `:id` (campground) | Valid identifier format | "Invalid campground ID" |
| `:comment_id` | Valid identifier format | "Invalid comment ID" |

---

## 7. Business Logic & Workflows

### 7.1 Campground Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAMPGROUND LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  CREATE  │───►│   READ   │───►│  UPDATE  │───►│  DELETE  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       ▼               ▼               ▼               ▼             │
│  • Auth required  • Public       • Owner only   • Owner only       │
│  • Validate all   • Populate     • Validate     • Remove doc       │
│  • Set author       comments     • Preserve     • Orphan comments  │
│  • Init comments  • Show owner     author                          │
│    as empty         controls                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Create Campground
1. User must be authenticated
2. Validate all input fields
3. Set `author.id` to current user's ID
4. Set `author.username` to current user's username
5. Initialize `comments` as empty array
6. Save campground
7. Redirect to campgrounds list

#### View Campground
1. Validate campground ID parameter
2. Fetch campground by ID
3. Populate/load associated comments
4. Determine if current user is owner
5. Render with conditional edit/delete controls

#### Update Campground
1. User must be authenticated
2. User must be owner (author.id matches user.id)
3. Validate all input fields
4. Update only: name, price, image, description
5. Preserve: author, comments
6. Redirect to campground detail page

#### Delete Campground
1. User must be authenticated
2. User must be owner
3. Remove campground document
4. Comments are NOT deleted (remain orphaned)
5. Redirect to campgrounds list with success message

---

### 7.2 Comment Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                          COMMENT LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  CREATE  │───►│   READ   │───►│  UPDATE  │───►│  DELETE  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       ▼               ▼               ▼               ▼             │
│  • Auth required  • Via parent   • Owner only   • Owner only       │
│  • Validate text    campground   • Validate     • Remove doc       │
│  • Set author     • Show owner   • Preserve     • Remove from      │
│  • Add to parent    controls       author         parent array     │
│    campground                                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Create Comment
1. User must be authenticated
2. Validate campground exists
3. Validate comment text
4. Set `author.id` to current user's ID
5. Set `author.username` to current user's username
6. Save comment document
7. Add comment ID to campground's `comments` array
8. Save campground
9. Redirect to campground detail page

#### View Comments
- Comments are viewed via parent campground's detail page
- All comments are loaded when viewing campground
- Each comment shows: author username, text, edit/delete (if owner)

#### Update Comment
1. User must be authenticated
2. User must be owner
3. Validate comment text
4. Update only: text
5. Preserve: author
6. Redirect to parent campground detail page

#### Delete Comment
1. User must be authenticated
2. User must be owner
3. Remove comment document
4. Remove comment ID from parent campground's `comments` array
5. Save campground
6. Redirect to parent campground detail page

---

### 7.3 Authentication Lifecycle

```
┌───────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LIFECYCLE                     │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│    ANONYMOUS                                                   │
│        │                                                       │
│        ├────► REGISTER ────► AUTHENTICATED ────► LOGOUT ──┐   │
│        │         │                │                        │   │
│        │         ▼                ▼                        │   │
│        └────► LOGIN ──────────────┘                        │   │
│                                                            │   │
│        ◄───────────────────────────────────────────────────┘   │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

### 7.4 Ownership Verification

```python
# Pseudocode for ownership check
def is_owner(resource, current_user):
    if current_user is None:
        return False
    if resource.author.id is None:
        return False
    return resource.author.id == current_user.id
```

**Important:** Use proper ID comparison methods. String comparison may fail if IDs are objects.

---

## 8. User Interface Specifications

### 8.1 Page Layout Structure

All pages share a common structure:

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  ┌─────────┐                        ┌─────────────────────┐ │
│  │ YelpCamp│                        │ Login | Sign Up     │ │
│  │ (logo)  │                        │ -- OR --            │ │
│  └─────────┘                        │ Username | Logout   │ │
│                                     └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     FLASH MESSAGES                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Success/Error alerts displayed here]                   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                       MAIN CONTENT                           │
│                                                              │
│                    (page-specific)                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.2 Navigation Header

**Anonymous User View:**
```
[YelpCamp]                                    [Login] [Sign Up]
```

**Authenticated User View:**
```
[YelpCamp]                        Signed in as {username} [Logout]
```

---

### 8.3 Landing Page (/)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    Welcome to YelpCamp!                      │
│                                                              │
│               [View All Campgrounds Button]                  │
│                                                              │
│              (Optional: Image slideshow/hero)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.4 Campgrounds Index (/campgrounds)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    Welcome to YelpCamp!                      │
│        View our hand-picked campgrounds from all over       │
│                                                              │
│   [Add a new campground] (only if authenticated)            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   [Image]   │  │   [Image]   │  │   [Image]   │         │
│  │  Camp Name  │  │  Camp Name  │  │  Camp Name  │         │
│  │ [More Info] │  │ [More Info] │  │ [More Info] │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ...                     │
│  │   [Image]   │  │   [Image]   │                          │
│  │  Camp Name  │  │  Camp Name  │                          │
│  │ [More Info] │  │ [More Info] │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Grid Layout:**
- 4 columns on large screens
- 2 columns on small screens
- Responsive wrapping

---

### 8.5 Campground Detail (/campgrounds/:id)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────┐  ┌─────────────────────────────────────────┐  │
│  │          │  │                                          │  │
│  │ Sidebar  │  │            [Campground Image]            │  │
│  │          │  │                                          │  │
│  │ - Info 1 │  ├─────────────────────────────────────────┤  │
│  │ - Info 2 │  │                                          │  │
│  │ - Info 3 │  │  Campground Name              $XX/night  │  │
│  │          │  │                                          │  │
│  └──────────┘  │  Description text goes here...           │  │
│                │                                          │  │
│                │  Submitted by: {username}                │  │
│                │                                          │  │
│                │  [Edit] [Delete]  (if owner)             │  │
│                │                                          │  │
│                ├─────────────────────────────────────────┤  │
│                │                                          │  │
│                │  Comments              [Add New Comment] │  │
│                │                        (if authenticated)│  │
│                │  ─────────────────────────────────────── │  │
│                │  {username}                   10 days ago│  │
│                │  Comment text here                       │  │
│                │  [Edit] [Delete] (if owner)              │  │
│                │  ─────────────────────────────────────── │  │
│                │  {username}                   10 days ago│  │
│                │  Comment text here                       │  │
│                │  [Edit] [Delete] (if owner)              │  │
│                │                                          │  │
│                └─────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Conditional Elements:**
- Edit/Delete campground buttons: Only visible to campground owner
- Add New Comment button: Only visible to authenticated users
- Edit/Delete comment buttons: Only visible to comment owner

---

### 8.6 Form Pages

All forms share similar styling:
- Centered on page (approximately 30% width)
- "Go back" link below form
- Submit button spans full form width

#### New/Edit Campground Form

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│              Create a New Campground                         │
│              -- OR --                                        │
│              Edit {Campground Name}                          │
│                                                              │
│              ┌─────────────────────────┐                    │
│              │ Name                    │                    │
│              ├─────────────────────────┤                    │
│              │ Price ($/night)         │                    │
│              ├─────────────────────────┤                    │
│              │ Image URL               │                    │
│              ├─────────────────────────┤                    │
│              │ Description             │                    │
│              ├─────────────────────────┤                    │
│              │      [Submit Button]    │                    │
│              └─────────────────────────┘                    │
│                       Go Back                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### New/Edit Comment Form

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│         Add New Comment to {Campground Name}                 │
│         -- OR --                                             │
│         Edit Comment                                         │
│                                                              │
│              ┌─────────────────────────┐                    │
│              │ Comment Text            │                    │
│              ├─────────────────────────┤                    │
│              │      [Submit Button]    │                    │
│              └─────────────────────────┘                    │
│                       Go Back                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Login/Register Forms

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    Login / Sign Up                           │
│                                                              │
│              ┌─────────────────────────┐                    │
│              │ Username                │                    │
│              ├─────────────────────────┤                    │
│              │ Password                │                    │
│              ├─────────────────────────┤                    │
│              │   [Login/Sign Up]       │                    │
│              └─────────────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.7 Flash Message Display

```
SUCCESS (Green):
┌─────────────────────────────────────────────────────────────┐
│  ✓ {Success message text}                                    │
└─────────────────────────────────────────────────────────────┘

ERROR (Red):
┌─────────────────────────────────────────────────────────────┐
│  ✗ {Error message text}                                      │
└─────────────────────────────────────────────────────────────┘
```

- Displayed at top of page content area
- Automatically cleared after one page view
- Can display multiple messages (but usually one)

---

## 9. Security Requirements

### 9.1 Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| Password Storage | Hash with PBKDF2, bcrypt, or Argon2 (never plain text) |
| Password Salt | Unique salt per password |
| Session Secret | Configurable via environment variable |
| Session Storage | Server-side only (not in cookies) |
| Session Fixation | Regenerate session ID on login |

---

### 9.2 Input Security

| Requirement | Implementation |
|-------------|----------------|
| XSS Prevention | Escape HTML in user-generated content (especially campground names) |
| Input Validation | Validate all inputs before processing |
| Input Sanitization | Trim whitespace from all string inputs |
| URL Validation | Verify image URLs are valid format |
| Length Limits | Enforce maximum lengths on all text fields |

---

### 9.3 Authorization Security

| Requirement | Implementation |
|-------------|----------------|
| Route Protection | Middleware checks before handler execution |
| Ownership Verification | Compare user IDs, not usernames |
| ID Comparison | Use proper method for ID type (object vs string) |
| Fail Secure | Default to denial if check cannot complete |

---

### 9.4 Data Security

| Requirement | Implementation |
|-------------|----------------|
| No Mass Assignment | Only allow specific fields to be updated |
| Field Filtering | Server-side allowlist of modifiable fields |
| Parameter Validation | Validate ID parameters before database queries |

---

### 9.5 Security Headers (Recommended)

Consider implementing:
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

---

## 10. Error Handling

### 10.1 Error Response Strategy

All errors should:
1. Log detailed error to server console/logs
2. Display user-friendly message to client
3. Redirect to safe page
4. Never expose stack traces or internal details to users

---

### 10.2 Error Messages

| Scenario | Flash Message | Redirect Target |
|----------|---------------|-----------------|
| Resource not found | "{Resource} not found" | /campgrounds or back |
| Validation failure | First validation error message | Back to form |
| Authentication required | "You need to be logged in to do that" | /login |
| Authorization failure | "You don't have permission to do that" | Back (previous page) |
| Database error | "Error {action} {resource}" | /campgrounds |
| Invalid credentials | Authentication library default | /login |
| Duplicate username | "User already exists" or similar | /register |

---

### 10.3 HTTP Status Codes

While the application primarily uses redirects (302), if building an API:

| Scenario | Status Code |
|----------|-------------|
| Success | 200 OK |
| Created | 201 Created |
| Redirect | 302 Found |
| Bad Request (validation) | 400 Bad Request |
| Unauthorized | 401 Unauthorized |
| Forbidden | 403 Forbidden |
| Not Found | 404 Not Found |
| Server Error | 500 Internal Server Error |

---

## 11. Seed Data

### 11.1 Purpose

Seed data populates the database with initial content for:
- Development and testing
- Demo purposes
- Initial deployment

---

### 11.2 Seed Campgrounds

```
Campground 1:
  name:        "Cloud's Rest"
  price:       "9.00"
  image:       [Valid image URL of mountain/camping scene]
  description: [500+ character Lorem Ipsum or descriptive text]
  author:      [Can be null/undefined for seeds]
  comments:    [1 comment attached]

Campground 2:
  name:        "Desert Mesa"
  price:       "12.00"
  image:       [Valid image URL of desert camping scene]
  description: [Same descriptive text]
  author:      [null/undefined]
  comments:    []

Campground 3:
  name:        "Canyon Floor"
  price:       "15.00"
  image:       [Valid image URL of canyon scene]
  description: [Same descriptive text]
  author:      [null/undefined]
  comments:    []
```

---

### 11.3 Seed Comments

```
Comment 1 (attached to Campground 1):
  text:   "This place is great, but I wish there was internet"
  author: { username: "Homer" }  // Note: No user ID for seed data
```

---

### 11.4 Seed Behavior

```
SEED PROCESS:
1. Delete all existing Campground documents
2. Delete all existing Comment documents
3. For each campground in seed data:
   a. Create campground document
   b. If campground has comments:
      - Create comment documents
      - Add comment references to campground
      - Save campground
4. Log completion
```

**Warning:** Seeded content with null authors will fail ownership checks. This is acceptable for demo data but means seeded items cannot be edited/deleted through the UI.

---

## 12. Configuration & Environment

### 12.1 Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | None |
| `SESSION_SECRET` | Secret key for session encryption | Production | Development fallback |
| `PORT` | Server listening port | No | 3000 |

---

### 12.2 Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `IP` | Server binding IP | 0.0.0.0 |

---

### 12.3 Production Considerations

- Use HTTPS (SSL/TLS)
- Set secure session cookies
- Use production database
- Set strong SESSION_SECRET
- Enable proper logging
- Configure error reporting
- Set appropriate CORS policies

---

## Appendix A: Quick Reference

### A.1 Route Summary

| Method | Path | Auth | Owner | Description |
|--------|------|------|-------|-------------|
| GET | / | - | - | Landing page |
| GET | /register | - | - | Registration form |
| POST | /register | - | - | Create account |
| GET | /login | - | - | Login form |
| POST | /login | - | - | Authenticate |
| GET | /logout | - | - | End session |
| GET | /campgrounds | - | - | List all |
| GET | /campgrounds/new | ✓ | - | New form |
| POST | /campgrounds | ✓ | - | Create |
| GET | /campgrounds/:id | - | - | View one |
| GET | /campgrounds/:id/edit | ✓ | ✓ | Edit form |
| PUT | /campgrounds/:id | ✓ | ✓ | Update |
| DELETE | /campgrounds/:id | ✓ | ✓ | Delete |
| GET | /campgrounds/:id/comments/new | ✓ | - | New form |
| POST | /campgrounds/:id/comments | ✓ | - | Create |
| GET | /campgrounds/:id/comments/:cid/edit | ✓ | ✓ | Edit form |
| PUT | /campgrounds/:id/comments/:cid | ✓ | ✓ | Update |
| DELETE | /campgrounds/:id/comments/:cid | ✓ | ✓ | Delete |

---

### A.2 Flash Messages Reference

| Action | Success Message | Error Messages |
|--------|-----------------|----------------|
| Register | "Welcome to YelpCamp {username}" | Validation errors, "User already exists" |
| Login | - | "Invalid credentials" (varies) |
| Logout | "Logged you out!" | - |
| Create Campground | - | Validation errors |
| Delete Campground | "Campground deleted" | Permission denied |
| Create Comment | "Successfully added comment" | Validation errors |
| Delete Comment | "Comment deleted" | Permission denied |
| Auth Required | - | "You need to be logged in to do that" |
| Owner Required | - | "You don't have permission to do that" |

---

### A.3 Validation Limits

| Field | Min | Max | Pattern |
|-------|-----|-----|---------|
| username | 3 | 30 | Alphanumeric |
| password | 6 | - | Any |
| campground.name | 1 | 100 | Any |
| campground.description | 1 | 5000 | Any |
| comment.text | 1 | 500 | Any |
| image URL | - | - | Valid URL |

---

## Appendix B: Frontend Implementation Guide

This section provides patterns and concepts to implement when learning a new frontend framework.

### B.1 Core Frontend Concepts

| Concept | What to Learn | YelpCamp Implementation |
|---------|---------------|-------------------------|
| **Routing** | File-based vs config-based routing | `/`, `/campgrounds`, `/campgrounds/:id` |
| **Components** | Component composition, props, slots | Card, Form, Button, Layout |
| **State Management** | Local vs global state, reactivity | Auth state, flash messages |
| **Data Fetching** | SSR, CSR, caching, loading states | Campground list, detail pages |
| **Forms** | Validation, submission, error handling | Login, Register, Create/Edit forms |
| **Authentication** | Session/token handling, protected routes | Login flow, route guards |

### B.2 Component Patterns to Implement

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layout                                                          │
│  ├── Header                                                      │
│  │   ├── Logo                                                    │
│  │   ├── NavLinks                                                │
│  │   └── AuthButtons / UserMenu                                  │
│  ├── FlashMessage                                                │
│  ├── MainContent (slot)                                          │
│  └── Footer                                                      │
│                                                                  │
│  Pages                                                           │
│  ├── LandingPage                                                 │
│  ├── CampgroundList                                              │
│  │   └── CampgroundCard (loop)                                   │
│  ├── CampgroundDetail                                            │
│  │   ├── CampgroundInfo                                          │
│  │   ├── CommentList                                             │
│  │   │   └── CommentItem (loop)                                  │
│  │   └── CommentForm                                             │
│  ├── CampgroundForm (create/edit)                                │
│  ├── LoginForm                                                   │
│  └── RegisterForm                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### B.3 State Management Patterns

| State Type | Examples | Pattern |
|------------|----------|---------|
| **UI State** | Modal open, loading spinner | Local component state |
| **Form State** | Input values, validation errors | Local or form library |
| **Auth State** | Current user, session | Global state/context |
| **Server State** | Campgrounds, comments | Data fetching library cache |
| **Flash Messages** | Success/error alerts | Global state with auto-clear |

### B.4 Data Fetching Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FETCHING STRATEGIES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SSR (Server-Side Rendering)                                     │
│  ├── Data fetched on server before HTML sent                     │
│  ├── Good for: SEO, initial page load                            │
│  └── YelpCamp: Campground list, detail pages                     │
│                                                                  │
│  CSR (Client-Side Rendering)                                     │
│  ├── Data fetched in browser after page load                     │
│  ├── Good for: Interactive updates, user-specific data           │
│  └── YelpCamp: Auth state, form submissions                      │
│                                                                  │
│  Hybrid                                                          │
│  ├── SSR for initial data, CSR for updates                       │
│  ├── Good for: Best of both worlds                               │
│  └── YelpCamp: Most modern frameworks default                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### B.5 Form Handling Checklist

- [ ] Controlled inputs (state bindings)
- [ ] Client-side validation
- [ ] Server-side validation error display
- [ ] Loading state during submission
- [ ] Disable submit while loading
- [ ] Success/error feedback (flash messages)
- [ ] Redirect after successful submission
- [ ] Pre-fill values for edit forms

### B.6 Authentication UI Patterns

```
Conditional Rendering:

IF user is authenticated:
  - Show username in header
  - Show logout button
  - Show "Add Campground" button
  - Show edit/delete on owned resources

IF user is NOT authenticated:
  - Show login/register links
  - Hide create buttons
  - Hide edit/delete buttons

Route Protection:
  - Redirect to login if accessing protected route
  - Store intended destination for post-login redirect
  - Handle session expiration gracefully
```

---

## Appendix C: Backend Implementation Guide

This section provides patterns and concepts to implement when learning a new backend framework.

### C.1 Core Backend Concepts

| Concept | What to Learn | YelpCamp Implementation |
|---------|---------------|-------------------------|
| **Routing** | Route definition, path params | RESTful campground/comment routes |
| **Middleware** | Request pipeline, auth guards | isLoggedIn, isOwner |
| **Controllers/Handlers** | Request handling, response | CRUD operations |
| **Database** | ORM/Query builder, migrations | Drizzle, schema design |
| **Validation** | Input sanitization, schemas | Zod schemas |
| **Authentication** | Sessions, tokens, hashing | better-auth integration |
| **Error Handling** | Try-catch, error middleware | Consistent error responses |

### C.2 API Architecture Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                      REQUEST FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request                                                         │
│     │                                                            │
│     ▼                                                            │
│  ┌─────────────┐                                                 │
│  │  Middleware │ ← CORS, Body Parser, Logger                     │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │ Auth Check  │ ← Session validation, user loading              │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │ Validation  │ ← Input schema validation (Zod)                 │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │  Handler    │ ← Business logic, DB operations                 │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  Response (JSON / Redirect)                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### C.3 Database Patterns

```sql
-- Schema Design (SQL representation)

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(30) UNIQUE NOT NULL,
  password    TEXT NOT NULL,  -- hashed
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campgrounds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  price       VARCHAR(20) NOT NULL,
  image       TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id   UUID REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text          VARCHAR(500) NOT NULL,
  author_id     UUID REFERENCES users(id),
  campground_id UUID REFERENCES campgrounds(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### C.4 Middleware Patterns

```
Authentication Middleware:
┌────────────────────────────────────────┐
│ 1. Check for session/token             │
│ 2. Validate session/token              │
│ 3. Load user from database             │
│ 4. Attach user to request context      │
│ 5. Call next() or return 401           │
└────────────────────────────────────────┘

Authorization Middleware:
┌────────────────────────────────────────┐
│ 1. Get resource ID from params         │
│ 2. Fetch resource from database        │
│ 3. Compare resource.authorId to user.id│
│ 4. Call next() or return 403           │
└────────────────────────────────────────┘
```

### C.5 Error Handling Strategy

| Error Type | HTTP Status | Response |
|------------|-------------|----------|
| Validation Error | 400 | `{ error: "Validation failed", details: [...] }` |
| Unauthorized | 401 | `{ error: "Authentication required" }` |
| Forbidden | 403 | `{ error: "Permission denied" }` |
| Not Found | 404 | `{ error: "Resource not found" }` |
| Conflict | 409 | `{ error: "Resource already exists" }` |
| Server Error | 500 | `{ error: "Internal server error" }` |

### C.6 API Design Patterns

**REST API:**
```
GET    /api/campgrounds          → List all
GET    /api/campgrounds/:id      → Get one
POST   /api/campgrounds          → Create
PUT    /api/campgrounds/:id      → Update
DELETE /api/campgrounds/:id      → Delete
```

**tRPC API:**
```typescript
campground.list()                → Query
campground.getById({ id })       → Query
campground.create({ data })      → Mutation
campground.update({ id, data })  → Mutation
campground.delete({ id })        → Mutation
```

---

## Appendix D: Technology Comparison Matrix

Use this matrix when evaluating which technology to learn next.

### D.1 Frontend Frameworks

| Framework | Language | Rendering | Learning Curve | Ecosystem |
|-----------|----------|-----------|----------------|-----------|
| **Nuxt** | Vue/TS | SSR/SSG/CSR | Medium | Rich |
| **Next.js** | React/TS | SSR/SSG/CSR | Medium | Very Rich |
| **SvelteKit** | Svelte/TS | SSR/SSG/CSR | Easy | Growing |
| **SolidStart** | Solid/TS | SSR/CSR | Medium | Small |
| **Astro** | Multi | SSG/SSR | Easy | Growing |
| **Angular** | TS | CSR/SSR | Steep | Enterprise |

### D.2 Backend Frameworks

| Framework | Language | Runtime | Performance | Use Case |
|-----------|----------|---------|-------------|----------|
| **Hono** | TS | Bun/Node/Edge | Excellent | Modern, fast |
| **Express** | JS/TS | Node | Good | Mature, flexible |
| **Fastify** | JS/TS | Node | Very Good | Performance |
| **Nitro** | TS | Node/Edge | Excellent | Nuxt ecosystem |
| **Elysia** | TS | Bun | Excellent | Bun-native |
| **FastAPI** | Python | Python | Good | Python ecosystem |
| **Gin/Fiber** | Go | Go | Excellent | High performance |
| **Axum** | Rust | Rust | Excellent | Maximum performance |

### D.3 Database & ORM Options

| ORM/Tool | Language | Database Support | Type Safety |
|----------|----------|------------------|-------------|
| **Drizzle** | TS | PostgreSQL, MySQL, SQLite | Excellent |
| **Prisma** | TS | PostgreSQL, MySQL, SQLite, MongoDB | Excellent |
| **Kysely** | TS | PostgreSQL, MySQL, SQLite | Excellent |
| **TypeORM** | TS | Many | Good |
| **SQLAlchemy** | Python | Many | Good |
| **GORM** | Go | Many | Good |

### D.4 API Patterns

| Pattern | Pros | Cons | Best For |
|---------|------|------|----------|
| **REST** | Simple, widely understood | Over/under fetching | Public APIs |
| **tRPC** | Type-safe, no schema | TypeScript only | Full-stack TS |
| **GraphQL** | Flexible queries | Complex setup | Large apps |
| **gRPC** | Fast, typed | Complex, binary | Microservices |

---

## Appendix E: Learning Checklist

Use this checklist when implementing YelpCamp in a new stack.

### E.1 Frontend Checklist

**Setup & Configuration**
- [ ] Project initialization
- [ ] TypeScript configuration
- [ ] Linting & formatting (ESLint, Prettier)
- [ ] Environment variables
- [ ] Development server

**Routing**
- [ ] Landing page route (/)
- [ ] Campgrounds list (/campgrounds)
- [ ] Campground detail (/campgrounds/:id)
- [ ] New campground (/campgrounds/new)
- [ ] Edit campground (/campgrounds/:id/edit)
- [ ] Login/Register pages
- [ ] 404 handling

**Components**
- [ ] Layout with header/footer
- [ ] Navigation component
- [ ] Campground card
- [ ] Campground detail view
- [ ] Comment list & item
- [ ] Form components (input, textarea, button)
- [ ] Flash message component
- [ ] Loading spinner
- [ ] Error boundary

**State & Data**
- [ ] Auth state management
- [ ] Data fetching setup (tRPC/fetch)
- [ ] Loading states
- [ ] Error handling
- [ ] Caching strategy

**Forms**
- [ ] Login form
- [ ] Register form
- [ ] Campground create/edit form
- [ ] Comment form
- [ ] Client-side validation
- [ ] Server error display

**Authentication**
- [ ] Login functionality
- [ ] Registration functionality
- [ ] Logout functionality
- [ ] Protected routes
- [ ] Conditional UI rendering

**Testing**
- [ ] Unit test setup
- [ ] Component tests
- [ ] E2E test setup
- [ ] Critical path tests

### E.2 Backend Checklist

**Setup & Configuration**
- [ ] Project initialization
- [ ] TypeScript configuration
- [ ] Database connection
- [ ] Environment variables
- [ ] CORS configuration

**Database**
- [ ] User schema
- [ ] Campground schema
- [ ] Comment schema
- [ ] Migrations setup
- [ ] Seed data script

**Authentication**
- [ ] Password hashing
- [ ] Session/token management
- [ ] Login endpoint
- [ ] Register endpoint
- [ ] Logout endpoint
- [ ] Session validation middleware

**Campground Routes**
- [ ] GET /campgrounds (list)
- [ ] GET /campgrounds/:id (detail)
- [ ] POST /campgrounds (create, auth)
- [ ] PUT /campgrounds/:id (update, owner)
- [ ] DELETE /campgrounds/:id (delete, owner)

**Comment Routes**
- [ ] POST /campgrounds/:id/comments (create, auth)
- [ ] PUT /comments/:id (update, owner)
- [ ] DELETE /comments/:id (delete, owner)

**Middleware**
- [ ] Authentication check (isLoggedIn)
- [ ] Authorization check (isOwner)
- [ ] Input validation
- [ ] Error handling

**Validation**
- [ ] User validation schema
- [ ] Campground validation schema
- [ ] Comment validation schema
- [ ] URL parameter validation

**Error Handling**
- [ ] Validation error responses
- [ ] Auth error responses
- [ ] Not found responses
- [ ] Server error handling

**Testing**
- [ ] Unit test setup
- [ ] API endpoint tests
- [ ] Auth flow tests

---

## Appendix F: Quick Start Templates

### F.1 New Frontend Template

```bash
# Create new UI implementation
mkdir YelpCamp_UI_<Framework>
cd YelpCamp_UI_<Framework>

# Initialize project (framework-specific)
# npm create nuxt@latest .
# npm create next-app .
# npm create svelte@latest .

# Create .claude folder
mkdir .claude
# Copy template from existing implementation
```

### F.2 New Backend Template

```bash
# Create new API implementation
mkdir YelpCamp_API_<Framework>
cd YelpCamp_API_<Framework>

# Initialize project (framework-specific)
# npm init
# bun init
# cargo init

# Install core dependencies
# - Web framework (hono, express, fastify)
# - Database ORM (drizzle, prisma)
# - Validation (zod)
# - Auth (better-auth, lucia)

# Create .claude folder
mkdir .claude
# Copy template from existing implementation
```

### F.3 Recommended Learning Order

**If you know JavaScript/TypeScript:**
1. Start with Nuxt 4 (current UI) to understand the full spec
2. Try Hono API (current API) to see backend patterns
3. Build React/Next.js UI to compare framework approaches
4. Try Express or Fastify API for Node.js backend variety
5. Explore Elysia (Bun) or Go/Rust for performance focus

**If you're new to web development:**
1. Start with the Hono API to understand backend concepts
2. Build the Nuxt 4 UI to understand frontend patterns
3. Try different combinations to solidify learning

---

*End of Specification Document*
