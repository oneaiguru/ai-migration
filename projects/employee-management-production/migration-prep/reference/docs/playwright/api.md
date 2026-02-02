---
source: https://playwright.dev/docs/api/class-playwright
date_fetched: 2025-10-07
format: gfm
---

Playwright Library \| Playwright

![](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJkaXNwbGF5OiBub25lOyI+PGRlZnM+CjxzeW1ib2wgaWQ9InRoZW1lLXN2Zy1leHRlcm5hbC1saW5rIiB2aWV3Ym94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTIxIDEzdjEwaC0yMXYtMTloMTJ2MmgtMTB2MTVoMTd2LThoMnptMy0xMmgtMTAuOTg4bDQuMDM1IDQtNi45NzcgNy4wNyAyLjgyOCAyLjgyOCA2Ljk3Ny03LjA3IDQuMTI1IDQuMTcydi0xMXoiPjwvcGF0aD48L3N5bWJvbD4KPC9kZWZzPjwvc3ZnPg==)

<div id="__docusaurus">

<div role="region" aria-label="Skip to main content">

<a href="#__docusaurus_skipToContent_fallback" class="skipToContent_fXgn">Skip to main content</a>

</div>

<div class="navbar__inner">

<div class="theme-layout-navbar-left navbar__items">

![](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdib3g9IjAgMCAzMCAzMCIgYXJpYS1oaWRkZW49InRydWUiPjxwYXRoIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNNCA3aDIyTTQgMTVoMjJNNCAyM2gyMiI+PC9wYXRoPjwvc3ZnPg==)

<a href="/" class="navbar__brand"></a>

<div class="navbar__logo">

<img src="/img/playwright-logo.svg" class="themedComponent_mlkZ themedComponent--light_NVdE" alt="Playwright logo" /><img src="/img/playwright-logo.svg" class="themedComponent_mlkZ themedComponent--dark_xIcU" alt="Playwright logo" />

</div>

**Playwright**<a href="/docs/intro" class="navbar__item navbar__link">Docs</a><a href="/docs/api/class-playwright" class="navbar__item navbar__link navbar__link--active" aria-current="page">API</a>

<div class="navbar__item dropdown dropdown--hoverable">

<a href="#" class="navbar__link" aria-haspopup="true" aria-expanded="false" role="button">Node.js</a>

- <a href="/docs/api/class-playwright" class="dropdown__link undefined dropdown__link--active" target="_self" rel="noopener noreferrer" data-language-prefix="/">Node.js</a>
- <a href="/python/docs/api/class-playwright" class="dropdown__link" target="_self" rel="noopener noreferrer" data-language-prefix="/python/">Python</a>
- <a href="/java/docs/api/class-playwright" class="dropdown__link" target="_self" rel="noopener noreferrer" data-language-prefix="/java/">Java</a>
- <a href="/dotnet/docs/api/class-playwright" class="dropdown__link" target="_self" rel="noopener noreferrer" data-language-prefix="/dotnet/">.NET</a>

</div>

<a href="/community/welcome" class="navbar__item navbar__link">Community</a>

</div>

<div class="theme-layout-navbar-right navbar__items navbar__items--right">

<a href="https://github.com/microsoft/playwright" class="navbar__item navbar__link header-github-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"></a><a href="https://aka.ms/playwright/discord" class="navbar__item navbar__link header-discord-link" target="_blank" rel="noopener noreferrer" aria-label="Discord server"></a>

<div class="toggle_vylO colorModeToggle_DEke">

<img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgYXJpYS1oaWRkZW49InRydWUiIGNsYXNzPSJ0b2dnbGVJY29uX2czZVAgbGlnaHRUb2dnbGVJY29uX3B5aFIiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTEyLDljMS42NSwwLDMsMS4zNSwzLDNzLTEuMzUsMy0zLDNzLTMtMS4zNS0zLTNTMTAuMzUsOSwxMiw5IE0xMiw3Yy0yLjc2LDAtNSwyLjI0LTUsNXMyLjI0LDUsNSw1czUtMi4yNCw1LTUgUzE0Ljc2LDcsMTIsN0wxMiw3eiBNMiwxM2wyLDBjMC41NSwwLDEtMC40NSwxLTFzLTAuNDUtMS0xLTFsLTIsMGMtMC41NSwwLTEsMC40NS0xLDFTMS40NSwxMywyLDEzeiBNMjAsMTNsMiwwYzAuNTUsMCwxLTAuNDUsMS0xIHMtMC40NS0xLTEtMWwtMiwwYy0wLjU1LDAtMSwwLjQ1LTEsMVMxOS40NSwxMywyMCwxM3ogTTExLDJ2MmMwLDAuNTUsMC40NSwxLDEsMXMxLTAuNDUsMS0xVjJjMC0wLjU1LTAuNDUtMS0xLTFTMTEsMS40NSwxMSwyeiBNMTEsMjB2MmMwLDAuNTUsMC40NSwxLDEsMXMxLTAuNDUsMS0xdi0yYzAtMC41NS0wLjQ1LTEtMS0xQzExLjQ1LDE5LDExLDE5LjQ1LDExLDIweiBNNS45OSw0LjU4Yy0wLjM5LTAuMzktMS4wMy0wLjM5LTEuNDEsMCBjLTAuMzksMC4zOS0wLjM5LDEuMDMsMCwxLjQxbDEuMDYsMS4wNmMwLjM5LDAuMzksMS4wMywwLjM5LDEuNDEsMHMwLjM5LTEuMDMsMC0xLjQxTDUuOTksNC41OHogTTE4LjM2LDE2Ljk1IGMtMC4zOS0wLjM5LTEuMDMtMC4zOS0xLjQxLDBjLTAuMzksMC4zOS0wLjM5LDEuMDMsMCwxLjQxbDEuMDYsMS4wNmMwLjM5LDAuMzksMS4wMywwLjM5LDEuNDEsMGMwLjM5LTAuMzksMC4zOS0xLjAzLDAtMS40MSBMMTguMzYsMTYuOTV6IE0xOS40Miw1Ljk5YzAuMzktMC4zOSwwLjM5LTEuMDMsMC0xLjQxYy0wLjM5LTAuMzktMS4wMy0wLjM5LTEuNDEsMGwtMS4wNiwxLjA2Yy0wLjM5LDAuMzktMC4zOSwxLjAzLDAsMS40MSBzMS4wMywwLjM5LDEuNDEsMEwxOS40Miw1Ljk5eiBNNy4wNSwxOC4zNmMwLjM5LTAuMzksMC4zOS0xLjAzLDAtMS40MWMtMC4zOS0wLjM5LTEuMDMtMC4zOS0xLjQxLDBsLTEuMDYsMS4wNiBjLTAuMzksMC4zOS0wLjM5LDEuMDMsMCwxLjQxczEuMDMsMC4zOSwxLjQxLDBMNy4wNSwxOC4zNnoiPjwvcGF0aD48L3N2Zz4=" class="toggleIcon_g3eP lightToggleIcon_pyhR" /><img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgYXJpYS1oaWRkZW49InRydWUiIGNsYXNzPSJ0b2dnbGVJY29uX2czZVAgZGFya1RvZ2dsZUljb25fd2ZnUiI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNOS4zNyw1LjUxQzkuMTksNi4xNSw5LjEsNi44Miw5LjEsNy41YzAsNC4wOCwzLjMyLDcuNCw3LjQsNy40YzAuNjgsMCwxLjM1LTAuMDksMS45OS0wLjI3QzE3LjQ1LDE3LjE5LDE0LjkzLDE5LDEyLDE5IGMtMy44NiwwLTctMy4xNC03LTdDNSw5LjA3LDYuODEsNi41NSw5LjM3LDUuNTF6IE0xMiwzYy00Ljk3LDAtOSw0LjAzLTksOXM0LjAzLDksOSw5czktNC4wMyw5LTljMC0wLjQ2LTAuMDQtMC45Mi0wLjEtMS4zNiBjLTAuOTgsMS4zNy0yLjU4LDIuMjYtNC40LDIuMjZjLTIuOTgsMC01LjQtMi40Mi01LjQtNS40YzAtMS44MSwwLjg5LTMuNDIsMi4yNi00LjRDMTIuOTIsMy4wNCwxMi40NiwzLDEyLDNMMTIsM3oiPjwvcGF0aD48L3N2Zz4=" class="toggleIcon_g3eP darkToggleIcon_wfgR" /><img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgYXJpYS1oaWRkZW49InRydWUiIGNsYXNzPSJ0b2dnbGVJY29uX2czZVAgc3lzdGVtVG9nZ2xlSWNvbl9Rem1DIj48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Im0xMiAyMWM0Ljk3MSAwIDktNC4wMjkgOS05cy00LjAyOS05LTktOS05IDQuMDI5LTkgOSA0LjAyOSA5IDkgOXptNC45NS0xMy45NWMxLjMxMyAxLjMxMyAyLjA1IDMuMDkzIDIuMDUgNC45NXMtMC43MzggMy42MzctMi4wNSA0Ljk1Yy0xLjMxMyAxLjMxMy0zLjA5MyAyLjA1LTQuOTUgMi4wNXYtMTRjMS44NTcgMCAzLjYzNyAwLjczNyA0Ljk1IDIuMDV6Ij48L3BhdGg+PC9zdmc+" class="toggleIcon_g3eP systemToggleIcon_QzmC" />

</div>

<div class="navbarSearchContainer_Bca1">

<span class="DocSearch-Button-Container"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGNsYXNzPSJEb2NTZWFyY2gtU2VhcmNoLUljb24iIHZpZXdib3g9IjAgMCAyMCAyMCIgYXJpYS1oaWRkZW49InRydWUiPjxwYXRoIGQ9Ik0xNC4zODYgMTQuMzg2bDQuMDg3NyA0LjA4NzctNC4wODc3LTQuMDg3N2MtMi45NDE4IDIuOTQxOS03LjcxMTUgMi45NDE5LTEwLjY1MzMgMC0yLjk0MTktMi45NDE4LTIuOTQxOS03LjcxMTUgMC0xMC42NTMzIDIuOTQxOC0yLjk0MTkgNy43MTE1LTIuOTQxOSAxMC42NTMzIDAgMi45NDE5IDIuOTQxOCAyLjk0MTkgNy43MTE1IDAgMTAuNjUzM3oiIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPjwvc3ZnPg==" class="DocSearch-Search-Icon" /><span class="DocSearch-Button-Placeholder">Search</span></span><span class="DocSearch-Button-Keys"></span>

</div>

</div>

</div>

<div class="navbar-sidebar__backdrop" role="presentation">

</div>

<div id="__docusaurus_skipToContent_fallback" class="theme-layout-main main-wrapper mainWrapper_z2l0">

<div class="docsWrapper_hBAB">

<div class="docRoot_UBD9">

<div class="sidebarViewport_aRkj">

<div class="sidebar_njMd">

- <div class="menu__list-item-collapsible">

  <a href="/docs/api/class-test" class="menu__link menu__link--sublist menu__link--sublist-caret menu__link--active" role="button" aria-expanded="true">API reference</a>

  </div>

  - <a href="/docs/api/class-test" class="menu__link" tabindex="0">Playwright Test</a>

  - <a href="/docs/api/class-playwright" class="menu__link menu__link--active" aria-current="page" tabindex="0">Playwright Library</a>

  - <div class="menu__list-item-collapsible">

    <a href="/docs/api/class-apirequest" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true" tabindex="0">Classes</a>

    </div>

    - <a href="/docs/api/class-apirequest" class="menu__link" tabindex="0">APIRequest</a>
    - <a href="/docs/api/class-apirequestcontext" class="menu__link" tabindex="0">APIRequestContext</a>
    - <a href="/docs/api/class-apiresponse" class="menu__link" tabindex="0">APIResponse</a>
    - <a href="/docs/api/class-accessibility" class="menu__link" tabindex="0">Accessibility</a>
    - <a href="/docs/api/class-browser" class="menu__link" tabindex="0">Browser</a>
    - <a href="/docs/api/class-browsercontext" class="menu__link" tabindex="0">BrowserContext</a>
    - <a href="/docs/api/class-browserserver" class="menu__link" tabindex="0">BrowserServer</a>
    - <a href="/docs/api/class-browsertype" class="menu__link" tabindex="0">BrowserType</a>
    - <a href="/docs/api/class-cdpsession" class="menu__link" tabindex="0">CDPSession</a>
    - <a href="/docs/api/class-clock" class="menu__link" tabindex="0">Clock</a>
    - <a href="/docs/api/class-consolemessage" class="menu__link" tabindex="0">ConsoleMessage</a>
    - <a href="/docs/api/class-coverage" class="menu__link" tabindex="0">Coverage</a>
    - <a href="/docs/api/class-dialog" class="menu__link" tabindex="0">Dialog</a>
    - <a href="/docs/api/class-download" class="menu__link" tabindex="0">Download</a>
    - <a href="/docs/api/class-elementhandle" class="menu__link" tabindex="0">ElementHandle</a>
    - <a href="/docs/api/class-filechooser" class="menu__link" tabindex="0">FileChooser</a>
    - <a href="/docs/api/class-frame" class="menu__link" tabindex="0">Frame</a>
    - <a href="/docs/api/class-framelocator" class="menu__link" tabindex="0">FrameLocator</a>
    - <a href="/docs/api/class-jshandle" class="menu__link" tabindex="0">JSHandle</a>
    - <a href="/docs/api/class-keyboard" class="menu__link" tabindex="0">Keyboard</a>
    - <a href="/docs/api/class-locator" class="menu__link" tabindex="0">Locator</a>
    - <a href="/docs/api/class-logger" class="menu__link" tabindex="0">Logger</a>
    - <a href="/docs/api/class-mouse" class="menu__link" tabindex="0">Mouse</a>
    - <a href="/docs/api/class-page" class="menu__link" tabindex="0">Page</a>
    - <a href="/docs/api/class-request" class="menu__link" tabindex="0">Request</a>
    - <a href="/docs/api/class-response" class="menu__link" tabindex="0">Response</a>
    - <a href="/docs/api/class-route" class="menu__link" tabindex="0">Route</a>
    - <a href="/docs/api/class-selectors" class="menu__link" tabindex="0">Selectors</a>
    - <a href="/docs/api/class-timeouterror" class="menu__link" tabindex="0">TimeoutError</a>
    - <a href="/docs/api/class-touchscreen" class="menu__link" tabindex="0">Touchscreen</a>
    - <a href="/docs/api/class-tracing" class="menu__link" tabindex="0">Tracing</a>
    - <a href="/docs/api/class-video" class="menu__link" tabindex="0">Video</a>
    - <a href="/docs/api/class-weberror" class="menu__link" tabindex="0">WebError</a>
    - <a href="/docs/api/class-websocket" class="menu__link" tabindex="0">WebSocket</a>
    - <a href="/docs/api/class-websocketroute" class="menu__link" tabindex="0">WebSocketRoute</a>
    - <a href="/docs/api/class-worker" class="menu__link" tabindex="0">Worker</a>

  - <div class="menu__list-item-collapsible">

    <a href="/docs/api/class-apiresponseassertions" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true" tabindex="0">Assertions</a>

    </div>

    - <a href="/docs/api/class-apiresponseassertions" class="menu__link" tabindex="0">APIResponseAssertions</a>
    - <a href="/docs/api/class-genericassertions" class="menu__link" tabindex="0">GenericAssertions</a>
    - <a href="/docs/api/class-locatorassertions" class="menu__link" tabindex="0">LocatorAssertions</a>
    - <a href="/docs/api/class-pageassertions" class="menu__link" tabindex="0">PageAssertions</a>
    - <a href="/docs/api/class-snapshotassertions" class="menu__link" tabindex="0">SnapshotAssertions</a>

  - <div class="menu__list-item-collapsible">

    <a href="/docs/api/class-fixtures" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true" tabindex="0">Test Runner</a>

    </div>

    - <a href="/docs/api/class-fixtures" class="menu__link" tabindex="0">Fixtures</a>
    - <a href="/docs/api/class-fullconfig" class="menu__link" tabindex="0">FullConfig</a>
    - <a href="/docs/api/class-fullproject" class="menu__link" tabindex="0">FullProject</a>
    - <a href="/docs/api/class-location" class="menu__link" tabindex="0">Location</a>
    - <a href="/docs/api/class-test" class="menu__link" tabindex="0">Playwright Test</a>
    - <a href="/docs/api/class-testconfig" class="menu__link" tabindex="0">TestConfig</a>
    - <a href="/docs/api/class-testinfo" class="menu__link" tabindex="0">TestInfo</a>
    - <a href="/docs/api/class-testinfoerror" class="menu__link" tabindex="0">TestInfoError</a>
    - <a href="/docs/api/class-testoptions" class="menu__link" tabindex="0">TestOptions</a>
    - <a href="/docs/api/class-testproject" class="menu__link" tabindex="0">TestProject</a>
    - <a href="/docs/api/class-teststepinfo" class="menu__link" tabindex="0">TestStepInfo</a>
    - <a href="/docs/api/class-workerinfo" class="menu__link" tabindex="0">WorkerInfo</a>

  - <div class="menu__list-item-collapsible">

    <a href="/docs/api/class-reporter" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true" tabindex="0">Test Reporter</a>

    </div>

    - <a href="/docs/api/class-reporter" class="menu__link" tabindex="0">Reporter</a>
    - <a href="/docs/api/class-suite" class="menu__link" tabindex="0">Suite</a>
    - <a href="/docs/api/class-testcase" class="menu__link" tabindex="0">TestCase</a>
    - <a href="/docs/api/class-testerror" class="menu__link" tabindex="0">TestError</a>
    - <a href="/docs/api/class-testresult" class="menu__link" tabindex="0">TestResult</a>
    - <a href="/docs/api/class-teststep" class="menu__link" tabindex="0">TestStep</a>

  - <div class="menu__list-item-collapsible">

    <a href="/docs/api/class-android" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true" tabindex="0">Experimental</a>

    </div>

    - <a href="/docs/api/class-android" class="menu__link" tabindex="0">Android</a>
    - <a href="/docs/api/class-androiddevice" class="menu__link" tabindex="0">AndroidDevice</a>
    - <a href="/docs/api/class-androidinput" class="menu__link" tabindex="0">AndroidInput</a>
    - <a href="/docs/api/class-androidsocket" class="menu__link" tabindex="0">AndroidSocket</a>
    - <a href="/docs/api/class-androidwebview" class="menu__link" tabindex="0">AndroidWebView</a>
    - <a href="/docs/api/class-electron" class="menu__link" tabindex="0">Electron</a>
    - <a href="/docs/api/class-electronapplication" class="menu__link" tabindex="0">ElectronApplication</a>

</div>

</div>

<div class="docMainContainer_TBSr" role="main">

<div class="container padding-top--md padding-bottom--lg">

<div class="row">

<div class="col docItemCol_VOVn">

<div class="docItemContainer_Djhp">

- <a href="/" class="breadcrumbs__link" aria-label="Home page"><img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIGNsYXNzPSJicmVhZGNydW1iSG9tZUljb25fWU5GVCI+PHBhdGggZD0iTTEwIDE5di01aDR2NWMwIC41NS40NSAxIDEgMWgzYy41NSAwIDEtLjQ1IDEtMXYtN2gxLjdjLjQ2IDAgLjY4LS41Ny4zMy0uODdMMTIuNjcgMy42Yy0uMzgtLjM0LS45Ni0uMzQtMS4zNCAwbC04LjM2IDcuNTNjLS4zNC4zLS4xMy44Ny4zMy44N0g1djdjMCAuNTUuNDUgMSAxIDFoM2MuNTUgMCAxLS40NSAxLTF6IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvcGF0aD48L3N2Zz4=" class="breadcrumbHomeIcon_YNFT" /></a>
- <span class="breadcrumbs__link">API reference</span>
- <span class="breadcrumbs__link">Playwright Library</span>

<div class="tocCollapsible_ETCw theme-doc-toc-mobile tocMobile_ITEo">

On this page

</div>

<div class="theme-doc-markdown markdown">

<div>

# Playwright Library

</div>

Playwright module provides a method to launch a browser instance. The following is a typical example of using Playwright to drive automation:

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
const { chromium, firefox, webkit } = require('playwright');

(async () => {
  const browser = await chromium.launch();  // Or 'firefox' or 'webkit'.
  const page = await browser.newPage();
  await page.goto('http://example.com');
  // other actions...
  await browser.close();
})();
```

</div>

</div>

------------------------------------------------------------------------

## Properties<a href="#properties" class="hash-link" aria-label="Direct link to Properties" title="Direct link to Properties">​</a>

### chromium<a href="#playwright-chromium" class="hash-link" aria-label="Direct link to chromium" title="Direct link to chromium">​</a>

Added before v1.9 playwright.chromium

This object can be used to launch or connect to Chromium, returning instances of [Browser](/docs/api/class-browser "Browser").

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.chromium
```

</div>

</div>

**Type**

- [BrowserType](/docs/api/class-browsertype "BrowserType")

------------------------------------------------------------------------

### devices<a href="#playwright-devices" class="hash-link" aria-label="Direct link to devices" title="Direct link to devices">​</a>

Added before v1.9 playwright.devices

Returns a dictionary of devices to be used with [browser.newContext()](/docs/api/class-browser#browser-new-context) or [browser.newPage()](/docs/api/class-browser#browser-new-page).

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
const { webkit, devices } = require('playwright');
const iPhone = devices['iPhone 6'];

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    ...iPhone
  });
  const page = await context.newPage();
  await page.goto('http://example.com');
  // other actions...
  await browser.close();
})();
```

</div>

</div>

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.devices
```

</div>

</div>

**Type**

- <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object" target="_blank" rel="noopener noreferrer" title="Object">Object</a>

------------------------------------------------------------------------

### errors<a href="#playwright-errors" class="hash-link" aria-label="Direct link to errors" title="Direct link to errors">​</a>

Added before v1.9 playwright.errors

Playwright methods might throw errors if they are unable to fulfill a request. For example, [locator.waitFor()](/docs/api/class-locator#locator-wait-for) might fail if the selector doesn't match any nodes during the given timeframe.

For certain types of errors Playwright uses specific error classes. These classes are available via [`playwright.errors`](#playwright-errors).

An example of handling a timeout error:

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
try {
  await page.locator('.foo').waitFor();
} catch (e) {
  if (e instanceof playwright.errors.TimeoutError) {
    // Do something if this is a timeout.
  }
}
```

</div>

</div>

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.errors
```

</div>

</div>

**Type**

- <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object" target="_blank" rel="noopener noreferrer" title="Object">Object</a>
  - `TimeoutError` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function" target="_blank" rel="noopener noreferrer" title="Function">function</a>

    A class of [TimeoutError](/docs/api/class-timeouterror "TimeoutError").

------------------------------------------------------------------------

### firefox<a href="#playwright-firefox" class="hash-link" aria-label="Direct link to firefox" title="Direct link to firefox">​</a>

Added before v1.9 playwright.firefox

This object can be used to launch or connect to Firefox, returning instances of [Browser](/docs/api/class-browser "Browser").

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.firefox
```

</div>

</div>

**Type**

- [BrowserType](/docs/api/class-browsertype "BrowserType")

------------------------------------------------------------------------

### request<a href="#playwright-request" class="hash-link" aria-label="Direct link to request" title="Direct link to request">​</a>

Added in: v1.16 playwright.request

Exposes API that can be used for the Web API testing.

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.request
```

</div>

</div>

**Type**

- [APIRequest](/docs/api/class-apirequest "APIRequest")

------------------------------------------------------------------------

### selectors<a href="#playwright-selectors" class="hash-link" aria-label="Direct link to selectors" title="Direct link to selectors">​</a>

Added before v1.9 playwright.selectors

Selectors can be used to install custom selector engines. See [extensibility](/docs/extensibility) for more information.

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.selectors
```

</div>

</div>

**Type**

- [Selectors](/docs/api/class-selectors "Selectors")

------------------------------------------------------------------------

### webkit<a href="#playwright-webkit" class="hash-link" aria-label="Direct link to webkit" title="Direct link to webkit">​</a>

Added before v1.9 playwright.webkit

This object can be used to launch or connect to WebKit, returning instances of [Browser](/docs/api/class-browser "Browser").

**Usage**

<div class="language-js codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.webkit
```

</div>

</div>

**Type**

- [BrowserType](/docs/api/class-browsertype "BrowserType")

</div>

<a href="/docs/api/class-test" class="pagination-nav__link pagination-nav__link--prev"></a>

<div class="pagination-nav__sublabel">

Previous

</div>

<div class="pagination-nav__label">

Playwright Test

</div>

<a href="/docs/api/class-apirequest" class="pagination-nav__link pagination-nav__link--next"></a>

<div class="pagination-nav__sublabel">

Next

</div>

<div class="pagination-nav__label">

APIRequest

</div>

</div>

</div>

<div class="col col--3">

<div class="tableOfContents_bqdL thin-scrollbar theme-doc-toc-desktop">

- <a href="#properties" class="table-of-contents__link toc-highlight">Properties</a>
  - <a href="#playwright-chromium" class="table-of-contents__link toc-highlight">chromium</a>
  - <a href="#playwright-devices" class="table-of-contents__link toc-highlight">devices</a>
  - <a href="#playwright-errors" class="table-of-contents__link toc-highlight">errors</a>
  - <a href="#playwright-firefox" class="table-of-contents__link toc-highlight">firefox</a>
  - <a href="#playwright-request" class="table-of-contents__link toc-highlight">request</a>
  - <a href="#playwright-selectors" class="table-of-contents__link toc-highlight">selectors</a>
  - <a href="#playwright-webkit" class="table-of-contents__link toc-highlight">webkit</a>

</div>

</div>

</div>

</div>

</div>

</div>

</div>

</div>

<div class="container container-fluid">

<div class="row footer__links">

<div class="theme-layout-footer-column col footer__col">

<div class="footer__title">

Learn

</div>

- <a href="/docs/intro" class="footer__link-item">Getting started</a>
- <a href="https://learn.microsoft.com/en-us/training/modules/build-with-playwright/" class="footer__link-item" target="_blank" rel="noopener noreferrer">Playwright Training<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="/community/learn-videos" class="footer__link-item">Learn Videos</a>
- <a href="/community/feature-videos" class="footer__link-item">Feature Videos</a>

</div>

<div class="theme-layout-footer-column col footer__col">

<div class="footer__title">

Community

</div>

- <a href="https://stackoverflow.com/questions/tagged/playwright" class="footer__link-item" target="_blank" rel="noopener noreferrer">Stack Overflow<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="https://aka.ms/playwright/discord" class="footer__link-item" target="_blank" rel="noopener noreferrer">Discord<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="https://twitter.com/playwrightweb" class="footer__link-item" target="_blank" rel="noopener noreferrer">Twitter<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="https://www.linkedin.com/company/playwrightweb" class="footer__link-item" target="_blank" rel="noopener noreferrer">LinkedIn<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>

</div>

<div class="theme-layout-footer-column col footer__col">

<div class="footer__title">

More

</div>

- <a href="https://github.com/microsoft/playwright" class="footer__link-item" target="_blank" rel="noopener noreferrer">GitHub<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="https://www.youtube.com/channel/UC46Zj8pDH5tDosqm1gd7WTg" class="footer__link-item" target="_blank" rel="noopener noreferrer">YouTube<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="https://dev.to/playwright" class="footer__link-item" target="_blank" rel="noopener noreferrer">Blog<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMy41IiBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9Imljb25FeHRlcm5hbExpbmtfblBJVSI+PHVzZSBocmVmPSIjdGhlbWUtc3ZnLWV4dGVybmFsLWxpbmsiPjwvdXNlPjwvc3ZnPg==" class="iconExternalLink_nPIU" /></a>
- <a href="/community/ambassadors" class="footer__link-item">Ambassadors</a>

</div>

</div>

<div class="footer__bottom text--center">

<div class="footer__copyright">

Copyright © 2025 Microsoft

</div>

</div>

</div>

</div>
