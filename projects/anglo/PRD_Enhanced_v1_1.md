**ChatGPT:**

# Product Requirements Document: English Learning App for Russian Speakers

## Executive Summary

**Grounding tags (use throughout this PRD):**
* FACT: verifiable and cited.
* DECISION: chosen product or architecture direction.
* HYPOTHESIS: expected impact to validate via experiments.
* UNKNOWN: not yet researched or confirmed.

This document outlines the Product Requirements for a new language-learning app targeting Russian-speaking users who want to learn English. The app’s initial launch will focus on the highest-demand language pair (Russian-to-English), delivered via a Progressive Web App (PWA) and Android (RuStore) to maximize reach in Russia. iOS is a secondary platform due to its smaller market share (~30%) in Russia and App Store payment challenges[gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/russian-federation#:~:text=Mobile%20Operating%20Systems%20Percentage%20Market,7)[support.google.com](https://support.google.com/googleplay/android-developer/answer/11950272?hl=en#:~:text=Due%20to%20payment%20system%20disruption%2C,available%20on%20the%20Play%20Store). The core learning experience will emphasize **gamified** features proven to drive engagement – daily streaks, experience points (XP), leaderboards, and reminders – rather than advanced AI tutors in the first version. Monetization will follow a **freemium** model: a robust free tier with fundamental learning content (but some daily use limits), and a premium subscription offering unlimited access, offline functionality, and an ad-free experience. An early “Founder Lifetime” one-time purchase option may be offered at launch to generate upfront cash and reward early adopters. All content will be original (built from the ground up to avoid Duolingo’s IP) and aligned to CEFR levels A1–B1 (beginner through intermediate). Special considerations for the Russian market – such as support for local payment methods (Mir cards, SBP transfers) and compliance with data localization laws – are included in the technical and business requirements. By focusing on the core user needs and market constraints in Russia, this product aims to quickly gain traction among Russian learners of English, providing a solid foundation for future expansion into additional languages and features.

## Target Audience and Language Scope

**Primary Audience:** Native Russian speakers who want to learn English. DECISION: launch with RU->EN first to focus content and the largest demand segment. Supporting signal (third-party estimates, not official Duolingo data): duolingodata.com lists the English-for-Russian course at ~17.3M learners versus German ~3.0M and French ~1.9M[duolingodata.com](https://duolingodata.com/#:~:text=Chinese%20A2%2060%20RU%20130,12%20474). In fact, English is the most popular foreign language in Russia by a wide margin - only about 11% of Russians speak English today, but it is still the **top language studied** in schools and universities[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=According%20to%20a%20Levada%20center,with%20studying%20English%20in%20Russia)[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=According%20to%20a%20Levada%20center,with%20studying%20English%20in%20Russia). HYPOTHESIS: focusing on English at launch covers most user demand; we will validate via early cohorts and surveys.

**Secondary Languages (Future):** Other languages such as German or French will **not** be included in the initial launch. These may be added in a later version (v2) only if there is clear evidence of significant demand (e.g. >10% of users signing up for a waitlist or survey interest for a specific language). Supporting signal (third-party estimates, not official Duolingo data): after English, duolingodata.com lists German (~3.0M learners) and French (~1.9M) as the next most popular courses for Russian speakers[duolingodata.com](https://duolingodata.com/#:~:text=Chinese%20A2%2060%20RU%20130,12%20474). Unless at least ~10% of our user base indicates strong interest in another language, we will concentrate our resources on doing one language pair extremely well. This will allow us to establish a loyal user base and refine our core learning product before expanding content breadth.

**Rationale:** By limiting scope to **Russian -> English** initially, we ensure that our content development and pedagogy are laser-focused on the most impactful use case. English proficiency is highly valued in Russia for educational and career opportunities[blog.duolingo.com](https://blog.duolingo.com/2025-duolingo-language-report/#:~:text=In%20much%20of%20the%20world%2C,their%20English%20skills%20with%20Duolingo)[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=According%20to%20a%20Levada%20center,with%20studying%20English%20in%20Russia), so we anticipate strong uptake if we provide a high-quality, localized English learning experience. Starting with one language pair also lets us optimize the course structure (e.g. aligning to CEFR levels A1–B1) and user experience without the complexity of multi-language support. Once we prove product-market fit with English, we can reuse our platform for additional languages if justified by user demand data.

**Launch Content Level:** The English course will cover material from **beginner (A1)** through **intermediate (B1)** proficiency. This range enables us to serve true beginners with no knowledge of English, up to lower-intermediate learners who can hold basic conversations. We choose A1–B1 because these levels capture the core foundations of the language (basic vocabulary, grammar, everyday phrases) which most learners need. Advanced content (B2+) is de-prioritized for v1 to keep the scope manageable and because relatively fewer users reach advanced levels. According to the CEFR framework, B1 corresponds to the ability to handle most common travel, work, or school scenarios in the language – a reasonable initial goal for our learners. All lesson content, exercises, and audio will be **original**, developed in-house (or via contracted language educators) to avoid any copyright issues with existing apps. We will leverage established frameworks (CEFR, frequency word lists, etc.) to guide curriculum development, but the exact sentences, stories, and characters will be unique to our app.

**Future Expansion (v2+):** If/when we expand to additional languages, we will use a data-driven approach. For example, should 10–15% of users request German or French, we could launch “English speakers learning German” (if we also have English speakers as a market) or “Russian speakers learning German/French”. But in v1, **90%+ of our target users’ needs are met by English**, so other languages are on hold. This focused approach also lets us build out our content creation pipeline and ensure quality (e.g. we can refine our approach to teaching methodology, exercises, and cultural localization with English first, then apply those lessons to new languages later).

## Platform Strategy and Distribution

**Progressive Web App (PWA) First:** The initial product will be delivered as a **Progressive Web App**, accessible via web browser on desktop and mobile, with installable capabilities. The PWA will function like a native app (responsive design for mobile, offline caching for lessons, push notifications for reminders) but has several advantages for our use case:

* **Bypass App Store Limitations:** A web app allows us to reach users directly without depending on app store distribution, which is crucial in Russia’s current environment. (Google Play has limited services and payments in Russia[reuters.com](https://www.reuters.com/technology/russias-vk-launches-rustore-apps-after-exit-western-alternatives-2022-05-25/#:~:text=Apple%20and%20Alphabet%27s%20Google%20%28GOOGL,to%20Moscow%27s%20actions%20in%20Ukraine)[support.google.com](https://support.google.com/googleplay/android-developer/answer/11950272?hl=en#:~:text=Due%20to%20payment%20system%20disruption%2C,available%20on%20the%20Play%20Store), and Apple’s App Store imposes restrictions and high fees). With a PWA, users can simply go to our website and “Add to Home Screen” for an app-like experience.
    
* **Faster Iteration & Unified Codebase:** We can deploy updates to the PWA continuously and have a single codebase for all platforms (web, Android, iOS via browser). This accelerates development and ensures every user is on the latest version.
    
* **Offline Support:** Using service workers, the PWA can cache lesson content and assets for offline use. Given connectivity issues in certain regions and the unpredictability of internet access in Russia (e.g., due to infrastructure or censorship disruptions), offline-first design is a priority. The web app will download lessons when the user has connectivity and allow doing exercises offline; progress will sync when back online.
    
* **Installable Experience:** Modern PWAs are installable on Android (Chrome prompts to install) and even on desktop. This gives a near-native feel – launching from an icon, full-screen mode, etc. – without requiring us to go through app store approvals initially.
    

**Android App via RuStore:** Android has the largest mobile OS share in Russia (~70%)[gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/russian-federation#:~:text=Mobile%20Operating%20Systems%20Percentage%20Market,7), so a native Android presence is important. However, we will **distribute via RuStore**, Russia’s domestic Android app store, rather than (or in addition to) Google Play. The reasons are: (1) Google Play **paused its billing system in Russia** as of March 2022, meaning Russian users cannot make purchases or subscriptions through Google Play[support.google.com](https://support.google.com/googleplay/android-developer/answer/11950272?hl=en#:~:text=Due%20to%20payment%20system%20disruption%2C,available%20on%20the%20Play%20Store). This severely hampers monetization for any app reliant on Google’s IAP. (2) Google Play has also blocked paid app downloads and updates in Russia for compliance reasons[support.google.com](https://support.google.com/googleplay/android-developer/answer/11950272?hl=en#:~:text=As%20of%20August%202%2C%202022%2C,in%20Russia%20at%20this%20time). Therefore, even if we listed a free app, we couldn’t easily charge for premium upgrades through Play Store. RuStore, launched by VK with government backing in 2022 as an alternative store, has quickly grown in adoption[reuters.com](https://www.reuters.com/technology/russias-vk-launches-rustore-apps-after-exit-western-alternatives-2022-05-25/#:~:text=May%2025%20%28Reuters%29%20,services%20to%20replace%20Western%20rivals)[reuters.com](https://www.reuters.com/technology/russias-vk-launches-rustore-apps-after-exit-western-alternatives-2022-05-25/#:~:text=RuStore%20was%20created%20with%20the,and%20cybersecurity%20firm%20Kaspersky%20Lab). By using RuStore:

* We ensure users can **download and update** the app without restrictions.
    
* We can integrate local payment gateways for in-app purchases (since RuStore supports payments via Russian systems).
    
* We align with the trend of Russian tech self-sufficiency – it’s an officially endorsed platform (“Russia’s official app store”)[en.wikipedia.org](https://en.wikipedia.org/wiki/RuStore#:~:text=RuStore%20,Russia%27s%20Ministry%20of%20Digital), making users (and regulators) more comfortable.
    

DECISION: Build the PWA in React + TypeScript and distribute Android via a Trusted Web Activity wrapper around the PWA; add minimal native glue only where required (payments/push). We will aim to list on **RuStore at launch or shortly after**. If feasible, we may also publish a version on Google Play but with free-only features, and guide users to upgrade via web; however, the primary Android channel will be RuStore to allow a smooth premium experience. (Notably, as of May 2022, RuStore launched with ~100 apps and has been adding more daily[reuters.com](https://www.reuters.com/technology/russias-vk-launches-rustore-apps-after-exit-western-alternatives-2022-05-25/#:~:text=VK%20%28VKCOq,were%20being%20added%20every%20day). By now it’s a well-established distribution channel for Russian Android users.)

**iOS App (Secondary Priority):** We will have an iOS app, but it is **lower priority** for a few reasons:

* **Market Share:** iOS accounts for roughly 25–30% of mobile devices in Russia, whereas ~70% run Android[gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/russian-federation#:~:text=Mobile%20Operating%20Systems%20Percentage%20Market,7). Focusing on PWA/Android first covers a larger user base. (For example, StatCounter shows ~30% iOS vs ~70% Android usage in late 2025 in Russia[gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/russian-federation#:~:text=Mobile%20Operating%20Systems%20Percentage%20Market,7), and globally iOS is about 28% of smartphones[en.wikipedia.org](https://en.wikipedia.org/wiki/Usage_share_of_operating_systems#:~:text=,most%20powerful%20supercomputers%2C%20Linux%20distributions).)
    
* **Payment Friction:** Apple’s App Store requires using their IAP system and historically has been strict (with high 30% fees). More importantly, many Russian payment cards don’t work for international App Store purchases since Visa/Mastercard left Russia in 2022[en.wikipedia.org](https://en.wikipedia.org/wiki/Mir_(payment_system)#:~:text=In%20March%202022%2C%20as%20a,18)[en.wikipedia.org](https://en.wikipedia.org/wiki/Mir_(payment_system)#:~:text=resulted%20in%20significantly%20increased%20use,It%20is%20estimated%20that%20banks). Apple does not support Mir cards, and Apple Pay is no longer available for Russian cards[en.wikipedia.org](https://en.wikipedia.org/wiki/Mir_(payment_system)#:~:text=In%20March%202022%2C%20as%20a,18). This means even if we have an iOS app, monetizing it is hard because users may not have a working payment method for subscriptions.
    
* **Regulatory Issues:** Apple has complied with some Russian regulations (e.g., showing Russian apps suggestions during setup), but also has had conflicts (e.g., antitrust fines for not allowing alternative payments[digitalpolicyalert.org](https://digitalpolicyalert.org/event/1439-apple-ordered-to-enable-app-developers-to-use-alternative-payment-methods-without-paying-appstore-commission#:~:text=Apple%20ordered%20to%20enable%20app,of%20its%20AppStore%20Review), VPN app removals). There’s also the possibility of new laws requiring alternative app stores on iOS in Russia[meduza.io](https://meduza.io/en/feature/2025/06/27/an-app-store-ultimatum#:~:text=An%20App%20Store%20ultimatum%20New,app%20store%E2%80%9D%20for%20Russian). All this creates uncertainty for investing heavily in iOS right now.
    

Given these factors, our v1 will treat iOS as a nice-to-have. The PWA will be fully accessible on iPhones via Safari – and we will optimize for that (e.g., ensure our PWA “Add to Home Screen” works well on iOS, even though iOS has some PWA limitations). We plan to release a native iOS app eventually (perhaps in v2 or once we have steady revenue from other channels) to capture that remaining 30% of users. When we do, we might consider leveraging Apple’s recent allowance of alternative payment methods in some regions or simply use the app as a gateway and encourage users to pay on web (bypassing Apple’s commission). For launch, however, **iOS users can be served by the web app**, which will provide nearly the same experience (minus push notifications, since iOS Safari’s support for PWA push is limited but coming along). We’ll monitor how many users access via iPhone to prioritize a native iOS build accordingly.

**Desktop Web:** Although the focus is on mobile-like experiences, the PWA will also function on desktop browsers. A subset of users (especially adult learners or those who prefer a PC for studying) might use the web app on their laptop/desktop. We will ensure the design is responsive to larger screens. Desktop is not the primary use case, but supporting it comes “for free” with a web-first approach. Duolingo, for instance, has a significant portion of usage on its web version, and offering that could differentiate us from mobile-only competitors.

**Localization & Distribution Considerations:** The app and all marketing materials (website, onboarding, support) will be in **Russian** (with English learning content of course). We will distribute the PWA via our website (a .ru domain or other domain not blocked in Russia). For visibility, we’ll leverage Russian marketing channels: e.g., VK, Telegram, Yandex for SEO. On Android, being on RuStore gives us discoverability there. We will also aim to comply with any Russian requirements for pre-installation (there’s a law requiring certain apps be pre-loaded on devices sold in Russia). Possibly we can pursue getting our app on that recommended list in the future if we gain traction.

In summary, the platform strategy is **web-first and Android-focused**, maximizing reach under Russia’s constraints and minimizing dependency on Western app stores. This staged approach (PWA → Android (RuStore) → iOS) aligns with both the technical ease (web development is fastest) and the market reality in Russia.

## Monetization Strategy and Subscription Tiers

Our monetization model is **freemium**, offering a free tier to drive user acquisition and engagement, with a paid premium subscription for enhanced features and unlimited access. This approach mirrors what's proven in the language app market (Duolingo, etc.), where typically 90+% of users remain on free and a small percentage pay for premium. We will optimize the free experience to be compelling but offer clear value for subscription upgrades.

**Free Tier:** The app will be fully usable for free, providing access to all core lessons and features, with some limitations to encourage upgrading:

* **Daily Attempt Limiter System (Configurable Hearts vs Energy Policy Engine):** Free users will face a soft limit on lesson attempts per day. The system will be implemented as a flexible policy engine supporting multiple mechanics:
  * **Hearts Model (launch baseline):** Each wrong answer costs 1 heart; if hearts run out (~3 per day), the user must wait ~20 hours or complete a practice exercise to refill. This mirrors Duolingo's original mechanic and encourages upgrade without locking out the app entirely.
  * **Energy Model (A/B test candidate):** Users earn/consume energy with each lesson attempt; energy recharges slowly (~4-6 hours) or can be earned back via streaks of correct answers (e.g., 5 consecutive correct answers restores 1 energy). This is Duolingo's newer approach and may improve retention for the Russian audience.
  * **Rationale:** The limiter is intentionally configurable as a runtime policy (via feature flags/remote config) so the team can run A/B experiments to determine which mechanic drives better retention, conversion, and user satisfaction. This design also allows rapid iteration based on analytics.

* **Online-by-Default (Optional Offline):** Free tier may require internet for lessons. This is a reasonable differentiation since offline mode (downloading course packs) is a key premium feature.

* **Limited Features:** Nice-to-have features are reserved for premium (e.g., certain advanced practice modes, streak freeze). But importantly, the _learning content itself (all lessons and exercises)_ is available to free users – we are not paywalling the English curriculum.

**Premium Tier (Subscription):** Branded as **"Plus"** or **"Premium"**, this paid monthly/annual subscription unlocks the full potential:

* **Unlimited Attempts:** Subscribers have no hearts/energy limits and can do unlimited lessons without interruption or waiting.

* **Offline Access:** Download entire lesson units/course packs to study without internet. This is crucial given potential connectivity issues in Russia. Offline access includes full exercise support with progress syncing when back online.

* **Streak Freeze/Repair:** Premium automatically provides one missed day forgiveness per month (or a monthly streak freeze). Protects users' streaks from missing a day due to life events.

* **Unlimited Daily Learning:** No daily cap on lessons – premium users can learn as much as they want each day.

* **Ad-Free (if we add ads):** Though we are moving toward a no-ad model, if ads are introduced as a revenue lever later, premium users would get an ad-free experience.

**Premium Pricing (Russia):**
* **Monthly:** ~500-600 RUB (~$5-6 USD)
* **Annual:** ~5,500-6,500 RUB (~$55-65 USD) with ~20% discount for annual commitment
* Pricing is conservative for the Russian market to maximize accessibility while maintaining profitability.

**Founder Lifetime Purchase (Launch Window):**
* One-time offer (~1,500-1,800 RUB or ~$15-18 USD) for the first 30-60 days post-launch.
* Grants permanent access to all premium features forever with no renewal required.
* Limited to early adopters only; creates urgency and generates upfront cash flow.
* After the window closes, this option is retired (or reopened at company discretion).

**Payment Methods & Russia-Specific Integration:**

This is critical for monetization success in Russia, as standard Western payment channels are unavailable.

* **RuStore In-App Payments (Android Primary):** DECISION: Android paid features and subscriptions go through RuStore Pay SDK.
  * **Payment methods:** bank cards (including Mir), SBP, SberPay.
  * **Rationale:** Google Play billing has been paused in Russia since March 10, 2022; RuStore is the primary paid channel.
  * **UNKNOWN:** exact RuStore subscription requirements, refund terms, and revenue share for 2026.

* **Web Payments (PWA):** For PWA users accessing via browser, integrate with 1-2 Russian-friendly payment processors:
  * **Primary partner requirements:** recurring subscriptions with SBP + Mir card support, proration, refunds, receipt generation, VAT handling, and anti-fraud controls.
  * **Backup partner:** alternate RU payment processor (TBD).
  * **Entitlement Architecture:** single "source of truth" entitlement service that ingests receipts from RuStore (Android) + web processors + promo codes; maintains user subscription state; serves license checks to the client.
  * **UNKNOWN:** whether 54-FZ fiscal receipt obligations apply to our product and which provider will handle fiscalization.

* **iOS Payment Methods (for future native app):** When iOS native app launches, the following payment methods will be available:
  * **Apple Account balance:** Via gift cards or App Store credit
  * **Mobile phone billing:** Beeline, MTS, and other Russian carriers
  * **Note:** App Store payment friction is real but not insurmountable; these methods are functional though require UX care.

* **Refund & Chargeback Policy:**
  * **Trial/Grace Period:** 7-day cancellation window post-purchase with immediate refund (aligned with Russian consumer norms)
  * **Subscription Refund:** 7-14 day window for user-initiated refunds; transparent cancellation flow
  * **Chargeback Handling:** Follow RuStore + payment processor terms; maintain immutable audit logs for dispute resolution
  * **Proration:** Fair prorating for mid-cycle upgrades/downgrades; refund credits clearly explained
  * **Compliance:** All transactions logged; subscription lifecycle fully auditable for tax/VAT reporting

**No Ads Monetization Model:**
We are moving away from ad-supported free tiers. While ads could generate revenue from free users, they:
* Degrade user experience and create friction
* Reduce differentiation between free and premium (premium users still dislike ads)
* Complicate analytics and user tracking (ads require additional tracking, raising privacy concerns in Russia)

Instead, we rely on:
* Subscription revenue (premium tier)
* Lifetime purchase revenue (launch window)
* Optional future: In-app purchases for cosmetics/convenience items (gems, badges, boosts) if A/B testing shows high ROI without harming retention

**Revenue Model Summary:**
* **Primary:** Premium subscription revenue (recurring)
* **Secondary:** Founder Lifetime revenue (launch window only)
* **Tertiary (Future):** Optional cosmetic/convenience shop if metrics support it

**Monetization Non-Goals:**
* No aggressive paywalls forcing upgrade to progress (free users can always learn)
* No selling of user data
* No manipulative dark patterns (spammy notifications, hidden charges)
* No predatory pricing or surprise fees

**Financial Projections (Indicative):**
Assuming 50k DAU at end of Year 1:
* Free tier: 90% retention; 10% premium conversion = 5k premium subscribers
* Premium @ 500 RUB/month average = ~2.5M RUB/month (~$25k USD) = ~30M RUB annual
* Lifetime purchases (first 60 days): estimate 500-1000 purchases @ 1,500 RUB = 0.75-1.5M RUB
* Total Year 1 revenue estimate: ~30-32M RUB

This is a floor estimate; engagement optimization (A/B testing, notification strategy, etc.) can drive higher LTV.

**Daily Streak:** **Streak** is the count of how many days in a row the user has met a minimum practice goal. This is one of the most powerful motivators - losing a streak is painful (loss aversion) and keeping it alive encourages daily use. We will implement a streak counter prominently on the home screen. For example, "5-Day Streak" with a flame icon. If the user does at least, say, one lesson or 10 XP in a day, their streak continues. If they miss a day (and have no streak freeze active), the streak resets to zero. HYPOTHESIS: streaks and reminders improve retention and daily practice; we will validate via experiments. We will also implement a **"Streak Freeze"** item (for free users, they could buy it with an in-app currency or watch an ad, while premium gets it automatically as noted). The streak feature will be emphasized during onboarding ("set a goal of 10 minutes per day and build your streak!") and we will leverage notifications to remind users not to break it (e.g. "Don't let your 10-day streak slip! Complete a lesson today."). Streaks tap into the user's intrinsic desire to not break the chain - it is a simple yet effective retention hook.

**Experience Points (XP) and Leveling:** Users earn **XP** for every lesson or practice they complete. XP contributes to the user’s **level** or ranking. We will likely have an overall user level (for example, starting at Level 1 and potentially going up to Level 100 or more, similar to experience points in games). XP provides a sense of progression beyond just course completion. It also allows for friendly competition via leaderboards. HYPOTHESIS: XP, leveling, and leaderboards increase lesson completion and session frequency; we will validate via experiments. So our app will have:

* **XP Leaderboard (Leagues):** a weekly leaderboard among a group of users (could be global or among friends) showing who earned the most XP that week. On Duolingo, they have league tiers (Bronze, Silver, etc.) to continuously motivate users to "rank up". We can implement a simpler version at first: e.g., a weekly competition where the top 10% get a "winner" badge or some reward (like bonus in-app currency or a profile accolade). The competitive drive to not fall behind others should spur users to do extra lessons.
    
* We might incorporate **levels or milestones**: e.g., reaching 500 XP makes you “Beginner II” or gives you a new avatar icon. Visual indicators of progression are satisfying and encourage people to keep pushing (progression compulsion).
    
* **Double XP events:** occasionally, we could have events like "Double XP weekend" or challenges where users can earn XP boosters. HYPOTHESIS: limited-time XP boosts can re-engage dormant users and increase session frequency; we will validate via experiments.
    

**Leaderboards and Social Features:** In addition to the competitive league, we will include basic social functionality:

* Users can add **friends** (finding by username or connecting via contacts/VK). Then they can see each other’s progress, streak, and XP.
    
* A **Friends Leaderboard** (separate from the global/public one) can show how you stack against your friends this week, which is often more meaningful and fun.
    
* Possibly a community forum or sentence discussions (if feasible) could come later, but not a priority for v1. For now, social is mainly friendly competition and encouragement.
    
* Achievements/Badges: Award badges for certain milestones (e.g., "Completed Unit 1 - Basics", "10-Day Streak Badge", "OOPS - made 100 mistakes total" - could be humorous ones too). Badges give users intermediate goals to strive for beyond just finishing lessons. HYPOTHESIS: badges increase completion and encourage goal pursuit; we will validate via experiments. We will incorporate a selection of badges to reward consistency, high performance, trying different features (like doing a speaking exercise), etc.
    

**Daily Quests/Reminders:** To drive daily engagement, aside from the streak, we can present **daily quests or goals**. For example: "Earn 30 XP today" or "Do 1 practice quiz today" - completing it gives a small reward (like an extra heart or some in-game currency). This adds variety and a fresh reason to open the app each day. HYPOTHESIS: daily quests improve daily active usage; we will validate via experiments. We will likely include a simple daily goal (which might just align with the streak goal) and perhaps a secondary goal like "Practice a difficult word today". These will be shown on the home screen and reset every day.

We will send **push notifications** as needed (for users who enable them). The notifications will be in Russian, e.g.: "You're 10 XP away from beating yesterday's score!" or "You've fallen from 3rd to 5th place in the weekly league - do a lesson to catch up!" Carefully crafted notifications can nudge users effectively. We'll use this channel judiciously to pull users back in without being spammy (target 1 notification max per day, respecting time-of-day preferences).

**Content and Learning Efficacy:** Gamification aside, it’s crucial that the **learning content is effective** and enjoyable:

* We will use a **variety of exercise types** to keep things interesting: tapping word banks, translating, matching pairs, listening to audio and selecting what was heard, etc. This multimodal approach helps cater to different learning preferences (visual, auditory, etc.).
    
* **Immediate Feedback:** When a user answers a question, they get immediate feedback: green for correct, red for incorrect, with the correct answer shown. If wrong, a quick tooltip or explanation is given (“Oops, _собака_ means dog, not cat.”). Research shows immediate feedback helps learning (and it’s a standard in these apps).
    
* **Reward and Encouragement:** When a lesson is completed, we’ll show positive reinforcement – points earned, maybe an encouraging message from our mascot (if we have one). Small dopamine hits at completion keep users feeling good about progress. We might have a fun mascot (like Duo the owl equivalent) to add personality and occasionally give witty encouragement in the app.
    
* **Adaptive Practice:** The app will track which questions or words users struggle with. We’ll include a **Practice** mode that focuses on weak words or past mistakes. Free users can use this to regain hearts as well. This ensures spaced repetition on trouble spots, which improves retention. It also adds more content for advanced users (they can always practice, even after finishing new lessons).
    
* **Curriculum Alignment:** Our lesson tree (or path) will be structured in a logical pedagogical sequence, roughly following CEFR progression. For instance, A1 topics: greetings, simple present tense, basic nouns; A2 topics: past tense, travel scenarios, etc. By B1, users should be tackling slightly more complex sentences (multiple clauses, expressing opinions in simple ways).
    
* We plan to incorporate **mini-stories or dialogues** as users advance (maybe as a lesson type). These help with reading and contextual learning. They also add variety beyond single sentences.
    

**Gamification vs Education Balance:** We will ensure that while gamification is heavy, it **does not overshadow learning**. The user should feel they are playing a game-like app _while_ absorbing language naturally. We'll avoid gimmicks that don't support learning (for example, arbitrary virtual pet games). Everything (streaks, points, leaderboards) is there to encourage more practice, which ultimately results in more language exposure. HYPOTHESIS: gamification improves retention and habit formation; we will validate via experiments.

**In-App Currency (Gems/Lingots):** We might include an in-app currency that users earn (like gems) for completing lessons or achievements. They can spend these on cosmetic items or streak freeze in the store. This is not essential for v1, but it’s a nice gamified loop (earn->spend->earn). It also allows non-paying users to get small benefits and feel progression. However, given time, we may postpone currency to v2. In v1, maybe we keep it simple: streak freeze can be “bought” by watching an ad instead of spending a currency.

**Testing and Improvement:** We will be data-driven. We’ll instrument analytics to see how many lessons users do, where they drop off, etc. We plan A/B tests for features like different reminder wordings, different league sizes, etc., similar to Duolingo’s approach of constant experimentation[blog.duolingo.com](https://blog.duolingo.com/global-language-report-2020/#:~:text=approach%20has%20allowed%20us%20to,other%20entity%20in%20human%20history). For example, if a 7-day streak goal vs a 3-day streak onboarding makes a difference, we’ll adopt what works best.

**Mascot and Personality:** While not a pure feature, having a friendly mascot (like Duolingo’s owl) can humanize the app. Given our market, perhaps a bear or cat (something culturally resonant and likable in Russia) could serve as the guide character, giving tutorial hints and cheering the user on. This helps build an emotional connection. (We’ll avoid anything that could be seen as culturally insensitive; maybe even a friendly owl could work since Duo is known even in Russia – but we want our own identity.)

**Local Cultural Context:** We will incorporate Russian cultural elements in examples to make learning engaging. For instance, some lesson sentences might include Russian names or contexts (like “Вика is learning English.”) to feel relevant. Also, English words chosen might consider cognates or loanwords Russians know. This isn’t gamification per se, but a UX consideration.

In summary, our core loop is: **Do a lesson → earn XP + maintain streak → compare with others & achieve goals → come back tomorrow.** All the gamification elements (streak, XP, leagues, badges, notifications) are geared to reinforce this loop. This approach is thoroughly validated: Duolingo’s 2025 report showed that average time spent and seriousness of learners in countries like Russia and Belarus is high[blog.duolingo.com](https://blog.duolingo.com/2025-duolingo-language-report/#:~:text=Japanese%20learners%20hold%20steady%20as,5), likely due to these engagement hooks. By prioritizing these features in PRD, we aim to maximize user retention and satisfaction from day one.

## Content and Curriculum

A high-quality, pedagogy-driven content strategy is central to this product. We are essentially building an **English course for Russian speakers** from scratch, aligned with international standards but tailored to our users’ needs.

**Curriculum Design:** The content will follow the **Common European Framework of Reference (CEFR)** guidelines for language proficiency levels. We target covering A1, A2, and B1 levels in the initial release. Practically, this means:

* **A1 (Beginner):** Simple phrases, introductions, basic questions, common verbs in present tense, singular/plural, basic adjectives (colors, sizes), numbers, etc. By end of A1, users can form simple sentences like “This is my house” or “I like coffee.”
    
* **A2 (Elementary):** Expand vocabulary (food, family, daily routines, directions, weather), introduce past and future basics (“I went to school”, “I will call you”), more complex sentence structures (but still simple compound sentences), introduce modals (“can, want to”), etc. By end of A2, users handle routine tasks requiring direct exchange of information.
    
* **B1 (Intermediate):** Focus on more tenses (present perfect, etc.), conditionals (“if I have time, I will…”), more abstract topics (expressing opinions, feelings), more nuanced vocabulary (job, travel, stories). At B1, users can deal with most situations while traveling, can produce simple connected text on familiar topics, describe experiences, hopes and give brief reasons for opinions.
    

**Scope:** The course will be divided into **Units** or **Sections**, each containing several lessons grouped by theme or grammar point. For example:

* Unit 1: Basics (greetings, simple verbs “to be”, basic nouns).
    
* Unit 2: Family & Friends (family member words, possessives).
    
* Unit 3: Food (common foods, “I eat/like…”, ordering).
    
* ...
    
* Unit on Past Tense, etc.  
    We’ll likely have on the order of ~50-100 lessons total to cover A1-B1 content. (For reference, Duolingo’s English for Russian course has 8,288 exercises across 130 units in B2 scope[duolingodata.com](https://duolingodata.com/#:~:text=Chinese%20A2%2060%20RU%20130,12%20474); we may not go as deep as B2 yet, so perhaps on the order of a few thousand individual question items).
    

**Exercise Content Creation:** Every lesson will have a variety of **sentence-based exercises**. We need to generate these sentences and ensure their accuracy and appropriateness:

* We will hire or contract **bilingual language experts** (Russian/English) to create the curriculum outline and write sentences. Possibly an experienced ESL teacher from Russia to ensure cultural fit.
    
* The content should avoid simply translating Duolingo’s sentences; we want original phrases that are relevant. We might incorporate some humor to make them memorable, but also keep them practical. E.g., “A cat is on the chair” (practice basic sentence), but also fun ones like “My bear drinks coffee” if it helps engagement (Duo does silly sentences to entertain users, which we might mimic in moderation).
    
* All sentences will have **audio recordings** (or TTS if high-quality TTS is available for English). It’s important users hear proper pronunciation. Ideally, we get a native British or American English voice (since Russians typically learn one of those accents; perhaps we default to American English audio unless we allow choice).
    
* We’ll include **phonetic tips** for tricky English sounds (like “th” which Russian speakers find difficult[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=to%20pronounce%20because%20Russians%20put,z%5D%20everywhere.%E2%80%9D)). Possibly via pop-up notes in relevant lessons: e.g., “Pronounce ‘thank’ with your tongue between your teeth: [θ]”.
    

**Not Derived from Duolingo:** We will ensure no direct copying of Duolingo’s course structure or sentences. While the general topics might coincide (they’re standard), we’ll use fresh wording. This avoids legal issues and also might produce a course better tuned to Russians. Duolingo’s content sometimes has a one-size-fits-all approach; we can tailor exercises to known problem areas for Russian speakers. For instance:

* Articles (“a/an/the”) do not exist in Russian, so we will have extra lessons focusing on choosing the right article – since Russians often struggle with this[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=that%20in%20English%20some%20tenses,Present%20Simple%20means%20schedule).
    
* Pronunciation tasks focusing on sounds Russians find hard (there’s no [θ] or [ð] in Russian, so “think” vs “sink” is tricky[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=to%20pronounce%20because%20Russians%20put,z%5D%20everywhere.%E2%80%9D)).
    
* Plural forms, since English has only one plural form (add -s) whereas Russian has complex cases, Russians might actually find plural easy but struggle with verb conjugation (3rd person -s).  
    We can emphasize such areas in our content roadmap.
    

**Lesson Flow:** A single lesson (say, “Present Tense 1”) might have:

1. **Introduction**: a card or two teaching something (e.g., a new word with image, or a grammar point explained simply in Russian).
    
2. **Exercises**: about 10-15 questions mixing types. Early lessons might be heavily picture-and-word based (for absolute beginners, recognizing “apple” etc.), later ones become more translation and typing.
    
3. **Tip/Notes Section:** We will have an in-app “Tips” section for lessons that need explanation (grammar notes, cultural notes). These can be accessed if the user is confused (like how Duolingo Web has Tips). We will write them in Russian for clarity. For example, a note on “English present tense vs Russian present” or explaining usage of articles. Making these accessible will add value, especially for serious learners who want to understand rules, not just memorize phrases.
    

**CEFR & Certification:** Since CEFR is mentioned, we might later allow users to evaluate their level or claim alignment. Possibly after finishing our course, they’d be at B1 and could consider taking an exam like IELTS or Duolingo English Test. We’re not doing certification ourselves in v1, but aligning to CEFR ensures credibility. We can state that “completing this course should leave you at about B1 level – able to [CEFR descriptor].”

**Cultural Localization:** We ensure example contexts are relatable. We can use Russian names (Oleg, Lena) as characters in sentences. Use rubles in examples of money, Russian cities in travel scenarios (“She is from Moscow, he is from London.”). This makes learning more engaging for our audience than overly American-centric content. However, we’ll also introduce cultural elements of English-speaking countries (maybe a lesson on British vs American differences or common international phrases).

**Content Volume and Updates:** Initially A1–B1 is the target. We will gather user feedback and possibly add more content (B2 level, or more practice content) in updates. Since Duolingo’s English course goes to B2, some advanced learners may want more – we can plan to extend to B2 once core is stable. But quality over quantity first.

**Stories/Dialogs:** If time permits, we’ll implement a few **simple dialogues or mini-stories** at checkpoints. These are short reading comprehension pieces or conversations (with audio) that use the vocabulary learned. They add immersion and test understanding in context. They were very popular in Duolingo (Stories feature) and help with reading/listening skills. We might include, for example, a short story after every 10 lessons, like “At the Restaurant” – a dialogue between a customer and waiter, and then ask a couple of comprehension questions. This might be a stretch goal for v1, but we mention it as part of the content plan if resources allow, because it’s a differentiator in user experience.

**Review and Mastery:** We will incorporate spaced repetition. Words/phrases have a strength meter (in the background, or visible if we add a “Words” tab). We can prompt users to practice words that are fading. Possibly an automated **review lesson** that gathers your weakest recent material. This maximizes learning efficacy and is something serious learners appreciate, as it ensures they don’t forget early lessons by the time they reach later ones.

**User-Generated Content or Community Input:** Not in v1, but we may consider community features like user sentence discussions or community translation for adding new courses. Given the Russia-specific nature and the need for tight QA (to avoid mistakes in our learning content), we will keep content creation internal for now.

**Quality Assurance:** All content should be tested for accuracy (no spelling mistakes, correct audio matches text, etc.). We’ll do an internal alpha with bilingual team members and maybe a small beta group of users to catch errors or awkward sentences. Since translation is involved in tasks, we need to anticipate alternative correct answers. Our system must handle synonyms (e.g. user can translate “мальчик” as “boy” but if they type “lad” is that taught? etc.) – we’ll code in acceptable alternatives, but also guide users to standard vocabulary.

**Sensitive Content:** We’ll avoid political or highly sensitive topics in our content. The focus is everyday language. In the Russian context particularly, we should be mindful not to include anything that could be construed as political messaging or culturally inappropriate given current events. The app is for learning English, not commentary, so we stick to neutral, generic content (talking about travel, hobbies, family, etc., not news or controversial issues).

**Mascot guidance in content:** If we have a mascot like a friendly bear, we might incorporate it in content tips (e.g., the mascot gives a grammar hint: “I’m a bear, **I eat honey**. Did you notice we don’t say ‘I am eat’? That’s because…[explanation]”). This can make learning feel less like dry lessons and more like a fun journey with a guide.

**Progression and Unlocking:** We will decide whether the course is strictly linear or if multiple lessons unlock in parallel. Likely, a hybrid: user must complete basics to unlock next unit, but can have a couple of lessons open at a time to choose from (or a test-out quiz to skip ahead if initial placement indicates they know some stuff). The placement test feature (to let users skip A1 if they are beyond beginner) would be valuable – we should have an **initial assessment** quiz that roughly gauges their level and either starts them at Unit 1 or offers to jump to Unit 5, etc. This improves onboarding for those who aren’t absolute beginners.

Summing up, our content approach is: **Comprehensive, structured, culturally tuned, and pedagogically solid.** We leverage standard frameworks (CEFR) and adapt to our audience’s L1 interference patterns. With robust content in place, all the gamification and tech in the world will actually result in real learning outcomes, which is crucial for word-of-mouth reputation. We want users to say “I actually learned a lot of English using this app,” not just “it’s fun.” Both are goals, but learning efficacy is core to long-term success (and low churn of serious users).

## Technical Architecture and Implementation

Building this app requires choosing a tech stack and architecture that supports our feature requirements (interactive exercises, offline mode, gamification backend) and is well-suited to the **Russia-focused deployment**. We also have to consider scalability (if we get millions of users) and compliance (data residency laws, etc.).

**Frontend (Client App):** DECISION: TypeScript-first client stack.

* **PWA:** React + TypeScript built with Vite, offline-first service worker, and cache strategy.
    
* **Android distribution:** Trusted Web Activity wrapper around the PWA for RuStore; minimal native glue only where unavoidable (payments/push).
    
* **Shared logic:** TypeScript packages for content schemas, lesson engine, and spaced repetition logic shared across clients.

**Backend:** DECISION: Node.js + TypeScript with Fastify.

* We will build a RESTful API for auth, lessons, progress sync, and entitlements.
    
* Shared DTOs/types live in TypeScript packages to keep client and server contracts aligned.

**Database:** We will use a **relational database (SQL)** for our main data store, as language learning data (user profiles, progress, lesson content) fits well into structured schemas. **PostgreSQL** is our top choice - it is powerful, open-source, and widely used in edtech. It handles complex queries and ensures consistency (ACID compliance), which we need for things like transactionally updating XP and streaks. We might have tables for:

* Users (id, email, hashed password, streak, settings, etc.)
    
* Lessons, Units, Exercises (content tables for course structure)
    
* UserProgress (what lessons completed, XP, last practiced times)
    
* LeaderboardRecords or just calculate on the fly from XP logs.
    
* Payments (to track who is Premium or lifetime).  
    We might also incorporate a **NoSQL** store for certain features, but likely not needed at start. However, for analytics and logs, we could use something like MongoDB or just send events to a service. But initially, Postgres should cover both transactional and simple analytical queries.
    

**Caching and Performance:** We plan to use **Redis** as an in-memory cache and for specific features:

* Caching frequently accessed data (like lesson content) to reduce DB load.
    
* Storing ephemeral data: e.g., user session tokens, rate limiting counters, or leaderboards that reset weekly (Redis is great for leaderboards sorted sets).
    
* We could even use Redis for a realtime leaderboard pub-sub if needed.
    
* If we implement notifications scheduling or queue of emails, Redis (with something like Celery or Bull for Node) can serve as a task broker.
    

Redis is also useful if we do any server-side matchmaking or global state (like a live event or challenge state).

**Offline and Sync:** Offline capability means the client needs to store data locally. We’ll use the PWA’s service worker to cache API responses and static assets (like images, audio files for exercises). We will implement a mechanism where, when online, the app fetches upcoming lessons data and caches it (maybe an IndexedDB or localStorage for text, and Cache API for media files). If offline, the service worker serves the cached lesson. The user’s answers can be stored locally (maybe in IndexedDB) and when connectivity returns, the app syncs them to server (posts the results). This requires careful handling of conflicts (e.g., if they do the same lesson twice offline, or if their token expired). We’ll design a sync queue on the client that retries when online.

On server, we might have an `/upload_progress` endpoint that accepts a batch of offline collected activities to update XP, streak, etc., appropriately.

**Scalability:** Our stack will be cloud-friendly and horizontally scalable:

* We’ll containerize the app (Docker) to deploy on cloud servers or Kubernetes.
    
* The backend will likely run on multiple instances behind a load balancer. It should be stateless (sessions stored in Redis or use JWTs).
    
* Postgres can be managed (cloud DB service) or on VM; we’ll ensure regular backups.
    
* We anticipate initial usage perhaps in the tens of thousands, but if it grows to millions, we want to be ready. Node.js can handle high load, but we will optimize critical endpoints (like the "submit answer" endpoint should be lightweight, maybe mostly client-validated to reduce server work).
    
* We might use a CDN for static content (images, audio) possibly via Yandex Cloud’s CDN or Cloudflare (if not blocked).
    

**Cloud Hosting (Russia):** A crucial point: due to Russian personal data laws, we should host user data on servers located in Russia. Russian law 242-FZ requires personal data of Russian citizens to be processed on servers within Russia[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=,such%20personal%20data%20is%20stored). Non-compliance can lead to Roskomnadzor blocking the service[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=citizens%20have%20to%20notify%20Roscomnadzor,such%20personal%20data%20is%20stored). Therefore, we plan to use a **Russia-based cloud provider** or data center. Options:

* **Yandex Cloud:** A full-fledged cloud similar to AWS but operated by Yandex in Russia, ensuring low latency for Russian users and compliance with data laws. We can deploy our infrastructure (VMs, DBaaS, object storage, etc.) on Yandex Cloud’s facilities in the Russian Federation.
    
* Alternatively, **Selectel** or **SberCloud** or other local hosting providers can be considered. The key is an hosting environment where data stays in Russia and services are reliable.
    
* We might still use some global services (like Cloudflare for DNS maybe), but all user data (names, emails, progress) should reside on Russian soil to avoid legal issues[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=,such%20personal%20data%20is%20stored). We will also register with Roskomnadzor if needed and be transparent about data storage.
    
* Using AWS directly might not be ideal because AWS doesn’t have region in Russia and routing data outside could violate laws. However, we could consider AWS Europe for non-personal data or redundancy, but primary storage must be local. Given the political climate, sticking to local cloud (Yandex Cloud in particular) also reduces risk of service cutoff (Western companies could disconnect services due to sanctions, as some have).
    

**Integration with Payment Systems:** As mentioned in Monetization, we need to integrate with Mir and SBP. Technically, this means:

* For Mir: partner with an acquiring bank that supports Mir e-commerce transactions. Possibly use their API or a gateway like Uniteller or CloudPayments (some gateways in Russia support Mir and have API docs). We’ll have our backend handle the payment notifications (e.g., via REST webhook from the gateway confirming payment).
    
* For SBP: The Fast Payment System allows generating a QR code for a payment. We might use APIs from the Central Bank or a bank like Sber to create a QR that encodes our merchant info and amount. The user scans in their banking app and we get confirmation. This is a bit complex but doable – if an easier route exists (like YooMoney or App Store’s own).
    
* DECISION: Android in-app purchases and subscriptions use RuStore Pay; PWA uses web checkout; entitlements are verified server-side.
* UNKNOWN: iOS native payment approach (App Store IAP vs web-to-pay) until iOS scope and compliance are confirmed.
    
* The backend will maintain premium status and expiration in the database once payment is confirmed.
    

**Security & Privacy:** We will implement industry standard security:

* All connections HTTPS (TLS) – likely use Let’s Encrypt for our domain certificates (unless using Yandex certs).
    
* Passwords stored hashed (e.g., bcrypt).
    
* Use secure token for auth (JWT or session ID with httpOnly cookie).
    
* Data minimalism: We collect only what we need (email, maybe nickname). If we handle minors, we’ll need parental consent flows, but likely target older teens/adults at start.
    
* Comply with Russian personal data regulations in privacy policy and possibly store some data about data processing as required by law.
    
* Protect against cheating: Not a huge issue, but leaderboards could be gamed if people script XP. We might put server checks (like limit XP per day, or identify suspicious patterns).
    
* Anti-abuse: content is largely pre-defined, but if we add profile chats or user-generated content, we’d need moderation. That’s not in v1 scope except possibly user profile names (we could filter profanity on usernames).
    

**Degraded Mode and Resilience ("Zombie Mode"):** A critical requirement given Russia's connectivity challenges and infrastructure unpredictability: when backend is unavailable (network down, server issue, etc.), the client must **continue functioning** with degraded capabilities:

* **Offline Lesson Caching:** All lessons, exercises, and course packs are pre-cached on the client device using service workers (for PWA) and local storage (for mobile). When offline, users can **complete lessons entirely locally** without backend connection.
* **Event Queuing:** User actions (answers submitted, streak maintained, XP earned) are queued locally (in IndexedDB or local storage) and synced to server when connectivity returns.
* **Streak Protection:** If backend is down and a user's action would update their streak, we protect the streak by allowing local streak updates and deferring server sync. When backend comes back, we reconcile the states.
* **Fallback Behavior:** The app will detect backend unavailability (timeout on API calls) and automatically switch to offline mode, showing a clear indicator ("📡 You're offline – learn anyway!" message).
* **Sync Reconciliation:** When connectivity returns, a robust sync mechanism ensures no data loss and handles conflicts (e.g., if the user completed the same lesson twice offline, we dedup on server). This mirrors Duolingo's "Zombie mode" where users keep learning during service incidents.
* **SLO Target:** Backend availability should be 99.5%+ uptime, but we design to tolerate brief outages (hours) without user frustration.

**Course Data vs User Data Separation (Offline Course Packs):** To enable efficient offline-first architecture and reduce server load:

* **Course Packs (Versioned, Immutable):** All course content (lessons, exercises, audio files, images, explanations) is compiled offline into versioned **course pack files** (~50-500 MB depending on scope), serialized and stored in cloud storage (Yandex Object Storage / S3).
* **Client Download & Cache:** On app startup, the client downloads the current course pack version and stores it locally (via service worker cache for PWA, app cache for mobile). Packs are versioned; if a new pack is available, the client downloads it on next sync (can be delta updates to save bandwidth).
* **User Data Fetched Separately:** User-specific data (progress, XP, streak, lesson completion history) is fetched from the server as separate, lightweight JSON payloads. This separates static course content from dynamic user state.
* **Session Generation:** The lesson rendering engine (Session Generator concept from Duolingo's architecture) takes:
  * User data (profile, progress so far, known weaknesses)
  * Course pack content (lesson definitions, exercises)
  * Client-side algorithm (which exercises to present based on spaced repetition / mastery model)
  * Generates a personalized lesson session locally, without needing backend.
* **Benefit:** Massive reduction in server load (course serving), faster lesson loading (pre-cached locally), and offline capability. Aligns with Duolingo's 2017 Scala rewrite architecture.

**Notification Provider Abstraction (Multi-Transport Support):** Push notifications are critical for streak engagement and retention, but face technical constraints in Russia:

* **Abstraction Layer:** Implement notifications as a pluggable provider system, not hardcoded FCM:
  * **Android via RuStore:** RuStore provides official Push SDK and "Universal Push" concept supporting multiple transports (HMS, FCM, RuStore transport). Our backend uses RuStore SDK to send push notifications to Android devices.
  * **Android via FCM (Fallback):** For devices with Google Play Services, fall back to FCM. Our backend sends via FCM API.
  * **PWA (Web Push):** Use Web Push API with VAPID keys; works on Chrome/Firefox on desktop and Android browsers. For notifications via service workers.
  * **iOS PWA (Limited):** iOS 16.4+ supports Web Push for PWA "Add to Home Screen" web apps, with strict constraints: requires https, user opt-in, only delivered in specific contexts. We document this as a limitation; users get reminders, but delivery is not guaranteed like native push.
  * **Fallback: Email/SMS Reminders:** If push fails or user disables it, we send optional email reminders (if opted in). Less effective for streak urgency but provides a fallback.
* **Scheduling & Delivery SLAs:** Reminders sent via time-zone-aware scheduling (e.g., "14:00 user's local time daily if they haven't completed a lesson"). We target 95% delivery within 15 minutes of scheduled time.
* **Opt-Out & Frequency Caps:** Users can fully opt out or limit frequency. We never spam; max 1 notification/day default, respecting quiet hours (user's settings).

**Data Residency and Russia Compliance (Explicit):**

This is a **hard requirement**, not optional. Russian Federal Law 242-FZ mandates that personal data of Russian citizens be processed and stored on servers within Russia:

* **Primary Database Location:** All user personal data (name, email, progress, payment info if applicable) is stored on Russian servers exclusively. We use Yandex Cloud (or Selectel/SberCloud) for primary DB.
* **No Cross-Border Transfer:** User data does **not** leave Russia unless users explicitly opt in and we have legal grounds. No data shared with parent companies or external analytics unless fully anonymized.
* **Roskomnadzor Compliance:** We document our data processing practices per Russian law 152-FZ (privacy) and 242-FZ (localization). We may register with Roskomnadzor as required. Non-compliance risks: service blocking, fines.
* **Backup & Redundancy:** We maintain redundant backups of Russian data within Russia (e.g., multiple data centers in Russia or regional backups), not in foreign cloud regions.
* **Analytics & Logs:** Server logs and analytics can be stored separately, but only after de-identification. Any metrics tied to user identities stay in Russia.
* **Third-Party Services:** Any third-party services used (e.g., error tracking, CDN) must either:
  * Be Russia-based (Sentry for Europe region? Or self-hosted)
  * Store data in Russia
  * Be purely anonymized/aggregated
  * Otherwise, integrate cautiously or use alternatives.
* **Transparency:** Privacy policy clearly states: "Your data is stored on secure Russian servers in accordance with Russian law 242-FZ."

**Analytics & Telemetry:** We will incorporate an analytics solution to track user behavior (with user consent and in line with privacy):

* Basic funnel: account created -> first lesson -> day 7 retention etc.
    
* Track which exercises cause most errors, time spent per screen, etc.
    
* Since Google Analytics might be problematic (Google services restricted), we could use Yandex Metrica for web analytics (popular in RU) and perhaps an open-source telemetry for in-app events. Or a self-hosted solution like PostHog to keep data internal.
    
* We’ll use this data for continuous improvement and A/B testing (like trying different gamification tweaks as mentioned).
    

**AI/ML Considerations:** In v1 we skip advanced AI features, but we might quietly use some ML in backend:

* For example, to power a **smart review** that picks questions you’re weak on, we could implement a spaced repetition algorithm or even a machine learning model that predicts memory decay.
    
* We may also use basic NLP to evaluate free-text answers (if any) or pronunciation scoring. However, initially we likely rely on third-party for speech recognition (maybe Google’s speech API or a local alternative). Note: if Google Cloud is not accessible, we might use Azure (but Microsoft also left). Perhaps use open-source (Vosk) or a Russian cloud’s speech-to-text for evaluating pronunciation.
    

**Speech Recognition:** Speaking exercises require capturing audio and checking it. iOS/Android could use native STT, or we send audio to server. There is **Silero** (a Russian open-source STT model) or Mozilla’s DeepSpeech. This part can be heavy – might be limited in v1 or require online connectivity. We might include only simple word-level speaking tasks at first, where we can tolerate some inaccuracy.

**Continuous Deployment:** We plan a CI/CD pipeline so we can iterate quickly. For web, we can deploy multiple times a day if needed. For mobile, releasing updates via RuStore and (eventually) App Store will be done as needed (maybe weekly early on). We’ll gather crash logs (Sentry or similar) to fix issues promptly.

**Testing:** We’ll write unit tests especially for critical backend logic (e.g., streak calculation, heart refill logic) to avoid regressions. Also do device testing on common devices (Android phone, iPhone, various browsers). The app should support at least the last few versions of major browsers and Android 5.0+ and iOS 12+ if PWA there, to cover most users.

**Compliance & Legal:**

* **Data Localization:** As stated, user data on Russian servers[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=,such%20personal%20data%20is%20stored). We’ll document compliance to avoid Roskomnadzor action.
    
* **Copyright:** Ensure all our content (text, audio, images) is either original or properly licensed. No pirated or unlicensed material. For images (if we have any, like icons), use open source or own artwork.
    
* **GDPR/Equivalent:** Possibly Russian law has its own privacy law (152-FZ) – we’ll ensure we have user consent for data processing, etc. Since our audience is Russian domestic, GDPR (EU) might not directly apply unless we have users in EU.
    
* **Age restrictions:** Likely we set minimum age 13 or require parental consent for younger (since many language app users could be school children). We’ll follow COPPA analogs if targeting sub-13.
    

**Roadmap for Tech Scaling:**  
For v1, a monolithic app is fine (all backend in one service). As we scale, we might microservice some pieces (like a separate service for the lesson content/learning logic vs auth vs leaderboard for performance reasons). If user growth is large, we might implement sharding for the database or move heavy read data (like public leaderboard info) to a NoSQL or Redis entirely.

**Support for Different Platforms Recap:**

* PWA: built as main web app.
    
* Android: DECISION: wrap the PWA in a Trusted Web Activity for RuStore distribution; add minimal native glue only where unavoidable.
    
* iOS: again possibly a WebView wrapper around the PWA (since Apple allows WKWebView apps, we might do that to get on App Store faster, and later move to a native iOS app if needed).
    
* We have to ensure push notifications work: For PWA, Chrome on Android supports push (we use VAPID and a push service, maybe Firebase Cloud Messaging as it’s common and still works for Chrome, but need alternative for other browsers). For iOS, we might miss push until native. But email reminders can supplement (send an email if user opted in, “We miss you!” type).
    

**Third-Party Services:**

* **Email/SMS**: for verification or reminders. We can integrate an email service like Mail.ru SMTP or AWS SES via a relay if allowed, or a service like SendPulse (Russian-friendly). SMS maybe for phone sign-ups if we allow phone login, but likely not in v1 (we use email/pass or social login).
    
* **Social Login**: Possibly allow sign in with VK or Yandex accounts to ease registration (since Facebook/Google might not be widely used or trusted now). This reduces friction for sign-ups. VK OAuth could be integrated if their API is stable.
    
* **Crash analytics**: Sentry or a self-hosted equivalent to track app errors.
    
* **Performance**: Use CDN for assets (Yandex Object Storage + CDN could serve our audio/images globally with low latency in Russia).
    

By carefully choosing this stack (React + TypeScript PWA, Fastify API, Postgres, Redis, local cloud), we ensure:

* We can **develop quickly** (leveraging high-level frameworks).
    
* The app will be **fast and responsive** (PWA for instant loads, caching, optimized queries).
    
* We remain **available in Russia** (hosting and payment considerations).
    
* We can **scale** to many users and iterate on features easily (modular architecture, CI/CD, analytics feedback loop).
    

Finally, to highlight the Russia-specific tech requirement: **compliance and latency**. Hosting in Russia not only complies with law but also improves user experience (lower ping, faster content load since not going through international routes that might be throttled). Also, by using Russian services (cloud, payment), we insulate ourselves from any further sanctions or cut-offs that have affected others (e.g., Microsoft/Azure stopping services in Russia, which happened). We essentially aim to build with an infrastructure that is as self-sufficient within Russia’s internet as possible, to ensure reliability for our users.

## Roadmap and Future Plans

This PRD primarily covers the **MVP (Minimum Viable Product)** – the features and scope for the initial launch. However, we have a vision for how the product can evolve beyond v1. It’s important to delineate which things are **in-scope for v1** and what’s **planned for v2 or later**, so we can focus development appropriately while communicating a growth path to stakeholders.

**MVP (v1) Scope Recap:**

* **Language:** Russian -> English course, levels A1–B1 content.
    
* **Platforms:** PWA (Web) and Android (via RuStore) at launch. iOS possibly only via web or deferred.
    
* **Core Features:** Lessons with interactive exercises; gamification (streaks, XP, leaderboards, badges); free tier with hearts/ads; premium tier with unlimited access; offline mode for premium; local payment integration.
    
* **Technical:** Basic backend + database with user accounts, progress tracking, and content delivery; caching; push notifications on web/Android; analytics.
    

We target to have the above ready and polished for an initial launch in [for example] 6-9 months from project start (exact timeline to be determined).

**Post-launch (v1.x) Immediate Improvements:** After launch, based on user feedback and metrics, we’ll likely need quick iterative improvements:

* **Bug fixes and UX tweaks:** inevitable after real users start using.
    
* **Content additions:** If users blow through content quickly or find gaps, we might add more practice material or clarifications in tips.
    
* **Tuning difficulty:** Adjust lesson pacing if we see drop-offs (e.g., if Lesson 5 is too hard, split it).
    
* **Balancing monetization:** Perhaps adjust hearts limit or ad frequency to optimize conversion without angering free users. These can be A/B tested.
    
* **Community building:** Possibly add a referral program (“invite a friend, get 1 week premium free”) to spur growth.
    

**Version 2 Vision (3–6 months after v1):**  
Here are major features/expansions we foresee for v2:

* **Additional Language Courses:** If demand is there (as discussed), possibly introduce **English for Russian: B2 level** extension, **German for Russian**, or others. We would analyze user surveys and waitlist signups to decide. For example, if 15% of our users express interest in German, we could launch a German course. That would require building German A1–A2 content and possibly hiring German content specialists. Similarly French if demand. But we will only do one at a time to maintain quality.
    
* **Duolingo Max-like AI Features:** We intentionally skipped these in v1 to keep focus, but in v2 or v3 we might add an **AI conversational chatbot for language practice** and **AI explanations**:
    
    * Duolingo Max introduced “Roleplay” (chat with an AI character) and “Explain My Answer” (AI tutor clarifies mistakes) using GPT-4[techcrunch.com](https://techcrunch.com/2023/03/14/duolingo-launches-new-subscription-tier-with-access-to-ai-tutor-powered-by-gpt-4/#:~:text=Duolingo%20is%20introducing%20a%20new,4%20AI%20language%20model)[techcrunch.com](https://techcrunch.com/2023/03/14/duolingo-launches-new-subscription-tier-with-access-to-ai-tutor-powered-by-gpt-4/#:~:text=The%20Explain%20My%20Answer%20feature,and%20you%E2%80%99re%20not%20sure%20why). Such features can provide great value to learners (personalized feedback and speaking practice). We could integrate an API like OpenAI GPT (if available – might be tricky if OpenAI access in Russia is limited; maybe via a third-party or a domestic equivalent like Sber’s models).
        
    * This would likely be a **new higher-priced tier** or an add-on, since running AI has costs. Possibly once we have a stable revenue from Premium, we invest in an **AI Tutor** feature. If we do, we’d start with English (the largest base) and maybe only for premium users or a new “Premium Plus” subscription.
        
    * However, implementing this requires strong content moderation and technical capability to avoid problematic outputs, as well as ensuring the AI speaks/understands some Russian for low-level learners (or we structure it to accept mistakes).
        
    * This is on the roadmap because it’s a trend in EdTech and could differentiate us in the future, but it’s definitely not for initial release due to complexity.
        
* **Community & Social Enhancements:** Possibly add a forum or sentence discussion where learners can ask questions and get answers either from peers or tutors. Also perhaps live events or group challenges (like a monthly challenge: “All users collectively achieve X XP”).
    
* **Mobile iOS App:** By v2, definitely have a dedicated iOS native app (assuming by then we figure out payment via either a Russian payment method or just use web for payment). iOS will help us capture that remaining user segment properly and also present a full portfolio to investors/press.
    
* **Live Classes or Tutors:** A far-off idea could be integrating human tutor marketplace or live video practice sessions for upsell. Some apps partner with tutors for 1-1 sessions. This would be beyond v2, but worth noting as a possible extension of the product line (would make us more than just a self-study app).
    
* **Enhanced Localization:** If we expand to other markets (say, a version for Ukraine or Turkey or other countries in the region), we could adapt our platform accordingly. But given our current focus is Russia and perhaps Russian-speaking populations, we’ll stick to that for the near term.
    

**Metrics-Driven Evolution:** Our plan is to keep a close eye on KPIs:

* **Activation rate:** % of signups that complete at least 1 lesson (aim >80% with good onboarding).
    
* **Day 7 / Day 30 retention:** We want to see strong retention. HYPOTHESIS: gamification and reminders improve D7/D30; we will iterate based on cohort data (streaks, notifications, and onboarding variations).
    
* **Conversion rate:** % of active users who go Premium. Initially, if we hit 2-5% that would be expected (Duolingo around ~5% now with Super). We can tweak pricing, trial offers, and paywall features to improve this if needed.
    
* **Revenue:** Monitor ARPDAU (average rev per daily user) combining ads and subs. This helps see if the monetization design is yielding returns.
    
* **Learning outcomes:** although harder to quantify internally, we might use user feedback and maybe run small tests like asking a sample of users to take an external test to gauge how well they learned. Positive outcomes will be a selling point and guide content improvements.
    

**Competitive Landscape & Differentiation:** Over time, we will emphasize how our app is tailored for Russians: e.g., better coverage of tricky grammar for Russian speakers, local payment, culturally relevant content. These are differentiators versus just using Duolingo or others. In marketing v2, we’ll highlight any unique features (like “First app with full offline mode and Mir payment for English learners!” or “New AI conversation coach specifically for Russian-speaking learners”).

**Risks and Mitigations on Roadmap:**

* **Regulatory changes:** e.g., if Russian government imposes new rules (like requiring apps to have Russian data, which we do, or any censorship of content), we need to adapt. We’ll keep an eye and maintain good relations (maybe register our software with authorities if needed).
    
* **Sanctions impact:** If more tech services shut off, we have alternatives. (Already considered e.g. using self-hosted models if cloud AI not accessible, etc.)
    
* **User acquisition:** We’ll invest in community and perhaps school partnerships to get users. There’s a large audience of schoolchildren and students learning English; we might in future create a version for schools or a dashboard for teachers (like Duolingo for Schools) – that could be v3 feature set for B2B.
    

**Timeline Sketch:**

* Month 0-3: Build core platform (backend, frontend skeleton, a few prototype lessons), internal testing.
    
* Month 3-5: Create full content A1-B1, integrate it; implement gamification features (streak, XP, leaderboards); alpha test with small group.
    
* Month 6: Beta launch PWA + RuStore quietly, gather feedback, fix bugs.
    
* Month 7: Official Launch marketing push.
    
* Month 7-9: Post-launch improvements, scale infra as needed.
    
* Month 10-12: Work on any major missing piece, possibly iOS app if decided.
    
* Month 12+: Start on second course or advanced content if metrics support.
    

Of course, this can shift, but it’s a guideline for prioritization.

Every step of expansion will be justified by data or strategic necessity. We explicitly choose _not_ to do certain things in v1 (like multi-language support, AI features, complex social features) to ensure we nail the basics first. As a result, the v1 product will be strong in its foundation: great content and engaging loop for one large use-case. Then our team can accelerate additional offerings on that solid base.

## Conclusion

This PRD has detailed a comprehensive plan for launching a Duolingo-style language learning app specifically tailored for the Russian market. By focusing on Russian speakers learning English (the highest-demand segment) and delivering the product via accessible platforms (web/PWA and RuStore Android) with local payment integrations, we align our strategy with the realities of the Russian digital landscape in 2025. The core product will combine **effective pedagogy** (CEFR-aligned curriculum, varied exercises, contextual tips) with **addictive gamification** (streaks, XP, leaderboards, rewards) to drive both learning outcomes and user retention.

We’ve designed the monetization to be user-friendly yet profitable: a free tier that provides genuine value and a premium tier that offers convenience and expanded access, plus a one-time lifetime option to kickstart revenue. We have incorporated engagement features and will test their impact. HYPOTHESIS: streaks, leaderboards, and reminders improve retention and lesson completion; we will validate via experiments. These are not gimmicks; they serve the educational mission by encouraging consistent practice, which is crucial for language acquisition.

Our technical approach ensures that the app will be reliable and performant for users across Russia. By using a TypeScript-first stack (React PWA + Fastify API + PostgreSQL/Redis) and hosting in-country, we mitigate external risks and comply with data laws[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=,such%20personal%20data%20is%20stored), all while delivering a smooth user experience (including offline learning, which is a big selling point given connectivity issues). This stack gives us the flexibility to expand functionality in future versions.

Critically, we are staying **grounded in real data and user needs** at every step. DECISION: the initial language focus is RU->EN. Supporting signal (third-party estimates, not official Duolingo data): English is the top course for Russian speakers on duolingodata.com[duolingodata.com](https://duolingodata.com/#:~:text=Chinese%20A2%2060%20RU%20130,12%20474), and we’ve considered device usage stats (Android dominance at ~70% in RU)[gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/russian-federation#:~:text=Mobile%20Operating%20Systems%20Percentage%20Market,7) to inform our platform priorities. We’ve looked at payment and legal constraints in Russia (Mir, SBP, Google billing pause[support.google.com](https://support.google.com/googleplay/android-developer/answer/11950272?hl=en#:~:text=Due%20to%20payment%20system%20disruption%2C,available%20on%20the%20Play%20Store), law 242-FZ[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=,such%20personal%20data%20is%20stored)) to ensure our product can actually be used and paid for by the target audience. In essence, the PRD is **fully grounded in current market research and technical insights** rather than assumptions or mere imitation.

By delivering a localized, fun, and pedagogically sound product, we aim to capture the hearts of Russian English learners. Success will be measured not only in revenue or DAUs, but in seeing our users make real progress in English – fulfilling a strong need in a country where English proficiency remains relatively low but highly desired[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=According%20to%20a%20Levada%20center,with%20studying%20English%20in%20Russia). If we execute on this PRD, in a year’s time we should have a vibrant user community keeping their streaks alive and sharing success stories of how our app helped them get a better job or communicate on a trip. Those wins will drive our brand reputation and organic growth.

The foundation laid out here sets us up to **scale and adapt** – whether that means adding more languages (becoming a go-to app for language learning in Runet) or integrating new technologies like AI tutors to stay at the cutting edge. We will proceed to design and development with these requirements as our guide, staying agile to feedback and changes, but always keeping in mind the core vision: making language learning accessible, enjoyable, and effective for our users in Russia.

**Sources (evidence):** The above requirements cite platform share, payment restrictions, and legal constraints. Third-party estimates are labeled as such.

* Third-party course popularity estimates (non-official): duolingodata.com + Russia demand context[duolingodata.com](https://duolingodata.com/#:~:text=Chinese%20A2%2060%20RU%20130,12%20474)[rbth.com](https://www.rbth.com/education/326271-how-russians-learn-english#:~:text=According%20to%20a%20Levada%20center,with%20studying%20English%20in%20Russia)
    
* Russian mobile market share data[gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/russian-federation#:~:text=Mobile%20Operating%20Systems%20Percentage%20Market,7)
    
* Google Play and payment restrictions news[support.google.com](https://support.google.com/googleplay/android-developer/answer/11950272?hl=en#:~:text=Due%20to%20payment%20system%20disruption%2C,available%20on%20the%20Play%20Store)[reuters.com](https://www.reuters.com/technology/russias-vk-launches-rustore-apps-after-exit-western-alternatives-2022-05-25/#:~:text=Apple%20and%20Alphabet%27s%20Google%20%28GOOGL,to%20Moscow%27s%20actions%20in%20Ukraine)
    
* Russian legal requirements for data (Federal Law 242-FZ)[wilmap.stanford.edu](https://wilmap.stanford.edu/entries/federal-law-no-242-fz#:~:text=,such%20personal%20data%20is%20stored)
    

These references reinforce the decisions made throughout this document, ensuring our product decisions are evidence-based and context-aware. We will continue to seek out data and user research as we move into implementation, to refine the product for maximum impact. With this PRD as a roadmap, the team can now proceed to the design, development, and eventual launch of a product we believe can become the **#1 English learning app for Russian speakers**.

## Open Questions / Research Backlog

* UNKNOWN: whether 54-FZ fiscal receipt obligations apply to our product and which provider will handle fiscalization.
    
* UNKNOWN: exact RuStore subscription/refund rules and revenue share for 2026.
    
* UNKNOWN: push provider strategy in RU distribution reality (FCM vs other transports) and fallback policy.
    
* UNKNOWN: ads decision (if any) and which ad networks are viable in RU, including consent requirements.
    
* UNKNOWN: data localization operational plan (what data can leave RU, if any).
