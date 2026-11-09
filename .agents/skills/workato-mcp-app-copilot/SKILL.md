---
name: workato-mcp-app-copilot
description: Show a Workato MCP app (an interactive UI served by a Workato Enterprise MCP server) inside Microsoft 365 Copilot as a declarative agent. Use when the user runs /workato-mcp-app-copilot or asks to "show an MCP app in Copilot", "put the MCP app in Microsoft Copilot", "declarative agent for an MCP server", or "Agents Toolkit with Workato MCP". Asks whether to attach to an existing MCP app or make a new one, hydrates it with the wk CLI, makes the app self-contained for Copilot, creates a Copilot copy of the server on Workato ID authentication, asks which user group gets access (or makes a new one), then builds, provisions and tests the declarative agent with the Microsoft 365 Agents Toolkit CLI. Does not use the Power Platform CLI.
---

# Workato MCP app in Microsoft 365 Copilot

Triggered by the slash command **/workato-mcp-app-copilot** (or by asking for it). It takes an MCP app that already renders in Claude and makes it render in **Microsoft 365 Copilot** through a **declarative agent**.

Why a declarative agent: Microsoft documents MCP app widgets (`ui://` resources) for declarative agents. It does **not** document them for Copilot Studio agents, and a Microsoft Q&A thread reports Copilot Studio returning text only. Copilot Studio can still call the same tools; it just will not draw the screens. If the user says "Copilot Studio", explain this once and continue with the declarative agent unless they insist.

The Power Platform CLI (`pac`) is not needed. Tooling is the **Microsoft 365 Agents Toolkit CLI** (`@microsoft/m365agentstoolkit-cli`, run with `npx`), the **wk** CLI and the Workato MCP servers.

## Ground rules
- **Signpost.** Before each step print `Step N/9: <what and why>`; afterwards say PASS / FAIL / skipped.
- **Never break the original.** Do not edit a server that other clients use (Claude, token authentication). Make a **copy** for Copilot and leave the original alone. Say so when you propose the copy.
- **No secrets in chat or files.** The OAuth client is registered by the toolkit (dynamic client registration); the secret part lands in `env/.env.*.user`, which is gitignored. Never ask the user to paste a secret.
- **Ask before outward or hard-to-reverse actions**: creating a server, assigning a user group, provisioning in the tenant, deleting anything. Never delete without asking.
- **Never bypass the lint hook** (`--skip-hooks`). If `wk push` is blocked by lint errors in other recipes, fix them (for example `elsif` to nested if/else) or tell the user.
- **Never `wk push --force`** to get a file uploaded; change the file (see step 4) so it is uploaded as modified.
- **Public repo rule.** This skill lives in a public repo. Output of this skill (project files, env files with tenant and app IDs, server handles) belongs in the user's private workspace repo, never here.
- Commands that need a browser sign-in (Microsoft 365) must be run by the user: tell them to type `! <command>` in the prompt.

## Step 1/9: Preflight
Check, and give the fix for each FAIL:
- **Node 22 or later** (`node -v`). The toolkit runs through `npx -y @microsoft/m365agentstoolkit-cli@<version>`; pin the version you use and say which.
- **wk CLI** and a Workato profile (`wk --help`, `wk auth ...`). If missing, run `/workato-setup` first.
- **Workato MCP servers connected** (Developer API MCP and AIRO MCP). If not, `/workato-setup` or `/mcp` reconnect.
- **Microsoft 365 sign-in** for the toolkit: the user runs `! npx @microsoft/m365agentstoolkit-cli auth login m365` (the provision step also prompts for it).
- **Tenant prerequisites** (ask the user to confirm, a tenant admin may be needed): Teams admin centre, Setup policies, "Upload custom apps" **On**; Copilot access for the testing users; developer mode in Copilot Chat (`-developer on`, needs a licensed Microsoft 365 Copilot user).

## Step 2/9: Existing MCP app, or a new one?
Ask with AskUserQuestion: **"Attach to an existing MCP app, or make a new one?"**

**Existing.**
1. List MCP servers in the workspace (`get_mcp_mcp_servers`, or `mcp_server_get` for a known handle). Show name, handle, project, authentication method and `mcp_apps_count`. Ask which server and which app.
2. Make sure its project is hydrated: look for a `[[sync]]` entry in `Workspace Projects/.wk/wk.toml`. If missing, add one (`server_path`, `local_path` lowercase-hyphenated, `folder_id`, `project_id`) and run `wk pull --folder "<server path>"` from `Workspace Projects/`. Confirm the server's `*.mcp_server.json` and the app `*_mcp_app_*.bin` now exist locally.
3. Read the server JSON: authentication type, tools, the `apps` entry (`name`, `tool`, `content_digest`, `meta.csp`). Tell the user what you found, and that you will make a **copy** (step 4).

**New.** Ask for: server name, project/folder, description (this becomes the agent instructions, so write it as "when to call what, never state figures yourself"), which skills (tools) it exposes, which tool opens the app, and where the app HTML comes from (they supply it, or start from a Workato MCP app template). Create the server with the AIRO `mcp_server_create` tool, hydrate it with wk, then add the app entry and `.bin` as in step 4. Say plainly that from-scratch app creation is less tested than the copy route; check the result in the Workato UI.

## Step 3/9: Make the app self-contained
Copy the app HTML to a working folder and run:

```
node .agents/skills/workato-mcp-app-copilot/scripts/inline-ext-apps.js <app.html> <app.copilot.html>
```

It inlines the `@modelcontextprotocol/ext-apps` library, removes Google Fonts links and rewrites the import. It lists any remaining external URLs; ask the user about each (placeholders such as example links are fine). Then check the app by hand:
- Tool calls go through `app.callServerTool(...)`, not `fetch` to the server.
- External links use the host's `openLink` (`data-external` pattern), not bare `<a>` tags.
- Declarative agents ignore `frameDomains`, `baseUriDomains` and `permissions` in the CSP; they honour `connectDomains` and `resourceDomains`.
Remind the user to regression-test the original still works in Claude (it is untouched).

## Step 4/9: Create the Copilot copy of the server
Copy files in the hydrated project folder (names are examples; keep the `<server>_mcp_app_<slug>.bin` pattern):
1. `cp <server>.mcp_server.json <server>_copilot.mcp_server.json` and `cp <app>.copilot.html <server>_copilot_mcp_app_<slug>.bin`.
2. Edit the new server JSON: `name` "<name> (Copilot)", `auth_type` `workato_idp`, app `name` unique, `content_digest` = SHA-256 of the new `.bin`, and `meta.csp` = `{baseUriDomains: [], connectDomains: [], frameDomains: [], resourceDomains: [<widget host>]}`. Reuse the same tool references: the Copilot server shares the original skills, so no recipes are duplicated.
3. `wk push --folder "<server path>" --dry-run`; only the two new files should be listed. Then push.
4. Read the new server (`mcp_server_get`) and take its `mcp_url`. **The URL is different from the original's**, and the widget host depends on it:
   `node .agents/skills/workato-mcp-app-copilot/scripts/widget-host.js <mcp_url>` prints the host. Put it into `resourceDomains` in the server JSON.
5. A push of the server JSON alone fails with "Missing binary for MCP app": the `.bin` is only uploaded when it changed. Append a one-line HTML comment to the `.bin`, recompute `content_digest`, dry-run (expect both files `updated`), push. Do not use `--force`.
6. Re-pull and confirm `auth_type` and the CSP are as intended.

## Step 5/9: Who gets access? (user group)
`workato_idp` only lets signed-in users through if the server has an assigned **user group**. A server with none can send users round a sign-in loop.
1. List groups (`get_mcp_user_groups`) with member counts.
2. Ask with AskUserQuestion: **use an existing group, or make a new one?** Recommend the smallest group that contains the people who will test. You cannot read group membership through the API, so say so, and ask whether the user is in the chosen group.
3. Existing: confirm, then `post_mcp_mcp_servers_assign_user_groups` with the chosen group ID. New: create it (`post_user_groups`), then tell the user members are managed in the Workato admin settings and who needs adding; assign it to the server.
4. Read the server back and confirm `idp_user_group_ids`. State clearly who now has access.

## Step 6/9: Build the declarative agent
Work in a new folder in the user's workspace repo (ask where). Scaffold and attach the server with the toolkit, non-interactively:

```
npx -y @microsoft/m365agentstoolkit-cli@<version> new -c declarative-agent -n <agent-name> -f <parent-folder> -i false --telemetry false
cd <parent-folder>/<agent-name>
npx -y @microsoft/m365agentstoolkit-cli@<version> add action --api-plugin-type mcp \
  --mcp-da-server-url <mcp_url>/mcp --mcp-da-auth-type oauth-dynamic -i false --telemetry false
```

This writes `appPackage/ai-plugin.json` (a `RemoteMCPServer` runtime with dynamic tool discovery) and a `dcr/register` step in `m365agents.yml` that registers an OAuth client with Workato ID at provision time. Then edit, using `references/agent-templates.md`:
- `appPackage/declarativeAgent.json`: name, description, `instructions` file.
- `appPackage/instruction.txt`: derive from the server description (which tool to call when; never state figures itself). Remove the scaffold's boilerplate.
- `appPackage/manifest.json`: developer name and URLs, short and full names and descriptions.
- `env/.env.dev`: `MCP_SERVER_URL=<mcp_url>` (the `dcr/register` step in `m365agents.yml` should read `${{MCP_SERVER_URL}}/mcp`; the add-action command writes the literal URL, replace it). `MCP_DA_AUTH_ID` is written by provision.
Check the package builds offline with placeholder values: `... package --env dev -i false` (set `TEAMS_APP_ID` and `MCP_DA_AUTH_ID` to dummies on the command line; delete `appPackage/build` afterwards).

## Step 7/9: Provision
Ask the user to run (browser sign-in needed): `! cd <agent folder> && npx @microsoft/m365agentstoolkit-cli provision --env dev`. It creates the Teams app, registers the OAuth client, validates the package and publishes the agent at the chosen scope. Read the output for `M365_TITLE_ID` and `SHARE_LINK`. The share link is `https://m365.cloud.microsoft/chat/?titleId=<title id>`. If provision fails, read the error and fix the file named; re-running is safe.

## Step 8/9: Test and troubleshoot
Open the share link, select the agent, ask it to open the app. Check, in order:
1. **The widget renders** (screens, not just text).
2. **A button that calls a server tool works** (this proves `callServerTool` through Copilot, the least documented part).
3. **A write works** (and tell the user it wrote a real row if the tools write data).

| Symptom | Likely cause and fix |
|---|---|
| Sign-in popup stuck on a blank "Working..." page, SAML requests cycling | Server has no user group, or the user is not in it (step 5). Also try Chrome or Edge, allow popups and third-party cookies, sign in to Microsoft first. |
| Text only, no screens | Copilot Studio agent, or the tool does not return a `ui://` resource, or the resource is not `text/html;profile=mcp-app`. |
| Widget blank | The widget host in `resourceDomains` was computed for the wrong server URL (step 4.4), or the page loads an external script. |
| 403 from a downstream API | The downstream connection lacks permissions; fix on that system's side, not in Copilot. |
| `Missing binary for MCP app` on push | `.bin` unchanged (step 4.5). |
| Provision: `MissingEnvironmentVariablesError` | A `${{VAR}}` in a manifest has no value in `env/.env.dev`. |

## Step 9/9: Record and commit
Summarise what was created (server copy, group, agent, share link) and what is manual. Write a short note in the user's project folder with the agent location, the server handle, the group and the lessons. `env/.env.dev` holds the tenant ID and app IDs: commit it only to the **private** workspace repo. Confirm which repo before committing, and never commit anything from the workspace to the public `workato-code-driven-dev` repo.

## Notes
- Authentication end state is usually Microsoft Entra SSO. This skill uses Workato ID first because it needs no Entra app registration; switching later means a different `auth` block in `ai-plugin.json` and an Entra app, with the server's `required_oauth_scopes` and the Entra redirect `https://teams.microsoft.com/api/platform/v1.0/oAuthConsentRedirect`.
- Dynamic client registration is available when the server's Workato ID metadata (`<mcp_url>/.well-known/oauth-protected-resource`, then the authorization server's `.well-known/oauth-authorization-server`) lists a `registration_endpoint`. Check it before step 6.
- The toolkit CLI is evolving; run `<command> --help` if a flag fails and adapt.
- Sources: Microsoft Learn "MCP Apps in declarative agents", "Build MCP plugins", "Plugin authentication", "Dynamic tool discovery"; the `@modelcontextprotocol/ext-apps` package.
