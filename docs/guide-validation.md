# Validate the installation guides

The shared guide sources are [Claude Code](claude-code-install-protocol.md) and
[Codex](codex-install-protocol.md). Keep their installation identities, connection
checks and host-specific instructions consistent with the plugin.

Run `npm test` before submitting a change. `npm run guides:check -- --realm prod`
compares the public website documents with this checkout. A mismatch means the
website and source differ; a failed request is not evidence that they match.
Merging a source change does not automatically update the website.

If a website reader is unavailable or returns an access page, use the supported
public source fallback instead:

- [Claude Code raw guide](https://raw.githubusercontent.com/opus-pro/opusclip-video-tools/main/docs/claude-code-install-protocol.md)
- [Codex raw guide](https://raw.githubusercontent.com/opus-pro/opusclip-video-tools/main/docs/codex-install-protocol.md)

A readable guide does not prove a working installation or authentication. Follow
its actual tool-discovery and identity checks; do not generate paid media as a
connectivity test. Keep contribution descriptions focused on public behavior and
validation, without private operational records.
