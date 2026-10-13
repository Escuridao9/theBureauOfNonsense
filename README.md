# The Bureau of Nonsense

The Bureau of Nonsense is a browser game about inspecting improbable applications under exceedingly specific regulations. Read the rulebook, approve compliant requests, or reject them and cite every broken rule.

Its desk combines handwritten typography, paper forms, stamps and a familiar office atmosphere. The project was developed with HTML5, CSS3 and JavaScript ES6+.

[Play on GitHub Pages](https://escuridao9.github.io/theBureauOfNonsense/) · [Source on GitHub](https://github.com/Escuridao9/theBureauOfNonsense)

## Run locally

Open the project folder in Visual Studio Code and start **Live Server** from `index.html`.

Alternatively, with Python installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

On Windows, use `py -m http.server 8000` if the `python` command is unavailable. Visit [http://localhost:8000](http://localhost:8000).

Use a web server because the game loads JavaScript modules and a local JSON file. The project runs directly in the browser and requires no build step or npm dependencies.

## Features

- A start menu with New Campaign, Continue Campaign, Roll of Honour and Settings.
- Three campaign modes and an optional clerk name.
- Department-specific regulations and randomized application queues.
- Cartoon identification portraits for all 24 applicants, with initials as a fallback.
- Approval stamps and rejection forms with selectable regulations.
- Audit receipts explaining decisions and points awarded.
- Shift and final reports with an expandable paper trail.
- Separate records for each mode, with the ten best completed runs.
- Saved progress and sound preferences using `localStorage`.
- A master volume and on/off switch, plus independent controls for music, atmosphere, stamps and paper sounds.
- Settings closes with Done, Escape or a click outside the paper.
- Sliding paper animation and reduced-motion support.
- Responsive layouts for desktop and mobile screens.
- A confirmed option to delete saved Bureau data.

## Campaign modes

| Mode | How it works |
| --- | --- |
| **Normal** | Three shifts and eighteen applications, with no timer. |
| **Under Pressure** | The same campaign, with twenty seconds to file each decision. The timer includes selecting rejection reasons; a missed deadline earns no points. |
| **Never-ending Paperwork** | Departments repeat with fresh queues. There is no timer, and the third wrong verdict ends the run. |

A correct verdict earns **10 points**. A fully justified inspection earns **5 additional points**, for a maximum of **15 points per application**. A perfect Normal or Under Pressure campaign scores **270 points**.

In Never-ending Paperwork, incomplete rejection reasons cost the bonus but do not add a warning when the verdict itself is correct.

## How to play

1. Choose **New Campaign**, select a mode and enter a clerk name if desired.
2. Read the department briefing and begin the shift.
3. Compare the application's fields with every regulation in the rulebook.
4. Approve the request if every rule is met. Otherwise, reject it and select every broken regulation.
5. Read the audit receipt, continue through the queue and review the shift report.

The Main menu pauses the timer in Under Pressure. The rejection form, Settings and the handbook leave it running.

| Key | Action |
| --- | --- |
| **A** | Approve the current application. |
| **R** | Open the rejection form. |
| **Enter** | Continue after an audit receipt. |

Shortcuts respect active forms and dialogs, so typing in an input does not stamp an application.

## Saved data and Settings

Progress, completed records, the best Normal score and sound preferences are stored in this browser's `localStorage`. **Continue Campaign** restores an unfinished run, including briefings, applications, receipts and shift reports. Starting a new campaign preserves completed records.

Settings provides a master on/off switch and volume slider, plus separate controls for atmosphere, music, stamps and paper sounds. The master slider scales every channel while preserving its own setting: music at 35% with the master at 50% plays at 17.5%. Switching all sounds off preserves those preferences for when sound is enabled again.

Preferences save as they change. Close Settings with **Done**, **Escape** or a click outside the paper. Browsers may require a click or key press before allowing audio playback.

To erase saved Bureau data, open **Settings → Clear saved data → Delete saved data**. Confirmation removes the saved campaign, records, best score and sound preferences, ends the active run, restores the default audio settings and returns to the menu. **Keep my records** cancels the operation.

Other open Bureau tabs reset when data is deleted, preventing an old session from saving erased progress again. Storage belonging to unrelated projects is preserved.

If browser storage is unavailable, the current visit remains playable and the interface explains that progress cannot be saved.

## Technologies and structure

- **HTML5:** semantic sections, forms, native dialogs, templates and audio elements.
- **CSS3:** custom properties, Grid, Flexbox, responsive layouts and motion preferences.
- **JavaScript ES6+:** modules, closures, array methods, asynchronous loading, DOM updates and browser storage.

| File or folder | Responsibility |
| --- | --- |
| `index.html` | Start menu, desk, dialogs, HTML templates and audio elements. |
| `css/style.css` | Handwritten appearance, paper components and responsive layouts. |
| `js/main.js` | Loading, user actions, screen transitions and clock updates. |
| `js/game.js` | Campaign state, queues, progression, deadlines and save restoration. |
| `js/rules.js` | Regulation checks, scoring, totals and field formatting. |
| `js/modes.js` | Campaign mode definitions and clerk-name normalization. |
| `js/ui.js` | Rendering documents, rules, receipts, reports, timers and records. |
| `js/storage.js` | Persistence, record validation, ranking and saved-data deletion. |
| `js/audio.js` | Native audio playback, master controls and per-channel preferences. |
| `data/applications.json` | Departments, regulations and applicants. |
| `assets/` | Fonts, sound files, font licenses and the favicon. |

## Project requirements

| Requirement | Where it is demonstrated |
| --- | --- |
| Logic and control flow | `rules.js` uses `switch` for regulation checks and field formatting. Campaign and UI code use conditionals, ternaries, loops, `map`, `filter` and `reduce`. |
| Simple data | Clerk names are normalized, numeric limits and boolean consent are validated, and dates, field values and scores are formatted. |
| Complex data | Campaign results are added with new arrays, queues are shuffled from copies, records are filtered and sorted without changing their inputs, and public state is defensively cloned. |
| Dynamic DOM | `ui.js` clones HTML templates, fills their content and updates containers with `appendChild` and `replaceChildren`. Template strings compose dynamic labels and messages. |
| Events and forms | Buttons, mode and rejection forms, keyboard shortcuts, sliders, checkboxes and a live countdown update the game in response to user actions. |
| Browser storage | `storage.js` uses `localStorage` for progress, audio preferences and records, with validation, restoration and a confirmed deletion option. |
| Asynchronous loading | `main.js` fetches `data/applications.json` using `async`/`await`, checks the HTTP response and handles errors with `try`/`catch` and a retry action. |
| Scope and encapsulation | `const` and `let` are used throughout; campaign, audio, storage and interface factories keep private state in closures. |
| Modules and utilities | Seven ES modules separate orchestration, campaign state, rules, modes, rendering, storage and audio. Shared helpers centralize formatting, scoring and settings handling. |
| Repository and delivery | The public repository and GitHub Pages links are above. This README describes the project, controls, file structure and local setup. |

## Credits

- Music: **The Five-Floor Goodbye**, by **Ryan Ike**, from the **Gunpoint** soundtrack.
- Fonts: **Caveat** and **Special Elite**. Their license files are included in `assets/fonts/`.
- Applicant portraits: generated with OpenAI image generation. The prompts and portrait-sheet mapping are documented in `assets/portraits/PROMPTS.md`.
