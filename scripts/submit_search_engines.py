#!/usr/bin/env python3
"""
HyperTrace — Automated Search Engine Submission & Indexing Script
Pings Google, Bing/IndexNow, and Yandex crawlers with the live sitemap URL.
"""

import urllib.request
import urllib.parse
import ssl
import sys

SITEMAP_URL = "https://hypertrace.flugelsoft.com/sitemap.xml"

SEARCH_ENGINES = [
    {
        "name": "Google Search Console Ping",
        "url": f"https://www.google.com/ping?sitemap={urllib.parse.quote(SITEMAP_URL)}"
    },
    {
        "name": "Bing / Yahoo / DuckDuckGo Webmaster Ping",
        "url": f"https://www.bing.com/ping?sitemap={urllib.parse.quote(SITEMAP_URL)}"
    },
    {
        "name": "Yandex Search Engine Ping",
        "url": f"https://blogs.yandex.ru/pings/?status=success&url={urllib.parse.quote(SITEMAP_URL)}"
    }
]

def submit_sitemap():
    print("======================================================================")
    print("🔍 HyperTrace Search Engine Automated Submission Suite")
    print(f"🌐 Target Sitemap: {SITEMAP_URL}")
    print("======================================================================")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for engine in SEARCH_ENGINES:
        name = engine["name"]
        url = engine["url"]
        print(f"\n📡 Pinging {name}...")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (HyperTrace SearchEngine Submitter)"})
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                code = response.getcode()
                print(f"✅ SUCCESS ({name}) - Status Code: {code}")
        except Exception as e:
            print(f"ℹ️  Response ({name}): {e}")

    print("\n======================================================================")
    print("🎉 Search Engine Sitemap Pings Completed!")
    print("======================================================================")

if __name__ == "__main__":
    submit_sitemap()
