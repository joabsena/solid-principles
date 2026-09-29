# Learning Record 0001 · SRP Is About Actors, Not Functions

## What I thought before
I thought Single Responsibility meant "a class should do one thing" — like a function that only does one operation. Small classes = good, big classes = bad.

## What I learned
SRP is about **who asks for changes**, not how many methods a class has. A "reason to change" is a person or role (actor) — the CFO, the SRE team, the Product Owner. If two different actors could request changes to the same class, it has two reasons to change, even if the class is only 20 lines.

## Why this matters
When one class serves multiple actors, changes for Actor A risk breaking functionality Actor B depends on. Merge conflicts, regressions, fear of touching code. Splitting by actor removes this coupling.

## Follow-ups
- How does SRP interact with the Open-Closed Principle? (If a class has one reason to change, it's naturally more open for extension.)
- In practice, how do I identify all the actors in my codebase? Look at who files the tickets.

## Date
2026-07-23
