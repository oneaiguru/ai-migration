# Tracker System Repo Research

## Summary

We identified several open-source projects that cover different aspects of a multi-provider LLM usage tracker. Notably, there are **LLM gateway/SDK tools** (like LiteLLM and Portkey) that handle multi-provider routing and basic cost controls, and **LLM observability platforms** (like Helicone, Langfuse, Lunary) that track usage, cost, and performance metrics. We also found **statistical libraries** for multi-armed bandits and A/B testing. No single repo fulfills _all_ our needs (multi-provider tracking **and** cost optimization **and** statistical analysis with simple JSON storage), but by combining the strengths of a few projects we can jumpstart development. Below we detail top candidate repositories, their features, and how they fit our requirements.

## Top Recommendations

### Option 1: LiteLLM (BerriAI/litellm)

**URL:** github.com/BerriAI/litellm  
**Stars:** 30k[github.com](https://github.com/BerriAI/litellm#:~:text=30k%20stars%20%20%204,Tags%20%20%20Activity) **Last Update:** Active (Oct 2025)  
**License:** MIT (per project documentation)

**What it does:**  
LiteLLM is a popular Python SDK and proxy that provides a unified interface to call over 100+ LLM models across providers (OpenAI, Anthropic, Azure, Cohere, Hugging Face, etc.)[github.com](https://github.com/BerriAI/litellm#:~:text=Supported%20Providers%20). It normalizes different provider APIs into the OpenAI format and supports features like retries, fallbacks, and budget limits.

**Relevant features:**

* ✅ **Multi-provider routing:** Call any model via `completion(model="provider/name", ...)` with responses normalized to a common schema[github.com](https://github.com/BerriAI/litellm#:~:text=,LLM%20Gateway). This covers our need to poll multiple APIs and unify their usage data formats.
  
* ✅ **Usage & cost tracking:** The LiteLLM **proxy** mode can track token usage and cost per request. It lets you set **budgets and rate limits** per project/API key/model[github.com](https://github.com/BerriAI/litellm#:~:text=The%20proxy%20provides%3A) and includes hooks for logging each call’s tokens.
  
* ✅ **Integrations for logging:** Built-in callbacks to send metrics to external trackers (Lunary, Langfuse, Helicone, etc.)[github.com](https://github.com/BerriAI/litellm#:~:text=LiteLLM%20exposes%20pre%20defined%20callbacks,Helicone%2C%20Promptlayer%2C%20Traceloop%2C%20Athina%2C%20Slack)[github.com](https://github.com/BerriAI/litellm#:~:text=,langfuse%2C%20supabase%2C%20athina%2C%20helicone%20etc) – showing it gathers usage data in a structured way.
  
* ❌ **Statistical analysis:** Does _not_ include A/B testing or bandit algorithms – it’s focused on API calls and usage, so we would need to add our own experiment logic.
  
* ❌ **Simple storage:** By default, the proxy uses a Postgres DB for key management if you use its full gateway. It doesn’t log to JSON files out-of-the-box (though we could adapt the Python SDK portion to log to JSON manually).
  

**Code quality:**  
LiteLLM is well-maintained (over 26k commits, very active) and widely adopted[github.com](https://github.com/BerriAI/litellm#:~:text=26%2C591%20Commits). Documentation is thorough (with an official docs site and examples). The design is fairly **modular** – you can use it as a simple SDK or run the proxy server for more features. The codebase is large but focused, with clear abstractions for each provider.

**Reusability:**

* _Can fork entire project:_ **YES (with caveats)**. Forking the whole proxy gives us a ready-made multi-LLM gateway with cost tracking. However, it brings extra complexity (running a server, database for API keys, etc.) we might not need.
  
* _Can extract modules:_ **YES.** The Python SDK portion can be used standalone. We can import `litellm` in our tool to leverage its provider integrations and unified API, and then add our custom usage logging (to JSON) and scheduling logic on top. This avoids reinventing API clients for each provider.
  
* _Need significant changes?:_ Possibly **NO** for the core calling functionality (it works as is), but **YES** to integrate our statistical logic and to replace the storage layer. We might subclass or wrap their calls to record usage in our format.
  

**Recommendation:** **FORK/EXTRACT.** LiteLLM provides an excellent foundation for multi-provider support and basic usage tracking. We recommend using it as a base: either fork it (if we want full control) or use it as a dependency and contribute/adjust as needed. Its cost tracking and rate-limiting features[github.com](https://github.com/BerriAI/litellm#:~:text=The%20proxy%20provides%3A) can jumpstart our cost-monitoring. We will need to build the experimental scheduler on top, but we’ll save a ton of time on the low-level API handling by leveraging LiteLLM.

### Option 2: Portkey AI Gateway

**URL:** github.com/Portkey-AI/gateway  
**Stars:** 9.7k[github.com](https://github.com/Portkey-AI/gateway#:~:text=9,Tags%20%20%20Activity) **Last Update:** Active (Oct 2025)  
**License:** MIT

**What it does:**  
Portkey is an open-source **AI gateway** (written in Node.js) that routes requests to 200+ LLMs through one API endpoint[github.com](https://github.com/Portkey-AI/gateway#:~:text=The%20AI%20Gateway%20is%20designed,model%20in%20under%202%20minutes). It focuses on reliability (fallbacks, retries) and cost-efficiency. Portkey allows defining routing rules and guardrails, and it offers a web console for monitoring requests.

**Relevant features:**

* ✅ **Multi-provider routing:** Like LiteLLM, Portkey supports a huge range of providers and models via one interface[github.com](https://github.com/Portkey-AI/gateway#:~:text=The%20AI%20Gateway%20is%20designed,model%20in%20under%202%20minutes)[github.com](https://github.com/Portkey-AI/gateway#:~:text=Supported%20Providers). It’s designed to integrate with OpenAI-compatible SDKs, LangChain, etc., so it unifies how you call different LLMs.
  
* ✅ **Cost optimization logic:** This is Portkey’s standout feature – it can **automatically switch to the most cost-effective provider** based on usage patterns and pricing[github.com](https://github.com/Portkey-AI/gateway#:~:text=,usage%20patterns%20and%20pricing%20models). It also has **smart caching** to save costs on repeated queries[github.com](https://github.com/Portkey-AI/gateway#:~:text=Cost%20Management). In essence, Portkey has built-in logic to compare $/token and select cheaper models when possible (capacity permitting). This aligns directly with our need for cost-aware scheduling.
  
* ✅ **Capacity & rate management:** Supports rate limiting and load balancing across providers[reddit.com](https://www.reddit.com/r/learnmachinelearning/comments/1jqft6i/datadog_llm_observability_alternatives/#:~:text=1,for%20a%20quick%20setup%2C%20though)[reddit.com](https://www.reddit.com/r/learnmachinelearning/comments/1jqft6i/datadog_llm_observability_alternatives/#:~:text=for%20tracking%20different%20LLMs%2C%20and,for%20a%20quick%20setup%2C%20though). You can prioritize a list of models (with fallback if one fails) and enforce usage quotas. These features help in handling capacity constraints.
  
* ❌ **Statistical A/B testing:** Portkey does not include multi-armed bandit or experimentation frameworks – its routing is rule-based or cost-based, not a statistical optimizer.
  
* ❌ **Simple storage:** Portkey is a running service; usage data is viewed in its console (and can be exported via APIs) but it doesn’t log to flat files. It’s heavier-weight, expecting you to either use their cloud or host the service (with a Redis/Mongo for some features, in enterprise version).
  

**Code quality:**  
The code is high-performance (they report <1ms overhead and production use with 10B+ tokens/day)[github.com](https://github.com/Portkey-AI/gateway#:~:text=,security%2C%20scale%2C%20and%20custom%20deployments). It’s written in TypeScript/Node with good documentation (extensive wiki). The architecture is robust (it’s **enterprise-ready**, with tests and a modular design). However, being Node-based, it’s a different tech stack from our Python tools.

**Reusability:**

* _Can fork entire project:_ **NO (not directly).** Forking Portkey would mean running a separate Node service for our tracker, which might be overkill given our preference for a simple Python script approach. Also, the full feature set (guardrails, UI) is beyond our scope.
  
* _Can extract modules:_ **Indirectly.** We can’t directly import its code into Python, but we can **extract its ideas**. For example, we can mimic Portkey’s pricing model comparisons and caching strategies in our Python code. Portkey’s docs and config files might contain pricing data or logic we can translate. (If needed, we could also call Portkey via its API from Python, but that adds complexity).
  
* _Would need changes:_ N/A if not forking. The main value is in referencing its **cost management strategies** – e.g. using a config of per-provider cost-per-token and implementing a “choose cheapest available” rule, as Portkey does[github.com](https://github.com/Portkey-AI/gateway#:~:text=match%20at%20L566%20usage%2C%20including,usage%20patterns%20and%20pricing%20models)[github.com](https://github.com/Portkey-AI/gateway#:~:text=usage%2C%20including%20request%20volume%2C%20latency%2C,usage%20patterns%20and%20pricing%20models).
  

**Recommendation:** **REFERENCE.** Portkey is a strong example of multi-provider optimization in action. We suggest studying its cost-management features (auto-switch, caching)[github.com](https://github.com/Portkey-AI/gateway#:~:text=,usage%20patterns%20and%20pricing%20models)[github.com](https://github.com/Portkey-AI/gateway#:~:text=,caching) to guide our implementation. If our timeline allows, we might run Portkey locally to see how it logs usage and handles model selection. We do _not_ need to fork it entirely, but we should **extract its cost optimization logic** (e.g. maintain a list of providers with their $/token and prioritize accordingly) and its approach to failover scheduling. In short, treat Portkey as a reference architecture for cost-aware routing rather than a direct dependency.

### Option 3: Helicone

**URL:** github.com/Helicone/helicone  
**Stars:** 4.6k[github.com](https://github.com/Helicone/helicone#:~:text=4,Tags%20%20%20Activity) **Last Update:** Active (Oct 2025)  
**License:** Apache 2.0

**What it does:**  
Helicone is an open-source **LLM observability and analytics** platform. It acts as a proxy between your app and LLM providers to log all requests, responses, tokens, errors, etc. Helicone provides a dashboard to monitor usage, costs, latency, and other metrics across providers. It supports OpenAI, Anthropic, and many others via a one-line integration (changing the base URL or adding a header)[github.com](https://github.com/Helicone/helicone#:~:text=Quick%20Start%20%E2%9A%A1%EF%B8%8F%20One%20line,of%20code)[github.com](https://github.com/Helicone/helicone#:~:text=import%20OpenAI%20from%20).

**Relevant features:**

* ✅ **Multi-provider usage tracking:** Yes – Helicone logs requests to OpenAI, Anthropic, Google Gemini, Together, etc.[github.com](https://github.com/Helicone/helicone#:~:text=Helicone%20is%20the%20all,LLM%20developer%20platform). It captures each call’s details regardless of provider, giving a unified view. Different usage formats (e.g. OpenAI’s token counts vs. others) are normalized in its logging backend.
  
* ✅ **Cost and quota monitoring:** Helicone tracks spend over time. The dashboard shows cost trends and usage by model/provider[reddit.com](https://www.reddit.com/r/learnmachinelearning/comments/1jqft6i/datadog_llm_observability_alternatives/#:~:text=3,you%20just%20need%20basic%20logging)[reddit.com](https://www.reddit.com/r/learnmachinelearning/comments/1jqft6i/datadog_llm_observability_alternatives/#:~:text=3,you%20just%20need%20basic%20logging). It can alert on usage limits (though enforcement is up to the user). Essentially, it provides the _analytics_ portion – e.g. how close you are to Claude’s monthly quota, how much each provider is costing, etc., all in one place.
  
* ✅ **Statistical analysis (partial):** While Helicone itself doesn’t do A/B testing, it integrates with eval frameworks. It logs prompt-response pairs and can send data to tools like LastMile or Ragas for evaluations[github.com](https://github.com/Helicone/helicone#:~:text=control%2C%20always%20accessible.%20,and%20more%20with%20our%20gateway). For our needs, Helicone’s value is more in data collection, but it doesn’t have built-in bandit algorithms or stopping rules.
  
* ✅ **No heavy database on our side:** (Relative to other platforms) Helicone can be self-hosted with a Postgres DB (via Supabase) but as users we don’t manage that – we just send requests to their cloud endpoint or our hosted instance. If we use Helicone Cloud’s generous free tier (100k req/month)[github.com](https://github.com/Helicone/helicone#:~:text=,No%20credit%20card%20required), we could avoid building a storage system entirely and just export JSON from Helicone. _However,_ relying on Helicone’s cloud might not fit “self-hosted JSON logs” requirement, so we likely would self-host or not use it directly.
  
* ❌ **Scheduling & optimization:** Helicone **does not route or optimize** – it’s purely observe and report. It won’t decide which provider to call; that logic must live elsewhere (e.g. our code or something like Portkey).
  
* ❌ **Simplicity:** Helicone is simpler than Langfuse/Lunary in scope, but it’s still a full web service. Running it means deploying the proxy and a DB. It’s not a lightweight script, so using it just to get JSON logs might be overkill.
  

**Code quality:**  
Good – it’s an active YC-backed project with many contributors. The code (TypeScript and some Python) is organized into proxy workers and a Next.js dashboard. Documentation is clear (a docs site plus examples). Helicone is built specifically for **developer-friendliness** (e.g., one-line integration, and lots of guides). The trade-off is complexity under the hood (it’s essentially an entire monitoring app).

**Reusability:**

* _Can fork entire project:_ **NO.** Forking Helicone would mean replicating their whole observability platform, which is outside our goal. We don’t need the full web UI or cloud infrastructure.
  
* _Can extract modules:_ **PARTIALLY.** We can learn from Helicone’s approach to **calculating cost and usage**. For example, Helicone likely has mappings of model names to token pricing (to compute cost per request) and logic to parse OpenAI’s usage fields. We could dig into their codebase or API to extract those pieces. We might also use their idea of a unified logging schema for different providers (to design our JSON format).
  
* _Would need changes:_ N/A if not directly using. If we did use it, we’d still need to build the optimization layer on top of the data it provides.
  

**Recommendation:** **REFERENCE / EXTRACT.** We recommend _referencing_ Helicone as a model for usage tracking. We could start by using Helicone in development to quickly get a sense of our usage across providers (since it’s easy to integrate) and export that data. Long-term, we might implement a simpler internal logger inspired by Helicone to avoid external dependencies. Specific elements to extract: how they handle **cost calculations** (so we don’t manually maintain pricing for each model) and how they structure the usage logs (fields for prompt tokens, completion tokens, etc. across providers)[github.com](https://github.com/Helicone/helicone#:~:text=,Your%20prompts%20remain%20under%20your). In summary, Helicone is a great learning tool for the **observability** aspect of our tracker. We will likely not fork it, but use it to inform our implementation of logging and cost tracking.

## Notable Mentions

* **Langfuse** – _LLM Observability & Analytics platform (Open-source)._ Similar to Helicone but even more comprehensive (traces, prompt management, evaluations, etc.). Langfuse tracks token usage and cost for many providers[langfuse.com](https://langfuse.com/docs/observability/features/token-and-cost-tracking#:~:text=Model%20Usage%20%26%20Cost%20Tracking,always%20add%20your%20own%20models) and has 17k+ stars[github.com](https://github.com/langfuse/langfuse#:~:text=match%20at%20L850%20Stars). It’s a LangSmith alternative[reddit.com](https://www.reddit.com/r/LangChain/comments/1l36tte/all_langfuse_product_features_now_free_opensource/#:~:text=Max%2C%20Marc%20and%20Clemens%20here%2C,are%20available%20as%20free%20OSS). We decided not to top-list it because it’s quite heavy (requires Docker, databases, and has many features we don’t need). Great for reference if we want to see how they store time-series metrics or implement evaluation workflows. License is Apache 2.0.
  
* **Lunary** – _Production toolkit for LLM chatbots._ An open-source platform (1.4k stars) focused on conversation tracking, prompt management, and analytics including **cost, token usage, and latency**[github.com](https://github.com/lunary-ai/lunary#:~:text=Lunary%20helps%20developers%20of%20LLM,Chatbots%20develop%20and%20improve%20them). It’s Apache-2.0 licensed[github.com](https://github.com/lunary-ai/lunary#:~:text=License). Lunary is a bit like a smaller Langfuse (with a UI and Postgres backend). It’s noteworthy for its emphasis on _ease of use_ and integration (they even mention working with LiteLLM, LangChain, etc.). We can glance at Lunary’s code for how they log usage data to a DB. Not chosen as top-3 because it overlaps with Helicone/Langfuse in purpose and doesn’t specifically address cost-optimization or bandits.
  
* **PromptLayer** – _OpenAI API request logging library._ PromptLayer (as a service and a Python library) records all your OpenAI API calls for later search and analysis[github.com](https://github.com/MagnivOrg/prompt-layer-library#:~:text=MagnivOrg%2Fprompt,you%20to%20search%20and). It’s not multi-provider (OpenAI-focused), but it shows how to intercept API calls in code. The open-source `prompt-layer-library` (by MagnivOrg) could provide lightweight insight into capturing usage without a heavy server. However, it lacks cost analytics or optimization logic – mainly a logging middleware. Good to be aware of as a simple approach.
  
* **OpenAI Usage Tracker Scripts** – There are small tools like the one by mazzzystar (`api-usage` with ~72 stars) that fetch usage from OpenAI’s billing API and display costs[github.com](https://github.com/mazzzystar/api-usage#:~:text=Introduction). These illustrate how to call provider-specific endpoints (OpenAI has `/v1/dashboard/billing/usage` etc.) and parse the results. While these aren’t multi-provider, we might use similar techniques for providers that expose usage info via API (if any, e.g., OpenAI, perhaps Azure OpenAI). We’ll skip these for core development but keep them in mind for reference on direct API polling.
  
* **Multi-Armed Bandit Libraries** – To fulfill our statistical analysis needs, we found libraries like **MABWiser** (Fidelity, Apache-2.0) and **PyBandits** (Playtika, MIT). MABWiser provides a suite of bandit algorithms (Epsilon-Greedy, UCB, Thompson Sampling, etc.) in a scikit-learn-like interface[github.com](https://github.com/fidelity/mabwiser#:~:text=Available%20Bandit%20Policies). PyBandits specifically implements Thompson Sampling for Bernoulli rewards[github.com](https://github.com/PlaytikaOSS/pybandits#:~:text=PyBandits%20is%20a%20,based%20on%20Thompson%20Sampling). Rather than coding bandit logic from scratch, we could leverage these libraries or at least study their implementations for correct handling of reward updates, confidence intervals, and stopping criteria. They are general-purpose and not tied to LLMs, but pairing one with our usage tracker would cover the “A/B testing and stopping rules” aspect nicely. (We did not list one of these as a top option because they handle only the statistical decision-making, not the LLM usage collection, but they will be crucial for our scheduling optimizer module.)
  
* **Other** – _OpenLLMetry (Traceloop)_: an OpenTelemetry-based toolkit for LLM observability[github.com](https://github.com/traceloop/openllmetry#:~:text=traceloop%2Fopenllmetry%3A%20Open,observability%20over%20your%20LLM%20application). It’s more of an instrumentation add-on than a full system – if we use OpenTelemetry, this could feed into standard monitors. Likely overkill for now.  
    _LangSmith (LangChain)_: a closed-source tool for logging and evaluating LLM calls. Not open-source, so not usable for us, but conceptually similar to Langfuse.  
    _Nexos (upcoming)_: Mentioned in community discussions as a future all-in-one routing and monitoring platform[reddit.com](https://www.reddit.com/r/learnmachinelearning/comments/1jqft6i/datadog_llm_observability_alternatives/#:~:text=tracing%20or%20eval%20tools,you%20just%20need%20basic%20logging), but it’s not released as of now.
    

## Gaps We Need to Fill

Despite the rich ecosystem above, we identified a few gaps that no existing repo addresses fully, meaning we’ll need to build these aspects ourselves:

* **Integrated Statistical Scheduler:** None of the open-source projects combine usage tracking with an automated _decision engine_ for routing requests. Portkey gives cost-based switching, but it’s rule-based rather than statistically optimized. We will need to implement our own multi-armed bandit or experiment framework to decide, for example, which provider to use for the next request based on performance and cost. This means writing logic (or using MAB libraries) for Thompson Sampling, confidence interval calculation, and early stopping of experiments – features not present in Helicone/LiteLLM/etc.
  
* **Lightweight Storage (JSON):** All the robust tools (Helicone, Langfuse, Lunary) rely on databases and servers. Our requirement is to store usage data in simple JSON/JSONL files for portability and version control. We didn’t find an open solution doing this out-of-the-box. We’ll design a custom logging system (possibly adapting parts of LiteLLM’s logging hooks to write to file). This is a gap we knowingly fill for simplicity, trading off the querying power of a database for human-readable logs.
  
* **Provider Polling for Quotas:** While usage proxies log each call, sometimes we need to poll provider-specific endpoints (e.g., to get remaining quota or monthly usage). None of the tools explicitly handled _polling the provider’s usage APIs_ as a feature – they mostly infer usage by logging calls. We might need to add small modules to hit endpoints like OpenAI’s billing API or Anthropic’s usage API (if available) to double-check against our logs or handle external updates.
  
* **Unified Cost Model Data:** To compare $/unit across providers, we need up-to-date pricing info. Outside of Portkey’s internal logic, there isn’t a public library of LLM pricing. We’ll have to compile this (from docs or hardcode it). Ensuring this stays current might require manual effort unless we find an API or repository of model pricing.
  
* **Scope of Optimizations:** Some aspects like **capacity constraints** (e.g., providers have rate limits or daily caps) are not fully open-sourced in these projects’ logic. We’ll have to implement constraint handling (e.g., “don’t exceed N calls per day on Claude”) in our scheduler. We have references (LiteLLM budgets, Portkey rate rules) but the specific logic tying it to scheduling decisions will be custom.
  

In summary, we have to build the **glue** between data collection and decision-making: the existing repos either do one or the other, but not both in an easy, lightweight way.

## Recommended Approach

**FORK:** We will likely **fork or reuse LiteLLM** as our core for multi-provider support. Its permissive MIT license and active development make it a solid base. By forking, we can strip out parts we don’t need (e.g., the web UI, heavy DB requirements for the proxy) and keep the essential SDK and cost tracking. This gives us instant coverage of dozens of providers and consistent response parsing[github.com](https://github.com/BerriAI/litellm#:~:text=,LLM%20Gateway). If not a full fork, using it as a library is an option, but a fork lets us tailor it (for instance, to log to JSON directly or to plug in our scheduling logic on each call).

**EXTRACT:** From other projects, we will extract specific components and ideas:

* From **Portkey**, take the concept of cost-aware routing. We should build a module in our system that maintains a list of models/providers with their costs and dynamically chooses the cheapest available option[github.com](https://github.com/Portkey-AI/gateway#:~:text=,usage%20patterns%20and%20pricing%20models) (given our performance requirements). We might also implement a version of Portkey’s **caching** to avoid repeated calls for identical prompts[github.com](https://github.com/Portkey-AI/gateway#:~:text=,caching).
  
* From **Helicone/Langfuse**, extract how they compute and aggregate usage metrics. In practical terms, we can copy the approach to calculating token counts and cost per request (they likely multiply tokens by price and perhaps handle rounding, etc.). If Helicone has scripts or queries for cost over time, we can mirror those in our JSON log processing. Also, we can adopt a similar JSON schema for logging events (timestamp, model, tokens used, cost, response time, etc.) informed by these tools’ data models.
  
* From **Bandit libraries (PyBandits/MABWiser)**, use the Thompson Sampling and UCB implementations as a starting point instead of writing our own from scratch. We might include one of these libraries as a dependency or just port the small amount of code needed to maintain running estimates of each provider’s “reward” (could be success rate or quality score) and uncertainty. This will help implement features like confidence intervals and stopping rules for A/B tests. For example, MABWiser’s use of statistical policies[github.com](https://github.com/fidelity/mabwiser#:~:text=Available%20Bandit%20Policies) can guide how we formalize our decision logic.
  
* Additionally, use snippets from **OpenAI usage scripts** to implement any needed direct API polling for usage. And use **PromptLayer’s idea** of a middleware to intercept API calls – since we control the call (via LiteLLM), we can insert our own logging around it, similar to how PromptLayer intercepts OpenAI calls.
  

**BUILD:** After incorporating the above, we will build the missing pieces unique to our system:

* A **Usage Logging Service** that writes JSONL records for each call. This could be as simple as a Python function that appends to a file after each API response, including all relevant info. We’ll build this to be robust (maybe buffering writes, handling concurrency if needed) and easy to analyze (one record per line with a consistent format).
  
* The **Scheduling & Optimization Engine** that ties into the call process. This will use the bandit algorithms to choose which provider to call next, update the statistics after each response, and enforce constraints (e.g., if one provider’s budget is nearly exhausted, reduce its selection probability or stop using it). This component is essentially our “brain” making decisions. We’ll implement it using the algorithms from literature, ensuring we can configure strategies (epsilon-greedy vs Thompson, etc.) and define rewards (maybe inverse cost, success metrics, etc.). No existing repo provides this end-to-end, so it’s custom build with help from research.
  
* **Configuration & Pricing Data:** a simple module (maybe a JSON or YAML config) where we maintain provider info: pricing, rate limits, quotas, etc. We’ll populate this from official docs, and ensure our system loads it to make decisions. This is a one-time build (with occasional updates).
  
* **Integration Glue:** Finally, we write integration code to connect all parts: e.g., wrap LiteLLM’s `completion()` call in a function that consults the scheduler for which provider to use, calls it, logs the usage to JSON, and updates the bandit model with the outcome. We’ll also build any necessary analysis scripts to read the JSON logs and present usage trends (since we’re not using a UI, maybe simple CLI reports or Jupyter notebooks for analysis).
  

With this approach – forking where advantageous and extending with our own logic – we leverage proven solutions and focus our coding effort on the truly novel parts of the tracker.

## Next Steps

1. **Prototype with LiteLLM:** Import LiteLLM in a sandbox and make a few calls to multiple providers. Verify it covers the providers we need and see how it returns usage info (e.g., does it give token counts in the response? – it appears to include a `usage` field[github.com](https://github.com/BerriAI/litellm#:~:text=,0)). This will inform how we intercept or gather data. If LiteLLM’s proxy mode is needed for budgets, evaluate running it locally in a stripped form.
   
2. **Gather Pricing & Constraints:** Create an initial dataset of provider costs (e.g., $0.002 / 1K tokens for OpenAI gpt-3.5, $1.50 per million chars for Claude, etc.) and define how to compute cost per request. Also list any hard quotas (Claude’s monthly allowance, OpenAI rate limits) that our scheduler should consider.
   
3. **Design JSON Log Schema:** Draft what each log entry will look like (timestamp, provider, model, tokens_in, tokens_out, cost, response_time, success_flag, reward_metric, etc.). Ensure it can capture everything needed for analysis and is easy to parse. We can model this after Helicone or Langfuse’s trace schemas for completeness.
   
4. **Plan Bandit Integration:** Decide which bandit approach to start with (e.g., Thompson Sampling on success rate or cost-success tradeoff). Experiment with one of the libraries (MABWiser or PyBandits) on dummy data to make sure we understand its API. Alternatively, code a simple Thompson Sampling loop ourselves for initial testing.
   
5. **Implement Core Loop:** Begin coding the main loop that: (a) selects a provider (bandit or cost-rule), (b) makes the API call via LiteLLM, (c) logs the usage and results to JSON, (d) updates the bandit with the reward (e.g., 1 for success, 0 for failure, or a score), and repeats. This will be the heart of the system. We can unit test this loop with a stubbed “provider” to ensure logging and updating works before hitting real APIs.
   
6. **Testing with Real Data:** Run the system with two or three providers in a pseudo A/B test to see if the logging captures everything and the scheduling logic behaves as expected (e.g., does it converge to the cheaper option if quality is equal?). We might use the providers’ free tiers or small inputs to generate sample usage.
   
7. **Identify Additional Needs:** As we test, note if we need any UI or alerts (for example, printing a warning if a provider is nearing its quota, or outputting a summary of cost usage at the end of a run). We can add lightweight features accordingly (maybe a daily summary JSON or an email alert, etc., though that’s optional).
   
8. **Iterate or Pivot:** If the LiteLLM approach proves too heavy or not exactly fitting, be ready to pivot to a simpler approach (using provider SDKs directly with our own wrappers). But given our research, LiteLLM seems to cover that well. Also, remain flexible in the bandit strategy – we might try a few algorithms (epsilon-greedy vs Thompson) to see what works best for our cost optimization goals.
   
9. **Documentation & Version Control:** Finally, document how the system works for future maintainers. Because we favor JSON logs, emphasize how to interpret them and possibly provide a script to convert logs into charts or reports (taking inspiration from Helicone’s dashboards).
   

By following these steps, Pro (and the team) can rapidly build the multi-provider usage tracker with confidence, standing on the shoulders of these open-source projects rather than starting from zero. The result will be a tailored system that meets our exact needs: unified usage tracking across providers, cost-optimized routing decisions, and statistically sound allocation of calls – all while remaining lightweight and transparent.