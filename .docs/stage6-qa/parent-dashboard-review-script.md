# Parent Dashboard Review Script

**Purpose:** Evaluate whether the parent dashboard clearly communicates a child's
progress and weak areas without requiring technical knowledge.

**Participants needed:** 2–3 parents, tested separately. Ideally at least one with limited tech experience.
**Duration per participant:** 20–25 minutes.
**Setup:** Desktop browser or tablet, logged in as a parent with at least 2 weeks of mock data loaded.

---

## Before the Session

**Preparation checklist:**
- [ ] Test account created with realistic mock data (min. 14 days of sessions, at least one weak topic)
- [ ] App is open at the Lobby screen — parent is NOT yet logged in
- [ ] Screen recording running
- [ ] Observer has this script, sits where they can see the screen but not direct the participant

**Briefing (read aloud):**
> "We'd like to know how easy it is for a parent to understand their child's progress in this app. There are no right or wrong ways to do this. If something is confusing, that's very useful feedback for us. Please think aloud as you go — say what you're thinking and what you're looking for."

---

## Tasks

| # | Task (say this aloud) | Success criteria | Time limit | Observation |
|---|-----------------------|-----------------|-----------|-------------|
| 1 | "Please log in to the parent area." | Parent finds the parent area button on the lobby and logs in successfully | 2 min | |
| 2 | "Tell me how [child name] did this week." | Parent can state the number of minutes played and general trend without prompting | 2 min | |
| 3 | "Which math topic is [child name] finding hardest?" | Parent identifies the correct weak area from the bar chart | 90 sec | |
| 4 | "Is [child name] improving, staying the same, or getting worse?" | Parent correctly interprets the line chart trend | 90 sec | |
| 5 | "How many coins did [child name] earn in total?" | Parent locates the total coins stat | 60 sec | |
| 6 | "Switch to see [second child name]'s progress." | Parent uses the child dropdown correctly | 60 sec | |
| 7 | "What would you do next based on what you see?" | Parent suggests a reasonable action (e.g. practice addition, reduce difficulty) | open | |

---

## Observation Checklist

**Navigation**
- [ ] Parent found the "Parent Area" button without prompting
- [ ] Parent logged in without confusion
- [ ] Parent found the child selector dropdown independently
- [ ] Parent could switch between children without help

**Chart comprehension**
- [ ] Parent understood what the line chart's X-axis (dates) represents
- [ ] Parent understood what the line chart's Y-axis (correct answers) represents
- [ ] Parent correctly identified which bar in the bar chart is tallest/worst
- [ ] Parent understood that the error-rate bar chart measures *mistakes*, not success

**Stats comprehension**
- [ ] Parent understood the coin total without explanation
- [ ] Parent understood the "current level" number in context
- [ ] Parent understood "weekly minutes" at a glance
- [ ] Parent correctly identified the "weak areas" section

**Confusion / friction points**
- [ ] Confused by: ___________________________
- [ ] Could not find: ___________________________
- [ ] Misread chart as: ___________________________
- [ ] Asked what X means: ___________________________

---

## Post-Session Interview (5 minutes)

| Question | Participant's answer |
|----------|---------------------|
| What was the most useful piece of information on the dashboard? | |
| What was the hardest thing to understand? | |
| Is there anything you expected to see but didn't find? | |
| Would you check this dashboard regularly? Why / why not? | |
| On a scale of 1–5, how easy was it to understand your child's progress? | |

---

## Scoring

| Dimension | Score (1=very unclear, 5=perfectly clear) | Notes |
|-----------|------------------------------------------|-------|
| Navigating to the dashboard | | |
| Reading the line chart (progress over time) | | |
| Reading the bar chart (error rates by topic) | | |
| Understanding summary stats (coins, level, time) | | |
| Identifying weak areas | | |
| Overall dashboard clarity | | |

**Pass threshold:** All dimensions ≥ 3. Dimensions scoring 1 or 2 are **blockers**.

---

## Common Issues to Watch For

- Parent cannot find the child dropdown → increase visibility of the selector
- Parent misreads error-rate chart as "correct answers" → improve axis labels and chart title
- Parent does not see the weak areas section → move it higher on the page
- Parent confused by "weekly minutes" (sessions × 2 min estimate) → be explicit about the approximation

---

## After All Sessions

Aggregate scores. Log findings in [.docs/stage6-qa/qa-report.md](qa-report.md).
Any blocker (score 1–2) must be addressed before Stage 7.
