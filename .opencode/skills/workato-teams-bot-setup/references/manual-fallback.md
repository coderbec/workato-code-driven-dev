# Manual fallback checklist

Use these only for steps the scripts could not do. Everything here mirrors Workato's "Create a Microsoft Teams Enterprise Workbot" guide.

## Workato: custom bot (always manual)
- [ ] Platform > Workbot > Custom bots > Create a custom bot > **Workbot for Microsoft Teams**, name = the bot name > Create new app
- [ ] Copy the **Bot endpoint address** (`https://<host>/skype_webhooks/event?coak_id=N`)

## Entra redirect URI (if `provision.js` could not set it)
- [ ] Azure portal > App registrations > the bot > Authentication: supported account types **Accounts in any organizational directory (Multitenant)**
- [ ] Add a platform > Web > redirect URI for the data centre: `https://www.workato.com/oauth/callback` (US), `https://app.<code>.workato.com/oauth/callback` (eu, jp, sg, au, il, kr, uk, trial) > Configure

## Teams Developer Portal (if a `teams app update` / manifest step failed)
- [ ] Apps > the app > Configure > Basic information: short (<=80) and long (<=4000) description, developer name, https website, privacy and terms links
- [ ] Application (client) ID = the Bot ID
- [ ] Configure > Domains: `*.workato.com`
- [ ] Configure > App features > Bot: select the bot, tick **Upload and download files**, scopes **Personal**, **Team**, **Group Chat**
- [ ] Add command `help` ("Type 'help' to view available commands") for Personal, Team and Group Chat

## Workato OAuth profile (if step 7 failed and `workato-profile.js` did not help)
- [ ] Workbot Step 3: Client ID = Bot ID, Client secret = a new secret from Entra > Certificates & secrets (copy the Value; it is shown once), Application ID = Teams App ID

## Publish (if `publish.js` could not call Graph)
- [ ] Teams Admin Center > Teams apps > Manage apps > Upload new app (admin), or in Teams: Apps > Manage your apps > Upload an app > **Submit an app to your org** (then an admin approves under Manage apps)

## Add the bot
- [ ] In a Teams chat or channel type `@`, Get bots, pick the bot; send `help`
- [ ] Set a reminder for the client secret expiry (Entra > Certificates & secrets)
