---
source: https://docs.dndkit.com/api-documentation/sensors
date_fetched: 2025-10-07
format: gfm
---

<div id="site-header" class="flex flex-col h-[64px] sticky top-0 z-30 w-full flex-none shadow-[0px_1px_0px] shadow-tint-12/2 bg-tint-base/9 theme-muted:bg-tint-subtle/9 [html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle/9 theme-gradient:bg-gradient-primary theme-gradient-tint:bg-gradient-tint contrast-more:bg-tint-base text-sm backdrop-blur-lg">

<div class="theme-bold:bg-header-background theme-bold:shadow-[0px_1px_0px] theme-bold:shadow-tint-12/2">

<div class="transition-[padding] duration-300 lg:chat-open:pr-80 xl:chat-open:pr-96">

<div class="gap-4 lg:gap-6 flex items-center justify-between w-full py-3 min-h-16 sm:h-16 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto">

<div class="flex max-w-full lg:basis-72 min-w-0 shrink items-center justify-start gap-2 lg:gap-4">

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2JhcnMuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvYmFycy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2l6ZS00IHRleHQtaW5oZXJpdCI+PC9zdmc+" class="gb-icon size-4 text-inherit" />

<a href="/" class="group/headerlogo min-w-0 shrink flex items-center"><img src="https://docs.dndkit.com/~gitbook/image?url=https%3A%2F%2F3633755066-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MMujhzqaYbBEEmDxnZO%252Flogo%252FKcjvp2XosRKqZWw9rgiB%252Fdnd-kit-docs-gradient-logo.svg%3Falt%3Dmedia%26token%3D744c7c18-4f1e-4655-b324-c4ae44a9af21&amp;width=260&amp;dpr=4&amp;quality=100&amp;sign=547e835e&amp;sv=2" class="block dark:hidden overflow-hidden shrink min-w-0 max-w-40 lg:max-w-64 lg:site-header-none:page-no-toc:max-w-56 max-h-10 h-full w-full object-contain object-left" data-fetchpriority="high" alt="Logo" /><img src="https://docs.dndkit.com/~gitbook/image?url=https%3A%2F%2F3633755066-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MMujhzqaYbBEEmDxnZO%252Flogo%252FKcjvp2XosRKqZWw9rgiB%252Fdnd-kit-docs-gradient-logo.svg%3Falt%3Dmedia%26token%3D744c7c18-4f1e-4655-b324-c4ae44a9af21&amp;width=260&amp;dpr=4&amp;quality=100&amp;sign=547e835e&amp;sv=2" class="hidden dark:block overflow-hidden shrink min-w-0 max-w-40 lg:max-w-64 lg:site-header-none:page-no-toc:max-w-56 max-h-10 h-full w-full object-contain object-left" loading="lazy" data-fetchpriority="low" alt="Logo" /></a>

</div>

<div class="flex grow-0 shrink-0 md:basis-56 justify-self-end items-center gap-2 order-last">

<div class="relative flex size-9 grow">

<div class="button group/button inline-flex items-center gap-2 rounded-md straight-corners:rounded-none circular-corners:rounded-3xl border border-tint hover:border-tint-hover disabled:border-tint depth-subtle:shadow-xs hover:depth-subtle:shadow-md focus-visible:depth-subtle:shadow-md active:depth-subtle:shadow-xs shadow-tint/6 dark:shadow-tint-1 contrast-more:border-tint-12 contrast-more:hover:border-2 contrast-more:hover:border-tint-12 hover:depth-subtle:-translate-y-px focus-visible:depth-subtle:-translate-y-px data-[state=open]:depth-subtle:-translate-y-px active:depth-subtle:translate-y-0 transition-all truncate disabled:cursor-not-allowed disabled:translate-y-0! disabled:shadow-none! bg-tint-base text-tint hover:theme-clean:bg-tint-subtle theme-bold:bg-header-link/2 theme-bold:text-header-link theme-bold:shadow-none! hover:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link hover:theme-bold:shadow-none hover:theme-bold:border-header-link/5 contrast-more:theme-bold:bg-header-background contrast-more:theme-bold:text-header-link contrast-more:theme-bold:border-header-link contrast-more:hover:theme-bold:border-header-link text-sm py-1.5 md:circular-corners:px-4 has-[input:focus]:-translate-y-px h-9 cursor-pointer px-2.5 has-[input:focus]:bg-tint-base has-[input:focus]:depth-subtle:shadow-lg has-[input:focus]:depth-subtle:shadow-primary-subtle has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary-hover md:cursor-text theme-bold:border-header-link/3 has-[input:focus-visible]:theme-bold:border-header-link/5 has-[input:focus-visible]:theme-bold:bg-header-link/3 has-[input:focus-visible]:theme-bold:ring-header-link/5 theme-bold:before:absolute theme-bold:before:inset-0 theme-bold:before:bg-header-background/7 theme-bold:before:backdrop-blur-xl relative z-30 max-w-none shrink grow justify-start max-md:absolute max-md:right-0 max-md:w-[38px]">

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL21hZ25pZnlpbmctZ2xhc3Muc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvbWFnbmlmeWluZy1nbGFzcy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2l6ZS00IHNocmluay0wIGFuaW1hdGUtc2NhbGUtaW4iPjwvc3ZnPg==" class="gb-icon size-4 shrink-0 animate-scale-in" />

<div class="sr-only" aria-live="assertive" role="alert" aria-relevant="all">

</div>

<div class="shortcut -mr-1 relative z-10 hidden justify-end gap-0.5 whitespace-nowrap text-xs [font-feature-settings:"calt","case"] after:absolute after:right-full after:z-20 after:h-full after:w-8 after:bg-linear-to-r after:from-transparent after:to-tint-base theme-bold:after:to-transparent after:content-[''] contrast-more:text-tint-strong md:flex opacity-0" aria-busy="true">

<span class="kbd flex h-5 min-w-5 items-center justify-center rounded-sm border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1">Ctrl</span><span class="kbd flex size-5 items-center justify-center rounded-sm border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1">K</span>

</div>

</div>

</div>

</div>

<div class="headerLinks_containerHeaderlinks__GUgiv lg:[&>.button+.button]:-ml-2 z-20 ml-auto flex min-w-9 shrink grow items-center justify-end gap-x-4 lg:gap-x-6 xl:grow-0">

<a href="https://examples.dndkit.com" class="flex items-center gap-1 shrink contrast-more:underline truncate text-tint links-default:hover:text-primary links-default:data-[state=open]:text-primary links-default:tint:hover:text-tint-strong links-default:tint:data-[state=open]:text-tint-strong underline-offset-2 links-accent:hover:underline links-accent:data-[state=open]:underline links-accent:underline-offset-4 links-accent:decoration-primary-subtle links-accent:decoration-[3px] links-accent:py-0.5 theme-bold:text-header-link hover:theme-bold:text-header-link/7!">Examples</a><a href="https://next.dndkit.com" class="flex items-center gap-1 shrink contrast-more:underline truncate text-tint links-default:hover:text-primary links-default:data-[state=open]:text-primary links-default:tint:hover:text-tint-strong links-default:tint:data-[state=open]:text-tint-strong underline-offset-2 links-accent:hover:underline links-accent:data-[state=open]:underline links-accent:underline-offset-4 links-accent:decoration-primary-subtle links-accent:decoration-[3px] links-accent:py-0.5 theme-bold:text-header-link hover:theme-bold:text-header-link/7!">Experimental</a><a href="https://dnd-kit.slack.com/" class="flex items-center gap-1 shrink contrast-more:underline truncate text-tint links-default:hover:text-primary links-default:data-[state=open]:text-primary links-default:tint:hover:text-tint-strong links-default:tint:data-[state=open]:text-tint-strong underline-offset-2 links-accent:hover:underline links-accent:data-[state=open]:underline links-accent:underline-offset-4 links-accent:decoration-primary-subtle links-accent:decoration-[3px] links-accent:py-0.5 theme-bold:text-header-link hover:theme-bold:text-header-link/7!">Community</a><a href="https://github.com/clauderic/dnd-kit" class="button group/button inline-flex items-center gap-2 rounded-md straight-corners:rounded-none circular-corners:rounded-3xl border border-tint hover:border-tint-hover disabled:border-tint depth-subtle:shadow-xs hover:depth-subtle:shadow-md focus-visible:depth-subtle:shadow-md active:depth-subtle:shadow-xs shadow-tint/6 dark:shadow-tint-1 contrast-more:border-tint-12 contrast-more:hover:border-2 contrast-more:hover:border-tint-12 hover:depth-subtle:-translate-y-px focus-visible:depth-subtle:-translate-y-px data-[state=open]:depth-subtle:-translate-y-px active:depth-subtle:translate-y-0 transition-all grow-0 shrink-0 truncate max-w-full disabled:cursor-not-allowed disabled:translate-y-0! disabled:shadow-none! bg-tint-base text-tint hover:theme-clean:bg-tint-subtle theme-bold:bg-header-link/2 theme-bold:text-header-link theme-bold:shadow-none! theme-bold:border-header-link/4 hover:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link hover:theme-bold:shadow-none hover:theme-bold:border-header-link/5 contrast-more:theme-bold:bg-header-background contrast-more:theme-bold:text-header-link contrast-more:theme-bold:border-header-link contrast-more:hover:theme-bold:border-header-link text-sm px-3.5 py-1.5" aria-label="Github"><span class="button-content truncate">Github</span></a>

<div class="headerLinks_linkEllipsis__Z01IN z-20 items-center">

<span class="sr-only">More</span><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2VsbGlwc2lzLnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpOy13ZWJraXQtbWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2VsbGlwc2lzLnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpO21hc2stcmVwZWF0Om5vLXJlcGVhdDstd2Via2l0LW1hc2stcmVwZWF0Om5vLXJlcGVhdDttYXNrLXBvc2l0aW9uOmNlbnRlcjstd2Via2l0LW1hc2stcG9zaXRpb246Y2VudGVyIiBjbGFzcz0iZ2ItaWNvbiBzaXplLTQiPjwvc3ZnPg==" class="gb-icon size-4" /><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tZG93bi5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTstd2Via2l0LW1hc2staW1hZ2U6dXJsKGh0dHBzOi8va2EtcC5mb250YXdlc29tZS5jb20vcmVsZWFzZXMvdjYuNi4wL3N2Z3MvcmVndWxhci9jaGV2cm9uLWRvd24uc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7bWFzay1yZXBlYXQ6bm8tcmVwZWF0Oy13ZWJraXQtbWFzay1yZXBlYXQ6bm8tcmVwZWF0O21hc2stcG9zaXRpb246Y2VudGVyOy13ZWJraXQtbWFzay1wb3NpdGlvbjpjZW50ZXIiIGNsYXNzPSJnYi1pY29uIHNocmluay0wIG9wYWNpdHktNiBzaXplLTMgdHJhbnNpdGlvbi1hbGwgZ3JvdXAtaG92ZXIvZHJvcGRvd246b3BhY2l0eS0xMSBncm91cC1kYXRhLVtzdGF0ZT1vcGVuXS9kcm9wZG93bjpvcGFjaXR5LTExIGdyb3VwLWRhdGEtW3N0YXRlPW9wZW5dL2Ryb3Bkb3duOnJvdGF0ZS0xODAiPjwvc3ZnPg==" class="gb-icon shrink-0 opacity-6 size-3 transition-all group-hover/dropdown:opacity-11 group-data-[state=open]/dropdown:opacity-11 group-data-[state=open]/dropdown:rotate-180" />

</div>

</div>

</div>

</div>

</div>

</div>

<div class="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden hidden animate-fade-out-slow">

<div class="h-full w-full origin-left animate-crawl bg-primary-solid theme-bold:bg-header-link">

</div>

</div>

<div class="motion-safe:transition-all motion-safe:duration-300 lg:chat-open:mr-80 xl:chat-open:mr-96">

<div class="flex flex-col lg:flex-row lg:justify-center px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto site-width-wide:max-w-full site-header:min-h-[calc(100vh-64px)] site-header-sections:min-h-[calc(100vh-108px)]">

<div class="lg:-ms-5 relative flex grow flex-col overflow-hidden border-tint-subtle sidebar-filled:bg-tint-subtle theme-muted:bg-tint-subtle [html.sidebar-filled.theme-muted_&]:bg-tint-base [html.sidebar-filled.theme-bold.tint_&]:bg-tint-base [html.sidebar-filled.theme-gradient_&]:border page-no-toc:bg-transparent! page-no-toc:border-none! sidebar-filled:rounded-xl straight-corners:rounded-none page-has-toc:[html.sidebar-filled.circular-corners_&]:rounded-3xl">

<div class="my-4 flex flex-col space-y-4 px-5 empty:hidden">

</div>

<div class="flex grow flex-col p-2 lg:pb-20 hide-scrollbar overflow-y-auto" testid="toc-scroll-container">

- <a href="/" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Overview</a>

- <div class="-top-6 group-first/page-group-item:-mt-6 sticky z-1 flex items-center gap-3 px-3 pt-6 font-semibold text-xs uppercase tracking-wide pb-3 -mb-1.5 mask-[linear-gradient(rgba(0,0,0,1)_70%,rgba(0,0,0,0))] bg-tint-base sidebar-filled:bg-tint-subtle theme-muted:bg-tint-subtle [html.sidebar-filled.theme-muted_&]:bg-tint-base [html.sidebar-filled.theme-bold.tint_&]:bg-tint-base [html.sidebar-default.theme-gradient_&]:bg-gradient-primary [html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint">

  Introduction

  </div>

  - <a href="/introduction/installation" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Installation</a>
  - <a href="/introduction/getting-started" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Quick start</a>

- <div class="-top-6 group-first/page-group-item:-mt-6 sticky z-1 flex items-center gap-3 px-3 pt-6 font-semibold text-xs uppercase tracking-wide pb-3 -mb-1.5 mask-[linear-gradient(rgba(0,0,0,1)_70%,rgba(0,0,0,0))] bg-tint-base sidebar-filled:bg-tint-subtle theme-muted:bg-tint-subtle [html.sidebar-filled.theme-muted_&]:bg-tint-base [html.sidebar-filled.theme-bold.tint_&]:bg-tint-base [html.sidebar-default.theme-gradient_&]:bg-gradient-primary [html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint">

  API Documentation

  </div>

  - <a href="/api-documentation/context-provider" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">DndContext<span class="group relative rounded-full straight-corners:rounded-xs w-5 h-5 after:grid-area-1-1 after:absolute after:-top-1 after:grid after:-left-1 after:w-7 after:h-7 hover:bg-tint-active hover:text-current"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tcmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvY2hldnJvbi1yaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gbS0xIGdyaWQgc2l6ZS0zIHNocmluay0wIHRleHQtY3VycmVudCBvcGFjaXR5LTYgdHJhbnNpdGlvbiBncm91cC1ob3ZlcjpvcGFjaXR5LTExIGNvbnRyYXN0LW1vcmU6b3BhY2l0eS0xMSByb3RhdGUtMCI+PC9zdmc+" class="gb-icon m-1 grid size-3 shrink-0 text-current opacity-6 transition group-hover:opacity-11 contrast-more:opacity-11 rotate-0" /></span></a>
    <div class="overflow-hidden" style="opacity:0;height:0px;display:none">

    - <a href="/api-documentation/context-provider/collision-detection-algorithms" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Collision detection algorithms</a>
    - <a href="/api-documentation/context-provider/usedndcontext" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">useDndContext</a>
    - <a href="/api-documentation/context-provider/use-dnd-monitor" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">useDndMonitor</a>

    </div>
  - <a href="/api-documentation/droppable" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Droppable<span class="group relative rounded-full straight-corners:rounded-xs w-5 h-5 after:grid-area-1-1 after:absolute after:-top-1 after:grid after:-left-1 after:w-7 after:h-7 hover:bg-tint-active hover:text-current"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tcmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvY2hldnJvbi1yaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gbS0xIGdyaWQgc2l6ZS0zIHNocmluay0wIHRleHQtY3VycmVudCBvcGFjaXR5LTYgdHJhbnNpdGlvbiBncm91cC1ob3ZlcjpvcGFjaXR5LTExIGNvbnRyYXN0LW1vcmU6b3BhY2l0eS0xMSByb3RhdGUtMCI+PC9zdmc+" class="gb-icon m-1 grid size-3 shrink-0 text-current opacity-6 transition group-hover:opacity-11 contrast-more:opacity-11 rotate-0" /></span></a>
    <div class="overflow-hidden" style="opacity:0;height:0px;display:none">

    - <a href="/api-documentation/droppable/usedroppable" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">useDroppable</a>

    </div>
  - <a href="/api-documentation/draggable" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Draggable<span class="group relative rounded-full straight-corners:rounded-xs w-5 h-5 after:grid-area-1-1 after:absolute after:-top-1 after:grid after:-left-1 after:w-7 after:h-7 hover:bg-tint-active hover:text-current"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tcmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvY2hldnJvbi1yaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gbS0xIGdyaWQgc2l6ZS0zIHNocmluay0wIHRleHQtY3VycmVudCBvcGFjaXR5LTYgdHJhbnNpdGlvbiBncm91cC1ob3ZlcjpvcGFjaXR5LTExIGNvbnRyYXN0LW1vcmU6b3BhY2l0eS0xMSByb3RhdGUtMCI+PC9zdmc+" class="gb-icon m-1 grid size-3 shrink-0 text-current opacity-6 transition group-hover:opacity-11 contrast-more:opacity-11 rotate-0" /></span></a>
    <div class="overflow-hidden" style="opacity:0;height:0px;display:none">

    - <a href="/api-documentation/draggable/usedraggable" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">useDraggable</a>
    - <a href="/api-documentation/draggable/drag-overlay" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Drag Overlay</a>

    </div>
  - <a href="/api-documentation/sensors" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance text-sm contrast-more:hover:ring-1 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px font-semibold sidebar-list-line:before:w-0.5 before:bg-primary-solid text-primary-subtle sidebar-list-pill:bg-primary [html.sidebar-list-pill.theme-muted_&amp;]:bg-primary-hover [html.sidebar-list-pill.theme-bold.tint_&amp;]:bg-primary-hover [html.sidebar-filled.sidebar-list-pill.theme-muted_&amp;]:bg-primary [html.sidebar-filled.sidebar-list-pill.theme-bold.tint_&amp;]:bg-primary hover:bg-primary-hover hover:text-primary hover:before:bg-primary-solid-hover hover:sidebar-list-pill:bg-primary-hover contrast-more:text-primary contrast-more:hover:text-primary-strong contrast-more:bg-primary contrast-more:ring-1 contrast-more:ring-primary contrast-more:hover:ring-primary-hover" aria-current="page">Sensors<span class="group relative rounded-full straight-corners:rounded-xs w-5 h-5 after:grid-area-1-1 after:absolute after:-top-1 after:grid after:-left-1 after:w-7 after:h-7 hover:text-current hover:bg-tint-hover"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tcmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvY2hldnJvbi1yaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gbS0xIGdyaWQgc2l6ZS0zIHNocmluay0wIHRleHQtY3VycmVudCBvcGFjaXR5LTYgdHJhbnNpdGlvbiBncm91cC1ob3ZlcjpvcGFjaXR5LTExIGNvbnRyYXN0LW1vcmU6b3BhY2l0eS0xMSByb3RhdGUtOTAiPjwvc3ZnPg==" class="gb-icon m-1 grid size-3 shrink-0 text-current opacity-6 transition group-hover:opacity-11 contrast-more:opacity-11 rotate-90" /></span></a>
    <div class="overflow-hidden" style="opacity:1;height:auto">

    - <a href="/api-documentation/sensors/pointer" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Pointer</a>
    - <a href="/api-documentation/sensors/mouse" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Mouse</a>
    - <a href="/api-documentation/sensors/touch" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Touch</a>
    - <a href="/api-documentation/sensors/keyboard" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Keyboard</a>

    </div>
  - <a href="/api-documentation/modifiers" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Modifiers</a>

- <div class="-top-6 group-first/page-group-item:-mt-6 sticky z-1 flex items-center gap-3 px-3 pt-6 font-semibold text-xs uppercase tracking-wide pb-3 -mb-1.5 mask-[linear-gradient(rgba(0,0,0,1)_70%,rgba(0,0,0,0))] bg-tint-base sidebar-filled:bg-tint-subtle theme-muted:bg-tint-subtle [html.sidebar-filled.theme-muted_&]:bg-tint-base [html.sidebar-filled.theme-bold.tint_&]:bg-tint-base [html.sidebar-default.theme-gradient_&]:bg-gradient-primary [html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint">

  Presets

  </div>

  - <a href="/presets/sortable" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Sortable<span class="group relative rounded-full straight-corners:rounded-xs w-5 h-5 after:grid-area-1-1 after:absolute after:-top-1 after:grid after:-left-1 after:w-7 after:h-7 hover:bg-tint-active hover:text-current"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tcmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvY2hldnJvbi1yaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gbS0xIGdyaWQgc2l6ZS0zIHNocmluay0wIHRleHQtY3VycmVudCBvcGFjaXR5LTYgdHJhbnNpdGlvbiBncm91cC1ob3ZlcjpvcGFjaXR5LTExIGNvbnRyYXN0LW1vcmU6b3BhY2l0eS0xMSByb3RhdGUtMCI+PC9zdmc+" class="gb-icon m-1 grid size-3 shrink-0 text-current opacity-6 transition group-hover:opacity-11 contrast-more:opacity-11 rotate-0" /></span></a>
    <div class="overflow-hidden" style="opacity:0;height:0px;display:none">

    - <a href="/presets/sortable/sortable-context" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Sortable Context</a>
    - <a href="/presets/sortable/usesortable" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">useSortable</a>

    </div>

- <div class="-top-6 group-first/page-group-item:-mt-6 sticky z-1 flex items-center gap-3 px-3 pt-6 font-semibold text-xs uppercase tracking-wide pb-3 -mb-1.5 mask-[linear-gradient(rgba(0,0,0,1)_70%,rgba(0,0,0,0))] bg-tint-base sidebar-filled:bg-tint-subtle theme-muted:bg-tint-subtle [html.sidebar-filled.theme-muted_&]:bg-tint-base [html.sidebar-filled.theme-bold.tint_&]:bg-tint-base [html.sidebar-default.theme-gradient_&]:bg-gradient-primary [html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint">

  Guides

  </div>

  - <a href="/guides/accessibility" class="group/toclink toclink relative transition-colors flex flex-row justify-between circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12 before:contents[] before:-left-px before:absolute before:inset-y-0 sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&amp;+div_a]:sidebar-list-default:rounded-l-none [&amp;+div_a]:pl-5 [&amp;+div_a]:sidebar-list-default:before:w-px">Accessibility</a>

<div class="relative z-2 lg:absolute left-0 right-2 bottom-0 pointer-events-none sidebar-filled:pl-2 sidebar-filled:pb-2 sidebar-filled:page-no-toc:p-0 bg-tint-base sidebar-filled:bg-tint-subtle theme-muted:bg-tint-subtle [html.sidebar-filled.theme-muted_&]:bg-tint-base [html.sidebar-filled.theme-bold.tint_&]:bg-tint-base rounded-lg straight-corners:rounded-none circular-corners:rounded-2xl before:hidden lg:before:block before:content-[""] before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-b before:from-transparent before:to-tint-base sidebar-filled:before:to-tint-subtle theme-muted:before:to-tint-subtle [html.sidebar-filled.theme-muted_&]:before:to-tint-base [html.sidebar-filled.theme-bold.tint_&]:before:to-tint-base page-no-toc:before:to-transparent!">

<a href="https://www.gitbook.com/?utm_source=content&amp;utm_medium=trademark&amp;utm_campaign=-MMujhzqaYbBEEmDxnZO" class="text-sm font-semibold text-tint flex flex-row items-center px-5 py-4 sidebar-filled:px-3 lg:sidebar-filled:page-no-toc:px-5 rounded-lg straight-corners:rounded-none circular-corners:rounded-2xl hover:bg-tint hover:text-tint-strong ring-2 lg:ring-1 ring-inset ring-tint-subtle transition-colors pointer-events-auto" target="_blank" rel="noopener noreferrer"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9zdGF0aWMtMnYuZ2l0Ym9vay5jb20vfmdpdGJvb2svc3RhdGljL2ljb25zL3N2Z3MvY3VzdG9tLWljb25zL2dpdGJvb2suc3ZnP3Y9Mik7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL3N0YXRpYy0ydi5naXRib29rLmNvbS9+Z2l0Ym9vay9zdGF0aWMvaWNvbnMvc3Zncy9jdXN0b20taWNvbnMvZ2l0Ym9vay5zdmc/dj0yKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2l6ZS01IHNocmluay0wIj48L3N2Zz4=" class="gb-icon size-5 shrink-0" /><span class="ml-3">Powered by GitBook</span></a>

</div>

</div>

</div>

<div class="contents">

<div class="contents [--content-scroll-margin:calc(var(--spacing)*16)]">

<div class="flex flex-col overflow-hidden w-full xl:max-2xl:rounded-corners:page-api-block:rounded-md xl:max-2xl:circular-corners:page-api-block:rounded-xl xl:max-2xl:page-api-block:border xl:max-2xl:page-api-block:border-tint xl:max-2xl:page-api-block:bg-tint/9 xl:max-2xl:page-api-block:backdrop-blur-lg xl:max-2xl:contrast-more:page-api-block:bg-tint xl:max-2xl:page-api-block:hover:shadow-lg xl:max-2xl:page-api-block:hover:shadow-tint-12/1 xl:max-2xl:dark:page-api-block:hover:shadow-tint-1/1 xl:max-2xl:page-api-block:not-hover:*:hidden">

<div class="hidden xl:max-2xl:page-api-block:flex! text-xs tracking-wide font-semibold uppercase px-2 py-1.5 flex-row items-center gap-2">

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Jsb2NrLXF1b3RlLnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpOy13ZWJraXQtbWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Jsb2NrLXF1b3RlLnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpO21hc2stcmVwZWF0Om5vLXJlcGVhdDstd2Via2l0LW1hc2stcmVwZWF0Om5vLXJlcGVhdDttYXNrLXBvc2l0aW9uOmNlbnRlcjstd2Via2l0LW1hc2stcG9zaXRpb246Y2VudGVyIiBjbGFzcz0iZ2ItaWNvbiBzaXplLTMiPjwvc3ZnPg==" class="gb-icon size-3" />On this page<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tZG93bi5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTstd2Via2l0LW1hc2staW1hZ2U6dXJsKGh0dHBzOi8va2EtcC5mb250YXdlc29tZS5jb20vcmVsZWFzZXMvdjYuNi4wL3N2Z3MvcmVndWxhci9jaGV2cm9uLWRvd24uc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7bWFzay1yZXBlYXQ6bm8tcmVwZWF0Oy13ZWJraXQtbWFzay1yZXBlYXQ6bm8tcmVwZWF0O21hc2stcG9zaXRpb246Y2VudGVyOy13ZWJraXQtbWFzay1wb3NpdGlvbjpjZW50ZXIiIGNsYXNzPSJnYi1pY29uIHNpemUtMyBvcGFjaXR5LTYgbWwtYXV0byI+PC9zdmc+" class="gb-icon size-3 opacity-6 ml-auto" />

</div>

<div class="flex shrink flex-col overflow-hidden">

- <div class="border-primary-9 tint:border-primary-11 sidebar-list-line:border-l-2 inset-0 pointer-events-none absolute z-0 sidebar-list-line:-left-px rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! sidebar-list-pill:bg-primary [html.theme-muted.sidebar-list-pill_&]:bg-primary-hover [html.theme-gradient.sidebar-list-pill_&]:bg-primary-active contrast-more:border contrast-more:bg-primary sidebar-list-default:hidden sidebar-list-default:ml-3 contrast-more:sidebar-list-default:ml-0">

  </div>

  <a href="#concepts" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current text-primary-subtle hover:text-primary contrast-more:text-primary contrast-more:hover:text-primary-strong sidebar-list-line:ml-px hover:bg-primary-hover theme-muted:hover:bg-primary-active [html.sidebar-filled.theme-bold.tint_&amp;]:hover:bg-primary-active theme-gradient:hover:bg-primary-active tint:font-semibold contrast-more:font-semibold sidebar-list-default:border-tint"><span>Concepts</span></a>

- <a href="#activators" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current subitem sidebar-list-line:pl-6 opacity-8 contrast-more:opacity-11 sidebar-list-default:rounded-l-none! sidebar-list-default:border-l sidebar-list-default:border-tint"><span>Activators</span></a>

- <a href="#built-in-sensors" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current subitem sidebar-list-line:pl-6 opacity-8 contrast-more:opacity-11 sidebar-list-default:rounded-l-none! sidebar-list-default:border-l sidebar-list-default:border-tint"><span>Built-in sensors</span></a>

- <a href="#custom-sensors" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current subitem sidebar-list-line:pl-6 opacity-8 contrast-more:opacity-11 sidebar-list-default:rounded-l-none! sidebar-list-default:border-l sidebar-list-default:border-tint"><span>Custom sensors</span></a>

- <a href="#lifecycle" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current"><span>Lifecycle</span></a>

- <a href="#hooks" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current"><span>Hooks</span></a>

- <a href="#usesensor" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current subitem sidebar-list-line:pl-6 opacity-8 contrast-more:opacity-11 sidebar-list-default:rounded-l-none! sidebar-list-default:border-l sidebar-list-default:border-tint"><span>useSensor</span></a>

- <a href="#usesensors" class="relative z-10 text-sm w-full py-1 px-3 transition-all duration-200 rounded-md straight-corners:rounded-none circular-corners:rounded-2xl sidebar-list-line:rounded-l-none! hover:bg-tint-hover theme-gradient:hover:bg-tint-12/1 hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-inset contrast-more:hover:ring-current subitem sidebar-list-line:pl-6 opacity-8 contrast-more:opacity-11 sidebar-list-default:rounded-l-none! sidebar-list-default:border-l sidebar-list-default:border-tint"><span>useSensors</span></a>

<div class="flex flex-col gap-3 border-tint-subtle border-t first:border-none sidebar-list-default:px-3 pt-5 first:pt-0 xl:max-2xl:page-api-block:p-5 empty:hidden">

</div>

</div>

<div class="sticky bottom-0 z-10 mt-auto flex flex-col bg-tint-base theme-gradient-tint:bg-gradient-tint theme-gradient:bg-gradient-primary theme-muted:bg-tint-subtle [html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle border-tint-subtle xl:max-2xl:page-api-block:border-t xl:max-2xl:page-api-block:p-2 pt-4">

<div class="flex items-center justify-end">

<div class="flex h-fit items-stretch justify-start overflow-hidden gap-2" role="radiogroup">

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL3N1bi1icmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvc3VuLWJyaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gYnV0dG9uLWxlYWRpbmctaWNvbiBzaXplLVsxZW1dIHNocmluay0wIj48L3N2Zz4=" class="gb-icon button-leading-icon size-[1em] shrink-0" />

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Rlc2t0b3Auc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvZGVza3RvcC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gYnV0dG9uLWxlYWRpbmctaWNvbiBzaXplLVsxZW1dIHNocmluay0wIj48L3N2Zz4=" class="gb-icon button-leading-icon size-[1em] shrink-0" />

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL21vb24uc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvbW9vbi5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gYnV0dG9uLWxlYWRpbmctaWNvbiBzaXplLVsxZW1dIHNocmluay0wIj48L3N2Zz4=" class="gb-icon button-leading-icon size-[1em] shrink-0" />

</div>

</div>

<div class="mt-4" visual-test="removed">

</div>

</div>

</div>

<div class="relative min-w-0 flex-1 max-w-screen-2xl py-8 break-anywhere page-width-default site-width-default page-has-toc" role="main">

<div class="max-w-3xl page-width-wide:max-w-screen-2xl mx-auto mb-6 space-y-3 page-api-block:ml-0 page-api-block:max-w-full page-has-ancestors">

<div class="flex h-fit items-stretch justify-start overflow-hidden *:translate-y-0! *:shadow-none! [&>*:not(:first-child)]:border-l-0 [&>*:not(:first-child,:last-child)]:rounded-none! [&>*:not(:only-child):first-child]:rounded-r-none [&>*:not(:only-child):last-child]:rounded-l-none float-right ml-4 xl:max-2xl:page-api-block:mr-62 -my-1.5">

<a href="https://github.com/dnd-kit/docs/blob/master/api-documentation/sensors/README.md" class="button group/button inline-flex items-center gap-2 rounded-md straight-corners:rounded-none circular-corners:rounded-3xl border border-tint hover:border-tint-hover disabled:border-tint depth-subtle:shadow-xs hover:depth-subtle:shadow-md focus-visible:depth-subtle:shadow-md active:depth-subtle:shadow-xs shadow-tint/6 dark:shadow-tint-1 contrast-more:border-tint-12 contrast-more:hover:border-2 contrast-more:hover:border-tint-12 hover:depth-subtle:-translate-y-px focus-visible:depth-subtle:-translate-y-px data-[state=open]:depth-subtle:-translate-y-px active:depth-subtle:translate-y-0 transition-all grow-0 shrink-0 truncate max-w-full disabled:cursor-not-allowed disabled:translate-y-0! disabled:shadow-none! depth-flat:bg-transparent text-tint hover:bg-tint-hover hover:depth-flat:bg-tint-hover hover:text-tint contrast-more:bg-tint-subtle disabled:bg-transparent disabled:text-tint/8 py-1 px-2 bg-tint-base text-sm" aria-label="Edit on Git" target="_blank" data-state="closed" rel="noopener noreferrer"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9icmFuZHMvZ2l0aHViLnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpOy13ZWJraXQtbWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9icmFuZHMvZ2l0aHViLnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpO21hc2stcmVwZWF0Om5vLXJlcGVhdDstd2Via2l0LW1hc2stcmVwZWF0Om5vLXJlcGVhdDttYXNrLXBvc2l0aW9uOmNlbnRlcjstd2Via2l0LW1hc2stcG9zaXRpb246Y2VudGVyIiBjbGFzcz0iZ2ItaWNvbiBidXR0b24tbGVhZGluZy1pY29uIHNpemUtWzFlbV0gc2hyaW5rLTAiPjwvc3ZnPg==" class="gb-icon button-leading-icon size-[1em] shrink-0" /><span class="button-content truncate">Edit</span></a>

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2NoZXZyb24tZG93bi5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTstd2Via2l0LW1hc2staW1hZ2U6dXJsKGh0dHBzOi8va2EtcC5mb250YXdlc29tZS5jb20vcmVsZWFzZXMvdjYuNi4wL3N2Z3MvcmVndWxhci9jaGV2cm9uLWRvd24uc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7bWFzay1yZXBlYXQ6bm8tcmVwZWF0Oy13ZWJraXQtbWFzay1yZXBlYXQ6bm8tcmVwZWF0O21hc2stcG9zaXRpb246Y2VudGVyOy13ZWJraXQtbWFzay1wb3NpdGlvbjpjZW50ZXIiIGNsYXNzPSJnYi1pY29uIHNpemUtMyB0cmFuc2l0aW9uLXRyYW5zZm9ybSBncm91cC1kYXRhLVtzdGF0ZT1vcGVuXS9idXR0b246cm90YXRlLTE4MCI+PC9zdmc+" class="gb-icon size-3 transition-transform group-data-[state=open]/button:rotate-180" />

</div>

1.  <a href="/api-documentation" class="decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100 no-underline hover:underline text-xs tracking-wide font-semibold uppercase flex items-center gap-1.5 contrast-more:underline contrast-more:decoration-current">API Documentation</a>

# Sensors

</div>

<div class="grid [&>*+*]:mt-5 whitespace-pre-wrap">

## 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#concepts" class="inline-flex h-full items-start leading-tight" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-tight">

Concepts

</div>

Sensors are an abstraction to detect different input methods in order to initiate drag operations, respond to movement and end or cancel the operation.

### 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#activators" class="inline-flex h-full items-start leading-snug" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug">

Activators

</div>

Sensors may define one or multiple **activator events**. Activator events use React <a href="https://reactjs.org/docs/events.html" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">SyntheticEvent listeners<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Fycm93LXVwLXJpZ2h0LnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpOy13ZWJraXQtbWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Fycm93LXVwLXJpZ2h0LnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpO21hc2stcmVwZWF0Om5vLXJlcGVhdDstd2Via2l0LW1hc2stcmVwZWF0Om5vLXJlcGVhdDttYXNrLXBvc2l0aW9uOmNlbnRlcjstd2Via2l0LW1hc2stcG9zaXRpb246Y2VudGVyIiBjbGFzcz0iZ2ItaWNvbiBtbC0wLjUgaW5saW5lIHNpemUtMyBsaW5rcy1hY2NlbnQ6dGV4dC10aW50LXN1YnRsZSI+PC9zdmc+" class="gb-icon ml-0.5 inline size-3 links-accent:text-tint-subtle" /></a>, which leads to improved performance over manually adding event listeners to each individual draggable node.

Sensors are initialized once one of the activator events is detected.

### 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#built-in-sensors" class="inline-flex h-full items-start leading-snug" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug">

Built-in sensors

</div>

The built-in sensors are:

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  <a href="/api-documentation/sensors/pointer" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">Pointer</a>

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  <a href="/api-documentation/sensors/mouse" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">Mouse</a>

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  <a href="/api-documentation/sensors/touch" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">Touch</a>

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  <a href="/api-documentation/sensors/keyboard" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">Keyboard</a>

  </div>

### 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#custom-sensors" class="inline-flex h-full items-start leading-snug" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug">

Custom sensors

</div>

If necessary, you may also implement custom sensors to respond to other inputs or if the built-in sensors do not suit your needs. If you build a custom sensor and you think others could benefit, don't hesitate to open an RFC pull request.

## 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#lifecycle" class="inline-flex h-full items-start leading-tight" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-tight">

Lifecycle

</div>

The lifecycle of a sensor is as follows:

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  Activator event detected, if the event is qualified, sensor class is initialized.

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  Sensor manually attaches new listeners to input methods upon initialization.

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  Sensor dispatches drag start event once constraints are met.

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  Sensor dispatches drag move events in response to input.

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  Sensor dispatches drag end or drag cancel event.

  </div>

- <div class="text-base leading-normal mr-1 flex min-h-lh min-w-6 items-center justify-center text-tint">

  <div class="before:font-var before:content-(--pseudoBefore--content)" style="--pseudoBefore--content:'•';--font-family:Arial;font-size:min(1.5em, 24px);line-height:1">

  </div>

  </div>

  <div class="flex min-w-0 flex-1 flex-col space-y-2">

  Sensor is torn down and cleans up manually attached event listeners.

  </div>

From an implementation perspective, Sensors are <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">classes<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Fycm93LXVwLXJpZ2h0LnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpOy13ZWJraXQtbWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Fycm93LXVwLXJpZ2h0LnN2Zz92PTImYW1wO3Rva2VuPWE0NjM5MzVlOTMpO21hc2stcmVwZWF0Om5vLXJlcGVhdDstd2Via2l0LW1hc2stcmVwZWF0Om5vLXJlcGVhdDttYXNrLXBvc2l0aW9uOmNlbnRlcjstd2Via2l0LW1hc2stcG9zaXRpb246Y2VudGVyIiBjbGFzcz0iZ2ItaWNvbiBtbC0wLjUgaW5saW5lIHNpemUtMyBsaW5rcy1hY2NlbnQ6dGV4dC10aW50LXN1YnRsZSI+PC9zdmc+" class="gb-icon ml-0.5 inline size-3 links-accent:text-tint-subtle" /></a>.

They are class-based rather than hooks because they need to be instantiated synchronously to respond to user interactions immediately, and it must be possible for them to be conditionally invoked.

## 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#hooks" class="inline-flex h-full items-start leading-tight" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-tight">

Hooks

</div>

### 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#usesensor" class="inline-flex h-full items-start leading-snug" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug">

useSensor

</div>

By default, `DndContext` uses the <a href="/api-documentation/sensors/pointer" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">Pointer</a> and <a href="/api-documentation/sensors/keyboard" class="underline decoration-[max(0.07em,1px)] underline-offset-2 links-accent:underline-offset-4 links-default:decoration-primary/6 links-default:text-primary-subtle hover:links-default:text-primary-strong contrast-more:links-default:text-primary contrast-more:hover:links-default:text-primary-strong links-accent:decoration-primary-subtle hover:links-accent:decoration-[3px] hover:links-accent:[text-decoration-skip-ink:none] transition-all duration-100">Keyboard</a> sensors.

If you'd like to use other sensors, such as the Mouse and Touch sensors instead, initialize those sensors separately with the options you'd like to use using the `useSensor` hook

<div class="group/codeblock grid shrink grid-flow-col overflow-hidden mx-auto page-width-wide:mx-0 w-full decoration-primary/6 print:break-inside-avoid max-w-3xl page-width-wide:max-w-full page-api-block:ml-0" aria-busy="false">

<div class="flex items-center justify-start gap-2 text-sm [grid-area:1/1]">

</div>

<span class="button-content truncate">Copy</span>

``` relative
import {MouseSensor, TouchSensor, useSensor} from '@dnd-kit/core';

function App() {
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
}
```

</div>

### 

<div class="relative hash grid grid-area-1-1 h-[1em] border-0 opacity-0 group-hover/hash:opacity-[0] group-focus/hash:opacity-[0] md:group-hover/hash:opacity-[1] md:group-focus/hash:opacity-[1] -ml-6 pr-2">

<a href="#usesensors" class="inline-flex h-full items-start leading-snug" aria-label="Direct link to heading"><img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2hhc2h0YWcuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvaGFzaHRhZy5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gc2VsZi1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC10cmFuc3BhcmVudCBncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdWJ0bGUgY29udHJhc3QtbW9yZTpncm91cC1ob3Zlci9oYXNoOnRleHQtdGludC1zdHJvbmcgc2l6ZS00Ij48L3N2Zz4=" class="gb-icon self-center transition-colors text-transparent group-hover/hash:text-tint-subtle contrast-more:group-hover/hash:text-tint-strong size-4" /></a>

</div>

<div class="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug">

useSensors

</div>

When initializing sensors with `useSensor`, make sure you pass the sensors to `useSensors` before passing them to `DndContext`:

<div class="group/codeblock grid shrink grid-flow-col overflow-hidden mx-auto page-width-wide:mx-0 w-full decoration-primary/6 print:break-inside-avoid max-w-3xl page-width-wide:max-w-full page-api-block:ml-0" aria-busy="false">

<div class="flex items-center justify-start gap-2 text-sm [grid-area:1/1]">

</div>

<span class="button-content truncate">Copy</span>

``` relative
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

function App() {
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  
  const sensors = useSensors(
    mouseSensor,
    touchSensor,
    keyboardSensor,
  );
  
  return (
    <DndContext sensors={sensors}>
      {/* ... */}
    </DndContext>
  )
}
```

</div>

In other examples across the documentation, you may also see sensors initialized without intermediate variables, which is equivalent to the syntax above:

<div class="group/codeblock grid shrink grid-flow-col overflow-hidden mx-auto page-width-wide:mx-0 w-full decoration-primary/6 print:break-inside-avoid max-w-3xl page-width-wide:max-w-full page-api-block:ml-0" aria-busy="false">

<div class="flex items-center justify-start gap-2 text-sm [grid-area:1/1]">

</div>

<span class="button-content truncate">Copy</span>

``` relative
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

function App() {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );
  
  return (
    <DndContext sensors={sensors}>
      {/* ... */}
    </DndContext>
  )
}
```

</div>

</div>

<div class="mx-auto mt-6 page-api-block:ml-0 flex max-w-3xl page-full-width:max-w-screen-2xl flex-row flex-wrap items-center gap-4 text-tint contrast-more:text-tint-strong">

Last updated 4 years ago

</div>

</div>

</div>

</div>

</div>

</div>

<div class="sm:px-6 md:px-8 max-w-screen-2xl px-4 py-8 lg:py-12 mx-auto">

<div class="mx-auto grid max-w-3xl site-width-wide:max-w-screen-2xl justify-between gap-12 lg:max-w-none! grid-cols-[auto_auto] lg:grid-cols-[18rem_minmax(auto,48rem)_auto] xl:grid-cols-[18rem_minmax(auto,48rem)_14rem] lg:site-width-wide:grid-cols-[18rem_minmax(auto,80rem)_auto] xl:site-width-wide:grid-cols-[18rem_minmax(auto,80rem)_14rem] lg:page-no-toc:grid-cols-[minmax(auto,48rem)_auto] xl:page-no-toc:grid-cols-[14rem_minmax(auto,48rem)_14rem] lg:[body:has(.site-width-wide,.page-no-toc)_&]:grid-cols-[minmax(auto,90rem)_auto] xl:[body:has(.site-width-wide,.page-no-toc)_&]:grid-cols-[14rem_minmax(auto,90rem)_14rem]">

<div class="-col-start-2 row-start-1 flex items-start justify-end xl:hidden">

<div class="flex h-fit items-stretch justify-start overflow-hidden gap-2" role="radiogroup">

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL3N1bi1icmlnaHQuc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvc3VuLWJyaWdodC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gYnV0dG9uLWxlYWRpbmctaWNvbiBzaXplLVsxZW1dIHNocmluay0wIj48L3N2Zz4=" class="gb-icon button-leading-icon size-[1em] shrink-0" />

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL2Rlc2t0b3Auc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvZGVza3RvcC5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gYnV0dG9uLWxlYWRpbmctaWNvbiBzaXplLVsxZW1dIHNocmluay0wIj48L3N2Zz4=" class="gb-icon button-leading-icon size-[1em] shrink-0" />

<img src="data:image/svg+xml;base64,PHN2ZyBzdHlsZT0ibWFzay1pbWFnZTp1cmwoaHR0cHM6Ly9rYS1wLmZvbnRhd2Vzb21lLmNvbS9yZWxlYXNlcy92Ni42LjAvc3Zncy9yZWd1bGFyL21vb24uc3ZnP3Y9MiZhbXA7dG9rZW49YTQ2MzkzNWU5Myk7LXdlYmtpdC1tYXNrLWltYWdlOnVybChodHRwczovL2thLXAuZm9udGF3ZXNvbWUuY29tL3JlbGVhc2VzL3Y2LjYuMC9zdmdzL3JlZ3VsYXIvbW9vbi5zdmc/dj0yJmFtcDt0b2tlbj1hNDYzOTM1ZTkzKTttYXNrLXJlcGVhdDpuby1yZXBlYXQ7LXdlYmtpdC1tYXNrLXJlcGVhdDpuby1yZXBlYXQ7bWFzay1wb3NpdGlvbjpjZW50ZXI7LXdlYmtpdC1tYXNrLXBvc2l0aW9uOmNlbnRlciIgY2xhc3M9ImdiLWljb24gYnV0dG9uLWxlYWRpbmctaWNvbiBzaXplLVsxZW1dIHNocmluay0wIj48L3N2Zz4=" class="gb-icon button-leading-icon size-[1em] shrink-0" />

</div>

</div>

</div>

</div>
