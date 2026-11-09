# Declarative agent templates (placeholders only)

Replace every `<...>`. These match what the Agents Toolkit CLI generated when this skill was written (declarative agent schema v1.9, plugin schema v2.4, Teams manifest 1.30, `m365agents.yml` v1.13). Run the CLI first and edit what it generates; use these to check the result.

## appPackage/declarativeAgent.json
```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.9/schema.json",
  "version": "v1.9",
  "name": "<Agent display name>${{APP_NAME_SUFFIX}}",
  "description": "<One sentence: what the agent does>",
  "instructions": "$[file('instruction.txt')]",
  "actions": [{ "id": "<action id>", "file": "ai-plugin.json" }]
}
```

## appPackage/ai-plugin.json (Workato ID, dynamic tool discovery)
```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json",
  "schema_version": "v2.4",
  "name_for_human": "<Plugin name>",
  "namespace": "<lowercase namespace>",
  "description_for_human": "<One line>",
  "description_for_model": "<Copy of the MCP server description: when to call what, never state figures yourself>",
  "functions": [],
  "runtimes": [
    {
      "type": "RemoteMCPServer",
      "auth": { "type": "OAuthPluginVault", "reference_id": "${{MCP_DA_AUTH_ID}}" },
      "spec": { "url": "${{MCP_SERVER_URL}}/mcp" },
      "run_for_functions": ["*"]
    }
  ]
}
```
Entra SSO uses the same shape with the Entra auth configuration's ID as `reference_id`. `"auth": { "type": "None" }` is for development only.

## appPackage/instruction.txt
```
You help <audience> <do the job>.

- When the user wants <X>, call <open-app tool>. The app it shows runs the request, so do not narrate its steps.
- When the user gives <reference> and asks about it, call <status tool>.
- Never calculate, estimate or state figures yourself. They come only from the tool's governed output.
- This build covers <scope>. For anything else, say it is not available yet.
```

## appPackage/manifest.json (fields to set)
`developer.name`, `websiteUrl`, `privacyUrl`, `termsOfUseUrl` (https, same domain family); `name.short` / `name.full`; `description.short` (80 chars max) / `description.full`; keep `copilotAgents.declarativeAgents[0].file` = `declarativeAgent.json`; `validDomains: []`.

## m365agents.yml: registration step (added by `add action ... oauth-dynamic`)
```yaml
  - uses: dcr/register
    with:
      name: <short name, lowercase>
      appId: ${{TEAMS_APP_ID}}
      applicableToApps: AnyApp
      targetAudience: HomeTenant
      mcpResourceUrl: ${{MCP_SERVER_URL}}/mcp
      targetUrlsShouldStartWith:
        - ${{MCP_SERVER_URL}}/mcp
    writeToEnvironmentFile:
      configurationId: MCP_DA_AUTH_ID
```
It sits right after `teamsApp/create` in the `provision` stage. The file header should read `version: v1.13`.

## env/.env.dev
```
MCP_SERVER_URL=<https://NNNN.apim.mcp.<dc>.workato.com>
MCP_DA_AUTH_ID=          # written by provision
```
Provision also writes `TEAMS_APP_ID`, `TEAMS_APP_TENANT_ID`, `M365_TITLE_ID`, `M365_APP_ID`, `SHARE_LINK`. The secret part goes to `env/.env.dev.user` (gitignored).

## MCP server JSON for the Copilot copy (changed fields)
```json
{
  "name": "<name> (Copilot)",
  "auth_type": "workato_idp",
  "apps": [{
    "name": "<app name, unique>",
    "content_digest": "<sha256 of the .bin>",
    "tool": "<same tool reference as the original>",
    "meta": { "csp": {
      "baseUriDomains": [], "connectDomains": [], "frameDomains": [],
      "resourceDomains": ["<widget host from scripts/widget-host.js>"]
    } }
  }]
}
```
Everything else (tools, references) stays as in the original so the copy shares its skills.
