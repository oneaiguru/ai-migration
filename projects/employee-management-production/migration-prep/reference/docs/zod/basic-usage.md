---
source: https://zod.dev/?id=basic-usage
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

<a href="/basics" class="relative flex flex-row items-center gap-2 rounded-md p-2 text-start [overflow-wrap:anywhere] md:py-1.5 [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-fd-primary/10 text-fd-primary" data-active="true" style="padding-inline-start:calc(var(--spacing) * 2)"></a>

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

<div class="mb-6">

# Basic usage

<div class="h-2">

</div>

<div class="flex items-center gap-2">

<div class="flex items-center gap-1.5">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgdy0zIGgtMyI+PHJlY3Qgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB4PSI4IiB5PSI4IiByeD0iMiIgcnk9IjIiPjwvcmVjdD48cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIj48L3BhdGg+PC9zdmc+" class="lucide lucide-copy w-3 h-3" />Copy markdown

</div>

<a href="https://github.com/colinhacks/zod/edit/main/packages/docs/content/basics.mdx" class="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-fd-muted-foreground hover:text-fd-foreground border border-[var(--color-fd-border)] rounded hover:bg-fd-muted/50 transition-colors" target="_blank" rel="noreferrer noopener"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdpdGh1YiB3LTMgaC0zIj48cGF0aCBkPSJNMTUgMjJ2LTRhNC44IDQuOCAwIDAgMC0xLTMuNWMzIDAgNi0yIDYtNS41LjA4LTEuMjUtLjI3LTIuNDgtMS0zLjUuMjgtMS4xNS4yOC0yLjM1IDAtMy41IDAgMC0xIDAtMyAxLjUtMi42NC0uNS01LjM2LS41LTggMEM2IDIgNSAyIDUgMmMtLjMgMS4xNS0uMyAyLjM1IDAgMy41QTUuNDAzIDUuNDAzIDAgMCAwIDQgOWMwIDMuNSAzIDUuNSA2IDUuNS0uMzkuNDktLjY4IDEuMDUtLjg1IDEuNjUtLjE3LjYtLjIyIDEuMjMtLjE1IDEuODV2NCI+PC9wYXRoPjxwYXRoIGQ9Ik05IDE4Yy00LjUxIDItNS0yLTctMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-github w-3 h-3" />Edit this page</a>

</div>

</div>

<div class="prose">

This page will walk you through the basics of creating schemas, parsing data, and using inferred types. For complete documentation on Zod's schema API, refer to [Defining schemas](/api).

## <a href="?id=defining-a-schema" class="peer" data-card="">Defining a schema</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Before you can do anything else, you need to define a schema. For the purposes of this guide, we'll use a simple object schema.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«Rf54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rf54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>import * as z from &quot;zod&quot;; 
 
const Player = z.object({ 
  username: z.string(),
  xp: z.number()
});</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«Rf54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rf54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

## <a href="?id=parsing-data" class="peer" data-card="">Parsing data</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Given any Zod schema, use `.parse` to validate an input. If it's valid, Zod returns a strongly-typed *deep clone* of the input.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>Player.parse({ username: &quot;billie&quot;, xp: 100 }); 
// =&gt; returns { username: &quot;billie&quot;, xp: 100 }</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Note** — If your schema uses certain asynchronous APIs like `async` [refinements](/api#refinements) or [transforms](/api#transforms), you'll need to use the `.parseAsync()` method instead.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>await Player.parseAsync({ username: &quot;billie&quot;, xp: 100 }); </code></pre>
</div>
</div>
</div>
</figure>

</div>

</div>

</div>

## <a href="?id=handling-errors" class="peer" data-card="">Handling errors</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

When validation fails, the `.parse()` method will throw a `ZodError` instance with granular information about the validation issues.

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" orientation="horizontal" style="outline:none">

Zod

Zod Mini

</div>

<div id="radix-«R1b54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="active" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1b54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>try {
  Player.parse({ username: 42, xp: &quot;100&quot; });
} catch(error){
  if(error instanceof z.ZodError){
    error.issues; 
    /* [
      {
        expected: &#39;string&#39;,
        code: &#39;invalid_type&#39;,
        path: [ &#39;username&#39; ],
        message: &#39;Invalid input: expected string&#39;
      },
      {
        expected: &#39;number&#39;,
        code: &#39;invalid_type&#39;,
        path: [ &#39;xp&#39; ],
        message: &#39;Invalid input: expected number&#39;
      }
    ] */
  }
}</code></pre>
</div>
</div>
</div>
</figure>

</div>

<div id="radix-«R1b54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" state="inactive" orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1b54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

To avoid a `try/catch` block, you can use the `.safeParse()` method to get back a plain result object containing either the successfully parsed data or a `ZodError`. The result type is a <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" rel="noreferrer noopener" target="_blank">discriminated union</a>, so you can handle both cases conveniently.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const result = Player.safeParse({ username: 42, xp: &quot;100&quot; });
if (!result.success) {
  result.error;   // ZodError instance
} else {
  result.data;    // { username: string; xp: number }
}</code></pre>
</div>
</div>
</div>
</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluZm8gc2l6ZS01IGZpbGwtYmx1ZS01MDAgdGV4dC1mZC1jYXJkIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTEyIDE2di00Ij48L3BhdGg+PHBhdGggZD0iTTEyIDhoLjAxIj48L3BhdGg+PC9zdmc+" class="lucide lucide-info size-5 fill-blue-500 text-fd-card" />

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

**Note** — If your schema uses certain asynchronous APIs like `async` [refinements](/api#refinements) or [transforms](/api#transforms), you'll need to use the `.safeParseAsync()` method instead.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>await schema.safeParseAsync(&quot;hello&quot;);</code></pre>
</div>
</div>
</div>
</figure>

</div>

</div>

</div>

## <a href="?id=inferring-types" class="peer" data-card="">Inferring types</a><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsgc2l6ZS0zLjUgc2hyaW5rLTAgdGV4dC1mZC1tdXRlZC1mb3JlZ3JvdW5kIG9wYWNpdHktMCB0cmFuc2l0aW9uLW9wYWNpdHkgcGVlci1ob3ZlcjpvcGFjaXR5LTEwMCIgYXJpYS1sYWJlbD0iTGluayB0byBzZWN0aW9uIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" />

Zod infers a static type from your schema definitions. You can extract this type with the `z.infer<>` utility and use it however you like.

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const Player = z.object({ 
  username: z.string(),
  xp: z.number()
});
 
// extract the inferred type
type Player = z.infer&lt;typeof Player&gt;;
 
// use it in your code
const player: Player = { username: &quot;billie&quot;, xp: 100 };</code></pre>
</div>
</div>
</div>
</figure>

In some cases, the input & output types of a schema can diverge. For instance, the `.transform()` API can convert the input from one type to another. In these cases, you can extract the input and output types independently:

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZWNrIHRyYW5zaXRpb24tdHJhbnNmb3JtIHNjYWxlLTAiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-check transition-transform scale-0" /><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkgYWJzb2x1dGUgdHJhbnNpdGlvbi10cmFuc2Zvcm0iPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMiI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-copy absolute transition-transform" />
<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">
<div style="min-width:100%;display:table">
<pre class="p-4 focus-visible:outline-none"><code>const mySchema = z.string().transform((val) =&gt; val.length);
 
type MySchemaIn = z.input&lt;typeof mySchema&gt;;
// =&gt; string
 
type MySchemaOut = z.output&lt;typeof mySchema&gt;; // equivalent to z.infer&lt;typeof mySchema&gt;
// number</code></pre>
</div>
</div>
</div>
</figure>

------------------------------------------------------------------------

Now that we have the basics covered, let's jump into the Schema API.

</div>

<div class="flex-1" role="none">

</div>

<div class="flex flex-row flex-wrap items-center justify-between gap-4 empty:hidden">

</div>

<div class="@container grid gap-4 pb-6 grid-cols-2">

<a href="/" class="flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full"></a>

<div class="inline-flex items-center gap-1.5 font-medium">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tbGVmdCAtbXgtMSBzaXplLTQgc2hyaW5rLTAgcnRsOnJvdGF0ZS0xODAiPjxwYXRoIGQ9Im0xNSAxOC02LTYgNi02Ij48L3BhdGg+PC9zdmc+" class="lucide lucide-chevron-left -mx-1 size-4 shrink-0 rtl:rotate-180" />

Intro

</div>

Introduction to Zod - TypeScript-first schema validation library with static type inference

<a href="/api" class="flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full text-end"></a>

<div class="inline-flex items-center gap-1.5 flex-row-reverse font-medium">

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tcmlnaHQgLW14LTEgc2l6ZS00IHNocmluay0wIHJ0bDpyb3RhdGUtMTgwIj48cGF0aCBkPSJtOSAxOCA2LTYtNi02Ij48L3BhdGg+PC9zdmc+" class="lucide lucide-chevron-right -mx-1 size-4 shrink-0 rtl:rotate-180" />

Defining schemas

</div>

Complete API reference for all Zod schema types, methods, and validation features

</div>

</div>

<div id="nd-toc" class="sticky top-[calc(var(--fd-banner-height)+var(--fd-nav-height))] h-(--fd-toc-height) pb-2 pt-12 max-xl:hidden" style="--fd-toc-height:calc(100dvh - var(--fd-banner-height) - var(--fd-nav-height))">

<div class="flex h-full w-(--fd-toc-width) max-w-full flex-col gap-3 pe-4">

### <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld2JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRleHQgc2l6ZS00Ij48cGF0aCBkPSJNMTcgNi4xSDMiPjwvcGF0aD48cGF0aCBkPSJNMjEgMTIuMUgzIj48L3BhdGg+PHBhdGggZD0iTTE1LjEgMThIMyI+PC9wYXRoPjwvc3ZnPg==" class="lucide lucide-text size-4" />On this page

<div class="overflow-hidden flex flex-col ps-px" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<div class="size-full rounded-[inherit] relative min-h-0 text-sm" radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<div class="flex flex-col">

<a href="#defining-a-schema" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Defining a schema<a href="#parsing-data" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Parsing data<a href="#handling-errors" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Handling errors<a href="#inferring-types" class="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary" data-active="false" style="padding-inline-start:14px"></a>

<div class="absolute inset-y-0 w-px bg-fd-foreground/10" style="inset-inline-start:0">

</div>

Inferring types

</div>

</div>

</div>

</div>

</div>

</div>

</div>
