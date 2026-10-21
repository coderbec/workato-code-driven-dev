---
name: workato-setup
description: Guided first-run setup for this repo. Use when the user says "start workato setup" (or runs /workato-setup), or asks to set up, configure or get started with this Workato code-driven-dev project. Checks the WORKATO_CODE_DEV profile variable, asks the data centre, installs Workato Developer Labs (wk CLI etc.), creates a wk auth profile, writes the Developer API and AIRO MCP config (header auth), has the user restart Claude so the MCPs connect, then lists and hydrates chosen projects.
---

# Workato guided setup

Triggered by the phrase **start workato setup** or the slash command **/workato-setup**. It runs in two phases with one restart of Claude in between, because MCP servers only connect when Claude starts.

- **Phase A (before restart)**: steps 1 to 5. Everything that does not need the MCPs.
- **Restart**: step 6. The user restarts Claude so the MCPs connect.
- **Phase B (after restart)**: steps 7 to 9. Verify the MCPs, choose projects, hydrate.

## Ground rules
- **Signpost everything.** Before each step print `Step N/9: <what and why>`. After it, say what happened (PASS / FAIL / skipped).
- **Always start with `node scripts/setup/status.js`.** It shows which steps are DONE or PENDING, so re-runs and post-restart runs resume in the right place. Skip DONE steps (say you are skipping them and why).
- **No `.env`, ever.** The only secret is the OS profile variable `WORKATO_CODE_DEV` (the Workato API token). Never ask for the token in chat, write it to a file, or print it. If a stray `.env` or `.env.bak*` exists, tell the user to delete it and rotate the token, but do not delete it for them.
- **Auth failures do not auto-retry.** If an MCP authenticate or login fails once, stop, tell the user, and wait. Never use OAuth for these servers; they use header auth only.
- **One component failing never stops the run.** Report it, continue, and list failures in the final summary.
- Use human-readable Workato names (project names as shown in the UI), not IDs.
- All commands are cross-platform Node scripts under `scripts/setup/`, run from the repo root.

# Phase A: before the restart

## Step 1/9: Check the WORKATO_CODE_DEV profile variable
Run `node scripts/setup/check-profile-var.js`. PASS: go to step 2. FAIL: **stop** and give these instructions, then wait; do not continue.

> `WORKATO_CODE_DEV` is not set. It holds your Workato API token (Workspace admin > API clients; the client role needs the **Developer API MCP** and **AIRO MCP** tools enabled). Set it **in a new terminal window** (not this Claude session), in the same project folder:
>
> **macOS (zsh, including the VS Code terminal on Mac)**
> ```
> echo 'export WORKATO_CODE_DEV="PASTE_TOKEN_HERE"' >> ~/.zshrc
> ```
> (bash users: `~/.bashrc`.)
>
> **Windows (PowerShell, cmd, or the VS Code terminal)**
> ```
> setx WORKATO_CODE_DEV "PASTE_TOKEN_HERE"
> ```
>
> Then:
> 1. Close that terminal. **If you use VS Code, fully quit and reopen VS Code**; terminals only see variables that existed when VS Code started. On Windows, `setx` only affects windows opened afterwards.
> 2. Open a terminal in this same project folder and run `claude`.
> 3. Say **start workato setup** (or `/workato-setup`). Setup resumes from step 2.

## Step 2/9: Data centre
Ask which Workato data centre the workspace is in: us, eu, jp, sg, au, il, kr, uk, or trial (Developer Sandbox). The token only works in its own data centre. `cn` is not supported (no MCP or CLI there). If status shows `.mcp.json` already written for a data centre, offer to keep it.

## Step 3/9: Install Workato Developer Labs
Run `node scripts/setup/install-labs.js`. It installs, independently: wk CLI, Recipe Linter, Workato Developer Skills (cloned to `.workato-labs/`), and the Recipe Visualizer editor extension. Relay the summary table; for each FAILED component say which one could not be installed and give its manual link, then carry on.

## Step 4/9: Create a wk auth profile
Needs the wk CLI from step 3. If it is missing, say step 4 is skipped, how to finish (install wk, then say "start workato setup" again), and continue to step 5.
Run `node scripts/setup/wk-profile.js --dc <code>`. It creates a **new** profile `workato-code-dev-N` (next unused number; existing profiles are never overwritten), makes it the default, and runs `wk auth status`.

## Step 5/9: Write the MCP configuration (header auth only)
Run `node scripts/setup/apply-data-centre.js --dc <code>`. It renders `.mcp.template.json` into `.mcp.json` (gitignored) for the **Developer API MCP** (`/mcp`) and **AIRO MCP** (`/airo_mcp`), both with `Authorization: Bearer ${WORKATO_CODE_DEV}`, then probes both URLs without credentials and expects HTTP 401. A WARN means the URL may be wrong or blocked: tell the user, do not guess.

Then run `node scripts/setup/status.js` and show the user the checklist: all four items must be DONE before the restart. Fix or explain anything PENDING first.

# Restart

## Step 6/9: Restart Claude so the MCP servers connect
MCP servers are read when Claude starts, so the setup cannot continue until Claude restarts. Tell the user, in this form:

> **Everything that can be set up now is done.** You need to restart Claude so the two Workato MCP servers connect.
>
> 1. Exit this session (`/exit`, or Ctrl+C twice).
> 2. In a terminal **in this same project folder** (the one that has `WORKATO_CODE_DEV`; in VS Code use the integrated terminal), run `claude`.
> 3. **What you should see:** a prompt to approve the project's MCP servers `workato-developer-api` and `workato-airo`. Approve both (use "use this and all future MCP servers in this project" if offered).
> 4. Run `/mcp`. **What you should see:** both servers listed as **connected**.
> 5. Say **continue workato setup** (or **start workato setup** again). I will confirm the MCPs and finish: project selection and hydration.
>
> **If it doesn't look like that:**
> - A server is not listed: it was not approved. Run `/mcp`, or exit and restart `claude` and approve when asked.
> - A server shows **failed**, or an authentication error: run `/mcp`, select it and choose **Reconnect**. If it still fails, the usual causes are (1) `WORKATO_CODE_DEV` is not set in this terminal (VS Code was not fully restarted), (2) the token belongs to a different data centre than the one chosen, or (3) the API client role does not include the **Developer API MCP** / **AIRO MCP** tools. Do **not** choose OAuth / "Authenticate": these servers use the header token only.
> - Still stuck: say **start workato setup**; I will run the checks again and tell you which one is failing.
>
> When both show **connected**, you are ready to go.

Stop here and wait for the user to return after restarting.

# Phase B: after the restart

## Step 7/9: Confirm the MCP servers are connected
Run `node scripts/setup/status.js` first. If Phase A items are PENDING, go back to that step.
Then check the MCP tools are available in this session (ToolSearch for `workato-developer-api` and `workato-airo` tools such as `get_projects`). 
- Both present: say **"Both MCP servers are connected. You are ready to go."** and continue.
- Missing or failing: do not proceed and do not retry authentication. Re-show the "If it doesn't look like that" list from step 6, ask the user to fix it and say "continue workato setup". As a fallback, steps 8 and 9 can run with `node scripts/discover-projects.js` (wk only) if the user wants to skip the MCP for now; make clear the MCPs are still not connected.

## Step 8/9: Choose projects to hydrate
Use the **Developer API MCP** tool `get_projects` to list project names. Present a numbered list and ask which to hydrate (any number, or "all").

## Step 9/9: Hydrate
Run `node scripts/hydrate-projects.js "Project A" "Project B"` for the chosen projects, announcing each. `recipes/` is local, gitignored working state. Finish with a summary: what installed (and anything that failed), which wk profile is default, MCP servers connected, which projects hydrated. Close with: "You're ready to go."

## Re-running
Safe to repeat. Step 3 skips what is installed. Step 4 makes a fresh numbered profile only if status shows no active `workato-code-dev-N` profile (otherwise offer to skip it). Step 5 re-renders the config.
