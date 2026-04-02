# Child Usability Test Script

**Purpose:** Observe a child (age 5–7) using the app without any adult guidance.
Identify friction points before release.

**Participants needed:** 2–3 children, tested separately.
**Duration per child:** 20–30 minutes.
**Setup:** Tablet, app running, screen recording on, adult observer silent and out of eye-line.

---

## Before the Session

**Preparation checklist:**
- [ ] App running on tablet at the lobby screen (no child profile created yet)
- [ ] Screen recording started (device screen + audio if possible)
- [ ] Observer has this script printed — does NOT show it to the child
- [ ] Room is quiet, no distractions
- [ ] Tablet is charged and propped at a comfortable angle

**Briefing for the child (read aloud exactly):**
> "אנחנו רוצים לראות איך אתה/את משחק/ת במשחק חדש. אין תשובות נכונות ושגויות — אנחנו בודקים את המשחק, לא אותך. אם משהו לא ברור לך, פשוט תגיד לנו. לא תהיה עזרה ממני — תנסה לבד."

*(We want to see how you play a new game. There are no right or wrong answers — we're testing the game, not you. If something is unclear, just say so. I won't help — try by yourself.)*

---

## Tasks

Give each task verbally. Do NOT demonstrate. Record what happens in the observation column.

| # | Task (say this aloud in Hebrew) | Success criteria | Observation |
|---|---------------------------------|-----------------|-------------|
| 1 | "בחר/י דמות ותתחיל/י לשחק" *(Pick a character and start playing)* | Child reaches the World Map without help | |
| 2 | "לחץ/י על השלב הראשון" *(Tap the first level)* | Child taps level 1 node and enters exercise screen | |
| 3 | *(No instruction — observe)* | Child understands drag-and-drop without being told | |
| 4 | *(After a correct answer)* — note whether child notices coin animation | Child reacts to coin reward | |
| 5 | *(After a wrong answer)* — note emotional reaction | Child does not get distressed; retries | |
| 6 | "שמע שוב את השאלה" *(Hear the question again)* | Child finds and taps the 🔊 replay button | |
| 7 | *(After completing level 1)* — "מה עכשיו?" *(What now?)* | Child understands they can go to the next level | |

---

## Observation Checklist

Mark each during the session:

**Navigation**
- [ ] Child found the avatar screen without prompting
- [ ] Child typed their name without help
- [ ] Child understood the World Map without explanation
- [ ] Locked levels were understood as unavailable (no repeated tapping)

**Exercise Mechanics**
- [ ] Child understood drag-and-drop on the first exercise
- [ ] Child did NOT need more than 2 attempts to understand the mechanic
- [ ] Child noticed the progress bar filling
- [ ] Child found the 🔊 replay button when they didn't hear/understand

**Emotional Response**
- [ ] Child smiled or showed positive reaction to coin animation
- [ ] Child was not upset or frustrated by wrong answer feedback
- [ ] Child wanted to continue after finishing a level

**Confusion Points** (mark if observed, add a note)
- [ ] Confused by: ___________________________
- [ ] Got stuck at: ___________________________
- [ ] Could not find: ___________________________

---

## Post-Session Interview (3 minutes)

Ask the child after the session:

| Question | Child's answer |
|----------|---------------|
| מה היה הכי כיף? *(What was most fun?)* | |
| מה היה קשה? *(What was hard?)* | |
| האם שמעת את השאלות בבירור? *(Could you hear the questions clearly?)* | |
| מה היית רוצה שיהיה שונה? *(What would you change?)* | |

---

## Scoring

After the session, the observer scores each dimension 1–5:

| Dimension | Score (1=major problem, 5=no issue) | Notes |
|-----------|-------------------------------------|-------|
| Discoverability (found everything without help) | | |
| Drag-and-drop ease | | |
| Emotional tone (not distressed by errors) | | |
| Audio/narration clarity | | |
| Overall enjoyment | | |

**Pass threshold:** All dimensions ≥ 3. Any dimension scoring 1 or 2 is a **blocker** — fix before release.

---

## Known Risks to Watch

- If child taps locked levels repeatedly → level lock feedback animation is insufficient
- If child cannot find the replay button → move it or make it larger
- If child is distressed by the wrong-answer sound → replace the sound
- If child does not notice coins → coin animation needs to be more prominent

---

## After All Sessions

Aggregate scores across all children. File issues for every item below threshold.
Update [.docs/stage6-qa/qa-report.md](qa-report.md) with findings.
