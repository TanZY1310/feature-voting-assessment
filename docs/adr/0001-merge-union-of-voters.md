# Merge dedup: survivor gains the union of voters

A merge absorbs one Request into another; the survivor's Support count must equal the union of both requests' voters, deduplicated by `userId` — never a sum. Comments and Activity stay on the absorbed Request, which becomes Redirected (status `redirected`, `mergedInto` pointing at the survivor). The merge is non-destructive: absorbed Requests remain fully viewable in read-only with a "merged into #N" banner.

We chose union-over-sum so a user who voted on both requests counts once, and chose in-place preservation over copying comments so authorship stays intact and un-merging stays trivial.