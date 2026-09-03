# Feature Request & Voting Platform

A platform where users submit feature requests and vote on them; admins triage, plan, ship, merge, and respond. The frontend runs against a mock API layer; the backend is a future placeholder.

## Language

### Core entity

**Request**:
The thing a user submits and the community votes on. Human label: "Feature Request".
_Avoid_: FeatureRequest, Idea, Suggestion, Ticket

**Author**:
The user who created a Request. A relationship, not a role.
_Avoid_: Owner, Creator

### Lifecycle

**Status**:
The lifecycle position of a Request: `under_review` → `planned` → `in_progress` → `released`, with terminal `declined` and `redirected`.
_Avoid_: State, Stage

**Pipeline**:
The visual stepped bar showing where a Request sits in the active progression (Under Review → Planned → In Progress → Released). A rendering of current Status, not a log.
_Avoid_: Timeline (when meaning the stepper)

**Activity**:
The append-only chronological event log for a Request: created, status changed, merged, official response posted — each with actor and timestamp.
_Avoid_: Timeline, History

**Merge**:
Admin action that absorbs one Request into another. Non-destructive: the survivor gains the union of voters and an activity entry; the absorbed Request becomes Redirected.
_Avoid_: Combine, Consolidate, Duplicate

**Survivor**:
The Request that remains after a Merge and absorbs the other.
_Avoid_: Destination, Target

**Absorbed**:
The Request consumed by a Merge; it becomes Redirected and carries `mergedInto` pointing at the Survivor.
_Avoid_: Duplicate, Subsumed

**Redirected**:
A terminal Status meaning "no longer an independent request — it was absorbed into another." Carries the survivor id in `mergedInto`.
_Avoid_: Merged, Closed

### Community signal

**Support**:
The community's signal on a Request, measured as the count of unique voters.
_Avoid_: Community priority, Popularity, Demand, Votes

**Vote**:
One signed-in user's expression of Support for a Request. Unique per `(userId, requestId)`, reversible (unvote).
_Avoid_: Upvote, Like, Endorsement

### Roles

**Role**:
A user's permission level: `user` or `admin`. Admin is a superset of user.
_Avoid_: Member, Moderator

**User**:
A signed-in person. Can submit, edit (own), comment, vote, and unvote.
_Avoid_: Account, Person

**Admin**:
A User with elevated permissions: status changes, merges, official responses, stats, and edit/delete of any Request.
_Avoid_: Moderator, Maintainer

### Conversation

**Comment**:
A community discussion item on a Request, authored by any signed-in User, many per Request.
_Avoid_: Post, Thread, Note

**Official Response**:
The single admin-authored slot (0..1) pinned above Comments on a Request — the team's consolidated answer. Set, edited, or removed by admins.
_Avoid_: Reply, Announcement, Sticky