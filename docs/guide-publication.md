# Publish the shared installation guides

The reviewed sources in this repository are `codex-install-protocol.md` and
`claude-code-install-protocol.md`. The production website serves mutable GCS
objects rather than reading GitHub at request time. Merging these documents alone
therefore does not update the website. No plugin version bump is needed when
only these external protocols and release checks change.

Publish each reviewed document to `opus-video-tools/guides/codex.md` or
`opus-video-tools/guides/claude.md` in the `stg-opus-lab-public` and
`opus-lab-public` buckets. Follow the owning application's release authorization.
For each object, read its current generation and save those exact bytes for
rollback before updating. Use `gcloud storage cp --if-generation-match=<generation>`
with `--content-type='text/markdown; charset=utf-8'` and `--cache-control=no-store`.
A precondition failure means someone published newer content: inspect it before
retrying; never overwrite it blindly.

After publishing staging, run `npm run guides:check -- --realm staging` from the
reviewed source checkout. After the authorized production publication, run the
same command with `--realm prod`. The check requires identical SHA-256 bytes from
the CDN and both products' public Markdown reader routes for both clients. It
fails on stale content, login HTML, redirects, network errors and non-200 responses.
It performs no authenticated or billable action.

Record source commit, previous/new object generations, content hashes and the
check result in the release/PR evidence. Roll back by restoring the saved bytes
using the failed publication's generation as the precondition, then verify the
reader routes again. Keep Claude and Codex endpoint instructions consistent;
staging guides intentionally install the same production plugin.
