---
source: https://zod.dev/?id=refine
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

<a href="/" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Intro

</div>

<a href="/basics" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start text-fd-muted-foreground [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none" data-active="false" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

<div class="w-full flex flex-row justify-between">

Basic usage

</div>

<a href="/api" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-fd-primary/10 text-fd-primary" data-active="true" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

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

<div class="mb-6">

# Defining schemas

<div class="h-2">

</div>

<div class="flex items-center gap-2">

<div class="flex items-center gap-1.5">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgdy0zIGgtMyI+PHJlY3Qgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB4PSI4IiB5PSI4IiByeD0iMiIgcnk9IjIiPjwvcmVjdD48cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIj48L3BhdGg+PC9zdmc+" class="lucide lucide-copy w-3 h-3" />Copy markdown

</div>

<a href="https://github.com/colinhacks/zod/edit/main/packages/docs/content/api.mdx" class="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-fd-muted-foreground hover:text-fd-foreground border border-[var(--color-fd-border)] rounded hover:bg-fd-muted/50 transition-colors" target="_blank" rel="noreferrer noopener"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdpdGh1YiB3LTMgaC0zIj48cGF0aCBkPSJNMTUgMjJ2LTRhNC44IDQuOCAwIDAgMC0xLTMuNWMzIDAgNi0yIDYtNS41LjA4LTEuMjUtLjI3LTIuNDgtMS0zLjUuMjgtMS4xNS4yOC0yLjM1IDAtMy41IDAgMC0xIDAtMyAxLjUtMi42NC0uNS01LjM2LS41LTggMEM2IDIgNSAyIDUgMmMtLjMgMS4xNS0uMyAyLjM1IDAgMy41QTUuNDAzIDUuNDAzIDAgMCAwIDQgOWMwIDMuNSAzIDUuNSA2IDUuNS0uMzkuNDktLjY4IDEuMDUtLjg1IDEuNjUtLjE3LjYtLjIyIDEuMjMtLjE1IDEuODV2NCI+PC9wYXRoPjxwYXRoIGQ9Ik05IDE4Yy00LjUxIDItNS0yLTctMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-github w-3 h-3" />Edit this page</a>

</div>

</div>

<div class="prose">

To validate data, you must first define a *schema*. Schemas represent *types*, from simple primitive values to complex nested objects and arrays.

## <a href="?id=primitives" class="peer" data-card="">Primitives</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>import * as z from &quot;zod&quot;;
 
// primitive types
z.string();
z.number();
z.bigint();
z.boolean();
z.symbol();
z.undefined();
z.null();</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=coercion" class="peer" data-card="">Coercion</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To coerce input data to the appropriate type, use `z.coerce` instead:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.coerce.string();    // String(input)
z.coerce.number();    // Number(input)
z.coerce.boolean();   // Boolean(input)
z.coerce.bigint();    // BigInt(input)</code></pre>
</div>
</div>
</div>
</figure>

The coerced variant of these schemas attempts to convert the input value to the appropriate type.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.coerce.string();
 
schema.parse(&quot;tuna&quot;);    // =&gt; &quot;tuna&quot;
schema.parse(42);        // =&gt; &quot;42&quot;
schema.parse(true);      // =&gt; &quot;true&quot;
schema.parse(null);      // =&gt; &quot;null&quot;</code></pre>
</div>
</div>
</div>
</figure>

The input type of these coerced schemas is `unknown` by default. To specify a more specific input type, pass a generic parameter:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const A = z.coerce.number();
type AInput = z.input&lt;typeof A&gt;; // =&gt; unknown
 
const B = z.coerce.number&lt;number&gt;();
type BInput = z.input&lt;typeof B&gt;; // =&gt; number</code></pre>
</div>
</div>
</div>
</figure>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" orientation="vertical">

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />How coercion works in Zod

<div id="radix-«Ra1b54uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«R21b54uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />Customizing the input type

<div id="radix-«Rc1b54uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«R41b54uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

## <a href="?id=literals" class="peer" data-card="">Literals</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Literal schemas represent a <a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types" rel="noreferrer noopener" target="_blank">literal type</a>, like `"hello world"` or `5`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const tuna = z.literal(&quot;tuna&quot;);
const twelve = z.literal(12);
const twobig = z.literal(2n);
const tru = z.literal(true);</code></pre>
</div>
</div>
</div>
</figure>

To represent the JavaScript literals `null` and `undefined`:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.null();
z.undefined();
z.void(); // equivalent to z.undefined()</code></pre>
</div>
</div>
</div>
</figure>

To allow multiple literal values:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const colors = z.literal([&quot;red&quot;, &quot;green&quot;, &quot;blue&quot;]);
 
colors.parse(&quot;green&quot;); // ✅
colors.parse(&quot;yellow&quot;); // ❌</code></pre>
</div>
</div>
</div>
</figure>

To extract the set of allowed values from a literal schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R2f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>colors.values; // =&gt; Set&lt;&quot;red&quot; | &quot;green&quot; | &quot;blue&quot;&gt;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R2f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=strings" class="peer" data-card="">Strings</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod provides a handful of built-in string validation and transform APIs. To perform some common string validations:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R2t54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2t54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.string().max(5);
z.string().min(5);
z.string().length(5);
z.string().regex(/^[a-z]+$/);
z.string().startsWith(&quot;aaa&quot;);
z.string().endsWith(&quot;zzz&quot;);
z.string().includes(&quot;---&quot;);
z.string().uppercase();
z.string().lowercase();</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R2t54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2t54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To perform some simple string transforms:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R3554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R3554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.string().trim(); // trim whitespace
z.string().toLowerCase(); // toLowerCase
z.string().toUpperCase(); // toUpperCase
z.string().normalize(); // normalize unicode characters</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R3554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R3554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=string-formats" class="peer" data-card="">String formats</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate against some common string formats:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.email();
z.uuid();
z.url();
z.httpUrl();       // http or https URLs only
z.hostname();
z.emoji();         // validates a single emoji character
z.base64();
z.base64url();
z.hex();
z.jwt();
z.nanoid();
z.cuid();
z.cuid2();
z.ulid();
z.ipv4();
z.ipv6();
z.cidrv4();        // ipv4 CIDR block
z.cidrv6();        // ipv6 CIDR block
z.hash(&quot;sha256&quot;);  // or &quot;sha1&quot;, &quot;sha384&quot;, &quot;sha512&quot;, &quot;md5&quot;
z.iso.date();
z.iso.time();
z.iso.datetime();
z.iso.duration();</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=emails" class="peer" data-card="">Emails</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate email addresses:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.email();</code></pre>
</div>
</div>
</div>
</figure>

By default, Zod uses a comparatively strict email regex designed to validate normal email addresses containing common characters. It's roughly equivalent to the rules enforced by Gmail. To learn more about this regex, refer to <a href="https://colinhacks.com/essays/reasonable-email-regex" rel="noreferrer noopener" target="_blank">this post</a>.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>/^(?!\.)(?!.*\.\.)([a-z0-9_&#39;+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i</code></pre>
</div>
</div>
</div>
</figure>

To customize the email validation behavior, you can pass a custom regular expression to the `pattern` param.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.email({ pattern: /your regex here/ });</code></pre>
</div>
</div>
</div>
</figure>

Zod exports several useful regexes you could use.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>// Zod&#39;s default email regex
z.email();
z.email({ pattern: z.regexes.email }); // equivalent
 
// the regex used by browsers to validate input[type=email] fields
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
z.email({ pattern: z.regexes.html5Email });
 
// the classic emailregex.com regex (RFC 5322)
z.email({ pattern: z.regexes.rfc5322Email });
 
// a loose regex that allows Unicode (good for intl emails)
z.email({ pattern: z.regexes.unicodeEmail });</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=uuids" class="peer" data-card="">UUIDs</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate UUIDs:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.uuid();</code></pre>
</div>
</div>
</div>
</figure>

To specify a particular UUID version:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>// supports &quot;v1&quot;, &quot;v2&quot;, &quot;v3&quot;, &quot;v4&quot;, &quot;v5&quot;, &quot;v6&quot;, &quot;v7&quot;, &quot;v8&quot;
z.uuid({ version: &quot;v4&quot; });
 
// for convenience
z.uuidv4();
z.uuidv6();
z.uuidv7();</code></pre>
</div>
</div>
</div>
</figure>

The RFC 9562/4122 UUID spec requires the first two bits of byte 8 to be `10`. Other UUID-like identifiers do not enforce this constraint. To validate any UUID-like identifier:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.guid();</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=urls" class="peer" data-card="">URLs</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate any WHATWG-compatible URL:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.url();
 
schema.parse(&quot;https://example.com&quot;); // ✅
schema.parse(&quot;http://localhost&quot;); // ✅
schema.parse(&quot;mailto:[email protected]&quot;); // ✅</code></pre>
</div>
</div>
</div>
</figure>

As you can see this is quite permissive. Internally this uses the `new URL()` constructor to validate inputs; this behavior may differ across platforms and runtimes but it's the mostly rigorous way to validate URIs/URLs on any given JS runtime/engine.

To validate the hostname against a specific regex:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.url({ hostname: /^example\.com$/ });
 
schema.parse(&quot;https://example.com&quot;); // ✅
schema.parse(&quot;https://zombo.com&quot;); // ❌</code></pre>
</div>
</div>
</div>
</figure>

To validate the protocol against a specific regex, use the `protocol` param.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.url({ protocol: /^https$/ });
 
schema.parse(&quot;https://example.com&quot;); // ✅
schema.parse(&quot;http://example.com&quot;); // ❌</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Web URLs** — In many cases, you'll want to validate Web URLs specifically. Here's the recommended schema for doing so:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const httpUrl = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.domain
});</code></pre>
</div>
</div>
</div>
</figure>

This restricts the protocol to `http`/`https` and ensures the hostname is a valid domain name with the `z.regexes.domain` regular expression:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>/^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/</code></pre>
</div>
</div>
</div>
</figure>

</div>

</div>

</div>

To normalize URLs, use the `normalize` flag. This will overwrite the input value with the <a href="https://chatgpt.com/share/6881547f-bebc-800f-9093-f5981e277c2c" rel="noreferrer noopener" target="_blank">normalized URL</a> returned by `new URL()`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>new URL(&quot;HTTP://ExAmPle.com:80/./a/../b?X=1#f oo&quot;).href
// =&gt; &quot;http://example.com/b?X=1#f%20oo&quot;</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=iso-datetimes" class="peer" data-card="">ISO datetimes</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

As you may have noticed, Zod string includes a few date/time related validations. These validations are regular expression based, so they are not as strict as a full date/time library. However, they are very convenient for validating user input.

The `z.iso.datetime()` method enforces ISO 8601; by default, no timezone offsets are allowed:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const datetime = z.iso.datetime();
 
datetime.parse(&quot;2020-01-01T06:15:00Z&quot;); // ✅
datetime.parse(&quot;2020-01-01T06:15:00.123Z&quot;); // ✅
datetime.parse(&quot;2020-01-01T06:15:00.123456Z&quot;); // ✅ (arbitrary precision)
datetime.parse(&quot;2020-01-01T06:15:00+02:00&quot;); // ❌ (offsets not allowed)
datetime.parse(&quot;2020-01-01T06:15:00&quot;); // ❌ (local not allowed)</code></pre>
</div>
</div>
</div>
</figure>

To allow timezone offsets:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const datetime = z.iso.datetime({ offset: true });
 
// allows timezone offsets
datetime.parse(&quot;2020-01-01T06:15:00+02:00&quot;); // ✅
 
// basic offsets not allowed
datetime.parse(&quot;2020-01-01T06:15:00+02&quot;);    // ❌
datetime.parse(&quot;2020-01-01T06:15:00+0200&quot;);  // ❌
 
// Z is still supported
datetime.parse(&quot;2020-01-01T06:15:00Z&quot;); // ✅ </code></pre>
</div>
</div>
</div>
</figure>

To allow unqualified (timezone-less) datetimes:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.iso.datetime({ local: true });
schema.parse(&quot;2020-01-01T06:15:01&quot;); // ✅
schema.parse(&quot;2020-01-01T06:15&quot;); // ✅ seconds optional</code></pre>
</div>
</div>
</div>
</figure>

To constrain the allowable time `precision`. By default, seconds are optional and arbitrary sub-second precision is allowed.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const a = z.iso.datetime();
a.parse(&quot;2020-01-01T06:15Z&quot;); // ✅
a.parse(&quot;2020-01-01T06:15:00Z&quot;); // ✅
a.parse(&quot;2020-01-01T06:15:00.123Z&quot;); // ✅
 
const b = z.iso.datetime({ precision: -1 }); // minute precision (no seconds)
b.parse(&quot;2020-01-01T06:15Z&quot;); // ✅
b.parse(&quot;2020-01-01T06:15:00Z&quot;); // ❌
b.parse(&quot;2020-01-01T06:15:00.123Z&quot;); // ❌
 
const c = z.iso.datetime({ precision: 0 }); // second precision only
c.parse(&quot;2020-01-01T06:15Z&quot;); // ❌
c.parse(&quot;2020-01-01T06:15:00Z&quot;); // ✅
c.parse(&quot;2020-01-01T06:15:00.123Z&quot;); // ❌
 
const d = z.iso.datetime({ precision: 3 }); // millisecond precision only
d.parse(&quot;2020-01-01T06:15Z&quot;); // ❌
d.parse(&quot;2020-01-01T06:15:00Z&quot;); // ❌
d.parse(&quot;2020-01-01T06:15:00.123Z&quot;); // ✅</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=iso-dates" class="peer" data-card="">ISO dates</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

The `z.iso.date()` method validates strings in the format `YYYY-MM-DD`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const date = z.iso.date();
 
date.parse(&quot;2020-01-01&quot;); // ✅
date.parse(&quot;2020-1-1&quot;); // ❌
date.parse(&quot;2020-01-32&quot;); // ❌</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=iso-times" class="peer" data-card="">ISO times</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

The `z.iso.time()` method validates strings in the format `HH:MM[:SS[.s+]]`. By default seconds are optional, as are sub-second deciams.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const time = z.iso.time();
 
time.parse(&quot;03:15&quot;); // ✅
time.parse(&quot;03:15:00&quot;); // ✅
time.parse(&quot;03:15:00.9999999&quot;); // ✅ (arbitrary precision)</code></pre>
</div>
</div>
</div>
</figure>

No offsets of any kind are allowed.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>time.parse(&quot;03:15:00Z&quot;); // ❌ (no `Z` allowed)
time.parse(&quot;03:15:00+02:00&quot;); // ❌ (no offsets allowed)</code></pre>
</div>
</div>
</div>
</figure>

Use the `precision` parameter to constrain the allowable decimal precision.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.iso.time({ precision: -1 }); // HH:MM (minute precision)
z.iso.time({ precision: 0 }); // HH:MM:SS (second precision)
z.iso.time({ precision: 1 }); // HH:MM:SS.s (decisecond precision)
z.iso.time({ precision: 2 }); // HH:MM:SS.ss (centisecond precision)
z.iso.time({ precision: 3 }); // HH:MM:SS.sss (millisecond precision)</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=ip-addresses" class="peer" data-card="">IP addresses</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const ipv4 = z.ipv4();
ipv4.parse(&quot;192.168.0.0&quot;); // ✅
 
const ipv6 = z.ipv6();
ipv6.parse(&quot;2001:db8:85a3::8a2e:370:7334&quot;); // ✅</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=ip-blocks-cidr" class="peer" data-card="">IP blocks (CIDR)</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Validate IP address ranges specified with <a href="https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing" rel="noreferrer noopener" target="_blank">CIDR notation</a>.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const cidrv4 = z.string().cidrv4();
cidrv4.parse(&quot;192.168.0.0/24&quot;); // ✅
 
const cidrv6 = z.string().cidrv6();
cidrv6.parse(&quot;2001:db8::/32&quot;); // ✅</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=jwts" class="peer" data-card="">JWTs</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Validate <a href="https://jwt.io/" rel="noreferrer noopener" target="_blank">JSON Web Tokens</a>.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.jwt();
z.jwt({ alg: &quot;HS256&quot; });</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=hashes" class="peer" data-card="">Hashes</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate cryptographic hash values:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.hash(&quot;md5&quot;);
z.hash(&quot;sha1&quot;);
z.hash(&quot;sha256&quot;);
z.hash(&quot;sha384&quot;);
z.hash(&quot;sha512&quot;);</code></pre>
</div>
</div>
</div>
</figure>

By default, `z.hash()` expects hexadecimal encoding, as is conventional. You can specify a different encoding with the `enc` parameter:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.hash(&quot;sha256&quot;, { enc: &quot;hex&quot; });       // default
z.hash(&quot;sha256&quot;, { enc: &quot;base64&quot; });    // base64 encoding
z.hash(&quot;sha256&quot;, { enc: &quot;base64url&quot; }); // base64url encoding (no padding)</code></pre>
</div>
</div>
</div>
</figure>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" orientation="vertical">

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />Expected lengths and padding

<div id="radix-«R2b554uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«Rb554uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

### <a href="?id=custom-formats" class="peer" data-card="">Custom formats</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define your own string formats:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const coolId = z.stringFormat(&quot;cool-id&quot;, ()=&gt;{
  // arbitrary validation here
  return val.length === 100 &amp;&amp; val.startsWith(&quot;cool-&quot;);
});
 
// a regex is also accepted
z.stringFormat(&quot;cool-id&quot;, /^cool-[a-z0-9]{95}$/);</code></pre>
</div>
</div>
</div>
</figure>

This schema will produce `"invalid_format"` issues, which are more descriptive than the `"custom"` errors produced by refinements or `z.custom()`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>myFormat.parse(&quot;invalid input!&quot;);
// ZodError: [
//   {
//     &quot;code&quot;: &quot;invalid_format&quot;,
//     &quot;format&quot;: &quot;cool-id&quot;,
//     &quot;path&quot;: [],
//     &quot;message&quot;: &quot;Invalid cool-id&quot;
//   }
// ]</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=template-literals" class="peer" data-card="">Template literals</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**New** — Introduced in <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="4832272c087c6678"><code>[email protected]</code></a>.

</div>

</div>

</div>

To define a template literal schema:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.templateLiteral([ &quot;hello, &quot;, z.string(), &quot;!&quot; ]);
// `hello, ${string}!`</code></pre>
</div>
</div>
</div>
</figure>

The `z.templateLiteral` API can handle any number of string literals (e.g. `"hello"`) and schemas. Any schema with an inferred type that's assignable to `string | number | bigint | boolean | null | undefined` can be passed.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.templateLiteral([ &quot;hi there&quot; ]);
// `hi there`
 
z.templateLiteral([ &quot;email: &quot;, z.string() ]);
// `email: ${string}`
 
z.templateLiteral([ &quot;high&quot;, z.literal(5) ]);
// `high5`
 
z.templateLiteral([ z.nullable(z.literal(&quot;grassy&quot;)) ]);
// `grassy` | `null`
 
z.templateLiteral([ z.number(), z.enum([&quot;px&quot;, &quot;em&quot;, &quot;rem&quot;]) ]);
// `${number}px` | `${number}em` | `${number}rem`</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=numbers" class="peer" data-card="">Numbers</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Use `z.number()` to validate numbers. It allows any finite number.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.number();
 
schema.parse(3.14);      // ✅
schema.parse(NaN);       // ❌
schema.parse(Infinity);  // ❌</code></pre>
</div>
</div>
</div>
</figure>

Zod implements a handful of number-specific validations:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rd554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rd554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.number().gt(5);
z.number().gte(5);                     // alias .min(5)
z.number().lt(5);
z.number().lte(5);                     // alias .max(5)
z.number().positive();       
z.number().nonnegative();    
z.number().negative(); 
z.number().nonpositive(); 
z.number().multipleOf(5);              // alias .step(5)</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rd554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rd554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

If (for some reason) you want to validate `NaN`, use `z.nan()`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.nan().parse(NaN);              // ✅
z.nan().parse(&quot;anything else&quot;);  // ❌</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=integers" class="peer" data-card="">Integers</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate integers:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.int();     // restricts to safe integer range
z.int32();   // restrict to int32 range</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=bigints" class="peer" data-card="">BigInts</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate BigInts:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.bigint();</code></pre>
</div>
</div>
</div>
</figure>

Zod includes a handful of bigint-specific validations.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Red54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Red54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.bigint().gt(5n);
z.bigint().gte(5n);                    // alias `.min(5n)`
z.bigint().lt(5n);
z.bigint().lte(5n);                    // alias `.max(5n)`
z.bigint().positive(); 
z.bigint().nonnegative(); 
z.bigint().negative(); 
z.bigint().nonpositive(); 
z.bigint().multipleOf(5n);             // alias `.step(5n)`</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Red54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Red54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=booleans" class="peer" data-card="">Booleans</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate boolean values:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.boolean().parse(true); // =&gt; true
z.boolean().parse(false); // =&gt; false</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=dates" class="peer" data-card="">Dates</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Use `z.date()` to validate `Date` instances.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.date().safeParse(new Date()); // success: true
z.date().safeParse(&quot;2022-01-12T06:15:00.000Z&quot;); // success: false</code></pre>
</div>
</div>
</div>
</figure>

To customize the error message:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.date({
  error: issue =&gt; issue.input === undefined ? &quot;Required&quot; : &quot;Invalid date&quot;
});</code></pre>
</div>
</div>
</div>
</figure>

Zod provides a handful of date-specific validations.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rfl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rfl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.date().min(new Date(&quot;1900-01-01&quot;), { error: &quot;Too old!&quot; });
z.date().max(new Date(), { error: &quot;Too young!&quot; });</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rfl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rfl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div id="zod-enums" style="height:0px">

</div>

## <a href="?id=enums" class="peer" data-card="">Enums</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Use `z.enum` to validate inputs against a fixed set of allowable *string* values.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const FishEnum = z.enum([&quot;Salmon&quot;, &quot;Tuna&quot;, &quot;Trout&quot;]);
 
FishEnum.parse(&quot;Salmon&quot;); // =&gt; &quot;Salmon&quot;
FishEnum.parse(&quot;Swordfish&quot;); // =&gt; ❌</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

Careful — If you declare your string array as a variable, Zod won't be able to properly infer the exact values of each element.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const fish = [&quot;Salmon&quot;, &quot;Tuna&quot;, &quot;Trout&quot;];
 
const FishEnum = z.enum(fish);
type FishEnum = z.infer&lt;typeof FishEnum&gt;; // string</code></pre>
</div>
</div>
</div>
</figure>

To fix this, always pass the array directly into the `z.enum()` function, or use <a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions" rel="noreferrer noopener" target="_blank"><code>as const</code></a>.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const fish = [&quot;Salmon&quot;, &quot;Tuna&quot;, &quot;Trout&quot;] as const;
 
const FishEnum = z.enum(fish);
type FishEnum = z.infer&lt;typeof FishEnum&gt;; // &quot;Salmon&quot; | &quot;Tuna&quot; | &quot;Trout&quot;</code></pre>
</div>
</div>
</div>
</figure>

</div>

</div>

</div>

Enum-like object literals (`{ [key: string]: string | number }`) are supported.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Fish = {
  Salmon: &quot;Salmon&quot;,
  Tuna: &quot;Tuna&quot;
} as const
 
const FishEnum = z.enum(Fish)
FishEnum.parse(&quot;Salmon&quot;); // =&gt; &quot;Salmon&quot;
FishEnum.parse(&quot;Swordfish&quot;); // =&gt; ❌</code></pre>
</div>
</div>
</div>
</figure>

You can also pass in an externally-declared TypeScript enum.

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Zod 4** — This replaces the `z.nativeEnum()` API in Zod 3.

Note that using TypeScript's `enum` keyword is <a href="https://www.totaltypescript.com/why-i-dont-like-typescript-enums" rel="noreferrer noopener" target="_blank">not recommended</a>.

</div>

</div>

</div>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>enum Fish {
  Salmon = &quot;Salmon&quot;,
  Tuna = &quot;Tuna&quot;,
  Trout = &quot;Trout&quot;,
}
 
const FishEnum = z.enum(Fish);</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=enum" class="peer" data-card=""><code>.enum</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To extract the schema's values as an enum-like object:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rh954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rh954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const FishEnum = z.enum([&quot;Salmon&quot;, &quot;Tuna&quot;, &quot;Trout&quot;]);
 
FishEnum.enum;
// =&gt; { Salmon: &quot;Salmon&quot;, Tuna: &quot;Tuna&quot;, Trout: &quot;Trout&quot; }</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rh954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rh954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=exclude" class="peer" data-card=""><code>.exclude()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To create a new enum schema, excluding certain values:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rhl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rhl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const FishEnum = z.enum([&quot;Salmon&quot;, &quot;Tuna&quot;, &quot;Trout&quot;]);
const TunaOnly = FishEnum.exclude([&quot;Salmon&quot;, &quot;Trout&quot;]);</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rhl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rhl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=extract" class="peer" data-card=""><code>.extract()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To create a new enum schema, extracting certain values:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Ri154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ri154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const FishEnum = z.enum([&quot;Salmon&quot;, &quot;Tuna&quot;, &quot;Trout&quot;]);
const SalmonAndTroutOnly = FishEnum.extract([&quot;Salmon&quot;, &quot;Trout&quot;]);</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Ri154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ri154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=stringbool" class="peer" data-card="">Stringbools</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**💎 New in Zod 4**

</div>

</div>

</div>

In some cases (e.g. parsing environment variables) it's valuable to parse certain string "boolish" values to a plain `boolean` value. To support this, Zod 4 introduces `z.stringbool()`:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const strbool = z.stringbool();
 
strbool.parse(&quot;true&quot;)         // =&gt; true
strbool.parse(&quot;1&quot;)            // =&gt; true
strbool.parse(&quot;yes&quot;)          // =&gt; true
strbool.parse(&quot;on&quot;)           // =&gt; true
strbool.parse(&quot;y&quot;)            // =&gt; true
strbool.parse(&quot;enabled&quot;)      // =&gt; true
 
strbool.parse(&quot;false&quot;);       // =&gt; false
strbool.parse(&quot;0&quot;);           // =&gt; false
strbool.parse(&quot;no&quot;);          // =&gt; false
strbool.parse(&quot;off&quot;);         // =&gt; false
strbool.parse(&quot;n&quot;);           // =&gt; false
strbool.parse(&quot;disabled&quot;);    // =&gt; false
 
strbool.parse(/* anything else */); // ZodError&lt;[{ code: &quot;invalid_value&quot; }]&gt;</code></pre>
</div>
</div>
</div>
</figure>

To customize the truthy and falsy values:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>// these are the defaults
z.stringbool({
  truthy: [&quot;true&quot;, &quot;1&quot;, &quot;yes&quot;, &quot;on&quot;, &quot;y&quot;, &quot;enabled&quot;],
  falsy: [&quot;false&quot;, &quot;0&quot;, &quot;no&quot;, &quot;off&quot;, &quot;n&quot;, &quot;disabled&quot;],
});</code></pre>
</div>
</div>
</div>
</figure>

By default the schema is *case-insensitive*; all inputs are converted to lowercase before comparison to the `truthy`/`falsy` values. To make it case-sensitive:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.stringbool({
  case: &quot;sensitive&quot;
});</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=optionals" class="peer" data-card="">Optionals</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To make a schema *optional* (that is, to allow `undefined` inputs).

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rjd54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rjd54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.optional(z.literal(&quot;yoda&quot;)); // or z.literal(&quot;yoda&quot;).optional()</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rjd54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rjd54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

This returns a `ZodOptional` instance that wraps the original schema. To extract the inner schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rjl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rjl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>optionalYoda.unwrap(); // ZodLiteral&lt;&quot;yoda&quot;&gt;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rjl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rjl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=nullables" class="peer" data-card="">Nullables</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To make a schema *nullable* (that is, to allow `null` inputs).

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rk154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rk154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.nullable(z.literal(&quot;yoda&quot;)); // or z.literal(&quot;yoda&quot;).nullable()</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rk154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rk154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

This returns a `ZodNullable` instance that wraps the original schema. To extract the inner schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rk954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rk954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>nullableYoda.unwrap(); // ZodLiteral&lt;&quot;yoda&quot;&gt;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rk954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rk954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=nullish" class="peer" data-card="">Nullish</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To make a schema *nullish* (both optional and nullable):

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rkl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rkl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const nullishYoda = z.nullish(z.literal(&quot;yoda&quot;));</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rkl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rkl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

Refer to the TypeScript manual for more about the concept of <a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing" rel="noreferrer noopener" target="_blank">nullish</a>.

## <a href="?id=unknown" class="peer" data-card="">Unknown</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod aims to mirror TypeScript's type system one-to-one. As such, Zod provides APIs to represent the following special types:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>// allows any values
z.any(); // inferred type: `any`
z.unknown(); // inferred type: `unknown`</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=never" class="peer" data-card="">Never</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

No value will pass validation.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.never(); // inferred type: `never`</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=objects" class="peer" data-card="">Objects</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define an object type:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>  // all properties are required by default
  const Person = z.object({
    name: z.string(),
    age: z.number(),
  });
 
  type Person = z.infer&lt;typeof Person&gt;;
  // =&gt; { name: string; age: number; }</code></pre>
</div>
</div>
</div>
</figure>

By default, all properties are required. To make certain properties optional:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rm554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rm554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Dog = z.object({
  name: z.string(),
  age: z.number().optional(),
});
 
Dog.parse({ name: &quot;Yeller&quot; }); // ✅</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rm554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rm554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

By default, unrecognized keys are *stripped* from the parsed result:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>Dog.parse({ name: &quot;Yeller&quot;, extraKey: true });
// =&gt; { name: &quot;Yeller&quot; }</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=zstrictobject" class="peer" data-card=""><code>z.strictObject</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define a *strict* schema that throws an error when unknown keys are found:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const StrictDog = z.strictObject({
  name: z.string(),
});
 
StrictDog.parse({ name: &quot;Yeller&quot;, extraKey: true });
// ❌ throws</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=zlooseobject" class="peer" data-card=""><code>z.looseObject</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define a *loose* schema that allows unknown keys to pass through:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const LooseDog = z.looseObject({
  name: z.string(),
});
 
LooseDog.parse({ name: &quot;Yeller&quot;, extraKey: true });
// =&gt; { name: &quot;Yeller&quot;, extraKey: true }</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=catchall" class="peer" data-card=""><code>.catchall()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define a *catchall schema* that will be used to validate any unrecognized keys:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rnh54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rnh54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const DogWithStrings = z.object({
  name: z.string(),
  age: z.number().optional(),
}).catchall(z.string());
 
DogWithStrings.parse({ name: &quot;Yeller&quot;, extraKey: &quot;extraValue&quot; }); // ✅
DogWithStrings.parse({ name: &quot;Yeller&quot;, extraKey: 42 }); // ❌</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rnh54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rnh54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=shape" class="peer" data-card=""><code>.shape</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To access the internal schemas:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rnt54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rnt54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>Dog.shape.name; // =&gt; string schema
Dog.shape.age; // =&gt; number schema</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rnt54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rnt54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=keyof" class="peer" data-card=""><code>.keyof()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To create a `ZodEnum` schema from the keys of an object schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Ro954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ro954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const keySchema = Dog.keyof();
// =&gt; ZodEnum&lt;[&quot;name&quot;, &quot;age&quot;]&gt;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Ro954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ro954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=extend" class="peer" data-card=""><code>.extend()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To add additional fields to an object schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rol54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rol54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const DogWithBreed = Dog.extend({
  breed: z.string(),
});</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rol54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rol54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

This API can be used to overwrite existing fields! Be careful with this power! If the two schemas share keys, B will override A.

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Alternative: spread syntax** — You can alternatively avoid `.extend()` altogether by creating a new object schema entirely. This makes the strictness level of the resulting schema visually obvious.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const DogWithBreed = z.object({ // or z.strictObject() or z.looseObject()...
  ...Dog.shape,
  breed: z.string(),
});</code></pre>
</div>
</div>
</div>
</figure>

You can also use this to merge multiple objects in one go.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const DogWithBreed = z.object({
  ...Animal.shape,
  ...Pet.shape,
  breed: z.string(),
});</code></pre>
</div>
</div>
</div>
</figure>

This approach has a few advantages:

1.  It uses language-level features (<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax" rel="noreferrer noopener" target="_blank">spread syntax</a>) instead of library-specific APIs
2.  The same syntax works in Zod and Zod Mini
3.  It's more `tsc`-efficient — the `.extend()` method can be expensive on large schemas, and due to <a href="https://github.com/microsoft/TypeScript/pull/61505" rel="noreferrer noopener" target="_blank">a TypeScript limitation</a> it gets quadratically more expensive when calls are chained
4.  If you wish, you can change the strictness level of the resulting schema by using `z.strictObject()` or `z.looseObject()`

</div>

</div>

</div>

### <a href="?id=safeextend" class="peer" data-card=""><code>.safeExtend()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

The `.safeExtend()` method works similarly to `.extend()`, but it won't let you overwrite an existing properly with a non-assignable schema. In other words, the result of `.safeExtend()` will have an inferred type that <a href="https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#conditional-type-constraints" rel="noreferrer noopener" target="_blank"><code>extends</code></a> the original (in the TypeScript sense).

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.object({ a: z.string() }).safeExtend({ a: z.string().min(5) }); // ✅
z.object({ a: z.string() }).safeExtend({ a: z.any() }); // ✅
z.object({ a: z.string() }).safeExtend({ a: z.number() });
//                                       ^  ❌ ZodNumber is not assignable </code></pre>
</div>
</div>
</div>
</figure>

Use `.safeExtend()` to extend schemas that contain refinements. (Regular `.extend()` will throw an error when used on schemas with refinements.)

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rph54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rph54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Base = z.object({
  a: z.string(),
  b: z.string()
}).refine(user =&gt; user.a === user.b);
 
// Extended inherits the refinements of Base
const Extended = Base.safeExtend({
  a: z.string().min(10)
});</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rph54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rph54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=pick" class="peer" data-card=""><code>.pick()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Inspired by TypeScript's built-in `Pick` and `Omit` utility types, Zod provides dedicated APIs for picking and omitting certain keys from an object schema.

Starting from this initial schema:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Recipe = z.object({
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.string()),
});
// { title: string; description?: string | undefined; ingredients: string[] }</code></pre>
</div>
</div>
</div>
</figure>

To pick certain keys:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rq954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rq954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const JustTheTitle = Recipe.pick({ title: true });</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rq954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rq954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=omit" class="peer" data-card=""><code>.omit()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To omit certain keys:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rql54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rql54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const RecipeNoId = Recipe.omit({ id: true });</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rql54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rql54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=partial" class="peer" data-card=""><code>.partial()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

For convenience, Zod provides a dedicated API for making some or all properties optional, inspired by the built-in TypeScript utility type <a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype" rel="noreferrer noopener" target="_blank"><code>Partial</code></a>.

To make all fields optional:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rr554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rr554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const PartialRecipe = Recipe.partial();
// { title?: string | undefined; description?: string | undefined; ingredients?: string[] | undefined }</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rr554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rr554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To make certain properties optional:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rrd54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rrd54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const RecipeOptionalIngredients = Recipe.partial({
  ingredients: true,
});
// { title: string; description?: string | undefined; ingredients?: string[] | undefined }</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rrd54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rrd54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=required" class="peer" data-card=""><code>.required()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod provides an API for making some or all properties *required*, inspired by TypeScript's <a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#requiredtype" rel="noreferrer noopener" target="_blank"><code>Required</code></a> utility type.

To make all properties required:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rrt54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rrt54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const RequiredRecipe = Recipe.required();
// { title: string; description: string; ingredients: string[] }</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rrt54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rrt54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To make certain properties required:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rs554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rs554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const RecipeRequiredDescription = Recipe.required({description: true});
// { title: string; description: string; ingredients: string[] }</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rs554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rs554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=recursive-objects" class="peer" data-card="">Recursive objects</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define a self-referential type, use a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get" rel="noreferrer noopener" target="_blank">getter</a> on the key. This lets JavaScript resolve the cyclical schema at runtime.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Category = z.object({
  name: z.string(),
  get subcategories(){
    return z.array(Category)
  }
});
 
type Category = z.infer&lt;typeof Category&gt;;
// { name: string; subcategories: Category[] }</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyaWFuZ2xlLWFsZXJ0IHNpemUtNSBmaWxsLW9yYW5nZS01MDAgdGV4dC1mZC1jYXJkIj48cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiPjwvcGF0aD48cGF0aCBkPSJNMTIgOXY0Ij48L3BhdGg+PHBhdGggZD0iTTEyIDE3aC4wMSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

Though recursive schemas are supported, passing cyclical data into Zod will cause an infinite loop.

</div>

</div>

</div>

You can also represent *mutually recursive types*:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const User = z.object({
  email: z.email(),
  get posts(){
    return z.array(Post)
  }
});
 
const Post = z.object({
  title: z.string(),
  get author(){
    return User
  }
});</code></pre>
</div>
</div>
</div>
</figure>

All object APIs (`.pick()`, `.omit()`, `.required()`, `.partial()`, etc.) work as you'd expect.

### <a href="?id=circularity-errors" class="peer" data-card="">Circularity errors</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Due to TypeScript limitations, recursive type inference can be finicky, and it only works in certain scenarios. Some more complicated types may trigger recursive type errors like this:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Activity = z.object({
  name: z.string(),
  get subactivities() {
    // ^ ❌ &#39;subactivities&#39; implicitly has return type &#39;any&#39; because it does not
    // have a return type annotation and is referenced directly or indirectly
    // in one of its return expressions.ts(7023)
 
    return z.nullable(z.array(Activity));
  },
});</code></pre>
</div>
</div>
</div>
</figure>

In these cases, you can resolve the error with a type annotation on the offending getter:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Activity = z.object({
  name: z.string(),
  get subactivities(): z.ZodNullable&lt;z.ZodArray&lt;typeof Activity&gt;&gt; {
    return z.nullable(z.array(Activity));
  },
});</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=arrays" class="peer" data-card="">Arrays</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To define an array schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Ru554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ru554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const stringArray = z.array(z.string()); // or z.string().array()</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Ru554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ru554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To access the inner schema for an element of the array.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rud54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rud54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>stringArray.unwrap(); // =&gt; string schema</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rud54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rud54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

Zod implements a number of array-specific validations:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rul54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rul54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.array(z.string()).min(5); // must contain 5 or more items
z.array(z.string()).max(5); // must contain 5 or fewer items
z.array(z.string()).length(5); // must contain 5 items exactly</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rul54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rul54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=tuples" class="peer" data-card="">Tuples</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Unlike arrays, tuples are typically fixed-length arrays that specify different schemas for each index.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const MyTuple = z.tuple([
  z.string(),
  z.number(),
  z.boolean()
]);
 
type MyTuple = z.infer&lt;typeof MyTuple&gt;;
// [string, number, boolean]</code></pre>
</div>
</div>
</div>
</figure>

To add a variadic ("rest") argument:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const variadicTuple = z.tuple([z.string()], z.number());
// =&gt; [string, ...number[]];</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=unions" class="peer" data-card="">Unions</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Union types (`A | B`) represent a logical "OR". Zod union schemas will check the input against each option in order. The first value that validates successfully is returned.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const stringOrNumber = z.union([z.string(), z.number()]);
// string | number
 
stringOrNumber.parse(&quot;foo&quot;); // passes
stringOrNumber.parse(14); // passes</code></pre>
</div>
</div>
</div>
</figure>

To extract the internal option schemas:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rvv54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rvv54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>stringOrNumber.options; // [ZodString, ZodNumber]</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rvv54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rvv54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=discriminated-unions" class="peer" data-card="">Discriminated unions</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

A <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" rel="noreferrer noopener" target="_blank">discriminated union</a> is a special kind of union in which a) all the options are object schemas that b) share a particular key (the "discriminator"). Based on the value of the discriminator key, TypeScript is able to "narrow" the type signature as you'd expect.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>type MyResult =
  | { status: &quot;success&quot;; data: string }
  | { status: &quot;failed&quot;; error: string };
 
function handleResult(result: MyResult){
  if(result.status === &quot;success&quot;){
    result.data; // string
  } else {
    result.error; // string
  }
}</code></pre>
</div>
</div>
</div>
</figure>

You could represent it with a regular `z.union()`. But regular unions are *naive*—they check the input against each option in order and return the first one that passes. This can be slow for large unions.

So Zod provides a `z.discriminatedUnion()` API that uses a *discriminator key* to make parsing more efficient.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const MyResult = z.discriminatedUnion(&quot;status&quot;, [
  z.object({ status: z.literal(&quot;success&quot;), data: z.string() }),
  z.object({ status: z.literal(&quot;failed&quot;), error: z.string() }),
]);</code></pre>
</div>
</div>
</div>
</figure>

Each option should be an *object schema* whose discriminator prop (`status` in the example above) corresponds to some literal value or set of values, usually `z.enum()`, `z.literal()`, `z.null()`, or `z.undefined()`.

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" orientation="vertical">

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />Nesting discriminated unions

<div id="radix-«R31554uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«R11554uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

## <a href="?id=intersections" class="peer" data-card="">Intersections</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Intersection types (`A & B`) represent a logical "AND".

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);
const c = z.intersection(a, b);
 
type c = z.infer&lt;typeof c&gt;; // =&gt; number</code></pre>
</div>
</div>
</div>
</figure>

This can be useful for intersecting two object types.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Person = z.object({ name: z.string() });
type Person = z.infer&lt;typeof Person&gt;;
 
const Employee = z.object({ role: z.string() });
type Employee = z.infer&lt;typeof Employee&gt;;
 
const EmployedPerson = z.intersection(Person, Employee);
type EmployedPerson = z.infer&lt;typeof EmployedPerson&gt;;
// Person &amp; Employee</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyaWFuZ2xlLWFsZXJ0IHNpemUtNSBmaWxsLW9yYW5nZS01MDAgdGV4dC1mZC1jYXJkIj48cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiPjwvcGF0aD48cGF0aCBkPSJNMTIgOXY0Ij48L3BhdGg+PHBhdGggZD0iTTEyIDE3aC4wMSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

When merging object schemas, prefer [`A.extend(B)`](#extend) over intersections. Using `.extend()` will give you a new object schema, whereas `z.intersection(A, B)` returns a `ZodIntersection` instance which lacks common object methods like `pick` and `omit`.

</div>

</div>

</div>

## <a href="?id=records" class="peer" data-card="">Records</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Record schemas are used to validate types such as `Record<string, string>`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const IdCache = z.record(z.string(), z.string());
type IdCache = z.infer&lt;typeof IdCache&gt;; // Record&lt;string, string&gt;
 
IdCache.parse({
  carlotta: &quot;77d2586b-9e8e-4ecf-8b21-ea7e0530eadd&quot;,
  jimmie: &quot;77d2586b-9e8e-4ecf-8b21-ea7e0530eadd&quot;,
});</code></pre>
</div>
</div>
</div>
</figure>

The key schema can be any Zod schema that is assignable to `string | number | symbol`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Keys = z.union([z.string(), z.number(), z.symbol()]);
const AnyObject = z.record(Keys, z.unknown());
// Record&lt;string | number | symbol, unknown&gt;</code></pre>
</div>
</div>
</div>
</figure>

To create an object schemas containing keys defined by an enum:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Keys = z.enum([&quot;id&quot;, &quot;name&quot;, &quot;email&quot;]);
const Person = z.record(Keys, z.string());
// { id: string; name: string; email: string }</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Zod 4** — In Zod 4, if you pass a `z.enum` as the first argument to `z.record()`, Zod will exhaustively check that all enum values exist in the input as keys. This behavior agrees with TypeScript:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>type MyRecord = Record&lt;&quot;a&quot; | &quot;b&quot;, string&gt;;
const myRecord: MyRecord = { a: &quot;foo&quot;, b: &quot;bar&quot; }; // ✅
const myRecord: MyRecord = { a: &quot;foo&quot; }; // ❌ missing required key `b`</code></pre>
</div>
</div>
</div>
</figure>

In Zod 3, exhaustiveness was not checked. To replicate the old behavior, use `z.partialRecord()`.

</div>

</div>

</div>

If you want a *partial* record type, use `z.partialRecord()`. This skips the special exhaustiveness checks Zod normally runs with `z.enum()` and `z.literal()` key schemas.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Keys = z.enum([&quot;id&quot;, &quot;name&quot;, &quot;email&quot;]).or(z.never()); 
const Person = z.partialRecord(Keys, z.string());
// { id?: string; name?: string; email?: string }</code></pre>
</div>
</div>
</div>
</figure>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" orientation="vertical">

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />A note on numeric keys

<div id="radix-«R33954uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«R13954uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

## <a href="?id=maps" class="peer" data-card="">Maps</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const StringNumberMap = z.map(z.string(), z.number());
type StringNumberMap = z.infer&lt;typeof StringNumberMap&gt;; // Map&lt;string, number&gt;
 
const myMap: StringNumberMap = new Map();
myMap.set(&quot;one&quot;, 1);
myMap.set(&quot;two&quot;, 2);
 
StringNumberMap.parse(myMap);</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=sets" class="peer" data-card="">Sets</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const NumberSet = z.set(z.number());
type NumberSet = z.infer&lt;typeof NumberSet&gt;; // Set&lt;number&gt;
 
const mySet: NumberSet = new Set();
mySet.add(1);
mySet.add(2);
NumberSet.parse(mySet);</code></pre>
</div>
</div>
</div>
</figure>

Set schemas can be further constrained with the following utility methods.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R14154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.set(z.string()).min(5); // must contain 5 or more items
z.set(z.string()).max(5); // must contain 5 or fewer items
z.set(z.string()).size(5); // must contain 5 items exactly</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R14154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=files" class="peer" data-card="">Files</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate `File` instances:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R14d54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14d54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const fileSchema = z.file();
 
fileSchema.min(10_000); // minimum .size (bytes)
fileSchema.max(1_000_000); // maximum .size (bytes)
fileSchema.mime(&quot;image/png&quot;); // MIME type
fileSchema.mime([&quot;image/png&quot;, &quot;image/jpeg&quot;]); // multiple MIME types</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R14d54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14d54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=promises" class="peer" data-card="">Promises</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyaWFuZ2xlLWFsZXJ0IHNpemUtNSBmaWxsLW9yYW5nZS01MDAgdGV4dC1mZC1jYXJkIj48cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiPjwvcGF0aD48cGF0aCBkPSJNMTIgOXY0Ij48L3BhdGg+PHBhdGggZD0iTTEyIDE3aC4wMSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Deprecated** — `z.promise()` is deprecated in Zod 4. There are vanishingly few valid uses cases for a `Promise` schema. If you suspect a value might be a `Promise`, simply `await` it before parsing it with Zod.

</div>

</div>

</div>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" orientation="vertical">

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />See z.promise() documentation

<div id="radix-«R34p54uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«R14p54uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

## <a href="?id=instanceof" class="peer" data-card="">Instanceof</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

You can use `z.instanceof` to check that the input is an instance of a class. This is useful to validate inputs against classes that are exported from third-party libraries.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>class Test {
  name: string;
}
 
const TestSchema = z.instanceof(Test);
 
TestSchema.parse(new Test()); // ✅
TestSchema.parse(&quot;whatever&quot;); // ❌</code></pre>
</div>
</div>
</div>
</figure>

### <a href="?id=property" class="peer" data-card="">Property</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate a particular property of a class instance against a Zod schema:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const blobSchema = z.instanceof(URL).check(
  z.property(&quot;protocol&quot;, z.literal(&quot;https:&quot; as string, &quot;Only HTTPS allowed&quot;))
);
 
blobSchema.parse(new URL(&quot;https://example.com&quot;)); // ✅
blobSchema.parse(new URL(&quot;http://example.com&quot;)); // ❌</code></pre>
</div>
</div>
</div>
</figure>

The `z.property()` API works with any data type (but it's most useful when used in conjunction with `z.instanceof()`).

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const blobSchema = z.string().check(
  z.property(&quot;length&quot;, z.number().min(10))
);
 
blobSchema.parse(&quot;hello there!&quot;); // ✅
blobSchema.parse(&quot;hello.&quot;); // ❌</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=refinements" class="peer" data-card="">Refinements</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Every Zod schema stores an array of *refinements*. Refinements are a way to perform custom validation that Zod doesn't provide a native API for.

### <a href="?id=refine" class="peer" data-card=""><code>.refine()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R16b54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R16b54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const myString = z.string().refine((val) =&gt; val.length &lt;= 255);</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R16b54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R16b54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyaWFuZ2xlLWFsZXJ0IHNpemUtNSBmaWxsLW9yYW5nZS01MDAgdGV4dC1mZC1jYXJkIj48cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiPjwvcGF0aD48cGF0aCBkPSJNMTIgOXY0Ij48L3BhdGg+PHBhdGggZD0iTTEyIDE3aC4wMSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

Refinement functions should never throw. Instead they should return a falsy value to signal failure. Thrown errors are not caught by Zod.

</div>

</div>

</div>

#### <a href="?id=error" class="peer" data-card=""><code>error</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To customize the error message:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R16r54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R16r54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const myString = z.string().refine((val) =&gt; val.length &gt; 8, { 
  error: &quot;Too short!&quot; 
});</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R16r54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R16r54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

#### <a href="?id=abort" class="peer" data-card=""><code>abort</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

By default, validation issues from checks are considered *continuable*; that is, Zod will execute *all* checks in sequence, even if one of them causes a validation error. This is usually desirable, as it means Zod can surface as many errors as possible in one go.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R17754uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17754uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const myString = z.string()
  .refine((val) =&gt; val.length &gt; 8, { error: &quot;Too short!&quot; })
  .refine((val) =&gt; val === val.toLowerCase(), { error: &quot;Must be lowercase&quot; });
  
 
const result = myString.safeParse(&quot;OH NO&quot;);
result.error?.issues;
/* [
  { &quot;code&quot;: &quot;custom&quot;, &quot;message&quot;: &quot;Too short!&quot; },
  { &quot;code&quot;: &quot;custom&quot;, &quot;message&quot;: &quot;Must be lowercase&quot; }
] */</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R17754uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17754uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To mark a particular refinement as *non-continuable*, use the `abort` parameter. Validation will terminate if the check fails.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R17f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const myString = z.string()
  .refine((val) =&gt; val.length &gt; 8, { error: &quot;Too short!&quot;, abort: true })
  .refine((val) =&gt; val === val.toLowerCase(), { error: &quot;Must be lowercase&quot;, abort: true });
 
 
const result = myString.safeParse(&quot;OH NO&quot;);
result.error?.issues;
// =&gt; [{ &quot;code&quot;: &quot;custom&quot;, &quot;message&quot;: &quot;Too short!&quot; }]</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R17f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

#### <a href="?id=path" class="peer" data-card=""><code>path</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To customize the error path, use the `path` parameter. This is typically only useful in the context of object schemas.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R17r54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17r54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) =&gt; data.password === data.confirm, {
    message: &quot;Passwords don&#39;t match&quot;,
    path: [&quot;confirm&quot;], // path of error
  });</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R17r54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17r54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

This will set the `path` parameter in the associated issue:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R18354uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R18354uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const result = passwordForm.safeParse({ password: &quot;asdf&quot;, confirm: &quot;qwer&quot; });
result.error.issues;
/* [{
  &quot;code&quot;: &quot;custom&quot;,
  &quot;path&quot;: [ &quot;confirm&quot; ],
  &quot;message&quot;: &quot;Passwords don&#39;t match&quot;
}] */</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R18354uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R18354uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To define an asynchronous refinement, just pass an `async` function:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const userId = z.string().refine(async (id) =&gt; {
  // verify that ID exists in database
  return true;
});</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

If you use async refinements, you must use the `.parseAsync` method to parse data! Otherwise Zod will throw an error.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R2l8f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2l8f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const result = await userId.parseAsync(&quot;abc123&quot;);</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R2l8f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2l8f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>

#### <a href="?id=when" class="peer" data-card=""><code>when</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Note** — This is a power user feature and can absolutely be abused in ways that will increase the probability of uncaught errors originating from inside your refinements.

</div>

</div>

</div>

By default, refinements don't run if any *non-continuable* issues have already been encountered. Zod is careful to ensure the type signature of the value is correct before passing it into any refinement functions.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.string().refine((val) =&gt; {
  return val.length &gt; 8
});
 
schema.parse(1234); // invalid_type: refinement won&#39;t be executed</code></pre>
</div>
</div>
</div>
</figure>

In some cases, you want finer control over when refinements run. For instance consider this "password confirm" check:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R19754uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19754uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
    anotherField: z.string(),
  })
  .refine((data) =&gt; data.password === data.confirmPassword, {
    message: &quot;Passwords do not match&quot;,
    path: [&quot;confirmPassword&quot;],
  });
 
schema.parse({
  password: &quot;asdf&quot;,
  confirmPassword: &quot;asdf&quot;,
  anotherField: 1234 // ❌ this error will prevent the password check from running
});</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R19754uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19754uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

An error on `anotherField` will prevent the password confirmation check from executing, even though the check doesn't depend on `anotherField`. To control when a refinement will run, use the `when` parameter:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R19f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark has-diff" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
    anotherField: z.string(),
  })
  .refine((data) =&gt; data.password === data.confirmPassword, {
    message: &quot;Passwords do not match&quot;,
    path: [&quot;confirmPassword&quot;],
 
    // run if password &amp; confirmPassword are valid
    when(payload) { 
      return schema 
        .pick({ password: true, confirmPassword: true }) 
        .safeParse(payload.value).success; 
    },  
  });
 
schema.parse({
  password: &quot;asdf&quot;,
  confirmPassword: &quot;asdf&quot;,
  anotherField: 1234 // ❌ this error will not prevent the password check from running
});</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R19f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=superrefine" class="peer" data-card=""><code>.superRefine()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

The regular `.refine` API only generates a single issue with a `"custom"` error code, but `.superRefine()` makes it possible to create multiple issues using any of Zod's <a href="https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/errors.ts" rel="noreferrer noopener" target="_blank">internal issue types</a>.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R19r54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19r54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const UniqueStringArray = z.array(z.string()).superRefine((val, ctx) =&gt; {
  if (val.length &gt; 3) {
    ctx.addIssue({
      code: &quot;too_big&quot;,
      maximum: 3,
      origin: &quot;array&quot;,
      inclusive: true,
      message: &quot;Too many items 😡&quot;,
      input: val,
    });
  }
 
  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: &quot;custom&quot;,
      message: `No duplicates allowed.`,
      input: val,
    });
  }
});
 </code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R19r54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19r54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=check" class="peer" data-card=""><code>.check()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Note** — The `.check()` API is a more low-level API that's generally more complex than `.superRefine()`. It can be faster in performance-sensitive code paths, but it's also more verbose.

</div>

</div>

</div>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" orientation="vertical">

<div class="group/accordion relative scroll-m-20" state="closed" orientation="vertical">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW1zLTEgc2l6ZS00IHNocmluay0wIHRleHQtZmQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLXRyYW5zZm9ybSBkdXJhdGlvbi0yMDAgZ3JvdXAtZGF0YS1bc3RhdGU9b3Blbl0vYWNjb3JkaW9uOnJvdGF0ZS05MCI+PHBhdGggZD0ibTkgMTggNi02LTYtNiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90" />View example

<div id="radix-«R3a754uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" state="closed" hidden="" role="region" aria-labelledby="radix-«R1a754uvbl5b»" orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

## <a href="?id=codecs" class="peer" data-card="">Codecs</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**New** — Introduced in Zod 4.1. Refer to the dedicated [Codecs](/codecs) page for more information.

</div>

</div>

</div>

Codecs are a special kind of schema that implement *bidirectional transformations* between two other schemas.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const stringToDate = z.codec(
  z.iso.datetime(),  // input schema: ISO date string
  z.date(),          // output schema: Date object
  {
    decode: (isoString) =&gt; new Date(isoString), // ISO string → Date
    encode: (date) =&gt; date.toISOString(),       // Date → ISO string
  }
);</code></pre>
</div>
</div>
</div>
</figure>

A regular `.parse()` operations performs the *forward transform*. It calls the codec's `decode` function.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>stringToDate.parse(&quot;2024-01-15T10:30:00.000Z&quot;); // =&gt; Date</code></pre>
</div>
</div>
</div>
</figure>

You can alternatively use the top-level `z.decode()` function. Unlike `.parse()` (which accepts `unknown` input), `z.decode()` expects a strongly-typed input (`string` in this example).

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.decode(stringToDate, &quot;2024-01-15T10:30:00.000Z&quot;); // =&gt; Date</code></pre>
</div>
</div>
</div>
</figure>

To perform the *reverse transform*, use the inverse: `z.encode()`.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.encode(stringToDate, new Date(&quot;2024-01-15&quot;)); // =&gt; &quot;2024-01-15T00:00:00.000Z&quot;</code></pre>
</div>
</div>
</div>
</figure>

Refer to the dedicated [Codecs](/codecs) page for more information. That page contains implementations for commonly-needed codecs that you can copy/paste into your project:

- [**`stringToNumber`**](/codecs#stringtonumber)
- [**`stringToInt`**](/codecs#stringtoint)
- [**`stringToBigInt`**](/codecs#stringtobigint)
- [**`numberToBigInt`**](/codecs#numbertobigint)
- [**`isoDatetimeToDate`**](/codecs#isodatetimetodate)
- [**`epochSecondsToDate`**](/codecs#epochsecondstodate)
- [**`epochMillisToDate`**](/codecs#epochmillistodate)
- [**`jsonCodec`**](/codecs#jsoncodec)
- [**`utf8ToBytes`**](/codecs#utf8tobytes)
- [**`bytesToUtf8`**](/codecs#bytestoutf8)
- [**`base64ToBytes`**](/codecs#base64tobytes)
- [**`base64urlToBytes`**](/codecs#base64urltobytes)
- [**`hexToBytes`**](/codecs#hextobytes)
- [**`stringToURL`**](/codecs#stringtourl)
- [**`stringToHttpURL`**](/codecs#stringtohttpurl)
- [**`uriComponent`**](/codecs#uricomponent)
- [**`stringToBoolean`**](/codecs#stringtoboolean)

## <a href="?id=pipes" class="peer" data-card="">Pipes</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Schemas can be chained together into "pipes". Pipes are primarily useful when used in conjunction with [Transforms](#transforms).

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1c354uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1c354uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const stringToLength = z.string().pipe(z.transform(val =&gt; val.length));
 
stringToLength.parse(&quot;hello&quot;); // =&gt; 5</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1c354uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1c354uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=transforms" class="peer" data-card="">Transforms</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Note** — For bi-directional transforms, use [codecs](/codecs).

</div>

</div>

</div>

Transforms are a special kind of schema that perform a unidirectional transformation. Instead of validating input, they accept anything and perform some transformation on the data. To define a transform:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1cj54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1cj54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const castToString = z.transform((val) =&gt; String(val));
 
castToString.parse(&quot;asdf&quot;); // =&gt; &quot;asdf&quot;
castToString.parse(123); // =&gt; &quot;123&quot;
castToString.parse(true); // =&gt; &quot;true&quot;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1cj54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1cj54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyaWFuZ2xlLWFsZXJ0IHNpemUtNSBmaWxsLW9yYW5nZS01MDAgdGV4dC1mZC1jYXJkIj48cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiPjwvcGF0aD48cGF0aCBkPSJNMTIgOXY0Ij48L3BhdGg+PHBhdGggZD0iTTEyIDE3aC4wMSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

Refinement functions should never throw. Thrown errors are not caught by Zod.

</div>

</div>

</div>

To perform validation logic inside a transform, use `ctx`. To report a validation issue, push a new issue onto `ctx.issues` (similar to the [`.check()`](#check) API).

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const coercedInt = z.transform((val, ctx) =&gt; {
  try {
    const parsed = Number.parseInt(String(val));
    return parsed;
  } catch (e) {
    ctx.issues.push({
      code: &quot;custom&quot;,
      message: &quot;Not a number&quot;,
      input: val,
    });
 
    // this is a special constant with type `never`
    // returning it lets you exit the transform without impacting the inferred return type
    return z.NEVER;
  }
});</code></pre>
</div>
</div>
</div>
</figure>

Most commonly, transforms are used in conjunction with [Pipes](#pipes). This combination is useful for performing some initial validation, then transforming the parsed data into another form.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1d954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1d954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const stringToLength = z.string().pipe(z.transform(val =&gt; val.length));
 
stringToLength.parse(&quot;hello&quot;); // =&gt; 5</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1d954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1d954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

### <a href="?id=transform" class="peer" data-card=""><code>.transform()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Piping some schema into a transform is a common pattern, so Zod provides a convenience `.transform()` method.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1dl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1dl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const stringToLength = z.string().transform(val =&gt; val.length); </code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1dl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1dl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

Transforms can also be async:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1dt54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1dt54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const idToUser = z
  .string()
  .transform(async (id) =&gt; {
    // fetch user from database
    return db.getUserById(id); 
  });
 
const user = await idToUser.parseAsync(&quot;abc123&quot;);</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1dt54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1dt54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

If you use async transforms, you must use a `.parseAsync` or `.safeParseAsync` when parsing data! Otherwise Zod will throw an error.

</div>

</div>

</div>

### <a href="?id=preprocess" class="peer" data-card=""><code>.preprocess()</code></a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Piping a transform into another schema is another common pattern, so Zod provides a convenience `z.preprocess()` function.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const coercedInt = z.preprocess((val) =&gt; {
  if (typeof val === &quot;string&quot;) {
    return Number.parseInt(val);
  }
  return val;
}, z.int());</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=defaults" class="peer" data-card="">Defaults</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To set a default value for a schema:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1ep54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ep54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const defaultTuna = z.string().default(&quot;tuna&quot;);
 
defaultTuna.parse(undefined); // =&gt; &quot;tuna&quot;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1ep54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ep54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

Alternatively, you can pass a function which will be re-executed whenever a default value needs to be generated:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1f154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1f154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const randomDefault = z.number().default(Math.random);
 
randomDefault.parse(undefined);    // =&gt; 0.4413456736055323
randomDefault.parse(undefined);    // =&gt; 0.1871840107401901
randomDefault.parse(undefined);    // =&gt; 0.7223408162401552</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1f154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1f154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=prefaults" class="peer" data-card="">Prefaults</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

In Zod, setting a *default* value will short-circuit the parsing process. If the input is `undefined`, the default value is eagerly returned. As such, the default value must be assignable to the *output type* of the schema.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const schema = z.string().transform(val =&gt; val.length).default(0);
schema.parse(undefined); // =&gt; 0</code></pre>
</div>
</div>
</div>
</figure>

Sometimes, it's useful to define a *prefault* ("pre-parse default") value. If the input is `undefined`, the prefault value will be parsed instead. The parsing process is *not* short circuited. As such, the prefault value must be assignable to the *input type* of the schema.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.string().transform(val =&gt; val.length).prefault(&quot;tuna&quot;);
schema.parse(undefined); // =&gt; 4</code></pre>
</div>
</div>
</div>
</figure>

This is also useful if you want to pass some input value through some mutating refinements.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const a = z.string().trim().toUpperCase().prefault(&quot;  tuna  &quot;);
a.parse(undefined); // =&gt; &quot;TUNA&quot;
 
const b = z.string().trim().toUpperCase().default(&quot;  tuna  &quot;);
b.parse(undefined); // =&gt; &quot;  tuna  &quot;</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=catch" class="peer" data-card="">Catch</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Use `.catch()` to define a fallback value to be returned in the event of a validation error:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1g954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1g954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const numberWithCatch = z.number().catch(42);
 
numberWithCatch.parse(5); // =&gt; 5
numberWithCatch.parse(&quot;tuna&quot;); // =&gt; 42</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1g954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1g954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

Alternatively, you can pass a function which will be re-executed whenever a catch value needs to be generated.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1gh54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1gh54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const numberWithRandomCatch = z.number().catch((ctx) =&gt; {
  ctx.error; // the caught ZodError
  return Math.random();
});
 
numberWithRandomCatch.parse(&quot;sup&quot;); // =&gt; 0.4413456736055323
numberWithRandomCatch.parse(&quot;sup&quot;); // =&gt; 0.1871840107401901
numberWithRandomCatch.parse(&quot;sup&quot;); // =&gt; 0.7223408162401552</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1gh54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1gh54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=branded-types" class="peer" data-card="">Branded types</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

TypeScript's type system is <a href="https://www.typescriptlang.org/docs/handbook/type-compatibility.html" rel="noreferrer noopener" target="_blank">structural</a>, meaning that two types that are structurally equivalent are considered the same.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>type Cat = { name: string };
type Dog = { name: string };
 
const pluto: Dog = { name: &quot;pluto&quot; };
const simba: Cat = pluto; // works fine</code></pre>
</div>
</div>
</div>
</figure>

In some cases, it can be desirable to simulate <a href="https://en.wikipedia.org/wiki/Nominal_type_system" rel="noreferrer noopener" target="_blank">nominal typing</a> inside TypeScript. This can be achieved with *branded types* (also known as "opaque types").

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Cat = z.object({ name: z.string() }).brand&lt;&quot;Cat&quot;&gt;();
const Dog = z.object({ name: z.string() }).brand&lt;&quot;Dog&quot;&gt;();
 
type Cat = z.infer&lt;typeof Cat&gt;; // { name: string } &amp; z.$brand&lt;&quot;Cat&quot;&gt;
type Dog = z.infer&lt;typeof Dog&gt;; // { name: string } &amp; z.$brand&lt;&quot;Dog&quot;&gt;
 
const pluto = Dog.parse({ name: &quot;pluto&quot; });
const simba: Cat = pluto; // ❌ not allowed</code></pre>
</div>
</div>
</div>
</figure>

Under the hood, this works by attaching a "brand" to the schema's inferred type.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Cat = z.object({ name: z.string() }).brand&lt;&quot;Cat&quot;&gt;();
type Cat = z.infer&lt;typeof Cat&gt;; // { name: string } &amp; z.$brand&lt;&quot;Cat&quot;&gt;</code></pre>
</div>
</div>
</div>
</figure>

With this brand, any plain (unbranded) data structures are no longer assignable to the inferred type. You have to parse some data with the schema to get branded data.

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

Note that branded types do not affect the runtime result of `.parse`. It is a static-only construct.

</div>

</div>

</div>

## <a href="?id=readonly" class="peer" data-card="">Readonly</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To mark a schema as readonly:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1i154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1i154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const ReadonlyUser = z.object({ name: z.string() }).readonly();
type ReadonlyUser = z.infer&lt;typeof ReadonlyUser&gt;;
// Readonly&lt;{ name: string }&gt;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1i154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1i154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

The inferred type of the new schemas will be marked as `readonly`. Note that in TypeScript, this only affects objects, arrays, tuples, `Set`, and `Map`:

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1i954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1i954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.object({ name: z.string() }).readonly(); // { readonly name: string }
z.array(z.string()).readonly(); // readonly string[]
z.tuple([z.string(), z.number()]).readonly(); // readonly [string, number]
z.map(z.string(), z.date()).readonly(); // ReadonlyMap&lt;string, Date&gt;
z.set(z.string()).readonly(); // ReadonlySet&lt;string&gt;</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1i954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1i954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

Inputs will be parsed like normal, then the result will be frozen with <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze" rel="noreferrer noopener" target="_blank"><code>Object.freeze()</code></a> to prevent modifications.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1ih54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ih54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const result = ReadonlyUser.parse({ name: &quot;fido&quot; });
result.name = &quot;simba&quot;; // throws TypeError</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1ih54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ih54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=json" class="peer" data-card="">JSON</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

To validate any JSON-encodable value:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const jsonSchema = z.json();</code></pre>
</div>
</div>
</div>
</figure>

This is a convenience API that returns the following union schema:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const jsonSchema = z.lazy(() =&gt; {
  return z.union([
    z.string(params), 
    z.number(), 
    z.boolean(), 
    z.null(), 
    z.array(jsonSchema), 
    z.record(z.string(), jsonSchema)
  ]);
});</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=functions" class="peer" data-card="">Functions</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod provides a `z.function()` utility for defining Zod-validated functions. This way, you can avoid intermixing validation code with your business logic.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const MyFunction = z.function({
  input: [z.string()], // parameters (must be an array or a ZodTuple)
  output: z.number()  // return type
});
 
type MyFunction = z.infer&lt;typeof MyFunction&gt;;
// (input: string) =&gt; number</code></pre>
</div>
</div>
</div>
</figure>

Function schemas have an `.implement()` method which accepts a function and returns a new function that automatically validates its inputs and outputs.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const computeTrimmedLength = MyFunction.implement((input) =&gt; {
  // TypeScript knows input is a string!
  return input.trim().length;
});
 
computeTrimmedLength(&quot;sandwich&quot;); // =&gt; 8
computeTrimmedLength(&quot; asdf &quot;); // =&gt; 4</code></pre>
</div>
</div>
</div>
</figure>

This function will throw a `ZodError` if the input is invalid:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>computeTrimmedLength(42); // throws ZodError</code></pre>
</div>
</div>
</div>
</figure>

If you only care about validating inputs, you can omit the `output` field.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const MyFunction = z.function({
  input: [z.string()], // parameters (must be an array or a ZodTuple)
});
 
const computeTrimmedLength = MyFunction.implement((input) =&gt; input.trim.length);</code></pre>
</div>
</div>
</div>
</figure>

Use the `.implementAsync()` method to create an async function.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const computeTrimmedLengthAsync = MyFunction.implementAsync(
  async (input) =&gt; input.trim().length
);
 
computeTrimmedLengthAsync(&quot;sandwich&quot;); // =&gt; Promise&lt;8&gt;</code></pre>
</div>
</div>
</div>
</figure>

## <a href="?id=custom" class="peer" data-card="">Custom</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

You can create a Zod schema for any TypeScript type by using `z.custom()`. This is useful for creating schemas for types that are not supported by Zod out of the box, such as template string literals.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const px = z.custom&lt;`${number}px`&gt;((val) =&gt; {
  return typeof val === &quot;string&quot; ? /^\d+px$/.test(val) : false;
});
 
type px = z.infer&lt;typeof px&gt;; // `${number}px`
 
px.parse(&quot;42px&quot;); // &quot;42px&quot;
px.parse(&quot;42vw&quot;); // throws;</code></pre>
</div>
</div>
</div>
</figure>

If you don't provide a validation function, Zod will allow any value. This can be dangerous!

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.custom&lt;{ arg: string }&gt;(); // performs no validation</code></pre>
</div>
</div>
</div>
</figure>

You can customize the error message and other options by passing a second argument. This parameter works the same way as the params parameter of [`.refine`](#refine).

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>z.custom&lt;...&gt;((val) =&gt; ..., &quot;custom error message&quot;);</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div class="flex-1" role="none">

</div>

<div class="flex flex-row flex-wrap items-center justify-between gap-4 empty:hidden">

</div>

<div class="@container grid gap-4 pb-6 grid-cols-2">

<a href="/basics" class="flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full"></a>

<div class="inline-flex items-center gap-1.5 font-medium">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tbGVmdCAtbXgtMSBzaXplLTQgc2hyaW5rLTAgcnRsOnJvdGF0ZS0xODAiPjxwYXRoIGQ9Im0xNSAxOC02LTYgNi02Ij48L3BhdGg+PC9zdmc+" class="lucide lucide-chevron-left -mx-1 size-4 shrink-0 rtl:rotate-180" />

Basic usage

</div>

Basic usage guide covering schema definition, parsing data, error handling, and type inference

<a href="/error-customization" class="flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full text-end"></a>

<div class="inline-flex items-center gap-1.5 flex-row-reverse font-medium">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW14LTEgc2l6ZS00IHNocmluay0wIHJ0bDpyb3RhdGUtMTgwIj48cGF0aCBkPSJtOSAxOCA2LTYtNi02Ij48L3BhdGg+PC9zdmc+" class="lucide lucide-chevron-right -mx-1 size-4 shrink-0 rtl:rotate-180" />

Customizing errors

</div>

Guide to customizing validation error messages and error handling patterns

</div>

</div>

<div id="nd-toc" class="sticky top-[calc(var(--fd-banner-height)+var(--fd-nav-height))] h-(--fd-toc-height) pb-2 pt-12 max-xl:hidden" style="--fd-toc-height:calc(100dvh - var(--fd-banner-height) - var(--fd-nav-height))">

<div class="flex h-full w-(--fd-toc-width) max-w-full flex-col gap-3 pe-4">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRleHQgc2l6ZS00Ij48cGF0aCBkPSJNMTcgNi4xSDMiPjwvcGF0aD48cGF0aCBkPSJNMjEgMTIuMUgzIj48L3BhdGg+PHBhdGggZD0iTTE1LjEgMThIMyI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-text size-4" />On this page

<div class="overflow-hidden flex flex-col ps-px" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<div class="size-full rounded-[inherit] relative min-h-0 text-sm" radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<div class="flex flex-col">

<a href="#primitives" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Primitives<a href="#coercion" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5 bottom-1.5" style="inset-inline-start:10px">

</div>

Coercion<a href="#literals" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Literals<a href="#strings" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Strings<a href="#string-formats" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

String formats<a href="#emails" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:10px">

</div>

Emails<a href="#uuids" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

UUIDs<a href="#urls" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

URLs<a href="#iso-datetimes" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

ISO datetimes<a href="#iso-dates" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

ISO dates<a href="#iso-times" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

ISO times<a href="#ip-addresses" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

IP addresses<a href="#ip-blocks-cidr" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

IP blocks (CIDR)<a href="#jwts" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

JWTs<a href="#hashes" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

Hashes<a href="#custom-formats" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:10px">

</div>

Custom formats<a href="#template-literals" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Template literals<a href="#numbers" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Numbers<a href="#integers" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Integers<a href="#bigints" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

BigInts<a href="#booleans" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Booleans<a href="#dates" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Dates<a href="#enums" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Enums<a href="#enum" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:10px">

</div>

`.enum`<a href="#exclude" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.exclude()`<a href="#extract" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:10px">

</div>

`.extract()`<a href="#stringbool" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Stringbools<a href="#optionals" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Optionals<a href="#nullables" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Nullables<a href="#nullish" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Nullish<a href="#unknown" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Unknown<a href="#never" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Never<a href="#objects" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Objects<a href="#zstrictobject" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:10px">

</div>

`z.strictObject`<a href="#zlooseobject" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`z.looseObject`<a href="#catchall" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.catchall()`<a href="#shape" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.shape`<a href="#keyof" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.keyof()`<a href="#extend" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.extend()`<a href="#safeextend" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.safeExtend()`<a href="#pick" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.pick()`<a href="#omit" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.omit()`<a href="#partial" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.partial()`<a href="#required" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:10px">

</div>

`.required()`<a href="#recursive-objects" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5 bottom-1.5" style="inset-inline-start:0">

</div>

Recursive objects<a href="#circularity-errors" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5 bottom-1.5" style="inset-inline-start:10px">

</div>

Circularity errors<a href="#arrays" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Arrays<a href="#tuples" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Tuples<a href="#unions" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Unions<a href="#discriminated-unions" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Discriminated unions<a href="#intersections" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Intersections<a href="#records" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Records<a href="#maps" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Maps<a href="#sets" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Sets<a href="#files" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Files<a href="#promises" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Promises<a href="#instanceof" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Instanceof<a href="#property" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5 bottom-1.5" style="inset-inline-start:10px">

</div>

Property<a href="#refinements" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5 bottom-1.5" style="inset-inline-start:0">

</div>

Refinements<a href="#refine" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:10px">

</div>

`.refine()`<a href="#superrefine" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:10px">

</div>

`.superRefine()`<a href="#check" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:10px">

</div>

`.check()`<a href="#codecs" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Codecs<a href="#pipes" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Pipes<a href="#transforms" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:0">

</div>

Transforms<a href="#transform" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:10px">

</div>

`.transform()`<a href="#preprocess" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:26px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 bottom-1.5" style="inset-inline-start:10px">

</div>

`.preprocess()`<a href="#defaults" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiAxNiIgY2xhc3M9ImFic29sdXRlIC10b3AtMS41IHN0YXJ0LTAgc2l6ZS00IHJ0bDotc2NhbGUteC0xMDAiPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTIiIGNsYXNzPSJzdHJva2UtZmQtZm9yZWdyb3VuZC8xMCIgc3Ryb2tlLXdpZHRoPSIxIj48L2xpbmU+PC9zdmc+" class="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100" /></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10 top-1.5" style="inset-inline-start:0">

</div>

Defaults<a href="#prefaults" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Prefaults<a href="#catch" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Catch<a href="#branded-types" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Branded types<a href="#readonly" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Readonly<a href="#json" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

JSON<a href="#functions" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Functions<a href="#custom" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Custom

</div>

</div>

</div>

</div>

</div>

</div>

</div>
