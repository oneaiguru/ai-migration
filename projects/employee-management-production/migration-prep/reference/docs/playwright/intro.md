---
source: https://playwright.dev/docs/intro
date_fetched: 2025-10-07
format: gfm
---

Installation \| Playwright

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

**Playwright**<a href="/docs/intro" class="navbar__item navbar__link navbar__link--active" aria-current="page">Docs</a><a href="/docs/api/class-playwright" class="navbar__item navbar__link">API</a>

<div class="navbar__item dropdown dropdown--hoverable">

<a href="#" class="navbar__link" aria-haspopup="true" aria-expanded="false" role="button">Node.js</a>

- <a href="/docs/intro" class="dropdown__link undefined dropdown__link--active" target="_self" rel="noopener noreferrer" data-language-prefix="/">Node.js</a>
- <a href="/python/docs/intro" class="dropdown__link" target="_self" rel="noopener noreferrer" data-language-prefix="/python/">Python</a>
- <a href="/java/docs/intro" class="dropdown__link" target="_self" rel="noopener noreferrer" data-language-prefix="/java/">Java</a>
- <a href="/dotnet/docs/intro" class="dropdown__link" target="_self" rel="noopener noreferrer" data-language-prefix="/dotnet/">.NET</a>

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

  <a href="/docs/intro" class="menu__link menu__link--sublist menu__link--sublist-caret menu__link--active" role="button" aria-expanded="true">Getting Started</a>

  </div>

  - <a href="/docs/intro" class="menu__link menu__link--active" aria-current="page" tabindex="0">Installation</a>
  - <a href="/docs/writing-tests" class="menu__link" tabindex="0">Writing tests</a>
  - <a href="/docs/codegen-intro" class="menu__link" tabindex="0">Generating tests</a>
  - <a href="/docs/running-tests" class="menu__link" tabindex="0">Running and debugging tests</a>
  - <a href="/docs/trace-viewer-intro" class="menu__link" tabindex="0">Trace viewer</a>
  - <a href="/docs/ci-intro" class="menu__link" tabindex="0">Setting up CI</a>

- <a href="/docs/getting-started-vscode" class="menu__link">Getting started - VS Code</a>

- <a href="/docs/release-notes" class="menu__link">Release notes</a>

- <a href="/docs/canary-releases" class="menu__link">Canary releases</a>

- <div class="menu__list-item-collapsible">

  <a href="/docs/test-agents" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true">Playwright Test</a>

  </div>

  - <a href="/docs/test-agents" class="menu__link" tabindex="0">Agents</a>
  - <a href="/docs/test-annotations" class="menu__link" tabindex="0">Annotations</a>
  - <a href="/docs/test-cli" class="menu__link" tabindex="0">Command line</a>
  - <a href="/docs/test-configuration" class="menu__link" tabindex="0">Configuration</a>
  - <a href="/docs/test-use-options" class="menu__link" tabindex="0">Configuration (use)</a>
  - <a href="/docs/emulation" class="menu__link" tabindex="0">Emulation</a>
  - <a href="/docs/test-fixtures" class="menu__link" tabindex="0">Fixtures</a>
  - <a href="/docs/test-global-setup-teardown" class="menu__link" tabindex="0">Global setup and teardown</a>
  - <a href="/docs/test-parallel" class="menu__link" tabindex="0">Parallelism</a>
  - <a href="/docs/test-parameterize" class="menu__link" tabindex="0">Parameterize tests</a>
  - <a href="/docs/test-projects" class="menu__link" tabindex="0">Projects</a>
  - <a href="/docs/test-reporters" class="menu__link" tabindex="0">Reporters</a>
  - <a href="/docs/test-retries" class="menu__link" tabindex="0">Retries</a>
  - <a href="/docs/test-sharding" class="menu__link" tabindex="0">Sharding</a>
  - <a href="/docs/test-timeouts" class="menu__link" tabindex="0">Timeouts</a>
  - <a href="/docs/test-typescript" class="menu__link" tabindex="0">TypeScript</a>
  - <a href="/docs/test-ui-mode" class="menu__link" tabindex="0">UI Mode</a>
  - <a href="/docs/test-webserver" class="menu__link" tabindex="0">Web server</a>

- <div class="menu__list-item-collapsible">

  <a href="/docs/library" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="true">Guides</a>

  </div>

  - <a href="/docs/library" class="menu__link" tabindex="0">Library</a>
  - <a href="/docs/accessibility-testing" class="menu__link" tabindex="0">Accessibility testing</a>
  - <a href="/docs/input" class="menu__link" tabindex="0">Actions</a>
  - <a href="/docs/test-assertions" class="menu__link" tabindex="0">Assertions</a>
  - <a href="/docs/api-testing" class="menu__link" tabindex="0">API testing</a>
  - <a href="/docs/auth" class="menu__link" tabindex="0">Authentication</a>
  - <a href="/docs/actionability" class="menu__link" tabindex="0">Auto-waiting</a>
  - <a href="/docs/best-practices" class="menu__link" tabindex="0">Best Practices</a>
  - <a href="/docs/browsers" class="menu__link" tabindex="0">Browsers</a>
  - <a href="/docs/chrome-extensions" class="menu__link" tabindex="0">Chrome extensions</a>
  - <a href="/docs/clock" class="menu__link" tabindex="0">Clock</a>
  - <a href="/docs/test-components" class="menu__link" tabindex="0">Components (experimental)</a>
  - <a href="/docs/debug" class="menu__link" tabindex="0">Debugging Tests</a>
  - <a href="/docs/dialogs" class="menu__link" tabindex="0">Dialogs</a>
  - <a href="/docs/downloads" class="menu__link" tabindex="0">Downloads</a>
  - <a href="/docs/evaluating" class="menu__link" tabindex="0">Evaluating JavaScript</a>
  - <a href="/docs/events" class="menu__link" tabindex="0">Events</a>
  - <a href="/docs/extensibility" class="menu__link" tabindex="0">Extensibility</a>
  - <a href="/docs/frames" class="menu__link" tabindex="0">Frames</a>
  - <a href="/docs/handles" class="menu__link" tabindex="0">Handles</a>
  - <a href="/docs/browser-contexts" class="menu__link" tabindex="0">Isolation</a>
  - <a href="/docs/locators" class="menu__link" tabindex="0">Locators</a>
  - <a href="/docs/mock" class="menu__link" tabindex="0">Mock APIs</a>
  - <a href="/docs/mock-browser-apis" class="menu__link" tabindex="0">Mock browser APIs</a>
  - <a href="/docs/navigations" class="menu__link" tabindex="0">Navigations</a>
  - <a href="/docs/network" class="menu__link" tabindex="0">Network</a>
  - <a href="/docs/other-locators" class="menu__link" tabindex="0">Other locators</a>
  - <a href="/docs/pages" class="menu__link" tabindex="0">Pages</a>
  - <a href="/docs/pom" class="menu__link" tabindex="0">Page object models</a>
  - <a href="/docs/screenshots" class="menu__link" tabindex="0">Screenshots</a>
  - <a href="/docs/aria-snapshots" class="menu__link" tabindex="0">Snapshot testing</a>
  - <a href="/docs/codegen" class="menu__link" tabindex="0">Test generator</a>
  - <a href="/docs/touch-events" class="menu__link" tabindex="0">Touch events (legacy)</a>
  - <a href="/docs/trace-viewer" class="menu__link" tabindex="0">Trace viewer</a>
  - <a href="/docs/videos" class="menu__link" tabindex="0">Videos</a>
  - <a href="/docs/test-snapshots" class="menu__link" tabindex="0">Visual comparisons</a>
  - <a href="/docs/webview2" class="menu__link" tabindex="0">WebView2</a>

- <div class="menu__list-item-collapsible">

  <a href="/docs/protractor" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="false">Migration</a>

  </div>

- <div class="menu__list-item-collapsible">

  <a href="/docs/docker" class="menu__link menu__link--sublist menu__link--sublist-caret" role="button" aria-expanded="false">Integrations</a>

  </div>

- <a href="/docs/languages" class="menu__link">Supported languages</a>

</div>

</div>

<div class="docMainContainer_TBSr" role="main">

<div class="container padding-top--md padding-bottom--lg">

<div class="row">

<div class="col docItemCol_VOVn">

<div class="docItemContainer_Djhp">

- <a href="/" class="breadcrumbs__link" aria-label="Home page"><img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMjQgMjQiIGNsYXNzPSJicmVhZGNydW1iSG9tZUljb25fWU5GVCI+PHBhdGggZD0iTTEwIDE5di01aDR2NWMwIC41NS40NSAxIDEgMWgzYy41NSAwIDEtLjQ1IDEtMXYtN2gxLjdjLjQ2IDAgLjY4LS41Ny4zMy0uODdMMTIuNjcgMy42Yy0uMzgtLjM0LS45Ni0uMzQtMS4zNCAwbC04LjM2IDcuNTNjLS4zNC4zLS4xMy44Ny4zMy44N0g1djdjMCAuNTUuNDUgMSAxIDFoM2MuNTUgMCAxLS40NSAxLTF6IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvcGF0aD48L3N2Zz4=" class="breadcrumbHomeIcon_YNFT" /></a>
- <span class="breadcrumbs__link">Getting Started</span>
- <span class="breadcrumbs__link">Installation</span>

<div class="tocCollapsible_ETCw theme-doc-toc-mobile tocMobile_ITEo">

On this page

</div>

<div class="theme-doc-markdown markdown">

<div>

# Installation

</div>

## Introduction<a href="#introduction" class="hash-link" aria-label="Direct link to Introduction" title="Direct link to Introduction">​</a>

Playwright Test is an end-to-end test framework for modern web apps. It bundles test runner, assertions, isolation, parallelization and rich tooling. Playwright supports Chromium, WebKit and Firefox on Windows, Linux and macOS, locally or in CI, headless or headed, with native mobile emulation for Chrome (Android) and Mobile Safari.

**You will learn**

- [How to install Playwright](/docs/intro#installing-playwright)
- [What's installed](/docs/intro#whats-installed)
- [How to run the example test](/docs/intro#running-the-example-test)
- [How to open the HTML test report](/docs/intro#html-test-reports)

## Installing Playwright<a href="#installing-playwright" class="hash-link" aria-label="Direct link to Installing Playwright" title="Direct link to Installing Playwright">​</a>

Get started by installing Playwright using one of the following methods.

### Using npm, yarn or pnpm<a href="#using-npm-yarn-or-pnpm" class="hash-link" aria-label="Direct link to Using npm, yarn or pnpm" title="Direct link to Using npm, yarn or pnpm">​</a>

The command below either initializes a new project or adds Playwright to an existing one.

<div class="tabs-container tabList__CuJ">

- npm
- yarn
- pnpm

<div class="margin-top--md">

<div class="tabItem_Ymn6" role="tabpanel">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
npm init playwright@latest
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
yarn create playwright
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
pnpm create playwright
```

</div>

</div>

</div>

</div>

</div>

When prompted, choose / confirm:

- TypeScript or JavaScript (default: TypeScript)
- Tests folder name (default: `tests`, or `e2e` if `tests` already exists)
- Add a GitHub Actions workflow (recommended for CI)
- Install Playwright browsers (default: yes)

You can re-run the command later; it does not overwrite existing tests.

### Using the VS Code Extension<a href="#using-the-vs-code-extension" class="hash-link" aria-label="Direct link to Using the VS Code Extension" title="Direct link to Using the VS Code Extension">​</a>

You can also create and run tests with the [VS Code Extension](/docs/getting-started-vscode).

## What's Installed<a href="#whats-installed" class="hash-link" aria-label="Direct link to What&#39;s Installed" title="Direct link to What&#39;s Installed">​</a>

Playwright downloads required browser binaries and creates the scaffold below.

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
playwright.config.ts         # Test configuration
package.json
package-lock.json            # Or yarn.lock / pnpm-lock.yaml
tests/
  example.spec.ts            # Minimal example test
tests-examples/
  demo-todo-app.spec.ts      # Richer example tests
```

</div>

</div>

The [playwright.config](/docs/test-configuration) centralizes configuration: target browsers, timeouts, retries, projects, reporters and more. In existing projects dependencies are added to your current `package.json`.

`tests/` contains a minimal starter test. `tests-examples/` provides richer samples (e.g. a todo app) to explore patterns.

## Running the Example Test<a href="#running-the-example-test" class="hash-link" aria-label="Direct link to Running the Example Test" title="Direct link to Running the Example Test">​</a>

By default tests run headless in parallel across Chromium, Firefox and WebKit (configurable in [playwright.config](/docs/test-configuration)). Output and aggregated results display in the terminal.

<div class="tabs-container tabList__CuJ">

- npm
- yarn
- pnpm

<div class="margin-top--md">

<div class="tabItem_Ymn6" role="tabpanel">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
npx playwright test
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
yarn playwright test
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
pnpm exec playwright test
```

</div>

</div>

</div>

</div>

</div>

<img src="/assets/images/run-tests-cli-6e7e3119a14239c9021b406d7109dc44.png" class="img_ev3q" decoding="async" loading="lazy" width="1724" height="658" alt="tests running in command line" />

Tips:

- See the browser window: add `--headed`.
- Run a single project/browser: `--project=chromium`.
- Run one file: `npx playwright test tests/example.spec.ts`.
- Open testing UI: `--ui`.

See [Running Tests](/docs/running-tests) for details on filtering, headed mode, sharding and retries.

## HTML Test Reports<a href="#html-test-reports" class="hash-link" aria-label="Direct link to HTML Test Reports" title="Direct link to HTML Test Reports">​</a>

After a test run, the [HTML Reporter](/docs/test-reporters#html-reporter) provides a dashboard filterable by the browser, passed, failed, skipped, flaky and more. Click a test to inspect errors, attachments and steps. It auto-opens only when failures occur; open manually with the command below.

<div class="tabs-container tabList__CuJ">

- npm
- yarn
- pnpm

<div class="margin-top--md">

<div class="tabItem_Ymn6" role="tabpanel">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
npx playwright show-report
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
yarn playwright show-report
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
pnpm exec playwright show-report
```

</div>

</div>

</div>

</div>

</div>

<img src="/assets/images/html-report-basic-8a88e44830660bfd1da1d17a7241f035.png" class="img_ev3q" decoding="async" loading="lazy" width="4032" height="2244" alt="HTML Report" />

## Running the Example Test in UI Mode<a href="#running-the-example-test-in-ui-mode" class="hash-link" aria-label="Direct link to Running the Example Test in UI Mode" title="Direct link to Running the Example Test in UI Mode">​</a>

Run tests with [UI Mode](/docs/test-ui-mode) for watch mode, live step view, time travel debugging and more.

<div class="tabs-container tabList__CuJ">

- npm
- yarn
- pnpm

<div class="margin-top--md">

<div class="tabItem_Ymn6" role="tabpanel">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
npx playwright test --ui
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
yarn playwright test --ui
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
pnpm exec playwright test --ui
```

</div>

</div>

</div>

</div>

</div>

<img src="/assets/images/ui-mode-1958baf0398aef5e9c9b5c68c5d56f2d.png" class="img_ev3q" decoding="async" loading="lazy" width="3598" height="2184" alt="UI Mode" />

See the [detailed guide on UI Mode](/docs/test-ui-mode) for watch filters, step details and trace integration.

## Updating Playwright<a href="#updating-playwright" class="hash-link" aria-label="Direct link to Updating Playwright" title="Direct link to Updating Playwright">​</a>

Update Playwright and download new browser binaries and their dependencies:

<div class="tabs-container tabList__CuJ">

- npm
- yarn
- pnpm

<div class="margin-top--md">

<div class="tabItem_Ymn6" role="tabpanel">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
npm install -D @playwright/test@latest
npx playwright install --with-deps
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
yarn add --dev @playwright/test@latest
yarn playwright install --with-deps
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
pnpm install --save-dev @playwright/test@latest
pnpm exec playwright install --with-deps
```

</div>

</div>

</div>

</div>

</div>

Check your installed version:

<div class="tabs-container tabList__CuJ">

- npm
- yarn
- pnpm

<div class="margin-top--md">

<div class="tabItem_Ymn6" role="tabpanel">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
npx playwright --version
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
yarn playwright --version
```

</div>

</div>

</div>

<div class="tabItem_Ymn6" role="tabpanel" hidden="">

<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#D4D4D4;--prism-background-color:#212121">

<div class="codeBlockContent_QJqH">

``` prism-code
pnpm exec playwright --version
```

</div>

</div>

</div>

</div>

</div>

## System requirements<a href="#system-requirements" class="hash-link" aria-label="Direct link to System requirements" title="Direct link to System requirements">​</a>

- Node.js: latest 20.x, 22.x or 24.x.
- Windows 11+, Windows Server 2019+ or Windows Subsystem for Linux (WSL).
- macOS 14 (Ventura) or later.
- Debian 12 / 13, Ubuntu 22.04 / 24.04 (x86-64 or arm64).

## What's next<a href="#whats-next" class="hash-link" aria-label="Direct link to What&#39;s next" title="Direct link to What&#39;s next">​</a>

- [Write tests using web-first assertions, fixtures and locators](/docs/writing-tests)
- [Run single or multiple tests; headed mode](/docs/running-tests)
- [Generate tests with Codegen](/docs/codegen-intro)
- [View a trace of your tests](/docs/trace-viewer-intro)

</div>

<a href="/docs/writing-tests" class="pagination-nav__link pagination-nav__link--next"></a>

<div class="pagination-nav__sublabel">

Next

</div>

<div class="pagination-nav__label">

Writing tests

</div>

</div>

</div>

<div class="col col--3">

<div class="tableOfContents_bqdL thin-scrollbar theme-doc-toc-desktop">

- <a href="#introduction" class="table-of-contents__link toc-highlight">Introduction</a>
- <a href="#installing-playwright" class="table-of-contents__link toc-highlight">Installing Playwright</a>
  - <a href="#using-npm-yarn-or-pnpm" class="table-of-contents__link toc-highlight">Using npm, yarn or pnpm</a>
  - <a href="#using-the-vs-code-extension" class="table-of-contents__link toc-highlight">Using the VS Code Extension</a>
- <a href="#whats-installed" class="table-of-contents__link toc-highlight">What's Installed</a>
- <a href="#running-the-example-test" class="table-of-contents__link toc-highlight">Running the Example Test</a>
- <a href="#html-test-reports" class="table-of-contents__link toc-highlight">HTML Test Reports</a>
- <a href="#running-the-example-test-in-ui-mode" class="table-of-contents__link toc-highlight">Running the Example Test in UI Mode</a>
- <a href="#updating-playwright" class="table-of-contents__link toc-highlight">Updating Playwright</a>
- <a href="#system-requirements" class="table-of-contents__link toc-highlight">System requirements</a>
- <a href="#whats-next" class="table-of-contents__link toc-highlight">What's next</a>

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
