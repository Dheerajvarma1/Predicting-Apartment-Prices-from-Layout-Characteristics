from playwright.sync_api import sync_playwright
import json
import re


def extract_samolet_flat_data(url: str) -> dict:

    if "samolet.ru" not in url:
        raise Exception("Invalid Samolet URL")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(url, wait_until="networkidle", timeout=60000)

        # Wait a bit to ensure hydration
        page.wait_for_timeout(3000)

        html = page.content()

        browser.close()

    # Search for Nuxt JSON manually inside HTML
    match = re.search(
        r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>',
        html,
        re.DOTALL
    )

    if not match:
        raise Exception("Nuxt data script not found in page HTML")

    script_content = match.group(1).strip()

    try:
        nuxt_json = json.loads(script_content)
    except json.JSONDecodeError:
        raise Exception("Failed to parse Nuxt JSON")

    return nuxt_json