**You:**

searhc if the is claude code SKILL for qucikbooks and for salesforce developmen need both 

* * *

**ChatGPT:**

Good question. Yes — there _are_ ways to use Claude + QuickBooks Online and Claude + Salesforce — but it’s not like there’s a built-in, official “QuickBooks-skill” or “Salesforce-skill” shipped out-of-the-box (at least not publicly as a turnkey product). Instead, people build custom Skills or integrations. Here’s what I found:

* * *

## ✅ What Claude “Skills” Are — how they work in general

* Claude supports custom skills: you (or your team) can create a `SKILL.md` file that defines a skill (name, description, instructions) to teach Claude how to handle a specific workflow or domain. [Claude+2apidog+2](https://www.claude.com/blog/how-to-create-skills-key-steps-limitations-and-examples?utm_source=chatgpt.com)
  
* Once built/uploaded (requires a paid plan such as Pro/Team/Max with code-execution enabled), these skills become usable inside Claude or via Claude Code, turning generic prompting into reproducible, automated workflows. [Claude+2Claude Skills+2](https://www.claude.com/blog/how-to-create-skills-key-steps-limitations-and-examples?utm_source=chatgpt.com)
  
* There’s a publicly available toolkit / repo called Claude Code Skills & Agents Factory, which helps scaffold and build such skills/agents — you can bootstrap your own integrations from there. [GitHub](https://github.com/alirezarezvani/claude-code-skill-factory?utm_source=chatgpt.com)
  

So — in principle — you can build a new skill aimed at QuickBooks or Salesforce operations.

* * *

## 🔗 Existing integrations of Claude with QuickBooks Online & Salesforce

There _are_ already documented ways to integrate Claude with both QuickBooks Online and Salesforce — typically using external tooling or middleware + connectors, rather than “native first-party skill bundles.”

* For QuickBooks Online: One connector path uses CData Connect AI: with CData’s connector + Claude, you can access and query live QuickBooks Online data, ask Claude to run queries and actions (e.g. fetch invoices, update data, generate reports) — no need to replicate data. [CData Software](https://www.cdata.com/kb/tech/qbonline-cloud-claude.rst?utm_source=chatgpt.com)
  
* Alternatively (or in addition), you can build custom “Claude Skill + automation workflow” via tools such as n8n — n8n supports a Claude + QuickBooks Online integration, enabling workflows that trigger on events or manual prompts. [n8n.io](https://n8n.io/integrations/claude/and/quickbooks-online/?utm_source=chatgpt.com)
  
* For Salesforce: Similarly, n8n has a Claude + Salesforce integration path. [n8n.io](https://n8n.io/integrations/claude/and/salesforce/?utm_source=chatgpt.com)
  
* Also: There’s an official partnership between Claude’s maker and Salesforce: Salesforce customers can now use Claude models (e.g. via Amazon Bedrock + Salesforce Platform) to build AI-powered CRM applications or automations. [Anthropic+1](https://www.anthropic.com/news/salesforce-partnership?utm_source=chatgpt.com)
  

Thus: while there’s no single “download this skill = done” for QuickBooks + Salesforce together, there _are_ working integration patterns.

* * *

## 🛠 What’s possible — and what you’d likely need to build/decide

If you want to have Claude effectively work with QuickBooks and Salesforce for you (e.g. automatically sync data, answer queries, generate reports, run updates), here’s what you need to think about / do:

* **Decide your integration path**: Use an existing connector (like CData for QuickBooks, or n8n for workflows), or build your own custom skill using Claude Code + a wrapper/API around QuickBooks Online or Salesforce APIs.
  
* **Create custom Skills (SKILL.md)** tailored to your workflows: define triggers, inputs/outputs, error handling, etc. This gives structured behaviour rather than ad-hoc LLM prompts.
  
* **Host or use a connector backend**: since neither QuickBooks nor Salesforce data lives “inside” Claude, you’ll need an external service or your own server to handle API/authentication, data fetching, updates.
  
* **Test & validate carefully**: data syncs, permissions, error handling — especially for financial/CRM data — need care to avoid mistakes.
  

* * *

## 🎯 My Assessment: “Yes — but you’ll build the glue”

* If your goal is simply to _query_ data (“What were total invoices last month?”, “List unpaid customers in QuickBooks”, “List open opportunities in Salesforce”) — that’s quite viable today using connectors + Claude prompts.
  
* If your goal is to _automate workflows_ (sync new QuickBooks invoices into Salesforce, update records, handle bi-directional sync) — you’ll likely need to build custom skills/integrations (or use a middleware like n8n + connectors) rather than rely on a ready-made official package.
  
* If you expect something as polished as “native QuickBooks-skill for Salesforce in Claude” out of the box — that doesn’t exist _yet_, as far as public documentation shows.
  

* * *

If you like — I can **search GitHub repos** for **public/open-source “Claude Skills” that integrate QuickBooks & Salesforce** (so you might build on top of them, rather than from scratch).  
Do you want me to start that search for you now?

* * *

**You:**

go deeper and see if you can find more

* * *

**ChatGPT:**

Short answer:

* **QuickBooks:** there _is_ an official QuickBooks Online MCP server + multiple ways to bolt it into Claude / Claude Code, and several tutorials explicitly showing “QuickBooks Skill” setups.
  
* **Salesforce:** there’s no “Salesforce Dev SKILL” blessed by Anthropic, but there _are_ example Salesforce-focused Claude Skills + a first-class Claude↔Salesforce integration path via connectors/Agentforce that you can build on.
  

Below is the deeper scan.

* * *

## 1. QuickBooks side – what solid building blocks already exist

### 1.1. Official QuickBooks Online MCP server (Intuit)

Intuit themselves ship a **QuickBooks Online MCP server**:

* GitHub: `intuit/quickbooks-online-mcp-server` – an MCP server over QuickBooks Online Accounting APIs. After auth, it exposes tools like **Create / Delete / Get / Search / Update** for Account, Bill, Invoice, Customer, Vendor, JournalEntry, etc. [GitHub](https://github.com/intuit/quickbooks-online-mcp-server?utm_source=chatgpt.com)
  
* Intuit blog calls this a **local MCP server** built on top of QBO APIs, explicitly meant for experimentation with AI agents. [Intuit Developer Community Blog](https://blogs.intuit.com/2025/10/21/experiment-with-intuits-local-mcp-server-early-preview/?utm_source=chatgpt.com)
  

This is basically the “backend half” of a QuickBooks Skill: Claude (or Claude Code) can talk to this MCP server and you wrap that in a SKILL folder.

### 1.2. Commercial MCP servers / connectors you can plug Claude into

You’ve got several “bring your own MCP” options that already advertise Claude:

* **CData QuickBooks Online MCP / Connect AI** – docs explicitly show “Use Claude to talk to your QuickBooks Online data via CData Connect AI Remote MCP.” They walk through:
  
    1. configure QBO connection,
       
    2. add CData connector into Claude,
       
    3. ask natural language questions over live QBO data. [CData Software+1](https://www.cdata.com/kb/tech/qbonline-cloud-claude.rst?utm_source=chatgpt.com)
    
* **Zapier QuickBooks Online MCP** – Zapier exposes a QuickBooks Online MCP server that any AI platform (Claude, etc.) can call; you get tools to attach files, create/update QBO data from within an agent. [Zapier](https://zapier.com/mcp/quickbooks?utm_source=chatgpt.com)
  
* **Pipedream QuickBooks MCP server** – again, purpose-built “QuickBooks MCP Server” with a static MCP URL usable by any AI client. [Pipedream MCP](https://mcp.pipedream.com/app/quickbooks?utm_source=chatgpt.com)
  
* **n8n & others (Make, Integrately, IFTTT, MESA)** – they don’t always say “MCP”, but they give you workflows “Claude ↔ QuickBooks Online” with triggers (new bill, invoice, estimate) and Claude completions or actions. [MESA+4n8n.io+4Make+4](https://n8n.io/integrations/claude/and/quickbooks-online/?utm_source=chatgpt.com)
  

All of these can be wired into a Skill just by pointing your SKILL runtime at the relevant MCP+auth.

### 1.3. Evidence of people building **QuickBooks-focused Claude Skills**

There’s clear community activity specifically around **“Claude Code + QuickBooks skill”**:

* A Reddit tracker thread: author explicitly says their **starting goal is to create Skills that let Claude Code access Deputy, Xero and QuickBooks using curl commands**, with a SKILL.md that Claude can help refine. [Reddit+1](https://www.reddit.com/r/ClaudeAI/comments/1o9ph4u/ive_been_tracking_what_people_are_building_with/?utm_source=chatgpt.com)
  
* Multiple recent Skill tutorials use QuickBooks as poster child:
  
    * “Claude Skills explained – step-by-step” shows an MCP server built for QuickBooks Online so Claude can pull income/expense data for analysis. [qa.yodo.me](https://qa.yodo.me/t/claude-skills-explained-step-by-step-tutorial-for-beginners/4860?utm_source=chatgpt.com)
      
    * Another guide on building “digital employees with Claude Skills” mentions connecting Skills to MCP servers like **QuickBooks** as a canonical example. [AI Fire](https://www.aifire.co/p/build-digital-employees-with-claude-skills?utm_source=chatgpt.com)
    
* n8n ships a ready workflow: **“QuickBooks Online MCP Server – Add QuickBooks tool to any AI (like Claude)”** – basically a scaffolding around the Intuit MCP server to make it plug-and-play in agents. [n8n.io](https://n8n.io/workflows/7842-quickbooks-online-mcp-server-add-quickbooks-tool-to-any-ai-like-claude/?utm_source=chatgpt.com)
  

🔎 **Conclusion (QuickBooks):**  
You _do_ have near-off-the-shelf building blocks for a **QuickBooks Skill for Claude Code**: the official Intuit MCP server + commercial MCPs + tutorial patterns. What’s generally _missing_ is a single polished, official `quickbooks-skill.zip` you download and forget; you still have to assemble SKILL.md + small glue code, but 90% of the backend is solved.

* * *

## 2. Salesforce side – Skill patterns & dev workflows

Here the story is more “examples + platform-level integration” rather than one canonical Skill.

### 2.1. Platform-level integration: Claude is first-class in Salesforce

Salesforce has **official partnerships** with Anthropic:

* Salesforce customers can select Claude 3.x models (Opus, Sonnet, Haiku) for AI-powered Salesforce apps via **Amazon Bedrock**. [Anthropic](https://www.anthropic.com/news/salesforce-partnership?utm_source=chatgpt.com)
  
* In 2025 they went further: Salesforce’s **Agentforce 360** platform embeds both GPT-5 and Claude models to power agents across Salesforce, Slack, Tableau, etc., focusing especially on regulated sectors. [Reuters](https://www.reuters.com/business/salesforce-deepens-ai-ties-with-openai-anthropic-power-agentforce-platform-2025-10-14/?utm_source=chatgpt.com)
  

So from the Salesforce side, Claude is already “inside” the ecosystem; from your side, you can still run Claude locally (Claude Code) and talk to Salesforce via APIs/CLI or hosted MCP connectors.

There is also a **Salesforce help page “Configure Claude with connectors”**, describing Claude as an AI assistant configured to connect to Salesforce-hosted MCP servers via “connectors” (this is within Salesforce docs, but it’s MCP-based just like other Claude setups). [Salesforce](https://help.salesforce.com/s/articleView?id=platform.claude_with_connectors.htm&language=en_US&type=5&utm_source=chatgpt.com)

### 2.2. Concrete Claude Skill examples touching Salesforce

A few public Skill patterns are clearly Salesforce-oriented:

* **`salesforce-analyzer` example** in the “Ultimate guide to extending Claude Code with skills”:  
    They show a generated Skill that:
    
    * analyzes Salesforce **data exports (CSV)**,
      
    * surfaces sales trends,
      
    * suggests follow-ups,
      
    * flags at-risk accounts.  
        The structure is a full Skill folder: `~/.claude/skills/salesforce-analyzer/` with `SKILL.md`, `analyzer.py`, sample data & README. [Gist](https://gist.github.com/alirezarezvani/a0f6e0a984d4a4adc4842bbe124c5935?utm_source=chatgpt.com)
    
* **Salesforce deployment / integration Skill on claude-plugins.dev**:  
    `@redmage123/salesforce/integration_SKILL.md` in a community “Claude Code Plugins” catalog. Its SKILL.md describes a skill that **“integrates winning solutions into the production codebase with regression testing and deployment verification”** – use when merging code, running regression tests, verifying deployments, etc. [Claude Code Plugins](https://claude-plugins.dev/skills/%40redmage123/salesforce/integration_SKILL.md?utm_source=chatgpt.com)
    
* Workshop content that explicitly shows **Claude completing complex Salesforce SOQL queries** as part of a Skills workflow (i.e. you build a Skill that scrapes docs, then use Claude Code to generate/optimize SOQL within that Skill). [Medium+1](https://medium.com/%40DaveThackeray/claude-skills-workshop-how-to-get-the-right-results-every-time-73f250500ec7?utm_source=chatgpt.com)
  

So the patterns for a _Salesforce dev_ Skill are already public: SOQL helper, data analyzer, deployment helper — you’d adapt them to your own org’s CLI/API setup.

### 2.3. Middleware integrations for Salesforce + Claude

Similar to QuickBooks, you can piggy-back on automation platforms:

* **n8n: Claude + Salesforce integration** – allows workflows where Salesforce events trigger Claude and vice versa; and separately, QuickBooks Online integrations that can include Claude in the same automation graph. [n8n.io+1](https://n8n.io/integrations/claude/and/salesforce/?utm_source=chatgpt.com)
  
* **Zapier: Salesforce ↔ Anthropic (Claude)** – point-and-click triggers/actions tying Salesforce objects to Claude completions (e.g. summarize case, suggest next best action, etc.). [Zapier](https://zapier.com/apps/salesforce/integrations/anthropic-claude?utm_source=chatgpt.com)
  

These are more “ops” than “dev”, but for Salesforce _development_ they’re still handy: you can build Skills that fire HTTP or CLI commands into those workflows.

🔎 **Conclusion (Salesforce):**  
There _are_ public Claude Skills and tutorials targeting Salesforce data & SOQL/regression testing, plus deep official platform integration. What’s missing is a single canonical “Salesforce Dev Skill” covering Apex/LWC generation, SFDX pipelines, org diffs, etc. — but you can compose that from existing examples.

* * *

## 3. Direct answer to your original ask

> **“is there claude code SKILL for quickbooks and for salesforce development?”**

* **QuickBooks:**
  
    * ✅ _Yes, at the infrastructure level_: official Intuit QuickBooks Online MCP server + several 3rd-party MCPs and tutorials explicitly about “QuickBooks + Claude Skills”. [qa.yodo.me+4GitHub+4Intuit Developer Community Blog+4](https://github.com/intuit/quickbooks-online-mcp-server?utm_source=chatgpt.com)
      
    * ⚠️ _But_: no single widely-advertised, Anthropic-maintained `quickbooks-dev-skill.zip` that you just drop in. You either:
      
        * use Intuit’s or CData’s MCP and let Claude Code help write a SKILL.md around it, or
          
        * grab community flows (like n8n’s QuickBooks MCP workflow) and wrap that. [n8n.io+1](https://n8n.io/workflows/7842-quickbooks-online-mcp-server-add-quickbooks-tool-to-any-ai-like-claude/?utm_source=chatgpt.com)
    
* **Salesforce development:**
  
    * ✅ There **are example Skills** (Salesforce analyzer, integration/deployment skill) and lots of content on using Claude Skills to work with Salesforce data/SOQL. [Medium+3Gist+3Claude Code Plugins+3](https://gist.github.com/alirezarezvani/a0f6e0a984d4a4adc4842bbe124c5935?utm_source=chatgpt.com)
      
    * ✅ Salesforce itself has integrated Claude models into its platform (Einstein/Agentforce), so from the Salesforce POV, Claude is first-class. [Anthropic+1](https://www.anthropic.com/news/salesforce-partnership?utm_source=chatgpt.com)
      
    * ⚠️ There _isn’t_ a one-click “Salesforce Dev Skill for Claude Code” that covers all dev tasks out of the box. You’d still define:
      
        * which org/CLI to hit (SFDX, REST, Tooling API),
          
        * which operations (generate Apex/LWC, run tests, deploy to sandbox/prod, run SOQL, etc.),
          
        * and then bake that into SKILL.md + small driver scripts.
          

* * *

## 4. If you want, next step could be:

Without needing more searching, I can sketch **two concrete SKILL layouts** (names, description, example tool calls):

1. `quickbooks-mcp-dev/` – built around `intuit/quickbooks-online-mcp-server` + your typical workflows (invoice sync, reconciliation checks).
   
2. `salesforce-dev-ops/` – wrapping SFDX + a few higher-level “plans” for Claude Code (e.g. “analyze this diff and propose safe deployment steps”, “generate tests for this Apex class and run them in scratch org”).
   

Say the word and I’ll just draft both SKILL.md skeletons + pseudo-tool sections in one go so you can copy-paste into your repo.