# Manual fallback: Entra side (portal), per Workato "SAML SSO with Entra"

Use for any step `provision.js` lists under "Left for you". Entity ID `https://<host>/portal/sso/saml/metadata`, Reply URL `https://<host>/portal/sso/saml/acs`.

1. Entra admin center > **Entra ID > Enterprise apps > All applications > New application > Create your own application**. Name it, choose **Integrate any other application you don't find in the gallery (Non-gallery)**, **Create**.
2. **Manage > Single sign-on > SAML > Basic SAML Configuration > Edit**: Identifier = Entity ID, Reply URL = ACS URL, **Save**.
3. **Attributes & Claims > Edit > + Add new claim**: Name `workato_app_user_name`, Source attribute `user.displayname`, **Save**.
4. Optional group sync: **+ Add a group claim**: Groups assigned to the application; Source attribute **Cloud-only group display names**; **Customize the name of the group claim** enabled; Name `workato_app_user_groups`; Namespace empty; **Save**.
5. **Single sign-on > SAML Certificates**: copy the **App Federation Metadata URL**.
6. **Manage > Users and groups > + Add user/group**: assign groups (names must exactly match the portal's user group names) or users, **Assign**.

Workato side: **Platform > Workflow apps portal > Portal settings > Security**. Authentication method = SAML based SSO; metadata URL = Yes + paste; set **Enforce SAML authentication for**; optional JIT provisioning and **Enable user groups syncing**; **Save changes**.

Likely failures (not in Workato's doc; Microsoft behaviour, verify): AADSTS50146 = no app-specific signing certificate while a claims policy is attached; AADSTS700016 / AADSTS50105 = Entity ID mismatch or user not assigned to the app.
