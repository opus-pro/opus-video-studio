# Brand Auto Helper

Use this helper for real brand, logo, product, website, packaging, proprietary UI, and trademark
text accuracy. It is a cross-cutting helper, not a primary workflow.

## Trigger

Enable this helper when the request mentions or depends on:

- a real brand, product, company, website, app, logo, wordmark, packaging, label, SKU, or
  proprietary UI
- a branded ad, product demo, site promo, packaging shot, logo reveal, brand CTA, or real UI screen
- official brand/product assets uploaded or linked by the user

If the user explicitly writes `+brand`, enable this helper too.

## Workflow

- Inspect user-provided official assets before discovery.
- If the user gives a public brand or product URL, inspect the page directly, identify the 1-3
  exact official candidate images or visible product crops worth using, and download/capture only
  those candidates before planning. Do not bulk-download page, navigation, recommendation, or
  carousel assets just to sort them later.
- If those official image assets cannot be downloaded but the product/packaging is visible in the
  browser, capture the official page view and crop/save the visible product/packaging as a
  lower-fidelity candidate before generating an approximate anchor.
- If the user names a real brand but gives no URL or asset, search for an official public brand or
  product page first. Inspect candidate pages, choose at most 3 relevant official candidates, then
  download only those selected assets.
- Use Codex's normal web/page inspection, network download, and built-in image understanding for
  brand research. Do not rely on HTML logo scraping heuristics.
- Open downloaded candidates with Codex's own image-viewing ability and reject unrelated images
  before using any of them as an identity anchor.
- If discovery exposes more than 3 plausible assets, list/select the best 1-3 by relevance before
  downloading. The selected set should be enough to ground the plan, not an exhaustive scrape.
- Open screenshot/crop candidates too, and label them as official-page screenshots in the plan
  gate.
- Include selected and unused brand assets in the storyboard plan gate.
- Open a human gate for any generated or selected brand/product anchor before paid video.
- Pass approved brand/product references to every paid call where identity matters.

## Do Not

Do not invent a logo, wordmark, packaging, or official product design and present it as verified.
Only generate an approximate brand/product anchor after official asset download and official page
screenshot/crop are both unavailable or unusable; disclose that limitation and offer user upload as
the higher-fidelity route.
