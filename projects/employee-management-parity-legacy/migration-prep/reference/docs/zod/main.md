---
source: https://zod.dev/
date_fetched: 2025-10-07
format: gfm
---

<div id="zod4" class="sticky top-0 z-40 flex flex-row items-center justify-center bg-fd-secondary px-4 text-center text-sm font-medium" style="height:3rem">

💎 Zod 4 is now stable!  <a href="/v4" class="underline">Read the announcement.</a>

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXgiPjxwYXRoIGQ9Ik0xOCA2IDYgMTgiPjwvcGF0aD48cGF0aCBkPSJtNiA2IDEyIDEyIj48L3BhdGg+PC9zdmc+" class="lucide lucide-x" />

</div>

<div id="inkeep-shadowradix-«R2lb»" style="display:contents">

</div>

<div id="nd-subnav" class="sticky top-(--fd-banner-height) z-30 flex h-14 flex-row items-center border-b border-fd-foreground/10 px-4 backdrop-blur-lg transition-colors md:hidden">

<a href="/" class="inline-flex items-center gap-2.5 font-semibold"></a>

<div class="md:mb-0 md:h-7">

<img src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=3840&amp;q=75" class="hidden dark:block w-8" style="color:transparent" aria-label="Zod logo" loading="lazy" decoding="async" data-nimg="1" sizes="100px" srcset="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=16&amp;q=75 16w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=32&amp;q=75 32w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=48&amp;q=75 48w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=64&amp;q=75 64w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=96&amp;q=75 96w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=128&amp;q=75 128w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=256&amp;q=75 256w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=384&amp;q=75 384w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=640&amp;q=75 640w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=750&amp;q=75 750w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=828&amp;q=75 828w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=3840&amp;q=75 3840w" width="1024" height="846" alt="Zod logo" /><img src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=3840&amp;q=75" class="block dark:hidden w-8" style="color:transparent" aria-label="Zod logo" loading="lazy" decoding="async" data-nimg="1" sizes="100px" srcset="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=16&amp;q=75 16w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=32&amp;q=75 32w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=48&amp;q=75 48w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=64&amp;q=75 64w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=96&amp;q=75 96w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=128&amp;q=75 128w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=256&amp;q=75 256w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=384&amp;q=75 384w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=640&amp;q=75 640w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=750&amp;q=75 750w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=828&amp;q=75 828w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=3840&amp;q=75 3840w" width="1024" height="845" alt="Zod logo" />

</div>

<div class="flex flex-1 flex-row items-center gap-1">

</div>

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNlYXJjaCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCI+PC9jaXJjbGU+PHBhdGggZD0ibTIxIDIxLTQuMy00LjMiPjwvcGF0aD48L3N2Zz4=" class="lucide lucide-search" />

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1lbnUiPjxsaW5lIHgxPSI0IiB4Mj0iMjAiIHkxPSIxMiIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjQiIHgyPSIyMCIgeTE9IjYiIHkyPSI2Ij48L2xpbmU+PGxpbmUgeDE9IjQiIHgyPSIyMCIgeTE9IjE4IiB5Mj0iMTgiPjwvbGluZT48L3N2Zz4=" class="lucide lucide-menu" />

</div>

<div id="nd-docs-layout" class="flex flex-1 flex-row pe-(--fd-layout-offset) [--fd-tocnav-height:36px] md:[--fd-sidebar-width:268px] lg:[--fd-sidebar-width:286px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px] [--fd-nav-height:calc(var(--spacing)*14)] md:[--fd-nav-height:0px]" role="main" style="--fd-layout-offset:max(calc(50vw - var(--fd-layout-width) / 2), 0px)">

<div class="flex size-full max-w-full flex-col pt-2 md:ms-auto md:w-(--fd-sidebar-width) md:border-e md:pt-4">

<div class="flex flex-col gap-2 px-4 empty:hidden">

<div class="flex flex-row pt-1 max-md:hidden">

<a href="/" class="inline-flex text-[15px] items-center gap-2.5 font-medium"></a>

<div class="md:mb-0 md:h-7">

<img src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=3840&amp;q=75" class="hidden dark:block w-8" style="color:transparent" aria-label="Zod logo" loading="lazy" decoding="async" data-nimg="1" sizes="100px" srcset="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=16&amp;q=75 16w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=32&amp;q=75 32w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=48&amp;q=75 48w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=64&amp;q=75 64w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=96&amp;q=75 96w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=128&amp;q=75 128w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=256&amp;q=75 256w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=384&amp;q=75 384w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=640&amp;q=75 640w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=750&amp;q=75 750w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=828&amp;q=75 828w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-white.d29d7ce8.png&amp;w=3840&amp;q=75 3840w" width="1024" height="846" alt="Zod logo" /><img src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=3840&amp;q=75" class="block dark:hidden w-8" style="color:transparent" aria-label="Zod logo" loading="lazy" decoding="async" data-nimg="1" sizes="100px" srcset="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=16&amp;q=75 16w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=32&amp;q=75 32w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=48&amp;q=75 48w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=64&amp;q=75 64w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=96&amp;q=75 96w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=128&amp;q=75 128w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=256&amp;q=75 256w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=384&amp;q=75 384w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=640&amp;q=75 640w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=750&amp;q=75 750w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=828&amp;q=75 828w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=1080&amp;q=75 1080w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=1200&amp;q=75 1200w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=1920&amp;q=75 1920w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=2048&amp;q=75 2048w, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.34ce4c58.png&amp;w=3840&amp;q=75 3840w" width="1024" height="845" alt="Zod logo" />

</div>

</div>

<div class="relative" style="width:24px;height:20px">

<img src="/_next/image?url=%2Flogo%2Flogo.png&amp;w=48&amp;q=100" class="transition-opacity duration-300 opacity-0 h-5" style="color:transparent;width:auto;height:100%" loading="lazy" decoding="async" data-nimg="1" srcset="/_next/image?url=%2Flogo%2Flogo.png&amp;w=32&amp;q=100 1x, /_next/image?url=%2Flogo%2Flogo.png&amp;w=48&amp;q=100 2x" width="24" height="20" alt="Zod 4" />

</div>

<div class="flex-1 text-start">

Zod 4

The latest version of Zod

</div>

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb25zLXVwLWRvd24gc2l6ZS00IHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCI+PHBhdGggZD0ibTcgMTUgNSA1IDUtNSI+PC9wYXRoPjxwYXRoIGQ9Im03IDkgNS01IDUgNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevrons-up-down size-4 text-fd-muted-foreground" />

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNlYXJjaCBtcy0xIHNpemUtNCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCI+PC9jaXJjbGU+PHBhdGggZD0ibTIxIDIxLTQuMy00LjMiPjwvcGF0aD48L3N2Zz4=" class="lucide lucide-search ms-1 size-4" />Search

<div class="ms-auto inline-flex gap-0.5">

<span class="kbd rounded-md border bg-fd-background px-1.5">⌘</span><span class="kbd rounded-md border bg-fd-background px-1.5">K</span>

</div>

</div>

<div class="overflow-hidden h-full" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<div class="size-full rounded-[inherit] p-4" radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden;mask-image:linear-gradient(to bottom, transparent, white 12px)">

<div style="min-width:100%;display:table">

<div class="mb-4 empty:hidden">

</div>

Zod 4

<a href="/v4" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Release notes

</div>

<a href="/v4/changelog" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Migration guide

</div>

Documentation

<a href="/" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-fd-primary/10 text-fd-primary" data-active="true" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Intro

</div>

<a href="/basics" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Basic usage

</div>

<a href="/api" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Defining schemas

</div>

<a href="/error-customization" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Customizing errors

</div>

<a href="/error-formatting" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Formatting errors

</div>

<a href="/metadata" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Metadata and registries

<span class="ml-0 mb-[-1px] text-xs px-1.5 py-0.5 bg-[#00000010] dark:bg-[#ffffff10] rounded-md">New</span>

</div>

<a href="/json-schema" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

JSON Schema

<span class="ml-0 mb-[-1px] text-xs px-1.5 py-0.5 bg-[#00000010] dark:bg-[#ffffff10] rounded-md">New</span>

</div>

<a href="/codecs" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Codecs

<span class="ml-0 mb-[-1px] text-xs px-1.5 py-0.5 bg-[#00000010] dark:bg-[#ffffff10] rounded-md">New</span>

</div>

<a href="/ecosystem" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Ecosystem

</div>

<a href="/library-authors" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

For library authors

</div>

Packages

<a href="/packages/zod" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Zod

</div>

<a href="/packages/mini" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Zod Mini

<span class="ml-0 mb-[-1px] text-xs px-1.5 py-0.5 bg-[#00000010] dark:bg-[#ffffff10] rounded-md">New</span>

</div>

<a href="/packages/core" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Zod Core

<span class="ml-0 mb-[-1px] text-xs px-1.5 py-0.5 bg-[#00000010] dark:bg-[#ffffff10] rounded-md">New</span>

</div>

</div>

</div>

</div>

<div class="flex flex-col border-t px-4 py-3 empty:hidden">

<div class="flex flex-row items-center">

<a href="https://github.com/colinhacks/zod" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 [&amp;_svg]:size-5 text-fd-muted-foreground md:[&amp;_svg]:size-4.5" rel="noreferrer noopener" target="_blank" data-active="false"><img src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48dGl0bGU+Z2l0aHViIGxvZ288L3RpdGxlPjxwYXRoIGQ9Ik0xMiAuMjk3Yy02LjYzIDAtMTIgNS4zNzMtMTIgMTIgMCA1LjMwMyAzLjQzOCA5LjggOC4yMDUgMTEuMzg1LjYuMTEzLjgyLS4yNTguODItLjU3NyAwLS4yODUtLjAxLTEuMDQtLjAxNS0yLjA0LTMuMzM4LjcyNC00LjA0Mi0xLjYxLTQuMDQyLTEuNjFDNC40MjIgMTguMDcgMy42MzMgMTcuNyAzLjYzMyAxNy43Yy0xLjA4Ny0uNzQ0LjA4NC0uNzI5LjA4NC0uNzI5IDEuMjA1LjA4NCAxLjgzOCAxLjIzNiAxLjgzOCAxLjIzNiAxLjA3IDEuODM1IDIuODA5IDEuMzA1IDMuNDk1Ljk5OC4xMDgtLjc3Ni40MTctMS4zMDUuNzYtMS42MDUtMi42NjUtLjMtNS40NjYtMS4zMzItNS40NjYtNS45MyAwLTEuMzEuNDY1LTIuMzggMS4yMzUtMy4yMi0uMTM1LS4zMDMtLjU0LTEuNTIzLjEwNS0zLjE3NiAwIDAgMS4wMDUtLjMyMiAzLjMgMS4yMy45Ni0uMjY3IDEuOTgtLjM5OSAzLS40MDUgMS4wMi4wMDYgMi4wNC4xMzggMyAuNDA1IDIuMjgtMS41NTIgMy4yODUtMS4yMyAzLjI4NS0xLjIzLjY0NSAxLjY1My4yNCAyLjg3My4xMiAzLjE3Ni43NjUuODQgMS4yMyAxLjkxIDEuMjMgMy4yMiAwIDQuNjEtMi44MDUgNS42MjUtNS40NzUgNS45Mi40Mi4zNi44MSAxLjA5Ni44MSAyLjIyIDAgMS42MDYtLjAxNSAyLjg5Ni0uMDE1IDMuMjg2IDAgLjMxNS4yMS42OS44MjUuNTdDMjAuNTY1IDIyLjA5MiAyNCAxNy41OTIgMjQgMTIuMjk3YzAtNi42MjctNS4zNzMtMTItMTItMTIiPjwvcGF0aD48L3N2Zz4=" /></a>

<div class="flex-1" role="separator">

</div>

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtc3VuIHNpemUtNi41IHJvdW5kZWQtZnVsbCBwLTEuNSB0ZXh0LWZkLW11dGVkLWZvcmVncm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiPjwvY2lyY2xlPjxwYXRoIGQ9Ik0xMiAydjIiPjwvcGF0aD48cGF0aCBkPSJNMTIgMjB2MiI+PC9wYXRoPjxwYXRoIGQ9Im00LjkzIDQuOTMgMS40MSAxLjQxIj48L3BhdGg+PHBhdGggZD0ibTE3LjY2IDE3LjY2IDEuNDEgMS40MSI+PC9wYXRoPjxwYXRoIGQ9Ik0yIDEyaDIiPjwvcGF0aD48cGF0aCBkPSJNMjAgMTJoMiI+PC9wYXRoPjxwYXRoIGQ9Im02LjM0IDE3LjY2LTEuNDEgMS40MSI+PC9wYXRoPjxwYXRoIGQ9Im0xOS4wNyA0LjkzLTEuNDEgMS40MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-sun size-6.5 rounded-full p-1.5 text-fd-muted-foreground" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJjdXJyZW50Q29sb3IiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtbW9vbiBzaXplLTYuNSByb3VuZGVkLWZ1bGwgcC0xLjUgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIj48cGF0aCBkPSJNMTIgM2E2IDYgMCAwIDAgOSA5IDkgOSAwIDEgMS05LTlaIj48L3BhdGg+PC9zdmc+" class="lucide lucide-moon size-6.5 rounded-full p-1.5 text-fd-muted-foreground" />

</div>

</div>

</div>

<div id="nd-page" class="flex w-full min-w-0 flex-col">

<div class="sticky overflow-visible z-10 xl:hidden h-10" style="top:calc(var(--fd-banner-height) + var(--fd-nav-height))">

<div id="nd-tocnav" class="border-b border-fd-foreground/10 backdrop-blur-md transition-colors">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRleHQgc2l6ZS00IHNocmluay0wIj48cGF0aCBkPSJNMTcgNi4xSDMiPjwvcGF0aD48cGF0aCBkPSJNMjEgMTIuMUgzIj48L3BhdGg+PHBhdGggZD0iTTE1LjEgMThIMyI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-text size-4 shrink-0" />On this page<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLWFsbCBvcGFjaXR5LTAgLW1zLTEuNSI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right size-4 shrink-0 text-fd-muted-foreground transition-all opacity-0 -ms-1.5" /><span class="truncate text-fd-muted-foreground transition-opacity -ms-1.5 opacity-0"></span>

<div id="radix-«Rkuvbl5b»" class="overflow-hidden flex flex-col max-h-[50vh]" state="closed" hidden="" toc-popover="">

</div>

</div>

</div>

<div class="prose">

<div class="flex flex-col items-stretch text-center">

<div class="relative" style="height:170px">

<img src="/_next/image?url=%2Flogo%2Flogo-glow.png&amp;w=640&amp;q=100" class="block dark:hidden mx-auto my-0! transition-opacity duration-500 opacity-0" style="color:transparent;height:100%;width:auto" decoding="async" data-nimg="1" srcset="/_next/image?url=%2Flogo%2Flogo-glow.png&amp;w=256&amp;q=100 1x, /_next/image?url=%2Flogo%2Flogo-glow.png&amp;w=640&amp;q=100 2x" width="200" height="170" alt="Zod logo" /><img src="/_next/image?url=%2Flogo%2Flogo-glow.png&amp;w=640&amp;q=100" class="hidden dark:block mx-auto my-0! transition-opacity duration-500 opacity-0" style="color:transparent;height:100%;width:auto" decoding="async" data-nimg="1" srcset="/_next/image?url=%2Flogo%2Flogo-glow.png&amp;w=256&amp;q=100 1x, /_next/image?url=%2Flogo%2Flogo-glow.png&amp;w=640&amp;q=100 2x" width="200" height="170" alt="Zod logo" />

</div>

# Zod

TypeScript-first schema validation with static type inference  
by [@colinhacks](https://x.com/colinhacks)

  

<div class="flex flex-row flex-wrap justify-center gap-1 py-2">

<a href="https://github.com/colinhacks/zod/actions?query=branch%3Amain" class="border-none"><img src="https://github.com/colinhacks/zod/actions/workflows/test.yml/badge.svg?event=push&amp;branch=main" class="h-[20px] m-0!" alt="Zod CI status" /></a><a href="https://twitter.com/colinhacks" class="border-none" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@colinhacks-4BBAAB.svg" class="h-[20px] m-0!" alt="Created by Colin McDonnell" /></a><a href="https://opensource.org/licenses/MIT" class="border-none" rel="nofollow"><img src="https://img.shields.io/github/license/colinhacks/zod" class="h-[20px] m-0!" alt="License" /></a><a href="https://www.npmjs.com/package/zod" class="border-none" rel="nofollow"><img src="https://img.shields.io/npm/dw/zod.svg" class="h-[20px] m-0!" alt="npm" /></a><a href="https://github.com/colinhacks/zod" class="border-none" rel="nofollow"><img src="https://img.shields.io/github/stars/colinhacks/zod" class="h-[20px] m-0!" alt="stars" /></a>

</div>

<div class="flex flex-row justify-center gap-1">

[Website](https://zod.dev)  •  [Discord](https://discord.gg/RcG33DQJdf)  •  [𝕏](https://twitter.com/colinhacks)  •  [Bluesky](https://bsky.app/profile/zod.dev)  

</div>

</div>

  

<div class="mt-5 font-gray-100 mx-auto text-center pt-12">

Zod 4 is now stable! Read the <a href="/v4" rel="noopener noreferrer" alt="zod 4 release notes">release notes here</a>.

</div>

  
  
  

## Featured sponsor: Jazz

<div class="w-full flex flex-col items-stretch">

<a href="https://jazz.tools/?utm_source=zod" class="mt-0 mb-0 border-none"></a>

<div class="h-[320px] flex justify-center items-center m-1">

<img src="https://raw.githubusercontent.com/garden-co/jazz/938f6767e46cdfded60e50d99bf3b533f4809c68/homepage/homepage/public/Zod%20sponsor%20message.png" class="max-h-[300px] w-auto" alt="Jazz logo" />

</div>

Interested in featuring? <a href="/cdn-cgi/l/email-protection#2251524d4c514d50514a4b5262414d4e4b4c4a434149510c414d4f" target="_blank" rel="noopener noreferrer">Get in touch.</a>

</div>

## <a href="?id=introduction" class="peer" data-card="">Introduction</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod is a TypeScript-first validation library. Using Zod, you can define *schemas* you can use to validate data, from a simple `string` to a complex nested object.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>import * as z from &quot;zod&quot;;
 
const User = z.object({
  name: z.string(),
});
 
// some untrusted data...
const input = { /* stuff */ };
 
// the parsed result is validated and type safe!
const data = User.parse(input);
 
// so you can use it with confidence :)
console.log(data.name);</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=features" class="peer" data-card="">Features</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

- Zero external dependencies
- Works in Node.js and all modern browsers
- Tiny: 2kb core bundle (gzipped)
- Immutable API: methods return a new instance
- Concise interface
- Works with TypeScript and plain JS
- Built-in JSON Schema conversion
- Extensive ecosystem

## <a href="?id=installation" class="peer" data-card="">Installation</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>npm install zod</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

Zod is also available as `@zod/zod` on <a href="https://jsr.io/@zod/zod" rel="noreferrer noopener" target="_blank">jsr.io</a>.

</div>

</div>

</div>

Zod provides an MCP server that can be used by agents to search Zod's docs. To add to your editor, follow <a href="https://share.inkeep.com/zod/mcp" rel="noreferrer noopener" target="_blank">these instructions</a>. Zod also provides an <a href="https://zod.dev/llms.txt" rel="noreferrer noopener" target="_blank">llms.txt</a> file.

## <a href="?id=requirements" class="peer" data-card="">Requirements</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod is tested against *TypeScript v5.5* and later. Older versions may work but are not officially supported.

### <a href="?id=strict" class="peer" data-card=""><code>"strict"</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>// tsconfig.json
{
  // ...
  &quot;compilerOptions&quot;: {
    // ...
    &quot;strict&quot;: true
  }
}</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=ecosystem" class="peer" data-card="">Ecosystem</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod has a thriving ecosystem of libraries, tools, and integrations. Refer to the [Ecosystem page](/ecosystem) for a complete list of libraries that support Zod or are built on top of it.

- [Resources](/ecosystem?id=resources)
- [API Libraries](/ecosystem?id=api-libraries)
- [Form Integrations](/ecosystem?id=form-integrations)
- [Zod to X](/ecosystem?id=zod-to-x)
- [X to Zod](/ecosystem?id=x-to-zod)
- [Mocking Libraries](/ecosystem?id=mocking-libraries)
- [Powered by Zod](/ecosystem?id=powered-by-zod)

I also contribute to the following projects, which I'd like to highlight:

- <a href="https://trpc.io" rel="noreferrer noopener" target="_blank">tRPC</a> - End-to-end typesafe APIs, with support for Zod schemas
- <a href="https://react-hook-form.com" rel="noreferrer noopener" target="_blank">React Hook Form</a> - Hook-based form validation with a <a href="https://react-hook-form.com/docs/useform#resolver" rel="noreferrer noopener" target="_blank">Zod resolver</a>
- <a href="https://github.com/colinhacks/zshy" rel="noreferrer noopener" target="_blank">zshy</a> - Originally created as Zod's internal build tool. Bundler-free, batteries-included build tool for TypeScript libraries. Powered by `tsc`.

## <a href="?id=sponsors" class="peer" data-card="">Sponsors</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Sponsorship at any level is appreciated and encouraged. If you built a paid product using Zod, consider one of the <a href="https://github.com/sponsors/colinhacks" rel="noreferrer noopener" target="_blank">corporate tiers</a>.

### <a href="?id=platinum" class="peer" data-card="">Platinum</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="w-full max-w-5xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">

<div class="divide-y divide-gray-200 dark:divide-gray-700">

<div class="p-4 text-center">

[](https://www.coderabbit.ai/)

<div class="w-full py-2 pb-0 flex justify-center items-center dark:border-gray-700">

<img src="https://github.com/user-attachments/assets/eea24edb-ff20-4532-b57c-e8719f455d6d" class="m-0! hidden dark:block h-20 object-contain" alt="CodeRabbit logo (dark theme)" /><img src="https://github.com/user-attachments/assets/d791bc7d-dc60-4d55-9c31-97779839cb74" class="m-0! block dark:hidden h-20 object-contain" alt="CodeRabbit logo (light theme)" />

</div>

Cut code review time & bugs in half

<a href="https://www.coderabbit.ai/" class="transition-colors duration-200">coderabbit.ai</a>

</div>

</div>

</div>

  

### <a href="?id=gold" class="peer" data-card="">Gold</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="max-w-4xl mt-4">

<div class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md">

<div class="grid grid-cols-1 sm:grid-cols-2">

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0">

<a href="https://www.courier.com/?utm_source=zod&amp;utm_campaign=osssponsors" class="my-0! border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/user-attachments/assets/6b09506a-78de-47e8-a8c1-792efe31910a" class="my-0! h-16 object-contain dark:hidden" alt="Courier logo (light theme)" /><img src="https://github.com/user-attachments/assets/6b09506a-78de-47e8-a8c1-792efe31910a" class="my-0! h-16 object-contain hidden dark:block" alt="Courier logo (dark theme)" /></a>

The API platform for sending notifications

<a href="https://www.courier.com/?utm_source=zod&amp;utm_campaign=osssponsors" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" target="_blank" rel="noopener noreferrer">courier.com</a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0">

<a href="https://liblab.com/?utm_source=zod" class="my-0! border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/user-attachments/assets/3de0b617-5137-49c4-b72d-a033cbe602d8" class="my-0! h-16 object-contain dark:hidden" alt="Liblab logo (light theme)" /><img src="https://github.com/user-attachments/assets/34dfa1a2-ce94-46f4-8902-fbfac3e1a9bc" class="my-0! h-16 object-contain hidden dark:block" alt="Liblab logo (dark theme)" /></a>

Generate better SDKs for your APIs

<a href="https://liblab.com/?utm_source=zod" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" target="_blank" rel="noopener noreferrer">liblab.com</a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0">

<a href="https://neon.tech" class="my-0! border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/user-attachments/assets/b5799fc8-81ff-4053-a1c3-b29adf85e7a1" class="my-0! h-16 object-contain dark:hidden" alt="Neon logo (light theme)" /><img src="https://github.com/user-attachments/assets/83b4b1b1-a9ab-4ae5-a632-56d282f0c444" class="my-0! h-16 object-contain hidden dark:block" alt="Neon logo (dark theme)" /></a>

Serverless Postgres — Ship faster

<a href="https://neon.tech" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" target="_blank" rel="noopener noreferrer">neon.tech</a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0">

<a href="https://retool.com/?utm_source=github&amp;utm_medium=referral&amp;utm_campaign=zod" class="my-0! border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/colinhacks/zod/assets/3084745/5ef4c11b-efeb-4495-90a8-41b83f798600" class="my-0! h-16 object-contain dark:hidden" alt="Retool logo (light theme)" /><img src="https://github.com/colinhacks/zod/assets/3084745/ac65013f-aeb4-48dd-a2ee-41040b69cbe6" class="my-0! h-16 object-contain hidden dark:block" alt="Retool logo (dark theme)" /></a>

Build AI apps and workflows with Retool AI

<a href="https://retool.com/?utm_source=github&amp;utm_medium=referral&amp;utm_campaign=zod" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" target="_blank" rel="noopener noreferrer">retool.com</a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0">

<a href="https://stainlessapi.com" class="my-0! border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/colinhacks/zod/assets/3084745/e9444e44-d991-4bba-a697-dbcfad608e47" class="my-0! h-16 object-contain dark:hidden" alt="Stainless logo (light theme)" /><img src="https://github.com/colinhacks/zod/assets/3084745/f20759c1-3e51-49d0-a31e-bbc43abec665" class="my-0! h-16 object-contain hidden dark:block" alt="Stainless logo (dark theme)" /></a>

Generate best-in-class SDKs

<a href="https://stainlessapi.com" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" target="_blank" rel="noopener noreferrer">stainlessapi.com</a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0">

<a href="https://speakeasy.com/?utm_source=zod+docs" class="my-0! border-none" target="_blank" rel="noopener noreferrer"><img src="https://r2.zod.dev/Logo_Black.svg" class="my-0! h-16 object-contain dark:hidden" alt="Speakeasy logo (light theme)" /><img src="https://r2.zod.dev/Logo_White.svg" class="my-0! h-16 object-contain hidden dark:block" alt="Speakeasy logo (dark theme)" /></a>

SDKs & Terraform providers for your API

<a href="https://speakeasy.com/?utm_source=zod+docs" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" target="_blank" rel="noopener noreferrer">speakeasy.com</a>

</div>

</div>

</div>

</div>

  

### <a href="?id=silver" class="peer" data-card="">Silver</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="max-w-6xl mx-auto">

<div class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md">

<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.subtotal.com/?utm_source=zod" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/176449348?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Subtotal logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">subtotal.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://juno.build/?utm_source=zod" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/147273133?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Juno logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">juno.build</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://nitric.io/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/72055470?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Nitric logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">nitric.io</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.propelauth.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/89474619?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="PropelAuth logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">propelauth.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://cerbos.dev/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/80861386?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Cerbos logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">cerbos.dev</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://scalar.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/301879?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Scalar logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">scalar.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://trigger.dev" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/95297378?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Trigger.dev logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">trigger.dev</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://transloadit.com/?utm_source=zod&amp;utm_medium=referral&amp;utm_campaign=sponsorship&amp;utm_content=github" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/125754?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Transloadit logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">transloadit.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://infisical.com" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/107880645?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Infisical logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">infisical.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://whop.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/91036480?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Whop logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">whop.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://cryptojobslist.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/36402888?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="CryptoJobsList logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">cryptojobslist.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://plain.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/70170949?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Plain logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">plain.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://inngest.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/78935958?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Inngest logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">inngest.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://storyblok.com/" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/13880908?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Storyblok logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">storyblok.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://mux.link/zod" class="flex flex-col items-center" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/16199997?s=200&amp;v=4" class="h-12 w-12 object-contain mb-2 mt-0" alt="Mux logo" /><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">mux.link/zod</span></a>

</div>

</div>

</div>

</div>

  

### <a href="?id=bronze" class="peer" data-card="">Bronze</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="max-w-6xl mx-auto">

<div class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md">

<div class="flex flex-wrap">

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.val.town/" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/user-attachments/assets/95305fc4-4da6-4bf8-aea4-bae8f5893e5d" class="h-12 object-contain mb-0 mt-0" alt="Val Town logo" /></a><a href="https://www.val.town/" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">val.town</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.route4me.com/" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/7936820?s=200&amp;v=4" class="h-12 object-contain mb-0 mt-0" alt="Route4Me logo" /></a><a href="https://www.route4me.com/" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">route4me.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://encore.dev" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://github.com/colinhacks/zod/assets/3084745/5ad94e73-cd34-4957-9979-37da85fcf9cd" class="h-12 object-contain mb-0 mt-0" alt="Encore logo" /></a><a href="https://encore.dev" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">encore.dev</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.replay.io/" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/60818315?s=200&amp;v=4" class="h-12 object-contain mb-0 mt-0" alt="Replay logo" /></a><a href="https://www.replay.io/" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">replay.io</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.numeric.io" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://i.imgur.com/kTiLtZt.png" class="h-12 object-contain mb-0 mt-0" alt="Numeric logo" /></a><a href="https://www.numeric.io" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">numeric.io</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://marcatopartners.com" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/84106192?s=200&amp;v=4" class="h-12 object-contain mb-0 mt-0" alt="Marcato Partners logo" /></a><a href="https://marcatopartners.com" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">marcatopartners.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://interval.com" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/67802063?s=200&amp;v=4" class="h-12 object-contain mb-0 mt-0" alt="Interval logo" /></a><a href="https://interval.com" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">interval.com</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://seasoned.cc" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/33913103?s=200&amp;v=4" class="h-12 object-contain mb-0 mt-0" alt="Seasoned logo" /></a><a href="https://seasoned.cc" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">seasoned.cc</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.bamboocreative.nz/" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/41406870?v=4" class="h-12 object-contain mb-0 mt-0" alt="Bamboo Creative logo" /></a><a href="https://www.bamboocreative.nz/" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">bamboocreative.nz</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://github.com/jasonLaster" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/254562?v=4" class="h-12 object-contain mb-0 mt-0" alt="Jason Laster logo" /></a><a href="https://github.com/jasonLaster" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">github.com/jasonLaster</span></a>

</div>

<div class="p-4 flex flex-col items-center border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0 sm:last-sm:border-b sm:even:last:border-r-0 lg:nth-3:last-3:border-r-0 xl:nth-4:last-4:border-r-0">

<a href="https://www.clipboardhealth.com/engineering" class="flex flex-col items-center m-0 border-none" target="_blank" rel="noopener noreferrer"><img src="https://avatars.githubusercontent.com/u/28880063?s=200&amp;v=4" class="h-12 object-contain mb-0 mt-0" alt="Clipboard logo" /></a><a href="https://www.clipboardhealth.com/engineering" class="hidden"><span class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">clipboardhealth.com/engineering</span></a>

</div>

</div>

</div>

</div>

  

</div>

<div class="flex-1" role="none">

</div>

<div class="flex flex-row flex-wrap items-center justify-between gap-4 empty:hidden">

</div>

<div class="@container grid gap-4 pb-6 grid-cols-2">

<a href="/v4/changelog" class="flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full"></a>

<div class="inline-flex items-center gap-1.5 font-medium">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tbGVmdCAtbXgtMSBzaXplLTQgc2hyaW5rLTAgcnRsOnJvdGF0ZS0xODAiPjxwYXRoIGQ9Im0xNSAxOC02LTYgNi02Ij48L3BhdGg+PC9zdmc+" class="lucide lucide-chevron-left -mx-1 size-4 shrink-0 rtl:rotate-180" />

Migration guide

</div>

Complete changelog and migration guide for upgrading from Zod 3 to Zod 4

<a href="/basics" class="flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full text-end"></a>

<div class="inline-flex items-center gap-1.5 flex-row-reverse font-medium">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW14LTEgc2l6ZS00IHNocmluay0wIHJ0bDpyb3RhdGUtMTgwIj48cGF0aCBkPSJtOSAxOCA2LTYtNi02Ij48L3BhdGg+PC9zdmc+" class="lucide lucide-chevron-right -mx-1 size-4 shrink-0 rtl:rotate-180" />

Basic usage

</div>

Basic usage guide covering schema definition, parsing data, error handling, and type inference

</div>

</div>

<div id="nd-toc" class="sticky top-[calc(var(--fd-banner-height)+var(--fd-nav-height))] h-(--fd-toc-height) pb-2 pt-12 max-xl:hidden" style="--fd-toc-height:calc(100dvh - var(--fd-banner-height) - var(--fd-nav-height))">

<div class="flex h-full w-(--fd-toc-width) max-w-full flex-col gap-3 pe-4">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRleHQgc2l6ZS00Ij48cGF0aCBkPSJNMTcgNi4xSDMiPjwvcGF0aD48cGF0aCBkPSJNMjEgMTIuMUgzIj48L3BhdGg+PHBhdGggZD0iTTE1LjEgMThIMyI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-text size-4" />On this page

<div class="overflow-hidden flex flex-col ps-px" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<div class="size-full rounded-[inherit] relative min-h-0 text-sm" radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<div class="flex flex-col">

<a href="#introduction" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Introduction<a href="#features" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Features<a href="#installation" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Installation<a href="#requirements" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Requirements<a href="#strict" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5 bottom-1.5" style="inset-inline-start:10px">

</div>

`"strict"`<a href="#ecosystem" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Ecosystem<a href="#sponsors" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Sponsors<a href="#platinum" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:10px">

</div>

Platinum<a href="#gold" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

Gold<a href="#silver" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

Silver<a href="#bronze" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

Bronze

</div>

</div>

</div>

</div>

</div>

</div>

</div>
