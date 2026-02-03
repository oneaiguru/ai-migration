# Salesforce-QuickBooks Integration: Complete Implementation Guide 2025

Welcome to the **Salesforce-QuickBooks Integration: Complete Implementation Guide 2025**. This comprehensive document (approximately 30-40 pages in length) provides step-by-step technical specifications and best practices for integrating Salesforce (Enterprise/Unlimited) with QuickBooks Online using a custom Apex/Node.js middleware approach. The guide is organized into six major sections corresponding to the project requirements. Each section includes detailed procedures, code examples, CLI commands, SOQL queries, and verification steps to eliminate ambiguity and ensure a successful production deployment. Citations to official documentation and recent (2024-2025) best practice sources are provided throughout for reference.

## Section 1: Salesforce Deployment Requirements (2025)

In this section, we outline the current Salesforce production deployment requirements and constraints (as of 2025) that are relevant to the integration project. Topics include Apex test coverage mandates, change set usage best practices, deployment validation procedures, test execution rules during deployments, API version compatibility, and considerations when deploying custom objects/fields. Following these guidelines will ensure the integration components can be deployed to production smoothly and meet Salesforce’s strict standards.

### **1.1 Apex Test Coverage Requirements**

Salesforce requires that all Apex code meet specific test coverage criteria before it can be deployed to a production org. The **exact requirement is at least 75% code coverage organization-wide**, meaning **75% of all Apex code lines in the org must be covered by unit tests**[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Here%20I%20will%20explain%20the,those%20tests%20must%20complete%20successfully). This is an org-wide aggregate percentage, not a per-class requirement[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/41755/is-the-75-code-coverage-requirement-to-deploy-to-production-per-class-or-overal#:~:text=,of%20those%20tests%20must). _Individual classes or triggers do **not** each need 75%, but the overall average must be ≥75%. However, every Apex Trigger must have **some** test coverage_[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Note%20the%20following%3A) (i.e. you cannot deploy a trigger with 0% coverage). All unit tests must execute without any failures, and all classes/triggers must compile successfully before deployment[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Note%20the%20following%3A). Key points include:

* **Organization-Wide 75% Coverage**: When deploying or releasing to AppExchange, the combined Apex in the org must have ≥75% of lines executed by tests[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Here%20I%20will%20explain%20the,those%20tests%20must%20complete%20successfully). If the production org’s total coverage is below 75%, the deployment will be blocked. For example, if the org has 10,000 lines of Apex, at least 7,500 must be covered by tests.
  
* **Trigger Coverage**: Salesforce specifically mandates that every trigger is invoked by at least one test (even if it’s just 1% coverage)[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Note%20the%20following%3A). This ensures no trigger is completely untested. Failing to execute a trigger in any test will cause deployment to fail.
  
* **Test Success**: 100% of tests must pass (no unhandled exceptions or assertion failures) during deployment. If any test method fails, the entire deployment is rolled back.
  
* **No Per-Class Minimum (Except Triggers)**: Apart from triggers, there is no rule that each Apex class must have 75% individually[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/41755/is-the-75-code-coverage-requirement-to-deploy-to-production-per-class-or-overal#:~:text=,of%20those%20tests%20must). It’s acceptable if some classes have lower coverage as long as the aggregate is ≥75%. That said, it’s a best practice to aim for high coverage on every class (ideally >90%) to ensure quality.
  
* **Excluded Code**: Note that test classes/methods themselves and calls to `System.debug()` are not counted toward coverage percentage[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,is%20covered%20by%20unit%20tests). Only executable code in non-test classes counts toward the total.
  
* **Focus on Use Cases**: Rather than just chasing the percentage, Salesforce recommends focusing on covering all business logic branches (positive, negative, bulk scenarios). By doing so, you will naturally achieve high coverage[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,is%20covered%20by%20unit%20tests). Aim for meaningful tests that validate behavior, not just lines executed.
  

**Verification**: To verify org-wide coverage, you can use **Setup** > **Apex Classes** > “Estimate your organization’s code coverage” in sandbox or production (after running all tests)[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=Once%20the%20Apex%20unit%20tests,by%20following%20the%20instructions%20below). This provides the overall percentage. Alternatively, use a SOQL query against the Tooling API object `ApexOrgWideCoverage`. For example, in Developer Console (with Tooling API enabled) run:

```sql
SELECT PercentCovered FROM ApexOrgWideCoverage
```

This returns the current org-wide coverage percentage[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=ApexOrgWideCoverage%20represents%20code%20coverage%20test,results%20for%20an%20entire%20organization). You can also query `ApexCodeCoverageAggregate` or `ApexCodeCoverage` to see coverage per class or trigger[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=The%20following%20example%20SOQL%20query,a%20specific%20class%20or%20trigger). For instance, to find classes with low coverage, run:

```sql
SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered 
FROM ApexCodeCoverageAggregate 
ORDER BY (NumLinesCovered/(NumLinesCovered+NumLinesUncovered)) ASC
```

This will list Apex classes/triggers by coverage percentage (after tests have been executed). Using the Salesforce CLI, you can run all tests and fetch a coverage report using:

```
sfdx force:apex:test:run -u <TargetOrg> -c -r human --codecoverage
```

This will execute all local tests and output coverage metrics. Ensure you run tests in a **Full sandbox** (which mirrors production data and metadata) to get an accurate preview of production coverage[atrium.ai](https://atrium.ai/resources/how-to-test-code-coverage-in-salesforce-useful-tips-and-techniques/#:~:text=1,then%20retry%20the%20deployment). If the coverage is below 75%, you must create additional tests before deployment (see Section 2 for strategies to improve coverage from 58% to 75%).

### **1.2 Change Set Best Practices and Limitations**

Salesforce Change Sets are the native mechanism for migrating metadata (code, objects, fields, etc.) from Sandbox to Production. While convenient for admins, they come with limitations. Understanding these will help plan a smooth deployment:

* **Connected Orgs Only**: Change sets only work between sandboxes and the production org that are affiliated (e.g. a sandbox and its production)[flosum.com](https://www.flosum.com/blog/limitations-of-changesets#:~:text=Limit%20,orgs%20only). You cannot directly send a change set between unrelated orgs. Ensure your sandbox and production have an established deployment connection (in **Setup -> Deployment Settings**, “Allow Inbound Change Sets” must be enabled on production for that sandbox)[flosum.com](https://www.flosum.com/blog/limitations-of-changesets#:~:text=Step%20,connections)[flosum.com](https://www.flosum.com/blog/limitations-of-changesets#:~:text=3,Inbound%20Change%20Sets%20and%20Save).
  
* **Manual Dependency Handling**: Change sets do **not automatically include dependent components** unless manually added. After adding components, always click “View/Add Dependencies” to catch related components you might have missed (e.g. a formula field’s referenced fields, or an Apex class referenced by another)[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=added%20a%20component%20the%20View%2FAdd,to%20what%20you%20have%20added). If a referenced component is missing in the target org or not included, the deployment will fail[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=For%20example%2C%20if%20you%20add,your%20change%20set%20that%20references). Best practice is to **add all custom fields, objects, record types, etc., that your Apex code or triggers rely on** in the same change set. Also include profiles/permission sets if field or object permissions need deployment (profiles in change sets have known issues[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=The%20first%20thing%20to%20consider,sense%20checking%20a%20user%E2%80%99s%20permissions), see below).
  
* **Profiles and Permissions**: Profile settings can be problematic in change sets. Change sets do not reliably deploy all profile permissions or FLS changes[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=The%20first%20thing%20to%20consider,sense%20checking%20a%20user%E2%80%99s%20permissions). It’s often easier to deploy new fields without profile access and then manually update profile permissions in production after deployment[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=The%20first%20thing%20to%20consider,sense%20checking%20a%20user%E2%80%99s%20permissions) (or use a Permission Set deployed via change set, which tends to work more predictably[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=That%20being%20said%2C%20Salesforce%20is,play%20nicely%20with%20change%20sets)). Document any manual post-deployment steps for profile access changes.
  
* **Size Limits**: A single change set can contain up to 10,000 files (metadata components). If your change set is very large (close to this limit), consider breaking it into multiple smaller change sets (for example, one for schema components like Custom Objects/Fields and another for Apex code)[help.salesforce.com](https://help.salesforce.com/s/articleView?id=platform.changesets_best_practices.htm&language=en_US&type=5#:~:text=Change%20sets%20are%20limited%20to,templates%2C%20dashboards%2C%20and%20reports). Large change sets can be unwieldy to manage via the web UI.
  
* **No Rollback**: **Deployments via change sets are not version-controlled and cannot be automatically rolled back**[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=Another%20thing%20to%20consider%20is,unlike%20with%20other%20DevOps%20solutions). If a change set deployment accidentally introduces a bug, you must manually reverse those changes (e.g. redeploy old code or manually delete/modify components). This means thorough testing in a Full sandbox is critical before deploying. As a contingency, keep backups of the metadata (for example, have the pre-deployment Apex classes in version control or a zip file) in case you need to redeploy the previous state.
  
* **Lack of Visibility & Audit**: Change sets offer minimal tracking of who deployed what and when. The Deployment Status in Setup will show who clicked deploy, but there’s no built-in detailed audit or version history. Ensure you communicate with the team about deployment timing and content. Consider taking screenshots or notes of the components in the change set for future reference.
  
* **No Partial Deploy or Merge**: Change sets deploy all or nothing (which is good for atomicity). However, you cannot select subsets of components at deploy time – it’s one bulk package. Also, you cannot automatically merge changes from multiple sandboxes; everything must be collected into a change set manually. Plan and coordinate development to avoid conflicts.
  
* **Unsupported Components**: Some metadata types aren’t supported in change sets (e.g., standard picklist values, email templates in folders, etc.)[flosum.com](https://www.flosum.com/blog/limitations-of-changesets#:~:text=Limit%20,support%20all%20Salesforce%20components). Review Salesforce documentation for change set supported components. For this integration, notable components like Auth. Providers and Named Credentials **are** supported (they appear under “AuthProvider” and “NamedCredential” metadata types when adding to a change set). If using those, include them. For any component not supported, you might need to recreate it in production or deploy via Metadata API/CLI as an alternative.
  
* **Deployment Order**: The platform will try to deploy all components together, but you should be mindful of implicit order. For example, if an Apex class in the change set references a custom object that is also in the change set, Salesforce will deploy the object first behind the scenes. Usually this is handled, but if you encounter issues, a workaround is to deploy in two passes (deploy schema first, then code). Generally, adding all dependencies as mentioned will avoid compilation errors. Use the **validation** feature (see below) to catch any ordering issues.
  
* **Connected App Consideration**: If you created a **Connected App** or Auth Provider in sandbox for QuickBooks OAuth (see Section 3), those can be deployed via change set. However, consumer secret values might not carry over (for Connected Apps, the Consumer Secret might need re-entering in production). For Auth Provider, ensure the callback URL is correct for production (which may differ from sandbox URL). You may choose to recreate the Auth Provider in production manually to establish the OAuth with QuickBooks production credentials if needed. (Many integration teams prefer to set up the final OAuth config directly in production to avoid secret propagation issues.)
  

**Best Practices Summary**: Plan deployments in advance and communicate with stakeholders[flosum.com](https://www.flosum.com/blog/limitations-of-changesets#:~:text=Strategy%20,advance). Use a sandbox that mirrors production (Full sandbox) to assemble and test the change set. List out all components needed. Double-check dependent components (use “View/Add Dependencies” and manual check). Keep note of any manual steps (like profile updates or adding remote site settings in production). Because there is no rollback, be absolutely sure tests cover the integration and that you have a back-out plan (even if it’s manual). If the integration includes any new custom settings/metadata that control feature toggles, consider leaving them “disabled” by default on deploy, and only enable once verification is complete – this provides a quick kill-switch if something goes wrong.

### **1.3 Production Deployment Validation Procedures**

Before performing the actual deployment of integration components to production, Salesforce provides a **validation** process to “test deploy” the change set without committing changes. This is highly recommended to catch any deployment errors or test failures in advance:

* **Validate Only Deployment**: In the production org’s **Inbound Change Sets** list (after uploading from sandbox), use the “**Validate**” option instead of “Deploy” initially. This runs the deployment as a simulation: all components are checked and all tests execute, but nothing is committed to the org. You will get a result summary of success or failures (just as you would in a real deployment). If any test fails or any component has an issue, the validation will report errors but not alter production. Fix any issues in sandbox, upload a new change set, and validate again until it passes cleanly.
  
* **Quick Deploy**: After a successful validation, Salesforce allows a **Quick Deploy** of that validated package. A Quick Deploy means you can deploy the previously validated change set **without running all tests again**, saving time[gearset.com](https://gearset.com/blog/salesforce-quick-deploy-and-validated-deployment-packages-with-gearset/#:~:text=If%20you%20use%20Change%20Sets,risk%20out%20of%20real%20deployments). Quick Deploy is only available if the validation passed all tests within the last 10 days[help.salesforce.com](https://help.salesforce.com/s/articleView?id=sf.devops_center_deployment_validate_only.htm&language=en_US&type=5#:~:text=If%20you%20ran%20the%20validation,If%20the)[salesforcetutorial.com](https://www.salesforcetutorial.com/quick-deploy-quick-deployments-salesforce/#:~:text=What%20is%20Quick%20deploy%20,This). In practice, you would validate (which runs tests, taking e.g. a couple hours), then during a deployment window (say after UAT sign-off) you hit “Quick Deploy” to actually commit the changes in a few minutes. **Note:** If any metadata changes occurred in the org after validation (or 10 days elapsed), you may need to re-run the validation because the cached test results expire (Salesforce documentation notes a 96-hour test result validity, but currently Quick Deploy is allowed up to 10 days post-validation to accommodate change sets[help.salesforce.com](https://help.salesforce.com/s/articleView?id=sf.devops_center_deployment_validate_only.htm&language=en_US&type=5#:~:text=If%20you%20ran%20the%20validation,If%20the) – it’s safest to deploy within 4 days of validation to be sure test results are fresh).
  
* **Deployment Status and Monitoring**: Use **Setup -> Deployment Status** in production to monitor the validation or deployment process. You’ll see an entry for your change set validation. If it’s still running tests, it will show in progress. Once completed, click it to review any test failures or component errors. Only after a 100% successful validation should you proceed to quick deploy.
  
* **Profiles & Permissions Check**: During validation, pay attention to any warnings (for example, if profile settings weren’t deployed, Salesforce might not treat it as an error – you’ll just notice that some profile changes didn’t come through). Plan to manually adjust those after deployment if needed.
  
* **Trial Runs**: If possible, perform a full deployment validation in a **Full Copy sandbox** first. This means deploying the change set to a full sandbox (refresh it with production metadata and data). This will surface any surprises (especially with tests that depend on data) in a non-prod environment. After resolving issues, proceed to validate against production. The Full sandbox deployment serves as a dress rehearsal.
  
* **Backups**: Ensure you have backup of critical components before deployment (e.g., download the apex classes as they exist in production before overriding them). Tools like ANT or SFDX CLI can be used to retrieve the current metadata from production. Example CLI retrieval command: `sfdx force:source:retrieve -m ApexClass,ApexTrigger,CustomObject,Profile` (listing all types you plan to change). This is just in case you need to rollback manually; you’ll have the last known good version.
  
* **Communicate Downtime if Needed**: Typically deploying Apex and such does not require system downtime for users, but running all tests can be resource-intensive. If the org is large, you might deploy during a maintenance window. Notify users if any brief lockups or slower performance might be expected during the deployment validation (especially if thousands of tests run). In our case, integration code likely won’t affect user-facing operations until turned on, so downtime may not be necessary, but it’s good practice to deploy outside peak hours.
  

**CLI Note**: You can also validate using Salesforce CLI for quicker feedback. For example, using sfdx: `sfdx force:mdapi:deploy -u ProductionOrg -d <yourDeploymentFolder> -c -w 100` (the `-c` flag means check only, not deploy; `-w 100` means wait 100 minutes max for tests). This will perform a validation via Metadata API. If successful, you can quick deploy with `sfdx force:mdapi:deploy -u ProductionOrg -q <jobId>` where `<jobId>` is the deployment ID from the validation (you get this from the CLI output or Deployment Status). This is an advanced option – using the UI is fine as well.

### **1.4 Test Execution Requirements During Deployment**

When deploying to a Salesforce production org, **running automated tests is mandatory for any deployment containing Apex code**. You cannot bypass tests on production deployments (this is a critical safeguard by Salesforce). Here are the rules and best practices around test execution in deployments:

* **All Local Tests by Default**: By default, a production deployment (via change set or Metadata API) will run all **local** tests, meaning all tests in your org’s namespace (excluding managed package tests). This is usually sufficient. In a change set UI deployment, you typically don’t even see an option – it just runs all local tests automatically.
  
* **Managed Package Tests**: If your org has installed packages, their tests are not run by default in change sets. You have the option (via Metadata API or if you check “RunAllTestsInOrg” in certain deployment tools) to include managed tests, but it’s not required unless you explicitly choose. For our integration code (custom Apex), “Run Local Tests” is appropriate. Do **not** run managed package tests unless necessary, as it lengthens deployment and can introduce unrelated failures.
  
* **Specified Tests (when applicable)**: Salesforce does allow specifying a subset of tests to run _in API deployments_ (using the `RunSpecifiedTests` option), **but only if overall coverage is already above 75% and if you name every class containing code to deploy**. This is typically used in CI pipelines for partial deploys. For a change set deployment, you cannot choose specific tests in the UI – it’s all or nothing. We will rely on all tests running. If deployment time is a concern (e.g., thousands of tests), one strategy could be to create a **“deployment test suite”** by tagging critical test classes with an @isTest(seeAllData=false) annotation and then using the API to run only those. However, given our org’s current 58% coverage, we actually **want** to run all tests to get an updated accurate coverage figure. In short: plan for all tests to run during the production push.
  
* **Test Level in Change Sets**: In the _Deployment Settings_ page for the target org, you can usually select test level for an inbound change set (e.g., “Default (Run Local Tests)” vs “Run All Tests”). The default is correct for us (all local tests). Only if you needed to include managed package tests (which we likely do not) would you choose “Run All Tests”. _Do not choose “no tests”_ – that option is disabled for production when code is present.
  
* **Test Execution Order & Resources**: Tests run in parallel batches by default in Salesforce deployments. Salesforce may split tests into multiple threads to finish faster. Be mindful of test data isolation and limits. If tests depend on certain data or sequence, ensure they are written not to conflict. The platform handles rolling back any data created during tests. If you have long-running tests, they could cause the deployment to approach a time limit (which is around 6 hours max for all tests). Our integration tests should be efficient: avoid waiting or infinite loops. Typically, 6 hours is plenty for most orgs; if you’re concerned, consider breaking the deployment into smaller ones.
  
* **Handling Test Failures**: If any test fails during the deployment, the deployment is aborted. Use the validation process (1.3) to ensure tests pass beforehand. However, in the rare case a test passes in sandbox but fails in production (e.g., due to data differences), you must address that quickly. If minor, you could disable that test and re-run, but that’s not ideal. A safer approach is to adjust the test in sandbox and redeploy. This again underscores using a Full sandbox for realistic data during testing.
  
* **Apex Test Execution Permissions**: The user deploying (or the integration agent) must have “Run All Tests” permission implicitly (System Admins do). If using a CI service or CLI, ensure the user or connected app has the right permissions to run tests.
  

**Summary**: Always run all tests in a production deployment (the default). Only consider test subsets in extraordinary cases via CLI. Use deployment validation to ensure tests will pass. Our target is to achieve ~75% coverage (or higher) by the time of deployment (from the current 58%), so that tests will pass the coverage check. Section 2 of this guide will cover strategies to bring coverage up to the required level **before** attempting the deployment.

### **1.5 API Version Compatibility Requirements**

Salesforce and QuickBooks each have versioning considerations that need to be addressed to avoid integration issues:

* **Salesforce API Version (for Apex)**: Each Apex class/trigger has a “Version Settings” specifying the Salesforce API version it was written against. Ensure that all new classes and triggers for this integration use a recent API version (e.g., API v57.0 as of Winter ‘25, or the latest available in 2025). Using the latest version guarantees access to modern Apex features and avoids using any deprecated behaviors. Consistency is key: ideally, all our Apex classes should target the same API version to prevent unexpected differences in behavior. You can check/edit the version in Developer Console or in the metadata files. If any class is on a very old version (< v40 for example), consider updating it if it interacts with our integration logic. Note that mixing versions generally works, but using uniformly latest version is a best practice for new development. **No code referencing pilot or beta API features should be deployed** – stick to GA features as of 2025.
  
* **Metadata/API Version for Deployment**: If using Metadata API (CLI) to deploy, ensure the tool’s API version is up to date. For change sets, Salesforce handles this internally. But for CLI, if you see an error like “API version not supported”, upgrade the CLI or specify a lower version for the deployment command. For example, if using SFDX, you might specify `--api-version 57.0` if that’s the target. All components in a deployment must be on an API version supported by the target org’s Salesforce release.
  
* **QuickBooks API Version**: QuickBooks Online uses a specific versioning for their API calls, typically via a “minor version” parameter in the URL. For instance, you’ll see `?minorversion=65` or `?minorversion=69` in QuickBooks API examples[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=1.%20Endpoint%3A%E2%80%98callout%3A,Method%3A%20POST). We should use the latest stable minor version for QuickBooks Online API in 2025 (at the time of writing, minorversion 65+ is common; the example from late 2024 shows 69). Confirm the appropriate minor version from QuickBooks API docs or the QuickBooks Developer portal. This ensures our data payloads are accepted and we can use the latest fields. In practice, you include `?minorversion=<N>` on QuickBooks REST endpoints to specify the version. Our integration code or Node middleware should consistently use the same minor version to avoid breaking changes.
  
* **Compatibility of Data Formats**: Ensure the data formats we use are compatible with both systems. For example, date/time formats – Salesforce DateTime vs QuickBooks timestamp (usually QuickBooks expects ISO 8601). Our Apex code should format dates to ISO strings if sending to QuickBooks. QuickBooks API typically returns JSON – our Apex should parse accordingly (using `JSON.deserialize` or manual parsing). The Node middleware (if doing transformations) should also ensure proper conversion.
  
* **TLS and Security**: As of 2025, Salesforce requires TLS 1.2+ for callouts, and Intuit/QuickBooks also requires TLS 1.2+ (they discontinued TLS1.0/1.1 in 2022)[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/rest-api-features#:~:text=Note%20about%20deprecation%20of%20TLS1,1). Ensure any external callout is using HTTPS with TLS1.2. This is usually handled by the platform automatically if using standard libraries. Just be aware if using any older integration libraries.
  
* **Connected App OAuth Version**: If using OAuth 2.0 (which we are), ensure we use OAuth 2.0 endpoints for QuickBooks (Intuit moved to OAuth2 exclusively since 2019). Any reference to OAuth1 in older code (like legacy HMAC-SHA1 signing) should be removed in favor of OAuth2 flows (see Section 3).
  
* **Salesforce Summer ‘24+ Changes**: Keep an eye on any critical updates or enforced behaviors that might affect deployments. For instance, from time to time, Salesforce changes test execution or API behaviors. Check release notes for anything like “Deployments now enforce X” in the current release. As of Winter ‘25, one example is stricter validation of Apex test namespaces – not an issue for us, but it’s good practice to read release update notes before deployment.
  
* **Integration User Permissions**: If a dedicated integration user is used to run the Apex in production, ensure that user’s profile is updated to API version changes if needed. (Usually not an issue, but e.g. if using a permission set with API access, it should allow whatever is needed.)
  

In summary, use the latest API versions for all components, test in sandbox with those versions, and verify that QuickBooks endpoints and payloads align with QuickBooks API’s expected version. Compatibility issues typically surface during testing (e.g., if an API field we use was removed in a newer version), so functional testing in Section 6 will validate this.

### **1.6 Custom Object and Field Deployment Considerations**

Our integration may involve custom objects or fields in Salesforce (for example, a custom **Integration Log** object, or custom fields on Opportunity to store QuickBooks IDs or statuses). When deploying these, consider:

* **Include All New Schema Components**: Be sure to add any new Custom Object, Custom Field, List View, Record Type, etc., to the change set. If an Apex class references a field that doesn’t exist in production yet, that field must be in the change set. Missing fields are a common deployment failure cause. Use the dependency check or manually ensure all referenced schema is included[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=For%20example%2C%20if%20you%20add,your%20change%20set%20that%20references).
  
* **Field Accessibility**: By default, when you deploy a new field via change set, you can choose to include field-level security settings for profiles in that change set. It’s often easier to **include profiles in the change set and set the field to visible/editable for required profiles** at deployment time, rather than manually updating each profile later. But as noted, profile deployments can be finicky[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=The%20first%20thing%20to%20consider,sense%20checking%20a%20user%E2%80%99s%20permissions). A cautious approach: deploy the field as hidden from all, then use permission sets or a post-deployment admin step to assign permissions.
  
* **Lookup Relationships**: If your custom objects have lookup/master-detail relationships, deploy the parent objects first or together. Note that deploying a master-detail field requires the parent object to exist in target. Ideally, if new, include both objects in one change set (Salesforce will handle ordering). If the parent is standard (e.g., linking something to Opportunity), no issue.
  
* **Record Data**: Change sets do **not** move actual records/data, only metadata. After deploying, if the integration requires certain config records (e.g., a Custom Metadata Type record or a default record in a custom settings object), you must create or deploy those separately. For example, if we use Custom Metadata to store “QuickBooks Company ID” or configuration, you can deploy those records as part of the change set (by adding the Custom Metadata type and records). If you use List Custom Settings, those are data and won’t deploy via change set; you’ll need to manually create them in production. Document any such data setup required post-deployment.
  
* **Named Credentials & Auth Provider Deployment**: These are metadata and can be added to change sets. When deploying a Named Credential that uses an Auth Provider, in production it should retain the auth provider reference. However, the actual authentication (handshake) will need to be redone in production by an admin after deployment (since the token/refresh token from sandbox won’t carry over). Be prepared to **authorize the Named Credential in production manually after deployment** (this will be covered in Section 3 and Section 6).
  
* **Remote Site Settings**: If not using Named Credential for callouts (e.g., if Apex calls directly to QuickBooks or the Node endpoint without a named credential), you must create a **Remote Site Setting** in production allowing the external host URL. Remote Site Settings are deployable via change set (Metadata type: RemoteSiteSetting). Alternatively, you can create it manually in production prior to deployment. In our case, we plan to use Named Credentials (which bypass the need for remote site), but if any external URL doesn’t use the named cred domain, add it to Remote Sites. For example, if Node middleware is at `https://api.mycompany.com/quickbooks`, that domain must be whitelisted in Remote Site settings for callouts[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Remote%20Site%20Settings)[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=1,com).
  
* **API Enabled**: Ensure the production org has API access enabled (Enterprise Edition always does by default) and that the user running integration has “API Enabled” permission (required for callouts and such).
  
* **Verify in Prod (post-deploy)**: After deployment, verify that all custom fields are present and on the correct page layouts if needed (change sets can include layouts too, if you want the fields to show for users). Also verify picklist values, etc., because those can sometimes be tricky (a new picklist field’s values deploy fine, but adding new values to an existing picklist via change set can overwrite or behave unexpectedly if not done carefully).
  
* **Names and Labels**: Changing names of components in deployment can cause mapping issues. For example, if you renamed a field in sandbox, the deployment will treat it as a new field in production (since change sets can’t rename existing metadata). Plan your naming ahead to avoid renames. If a rename is needed, coordinate it as a separate step (or accept that the old field remains and clean it up later manually).
  
* **Destructive Changes**: If the deployment involves deleting or renaming existing components in production (not anticipated for this integration’s initial release), know that change sets do not support destructive changes directly. You’d have to use the Ant/CLI with a destructiveChanges.xml. It’s best to avoid any deletion in the initial deployment; focus on adding new integration components. Any cleanup of old unused components can be done separately after everything is stable.
  

By carefully handling custom object and field deployment, we ensure that the underlying data model for the integration is correctly established in production, paving the way for the integration logic (triggers, classes) to function without runtime errors (like missing fields). In Section 5 we will walk through creating the change set with the above considerations, and in Section 6 we’ll verify that all deployed components are functioning as expected.

## Section 2: Test Coverage Strategies

This section provides detailed guidance on improving and maintaining Apex test coverage, which is essential for deployment and for the long-term health of the integration. Given our current state (58% coverage in sandbox), we need to systematically raise this to at least 75%. We outline strategies to calculate current coverage, identify gaps, write effective tests (especially for asynchronous Queueable classes, HTTP callouts, and triggers), and ensure test isolation and best practices. By following these strategies, the development team can confidently achieve the required coverage and have a robust automated test suite that validates the integration logic.

### **2.1 Calculating Organization-Wide Test Coverage**

Before writing new tests, it’s important to accurately measure your current code coverage and identify which areas are lacking. Salesforce provides multiple ways to calculate org-wide coverage:

* **Developer Console**: Go to **Setup -> Apex Classes**, and click “**Estimate your organization’s code coverage**.” This will compile all classes and run a coverage calculation[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=Once%20the%20Apex%20unit%20tests,by%20following%20the%20instructions%20below). If you haven’t run all tests recently, you may need to run them first. In Developer Console’s Test panel, you can run all tests or specific test suites, then click the **Tests** tab’s “Overall Code Coverage” panel to see the percentage[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=,Test%20Classes)[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=Once%20the%20Apex%20unit%20tests,by%20following%20the%20instructions%20below).
  
* **Tooling API via Query**: Use the `ApexOrgWideCoverage` object (Tooling API) as mentioned in Section 1.1. For example, open the Developer Console’s Query Editor, check “Use Tooling API”, and run:
  
    ```sql
    SELECT PercentCovered FROM ApexOrgWideCoverage
    ```
    
    This returns a number like 58 (meaning 58%)[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=ApexOrgWideCoverage%20represents%20code%20coverage%20test,results%20for%20an%20entire%20organization). This is a quick way to get the exact org-wide coverage in decimals. If the result is lower than expected or null, ensure you have recently run all tests and that “Store Only Aggregated Code Coverage” is unchecked in Apex Test Execution options[atrium.ai](https://atrium.ai/resources/how-to-test-code-coverage-in-salesforce-useful-tips-and-techniques/#:~:text=a.%20Setup%20,and%20clear%20all%20test%20history) (this setting, when unchecked, stores detailed coverage results that make these calculations possible).
    
* **Identify Low-Coverage Classes**: To pinpoint which classes or triggers need more tests, query `ApexCodeCoverageAggregate` which gives coverage per class. For instance:
  
    ```sql
    SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered 
    FROM ApexCodeCoverageAggregate 
    ORDER BY (NumLinesCovered/(NumLinesCovered+NumLinesUncovered)) ASC
    ```
    
    This will list classes by ascending coverage percentage. Look for those with very low coverage or high uncovered lines. These are your primary candidates for new tests. Often, utility classes or triggers may have been neglected in testing.
    
* **CLI Tools**: If using Salesforce DX, you can run `sfdx force:apex:test:run --codecoverage --resultformat human` which after execution, provides a per-class coverage breakdown and the overall org coverage in the results. Another approach is using the CLI to query the Tooling API as above (for example, using `sfdx force:data:soql:query -q "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate"` with `--usetoolingapi` if supported).
  

**Analyze Current Coverage**: Once you have the data, determine how far off from 75% you are and which components drag the coverage down. Common culprits for low coverage include: classes with complex logic that lack tests, bulk triggers not fully tested in bulk scenarios, Apex callout classes (often skipped tests because callouts require mocking), and utility classes (people sometimes don’t test them assuming they’re simple). Also check if any tests are failing or being skipped – a failing test yields 0% coverage for its target code, so fix failing tests to regain coverage.

### **2.2 Strategies to Improve Coverage from 58% to 75%**

Raising coverage ~17 percentage points requires writing additional tests to cover lines currently not executed. Here’s a structured approach to boosting coverage effectively:

* **Prioritize Critical Classes**: Focus on classes and triggers that are central to the integration (e.g., the Opportunity trigger, Queueable job classes, HTTP callout service classes). Not only do these need coverage for deployment, but high-quality tests here will ensure the integration works as expected. It’s often possible to get these classes to 90%+ coverage by simulating various scenarios.
  
* **Cover Bulk Scenarios**: Make sure to write tests that cover bulk operations, especially for triggers. For example, create 20+ Opportunity records in a test and perform an update that triggers the logic[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,create%20an%20account%20A%2C%20and). Salesforce requires testing bulk trigger behavior – use at least 20 records to ensure your code can handle bulk limits[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,create%20an%20account%20A%2C%20and). By doing this, you also cover many branches in your code that handle lists vs. single records.
  
* **Test Positive and Negative Paths**: For each piece of logic, write tests for successful cases (e.g., invoice creation succeeds) and error cases (e.g., QuickBooks API returns an error). For error cases, you may need to simulate exceptions or error responses (using mocks, see 2.4). Ensuring your error-handling code is executed in tests not only increases coverage but validates your integration’s resilience.
  
* **Increase Test Depth**: Don’t just aim to hit 75% minimally; aim higher so future changes don’t drop it below the threshold. As a best practice, shoot for **85%+** coverage before deployment[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=Sets%20www,production%20using%20Salesforce%20change%20sets). This buffer accounts for new code being added. Many teams treat 75% as a floor, not a target, and strive for near 90-100% on new code. Our plan should include writing thorough tests for the newly developed integration classes, which will significantly boost overall coverage.
  
* **Revisit Existing Tests**: Check if some existing test classes are using `seeAllData=true` and maybe failing due to no data in sandbox. If so, refactor those tests to create their own data (this will make them reliable and count toward coverage). Sometimes simply fixing or enabling an existing test can increase coverage.
  
* **Leverage Test Setup**: Use the `@testSetup` method to create common test data (Accounts, sample Opportunities, etc.) that all tests in a class can use[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=,inside%20our%20test%20method%20itself). This reduces code duplication and ensures consistency. However, remember that static variables do not persist across test methods (Salesforce clears them to isolate tests)[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/391260/queueable-test-class#:~:text=,in%20test%20setup%2C%20run%20fifteen). So if using complex data structures, either rebuild them in each test or query the test records in each test method (the test setup records are accessible via SOQL).
  
* **Utilize Data Factory**: If many tests need similar data, consider writing a **TestDataFactory** class with static methods to generate test records (like an Account with required fields, an Opportunity with certain Stage, etc.). This encourages reuse and consistent data. It doesn’t directly improve coverage, but it speeds writing more tests and reduces errors.
  
* **Write Tests for Uncovered Classes**: Identify classes with 0% coverage and target them first – every line you cover there is a pure gain. Pay special attention to utility classes (like a class that constructs JSON for QuickBooks) – even if simple, write a basic test to execute those methods. Sometimes writing a trivial test on a 0% class can bump overall coverage by a percentage point or more.
  
* **Target High-Risk, High-Complexity Code**: Classes with complex branching (if/else, loops, error handling) need multiple tests to cover all branches. Use the Salesforce Developer Console’s code coverage highlighting (after running tests, open a class and see which lines are highlighted as covered vs uncovered) to see which branches you missed, then add tests accordingly. Aim to cover each branch at least once.
  
* **Mock External Interactions**: Use mocking to be able to execute code that normally would call out to external services (more on this in 2.4). Without proper mocking, those sections remain untested (Salesforce will not allow real callouts in tests, so you must simulate them). By implementing HttpCalloutMock and stub data, you can cover the callout logic fully, thereby boosting coverage in integration classes.
  
* **Verify Post-Deployment**: After adding tests, run all tests in the Full sandbox and ensure the new coverage is above 75%. Use the queries above to double-check. **If coverage is still below 75%** after writing what you think are all needed tests, systematically find what’s missing. Often, one or two classes can drag it down. Consider temporarily commenting out truly dead code (not recommended in production, but if, say, there’s an old unused class causing low coverage and you can’t test it easily, you might remove it or annotate it with `@IsTest` to exclude it). However, best practice is to either delete unused code or test it.
  
* **Aim for 100% on New Code**: As an internal goal, try to hit 95-100% coverage on all new integration-related classes (Opportunity triggers, Queueables, callout services). It is quite feasible by controlling input scenarios in tests. This will raise the aggregate significantly. For example, if you add a new class and fully cover it with tests, it contributes positively to the overall percentage.
  

One specific tip: if after writing all possible tests you find the coverage is, say, 72%, one brute-force (but **not recommended**) method is to create a throwaway test class that invokes methods of untested classes simply to raise coverage (without assertions). This is a known “sneaky” trick[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/25892/the-most-sneaky-way-to-increase-your-code-coverage#:~:text=,code%20coverage%20needed%20on%20SFDC) but should be avoided for quality reasons. Instead, truly test the logic or remove dead code. Remember, the goal of tests is not just deployment, but to catch bugs. High coverage achieved honestly correlates with fewer bugs. With our plan, we should comfortably cross 75% with robust tests.

### **2.3 Writing Effective Test Classes for Queueable Apex**

Our integration will use Queueable Apex classes (for asynchronous callouts and processing). Testing Queueable classes has some nuances:

* **Synchronous Execution in Tests**: When you enqueue a Queueable in a test context, you can make it run immediately by surrounding it with `Test.startTest()` and `Test.stopTest()`. All asynchronous jobs (Queueable, @future, batch executes) that were queued between `startTest` and `stopTest` will execute after `Test.stopTest()` is called[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=,stopTest)[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=2,stopTest). For example:
  
    ```java
    Test.startTest();
    ID jobId = System.enqueueJob(new MyQueueable(params));
    Test.stopTest();
    // After stopTest, the Queueable's execute() method has run.
    ```
    
    This pattern is essential. If you omit `Test.startTest/stopTest`, the queueable will not run during the test, and your test won’t cover the code inside it[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=So%20we%20are%20executing%20the,get%20executed%20in%20near%20future). Always wrap enqueueJob calls in start/stop in tests.
    
* **Asserting Results**: After `Test.stopTest()`, you should verify that the Queueable did what it was supposed to. If the Queueable updated records, query those records and assert the changes. If it made callouts, perhaps it stores the result somewhere (or you have a mock that sets a static flag). For example, if `MyQueueable` adds a note to an Opportunity, your test would enqueue it, then after stopTest, query that Opportunity’s notes to ensure the change.
  
* **Testing Chained Queueables**: If a Queueable’s `execute()` enqueues another Queueable (chaining), there is a limitation: Salesforce does not allow the second chain to execute in the same test context by default (the test will get an exception if a queued job chains another without test context handling)[trailhead.salesforce.com](https://trailhead.salesforce.com/trailblazer-community/feed/0D54V00007T439ZSAR#:~:text=Test%20class%20for%20chained%20queueable,Apex%20is%20running%20in). A common approach is to add a check in your code:
  
    ```java
    if (!Test.isRunningTest()) {
        System.enqueueJob(new FollowupQueueable());
    }
    ```
    
    This prevents chaining during tests (to avoid the limit). Then in tests, you can separately invoke the second queueable’s logic by either calling some method directly or by enqueuing it separately within another startTest/stopTest block. Document this behavior: essentially, if you have chained jobs, test them individually. Confirm that adding `Test.isRunningTest()` as a guard is acceptable for your logic (it usually is).
    
* **Handling Batch + Queueable combos**: If your integration were to use Batch Apex that calls Queueable in finish, testing needs similar approach. Our integration likely just uses Queueables from triggers, which is simpler.
  
* **Number of Jobs**: Each test method can at most enqueue 50 jobs. We likely won’t hit this, but if your trigger calls enqueueJob in a loop, the test might enqueue many. Ensure your production code enqueues at most one job per transaction (common pattern: use one Queueable for all records rather than one per record). Not only is that best practice, but it avoids hitting limits in tests too.
  
* **Example Structure**:
  
    ```java
    @isTest
    private class MyQueueableTest {
        @testSetup static void setupData() {
            // create any reference data needed for tests
            Account a = new Account(Name='Test Customer');
            insert a;
            // maybe insert an Opportunity for context
        }
        @isTest static void testQueueableLogic() {
            // Given: setup input for Queueable
            Opportunity opp = new Opportunity(Name='Test Opp', StageName='Closed Won', CloseDate=Date.today());
            opp.AccountId = [SELECT Id FROM Account LIMIT 1].Id;
            insert opp;
            // When: enqueue the Queueable
            Test.startTest();
            System.enqueueJob(new MyQueueable(opp.Id));
            Test.stopTest();
            // Then: assert results of Queueable
            Opportunity updatedOpp = [SELECT QuickBooks_ID__c FROM Opportunity WHERE Id = :opp.Id];
            System.assertNotEquals(null, updatedOpp.QuickBooks_ID__c, 'QuickBooks ID should be set by queueable');
        }
    }
    ```
    
    In this pseudocode, we create an Opportunity, enqueue the job, and after stopTest, verify the Opportunity got a QuickBooks ID (assuming the queueable was supposed to set one after calling QuickBooks API). The actual assertions depend on what your queueable does (it might create a record, send an email, etc.).
    
* **Test Multiple Scenarios**: If your Queueable behaves differently based on input (e.g., if an Opportunity has different Stage, maybe it does something else), you should write separate test methods for those scenarios. Each test method gets a fresh context and fresh Test.startTest/stopTest to execute the job. Ensure each test sets up its data appropriately.
  
* **Governor Limits in Tests**: Use `Test.startTest/stopTest` not only to execute async code, but also to reset governor limits. Code before startTest and after stopTest share one context, but inside startTest/stopTest, you get fresh limits. This is useful if you need to generate a lot of data or do a lot of DML to set up – do heavy setup, then call startTest to reset limits, then enqueue and stopTest. This way, your queueable has full limits available and your test won’t hit limits (the queueable itself runs in a separate context with its own limits as well).
  
* **Covering Exception Paths**: You might have queueable code that catches exceptions (e.g., callout failures). To test those, you can have your mock (for callout) throw an exception or return an error code, causing the queueable to go into its exception handling branch. Then assert that it logged an error record or whatever your error handling is. This ensures that even error scenarios in the queueable are tested (and covered).
  

By following these tips, you can achieve nearly 100% coverage on your Queueable classes and be confident that they work in both single and bulk scenarios. In our integration, for example, if `PaymentSyncQueueable` fetches payment info, we’d create a context where an Invoice is pending, enqueue it, simulate a QuickBooks response via a mock, and assert that the Salesforce records were updated accordingly.

### **2.4 Testing HTTP Callouts and External API Integrations**

A critical part of our integration is making HTTP callouts to QuickBooks (either directly or via the Node.js middleware). Salesforce does not allow actual callouts during tests, but provides a mechanism to simulate responses. Testing callouts thoroughly is crucial to ensure our integration logic (which likely parses responses and handles errors) is correct. Here’s how to test callouts:

* **Use HttpCalloutMock Interface**: Salesforce’s recommended approach is to implement the `HttpCalloutMock` interface to create a mock response[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=1)[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=public%20class%20MockWeatherCallout%20implements%20HttpCalloutMock,returning%20mock%20response%20return%20mockRes). In your test, you then register this mock with `Test.setMock(HttpCalloutMock.class, new YourMockClass())`. When Apex code executes an `Http.send()` callout, Salesforce will **not** actually call the external service, but instead call your mock’s `respond(HttpRequest req)` method to get a fake `HttpResponse`[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=). This allows you to control the outcome of the callout (success, error, specific body).
  
    Example:
    
    ```java
    public class QuickBooksCalloutMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            // You can inspect req to see which endpoint was called, if needed:
            if (req.getEndpoint().contains('/invoice')) {
                // simulate a response for an invoice creation
                HttpResponse res = new HttpResponse();
                res.setStatusCode(200);
                res.setBody('{"Invoice":{"Id":"123","status":"Submitted"}}');
                return res;
            } else {
                // default response
                HttpResponse res = new HttpResponse();
                res.setStatusCode(400);
                res.setBody('{"Fault":{"Error":[{"Message":"Invalid"}]}}');
                return res;
            }
        }
    }
    ```
    
    In your test method:
    
    ```java
    Test.setMock(HttpCalloutMock.class, new QuickBooksCalloutMock());
    Test.startTest();
    // call the method that triggers the HTTP callout
    MyIntegrationClass.sendInvoiceToQB(inv.Id);
    Test.stopTest();
    // then assert the behavior, e.g., verify an Invoice ID was saved on record
    ```
    
    This approach ensures your Apex callout logic (parsing the JSON, error handling, etc.) runs and can be verified[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=,If%20the). The mock above can be as simple or complex as needed – e.g., return different bodies based on input URL or content. The key is you simulate the variety of responses: e.g., a successful 200 with expected JSON, a 400 with an error message (to test error handling), maybe even a 500 or timeout scenario.
    
* **Using StaticResourceCalloutMock**: Another approach is using static resources for response bodies. Salesforce provides `StaticResourceCalloutMock` (in Apex) where you can store a JSON file as a static resource and have the mock return that. Example usage:
  
    ```java
    StaticResourceCalloutMock mock = new StaticResourceCalloutMock();
    mock.setStaticResource('QBSampleResponse'); // a static resource containing JSON
    mock.setStatusCode(200);
    mock.setHeader('Content-Type', 'application/json');
    Test.setMock(HttpCalloutMock.class, mock);
    ```
    
    Then proceed to call the method. This is useful if you have large or complex sample responses – you can maintain them as files rather than in code. It also allows reusing the same response in multiple tests.
    
* **Multi-Callout Scenarios**: If a single transaction makes multiple callouts (to possibly different endpoints), you have a few options:
  
    * Use a single `HttpCalloutMock` implementation that handles multiple endpoint patterns (like the example above differentiating on URL).
      
    * Use a library or custom MultiMock. There are examples where you can map endpoints to different mock classes[stackoverflow.com](https://stackoverflow.com/questions/58270788/how-to-make-a-multimock-http-callout-test-for-salesforce#:~:text=How%20to%20make%20a%20MultiMock,then%20call%20the%20getUrl). For instance, a `MultiRequestMock` that holds a map of endpoint->HttpCalloutMock and returns the appropriate one when called[stackoverflow.com](https://stackoverflow.com/questions/58270788/how-to-make-a-multimock-http-callout-test-for-salesforce#:~:text=Salesforce%3F%20stackoverflow,then%20call%20the%20getUrl). This is more advanced but can keep tests cleaner if your code calls, say, one callout to get an OAuth token and another to send data – you might want to simulate each differently.
      
    * Simplest is often just to handle logic in one mock class with if/else based on `req.getEndpoint()`.
    
* **Test Oauth Token Flow**: If your Apex does the OAuth dance (though likely we offload OAuth to Named Credential, if not, then Apex might call token endpoint). In tests, simulate the token endpoint giving a token. Ensure your code that stores the token runs. Likewise, simulate token expiration error from QuickBooks to ensure your refresh logic (if any) runs.
  
* **Governor Limits**: Remember to use startTest/stopTest around the callout invocation. Salesforce allows up to 100 callouts per test method. Usually fine, but if doing many, consider that limit.
  
* **Assert Outcomes**: After the callout method runs in the test, assert that:
  
    * The response data was processed correctly (e.g., if QuickBooks returned an Invoice ID, your Salesforce record was updated with that ID).
      
    * Errors are handled (e.g., if QuickBooks returned an error, perhaps an `Integration_Log__c` record was created with status "Failed"). In the test where you simulate an error response, query the Integration Log (or whatever error capture) to ensure it recorded the failure as expected.
      
    * No unhandled exceptions occurred. If your code is supposed to catch exceptions and do something, ensure that in the test the code indeed did not propagate an exception. A test method that ends normally indicates no uncaught exception – but you may also explicitly wrap calls in try-catch in test to assert an exception was thrown if that is expected.
    
* **Coverage through Callout**: Each execution of a callout in a test with a setMock counts toward coverage. The code inside the callout method is executed fully as if the response was real, so you’ll cover those lines. Ensure your tests cover success and failure branches of the callout-handling code. For example, one test uses a mock returning 200, another uses a mock returning 401 Unauthorized to simulate an expired token. That way both success path and refresh token path (for example) are covered. It’s not uncommon to have separate test methods for each major branch of callout logic.
  
* **Callout to Node Middleware**: If your Apex calls a Node.js middleware endpoint instead of QuickBooks directly, from Salesforce’s perspective it’s the same (an HTTP callout to some URL). The testing strategy is identical: use a mock to simulate what that middleware would return. If the Node app is just passing data through or doing minor transformation, perhaps you test it as if it were QuickBooks. If the Node returns a simpler acknowledgment, test that. The key is to decouple tests from the real Node service – we simulate it.
  
* **Integration Testing Outside Salesforce**: Note that our focus here is Apex unit tests. End-to-end integration testing (with QuickBooks sandbox, Node, etc.) will be done manually or with integration test scripts outside of Salesforce tests (since SF tests can’t call external systems). In Section 6, we’ll cover how to verify the integration live. The Apex tests ensure our code is logically correct and can handle responses, but they use mocked data. It’s important to test with the real QuickBooks sandbox as well to ensure our assumptions on JSON structure etc. are correct.
  

By thoroughly testing callouts with mocks, we not only achieve the required coverage, but we also gain confidence that our integration code can handle various API responses properly. This reduces the risk of bugs when the code runs in production against the real QuickBooks API. Keep the mocked responses realistic by copying actual API examples from QuickBooks documentation for consistency.

### **2.5 Best Practices for Trigger Test Coverage**

Our integration involves at least one trigger (likely on Opportunity, when Stage changes to “Closed Won” or similar). Ensuring high coverage and correct behavior of triggers requires special attention due to bulk behavior and order of execution. Best practices include:

* **Bulk Data in Tests**: Always test triggers with bulk data sets. As mentioned, create 20 or more records in a test to simulate bulk behavior[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,create%20an%20account%20A%2C%20and). Salesforce triggers should handle up to 200 records per transaction, so write tests that insert or update 200 records at once if possible to truly simulate bulk. This flushes out issues like hitting SOQL limits if queries aren’t bulkified. For example:
  
    ```java
    List<Opportunity> opps = new List<Opportunity>();
    for(Integer i=0; i<100; i++){
        opps.add(new Opportunity(Name='Test Opp '+i, StageName='Prospecting', CloseDate=Date.today().addDays(30)));
    }
    insert opps;
    // now update all to Closed Won
    for(Opportunity o : opps) o.StageName = 'Closed Won';
    update opps;
    ```
    
    After such an update, assert that for all those Opportunities, whatever the trigger should do has happened (maybe an Integration record created for each, etc.). This ensures your trigger logic can handle mass updates.
    
* **Single Record Behavior**: Also test single-record scenarios to ensure no edge cases when only one record (some code might behave slightly differently if list size = 1). This is usually fine, but e.g., if your trigger code divides by list size or similar, you want to cover list of 1 and list of many.
  
* **Order of Execution Considerations**: If your trigger is after insert/update, and for example it enqueues a queueable, you should ensure in test that it enqueues correctly. You can assert that the Queueable was enqueued by checking the AsyncApexJob records after the transaction (though in a single test method, that might be tricky because the enqueue will have executed in Test.stopTest). Simpler: test the outcome of the queueable as we did in Queueable tests. You might not need to assert “job queued” explicitly if your queueable’s effects are verifiable.
  
* **Use of @TestSetup**: Use a test setup method to create reference records like Accounts that triggers might need (e.g., for lookup fields) so each test method doesn’t need to recreate them[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=,inside%20our%20test%20method%20itself). But remember to query inside each test the data created by testSetup (as static variables don’t hold, per isolation).
  
* **Trigger Context Variations**: If your trigger code branches on `Trigger.isInsert`, `isUpdate`, etc., write tests for each scenario. E.g., create new Opportunity to fire `before insert` vs update existing for `before update`. If your trigger logic specifically checks `if(oldValue.StageName != newValue.StageName)` to detect stage change, write tests where stage changes (Prospecting -> Closed Won) and where an update occurs without stage change (e.g., change another field) to ensure the trigger correctly ignores those. The latter ensures coverage on the branch where condition is false.
  
* **Isolation**: Triggers often query or modify other objects. Make sure in tests to isolate what’s needed. Use `Test.startTest/stopTest` if you need to simulate something happening after trigger context (like if trigger queued a job, and you want to execute it).
  
* **Avoid Hardcoding Ids**: Sometimes tests fail because code uses specific record Ids (like a specific Pricebook2 Id). Use TestUtil methods like `Test.getStandardPricebookId()` if needed, or create your own records. In our integration, we might need a Pricebook for OpportunityLineItems – ensure test creates or queries a valid one. This prevents tests failing due to missing data.
  
* **Asserting Trigger Results**: Identify the observable outcome of the trigger. If the trigger enqueues a job, maybe the immediate outcome is a record inserted into an `Integration_Queue__c` custom object (just as an example). Then assert that record exists with correct fields. If the trigger just calls a Queueable, you might not have a direct database change to assert in the same transaction. In that case, your integration logic is in the Queueable which you’ll test separately. For trigger tests, you can at least assert that no errors occurred and maybe check a static flag or log.
  
    Alternatively, refactor trigger logic into a handler class (TriggerHandler pattern). Then you can test the handler class by calling its methods with sample records, which is easier than invoking the trigger via DML. But either way, ensure the logic is covered.
    
* **Negative Tests**: Create scenarios that should not invoke integration. For example, update an Opportunity in a stage that is not Closed Won – verify the trigger doesn’t enqueue a job or create an invoice. Essentially, assert that nothing (or the expected nothing) happened. This might be checking that a certain static variable remains false, or that no Integration Log record was created.
  
* **Trigger Recursion**: If your trigger intentionally or unintentionally can re-fire (e.g., trigger updates a record of same object type), you must guard against recursion. Tests should cover that scenario too. For instance, if Opportunity trigger updates the Opportunity itself (which is a bad practice without recursion check), test might fall into an infinite loop. In general, we avoid that by using static boolean or checking `!Trigger.isExecuting` on some static context. Write tests to ensure your recursion control works (like updating 1 record that triggers update on another – ensure it doesn’t double-process).
  
* **All Branches**: Use coverage highlighting to see if any code in the trigger handler (or trigger body if logic is there) wasn’t executed. Then design a test to hit that branch.
  

By following these practices, your triggers should be well-tested and you’ll avoid the common pitfalls of untested bulk behavior. Achieving near 100% coverage on triggers is usually straightforward if you simulate enough data variety.

### **2.6 Test Data Setup and Teardown Procedures**

Proper test data management ensures tests run reliably and do not depend on org data or interfere with each other:

* **Always Create Your Own Data**: Tests should **not rely on existing org data** (the default in Apex test execution is `SeeAllData=false`, which means tests cannot see org records). This is good because it forces tests to be self-contained. So, every test (or test setup) must create the records it needs[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,have%20to%20delete%20any%20data). For example, if our logic needs an Account and an Opportunity, the test should insert an Account and then an Opportunity linked to it. The one exception is that a few standard objects (like User or certain settings) might be accessible. But as a rule, assume nothing is there and explicitly insert.
  
* **@TestSetup Method**: Use one `@TestSetup` per test class to create common data[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=,inside%20our%20test%20method%20itself). Data created in testSetup is rolled back at end of test class, just like data in test methods. It is accessible in all test methods in that class. The advantage is performance: Salesforce runs testSetup once, then reuses that created data for each test method, avoiding re-insertion overhead. For example, testSetup might insert a test Account “Acme Corp” and maybe a Product2 or Pricebook, etc., that all tests use. In each test, you can query those records (e.g., `Account testAcc = [SELECT Id FROM Account WHERE Name='Acme Corp' LIMIT 1];`). This reduces code duplication. Just ensure the data is set up correctly to meet all test needs. If a specific test needs a different data scenario, it can still create additional records itself.
  
* **No Teardown Required**: Salesforce automatically rolls back all database changes made by tests (they operate in a sandbox context). So you **do not need to delete records** at the end of tests[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,have%20to%20delete%20any%20data). In fact, doing deletes in test code wastes time and CPU. Simply let tests exit and Salesforce will rollback everything. One exception: if you’re testing deletion logic (like writing a test for what happens when a record is deleted), obviously you perform deletes as part of the test scenario, but not as “cleanup”, rather as the action under test.
  
* **Test Isolation**: Each test method in Apex is isolated by default (changes in one do not persist to the next). However, static variables are not reset between test methods unless you use the TestSetup pattern (which does implicit isolation for you on data). Actually, as the StackExchange answer highlighted, Salesforce clears static variables between test methods intentionally[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/391260/queueable-test-class#:~:text=,in%20test%20setup%2C%20run%20fifteen). This means if you set a static variable in one test method, it won’t hold the value in the next test method. This is good; it prevents tests from depending on each other. But be aware: if you were trying to use a static variable in a @TestSetup to pass data to tests, it won’t work for more than one test[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/391260/queueable-test-class#:~:text=but%20this%20only%20works%20if,which%20testmethods%20execute%20is%20inderterminate). Instead, use the database as the storage (i.e., insert records in testSetup, query in tests).
  
* **SOQL vs Hardcoding IDs**: Avoid hardcoding IDs of records in tests (like a particular record Id from your dev org). Those IDs won’t exist in other environments. Instead, query or create needed records. Salesforce provides some utility methods: for example `Test.getStandardPricebookId()` returns the standard price book Id in that org, which is useful if your Opportunity insertion needs PricebookId.
  
* **Creating Users**: If your code involves running as different users or checking profile/permissions, you can create User records in tests (with SeeAllData=false you can’t see real Users except current). There are some quirks (like you can’t directly insert a User without required fields like RoleId in a test). Use test utility or an existing user if possible. For example, if your integration posts Chatter as a specific user, you might use `System.runAs()` with a dummy user to test that context.
  
* **Test Data Volume**: Keep test data minimal but sufficient. E.g., to test 200 records bulk, you create 200, that’s fine. But don’t create thousands unnecessarily, it slows tests. The goal is to cover logic, not performance test (performance testing can be separate).
  
* **Isolation from External Services**: We already ensure callouts are mocked, so no external data needed. If any test inadvertently tries to call out without mock, it will fail – so always set up mocks for any test that triggers callouts.
  
* **No Commit – so no Rollback needed**: All DML in tests are rolled back by Salesforce, so test methods don’t have to worry about cleaning up. In fact, as Rakesh Gupta’s blog notes, “Since tests don’t commit, you don’t have to delete any data”[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,have%20to%20delete%20any%20data). This is a nice feature: your tests can create dummy Accounts, etc., and not pollute the real org data.
  
* **Test Data Best Practices**: Create data that realistically triggers your business logic. For example, ensure required fields are filled (or else your triggers might fail on validation rules). You might need to disable certain validations if they interfere with tests – but better is to satisfy them in test data (e.g., if Opportunity has a custom required field, set it in the test data).
  
* **Comments and Clarity**: Write comments in test classes explaining what is being tested and the assumptions[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,Never%20test%20your%20entire). This is helpful for future maintainers. Given this is a long-term integration, having clear tests is important for ongoing reliability.
  

In summary, proper test data setup (using @TestSetup and building all necessary records in-memory) and relying on Salesforce’s isolation will make our tests deterministic and repeatable in any org (sandbox or prod). We won’t have tests that “pass on sandbox, fail in prod” due to missing data, because we provide everything needed within the test itself.

### **2.7 Mock Frameworks and Test Isolation Techniques**

Beyond HTTP callouts, we might have other scenarios to mock or isolate in tests. For example, if our integration code uses a custom Apex interface for external service calls, we can inject a fake implementation during tests. Also, test isolation and independence are crucial for a large suite. Some points:

* **Use of Stub API**: Salesforce has an Apex Stub API (`Test.createStubInstance` etc.) that allows you to create a mock implementation of an interface. If our design is such that, say, `IQuickBooksService` is an interface with method `createInvoice(opportunity)`, and in production we have `QuickBooksService` implementing it to perform callouts, we can in tests do:
  
    ```java
    QuickBooksService stub = (QuickBooksService) Test.createStubInstance(QuickBooksService.class);
    // optionally, use StubProvider to define behaviors for methods if needed.
    ```
    
    And then perhaps inject that stub into the trigger handler (maybe via a setter or using a subclass that overrides a method to return stub). This gets complicated, but it’s a powerful technique for decoupling logic from callouts or static methods. If not already architected, we might skip this and rely on simpler HttpCalloutMock.
    
* **Mocking Database Operations**: Generally not needed because we control the data in tests. But if we had static methods that do complex calculations, you just call them in tests with known inputs.
  
* **Email and Future Callouts**: If the integration sends emails or uses Platform Events, note that sending emails in tests is not allowed (it won’t send actual email, but also there’s a limit of 10 email sends in test context). If your integration sends an email alert on failure, the test might hit that if done 10 times. That’s fine – just be aware, or use the `Limits.getEmailInvocations()` to assert an email was attempted to be sent once and not exceed limits. There is no need to “mock” email sending; just test that the email record is created by querying `Messaging.EmailMessage` maybe, or simply ensure no exceptions.
  
* **Parallel Test Execution**: Salesforce may run test classes in parallel if you run all tests at once (especially in prod validation). Ensure your tests do not depend on global state that could conflict. For example, if you used a custom setting for the integration toggle and your test changes it, that could affect another test in another class if running simultaneously. Since tests have separate transactions, they shouldn’t conflict on data, but static variables are per Apex context – however, parallel tests run in separate contexts, so that’s fine. The main risk is if using real org data (which we are not).
  
* **Faker Data for External**: If needed, you can use third-party libraries (like a JSON faker) in tests to generate random but plausible data to test robustness. Not strictly needed here.
  
* **Continuous Integration**: If using CI to run tests on each commit, ensure the test suite remains stable (no order dependency). Because of isolation and not relying on external data, our tests should run consistently in any order. The Salesforce test runner randomizes order of execution of test classes, so they need to be independent.
  
* **Performance of Tests**: Sometimes writing too many tests or very heavy tests can slow down deployment (since all tests run). We aim for effective tests but also efficient. Using testSetup is one way we did to optimize. Also avoid unnecessary `System.debug` in tests – they don’t count in coverage but still consume log size and processing (though they are ignored from coverage perspective[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=,is%20covered%20by%20unit%20tests)). For large inserts (like 200 opps), that’s fine, but maybe no need to insert 200 if 50 would cover logic; however, 200 is realistic upper bound. It’s a trade-off: we prefer realistic bulk to catch issues.
  
* **Cleanup Static Config**: If any of our code uses Custom Settings or Custom Metadata (like a flag “IntegrationEnabled”), if tests change that, they should reset it. Custom Settings data is not rolled back automatically if used via `SeeAllData=true`, but if created in test context with false, it’s isolated. If using a Hierarchy custom setting accessible without seeAllData, be careful. Usually better to not depend on that in tests; or if you do, manually reset in a finally block (but again, that data is rolled back as it’s created in test context).
  
* **Parallel Execution Consideration**: On a related note, the org’s overall code coverage does not include managed package tests unless you specifically run them (and if you did run all tests including managed, the coverage might include them which can be confusing). Typically we run local tests only, so that’s fine. Just be aware that if someone accidentally ran with managed tests, it could incorporate them. But since our integration doesn’t involve installed packages in test, not an issue.
  

To conclude Section 2: by applying these strategies, we will create a robust test suite that not only satisfies Salesforce’s 75% coverage deployment requirement[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Here%20I%20will%20explain%20the,those%20tests%20must%20complete%20successfully), but also ensures all integration functionalities (triggers, async jobs, callouts) behave as expected in various scenarios. This will significantly reduce the need for guesswork and manual troubleshooting in production. Next, we’ll configure the OAuth and API connection between Salesforce and QuickBooks (Section 3) with security and best practices in mind.

## Section 3: OAuth & API Integration

In this section, we document how to configure secure OAuth 2.0 authentication between Salesforce and QuickBooks Online, and how to handle API connections. We will set up a Salesforce **Connected App/Auth Provider** for QuickBooks (per 2025 standards), configure QuickBooks Developer settings (client ID/secret and redirect URI), and ensure our integration can obtain and manage OAuth tokens. We’ll also cover error handling for token failures, security best practices for sensitive credentials, and any required domain configurations (CORS, remote site) to allow the integration to function. The goal is a secure, seamless Authorization Code grant flow where users can authorize Salesforce to access QuickBooks, and our Apex can use the resulting tokens for API callouts.

### **3.1 Salesforce Connected App & Auth Provider Configuration (2025 Standards)**

To integrate via OAuth 2.0, Salesforce needs to know about the external Identity Provider (Intuit/QuickBooks in this case). We achieve this by setting up an **Auth. Provider** in Salesforce, which under the hood creates a Connected App that uses the OAuth client credentials from QuickBooks:

* **Create a QuickBooks App in Intuit Developer**: First, log in to the Intuit Developer Portal (https://developer.intuit.com) and create an app for QuickBooks Online. Choose “QuickBooks Online and Payments” as the platform for the app[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Create%20App). You will be asked to select scopes – choose scopes that include at least the accounting data access (often this is `com.intuit.quickbooks.accounting` scope) and any others needed (e.g., if using payments API, include that). After creation, you will be provided a **Client ID** and **Client Secret**[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Get%20Client%20Tokens). Save these – they will be entered into Salesforce. Also note the **Realm ID** (company ID) associated with your QuickBooks sandbox company; sometimes provided after connecting, or find it under “Keys & credentials”.
  
* **Configure Redirect URI in QuickBooks**: Intuit requires you to whitelist redirect URIs. In your app settings on Intuit, find where to add Redirect URIs[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Add%20Redirect%20URI). We will need to add the Salesforce-generated callback URL there. We don't have that URL yet, but it follows the format:
  
    ```
    https://login.salesforce.com/services/authcallback/<OrgId>/<ProviderName>
    ```
    
    if using production, or `https://test.salesforce.com/...` for sandbox, unless using MyDomain. Actually, when we create the Auth Provider in Salesforce, it will display the exact Callback URL. We will copy that and paste into Intuit app settings[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=Salesforce%20Partner%29%20%206,Kizzy). _Important:_ If you plan to have separate sandbox and production Intuit apps (not strictly necessary, but sometimes done), ensure each app’s redirect matches the respective org’s callback. Intuit allows multiple redirect URIs per app, so you could include both sandbox and prod URLs in one Intuit app if desired.
    
* **Set Up Auth Provider in Salesforce**: In Salesforce Setup, navigate to **Auth. Providers** (under Security or Quick Find “Auth”). Click **New**. For **Provider Type**, select **OpenID Connect** (Intuit supports OpenID Connect on top of OAuth 2.0)[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=4,Kizzy). Fill the following:
  
    * **Name**: e.g., “QuickBooks” (this will form part of the callback URL and the named credential reference).
      
    * **URL Suffix**: e.g., “QuickBooks” (auto-filled from Name, can adjust if needed).
      
    * **Consumer Key**: Enter the QuickBooks **Client ID** obtained earlier[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=3,Top%20Salesforce%20Partner%29%20%20111).
      
    * **Consumer Secret**: Enter the **Client Secret**[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=3,Top%20Salesforce%20Partner%29%20%20111).
      
    * **Authorize Endpoint URL**: For QuickBooks OAuth2, use `https://appcenter.intuit.com/connect/oauth2` (Intuit’s authorization URL where user logs in) – Intuit’s docs or discovery document confirms this.
      
    * **Token Endpoint URL**: For QuickBooks, use `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer` (the endpoint to exchange auth code for tokens, and refresh tokens). Intuit’s discovery document provides these, but as of 2025 this is correct.
      
    * **User Info Endpoint URL** (optional for OpenID scope): You can leave blank or if you plan to get user profile info, use `https://accounts.platform.intuit.com/v1/openid_connect/userinfo`.
      
    * **Default Scopes**: specify the scopes like `com.intuit.quickbooks.accounting openid profile email` as required. (If you include openid and profile, QuickBooks will return user info, not mandatory unless needed).
      
    * **Send access token in header** (checkbox): Typically yes (Intuit expects `Authorization: Bearer <token>`).
      
    * **Token Issuer**: leave blank (for custom providers).
      
    * **Logout URL**: not critical; can put Intuit logout if desired.
      
    * **Icon**: optional, you can upload QuickBooks logo.
      
    
    Save the Auth Provider. Salesforce will generate the **Callback URL** (Redirect URL) for you[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=Salesforce%20Partner%29%20%206,Kizzy). Copy this URL. It will look like: `https://login.salesforce.com/services/authcallback/<OrgID>/QuickBooks` (if your org has MyDomain, it will use that domain, e.g., `https://<yourdomain>.my.salesforce.com/services/authcallback/...`). **Now, go back to Intuit Developer portal and add this URL to the app’s Redirect URIs list**[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=Salesforce%20Partner%29%20%206,Kizzy), then save the Intuit app settings.
    
    **Note:** If you are configuring this in a sandbox first: the callback will have `https://test.salesforce.com` (or your sandbox domain). You’ll need to add that. Later, for production, you must add the production callback in Intuit as well. It’s often easiest to plan ahead by adding both the sandbox and production callbacks to the Intuit app from the start. Intuit allows multiple redirect URIs.
    
    Once Auth Provider is set, Salesforce creates a Connected App behind scenes. You can verify under **Connected Apps** that one exists for QuickBooks with the consumer key/secret you entered (it’s essentially linked).
    

_Salesforce Auth. Provider configuration for QuickBooks OAuth 2.0 (OpenID Connect). In the **New Auth Provider** screen, enter the Intuit QuickBooks Consumer Key & Secret and appropriate endpoints. Salesforce will handle the OAuth flow and token exchange, and provide a Callback URL to use in QuickBooks app settings._

* **Create Named Credential**: With the Auth Provider in place, create a **Named Credential** in Salesforce to use in Apex callouts. Go to **Setup -> Named Credentials**. Click **New**. Fill in:
  
    * **Name**: e.g., `QuickBooks` (this will be used as `callout:QuickBooks` in Apex URLs).
      
    * **URL**: The base URL for QuickBooks API. For QuickBooks Online Production, it’s `https://quickbooks.api.intuit.com` and for Sandbox company data, it’s `https://sandbox-quickbooks.api.intuit.com`. We can parameterize the realm/company ID in the path, so base URL would just be `https://sandbox-quickbooks.api.intuit.com` for development. (Alternatively, use the production base and Intuit will route sandbox data by realmId – but Intuit usually separates sandbox base URL).
      
    * **Identity Type**: select **Named Principal** (one set of credentials for the org)[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=8,we%20will%20create%20a%20custom).
      
    * **Authentication Protocol**: choose **OAuth 2.0**[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=1,we%20will%20create%20a%20custom).
      
    * **Auth Provider**: select the QuickBooks Auth Provider you created (e.g., “QuickBooks”)[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=1,we%20will%20create%20a%20custom).
      
    * Scope: (optional) you can specify scopes here too, but it should inherit from Auth Provider settings. Ensure it includes needed scopes like `com.intuit.quickbooks.accounting`.
      
    * Start Authentication Flow on Save: checked (so that it immediately prompts to authenticate).
      
    * Generate Authorization Header: checked (this means Apex callouts using this named credential will automatically include `Authorization: Bearer <token>` header, which QuickBooks API expects).
      
    
    Save the Named Credential. Now, Salesforce will show an **“Authenticate”** status button. Click **Authenticate** – it will redirect you (the admin) to Intuit’s OAuth login page. Log in with your QuickBooks developer sandbox credentials and authorize access for the app. After granting access, you’ll be returned to Salesforce and the Named Credential’s “Authentication Status” should update to **Authenticated**[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=Partner%29%20Image%3A%20Salesforce%20Integration%20,Top%20Salesforce%20Partner). This means Salesforce obtained an Access Token (and a Refresh Token stored behind the scenes) for the QuickBooks API.
    

_Salesforce Named Credential configuration for QuickBooks integration. This shows a Named Credential using OAuth 2.0 with the previously created Auth Provider. Once saved and authenticated, Salesforce stores the access and refresh tokens, enabling Apex callouts to QuickBooks via the Named Credential._

At this point, you have a secure connection setup. In Apex, any callout to `callout:QuickBooks` (the Named Credential) will automatically insert the OAuth token in the header, and Salesforce will handle refreshing the token when expired. You do not need to manually handle token storage/refresh in Apex when using Named Credentials – Salesforce does it.

* **Security Considerations**: The Client Secret is stored encrypted in the Auth Provider/Connected App settings in Salesforce. Only users with appropriate permissions can view it. The tokens Salesforce obtains are stored in a protected way (not directly visible). Ensure the Named Credential is marked as “Secure” by using the provided OAuth mechanism (which it is). Do not hard-code Client Secrets or tokens in Apex code or config, always use the Named Credential reference.
  
* **Profiles/Permission for Named Credential**: By default, Named Credentials (and Auth Providers) can be used by admin users. If integration runs under a specific Integration User, ensure that user’s profile has access to the Named Credential/Connected App. This might involve checking “Permitted Users” setting on the Named Credential. For Named Principal, all users use the same creds, so it’s fine. But ensure no profile restrictions block callout access. Often, you must go to the Connected App (created by Auth Provider) and set it to “Admin approved users are pre-authorized” and add the profile or permission set for your integration user there. This avoids having to individually allow the user. In our case, the integration likely runs in system context (trigger -> queueable runs as automated process or current user). If it runs as current user and multiple users need to use it, you might consider making the connected app admin-approved.
  
* **Multiple Companies (RealmIDs)**: QuickBooks tokens are tied to a specific QuickBooks company (realm). The integration as planned likely connects one Salesforce org to one QuickBooks company (realm). The RealmID is returned with the OAuth callback (as a URL param)[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Add%20Redirect%20URI). Salesforce’s Auth Provider might capture it – there’s a setting “Include Organization ID in Callback” but that’s for Salesforce’s org. Instead, we will likely get the realmId in the redirect and it becomes part of the access token context. If needed, store the realmId (company ID) in a custom setting for use in API calls (like constructing the URL). Actually, the Named Credential URL can include the realmId if we set it. A pattern: we could store realmId in a Custom Metadata (as Kizzy blog suggests)[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=1,endpoint%20URL%20in%20Custom%20metadata). For simplicity, you might manually find your QuickBooks sandbox company’s realmId (in QuickBooks, under settings -> account info, or from the redirect URL it returns with code and realmId). Then in Apex, when calling, use that realmId.
  
    Alternatively, QuickBooks API endpoints require realmId either in URL or as a header. Typically, it’s in the URL path: e.g., `.../v3/company/<realmId>/customer`. So we must know it. If only one realm, it can be a constant configured. If multiple QuickBooks companies to integrate, that complicates, but not in our scope (likely one).
    
    In our configuration, we might do: Named Credential URL: `https://sandbox-quickbooks.api.intuit.com/v3/company/<realmId>` and then in Apex, call endpoints like `callout:QuickBooks/customer?minorversion=65`. This would hit: `https://.../v3/company/1234567890/customer?minorversion=65` (with 1234567890 as realmId). One approach is to include the realmId in the Named Credential URL itself (since it’s constant for one integration). Or store it in a Custom Setting and append in Apex. Either is fine. The Kizzy example stored it in custom metadata and appended[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=1,endpoint%20URL%20in%20Custom%20metadata), which gives flexibility if realmId changes (rarely changes).
    
* **Verification**: After authenticating, test that the Named Credential works: use **Anonymous Apex** to call a simple QuickBooks API (like query company info). For example:
  
    ```java
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:QuickBooks/v3/company/<realmId>/companyinfo/<realmId>?minorversion=65');
    req.setMethod('GET');
    Http http = new Http();
    HttpResponse res = http.send(req);
    System.debug(res.getStatusCode() + ' ' + res.getBody());
    ```
    
    Run this in Execute Anonymous (in sandbox first). If configured right, status should be 200 and body returns company details JSON. If there’s an auth issue, you’d get 401. This quick test ensures everything is set up. (Replace `<realmId>` with actual ID or if you already included it in Named Credential URL, adjust accordingly.)
    
* **Production Deployment**: The Auth Provider and Named Credential can be deployed via change set like any metadata. But after deployment to production, you will need to **re-authenticate** in production (the token from sandbox won’t carry over). So plan a step: post-deployment, log into production, go to Named Credential, and click “Authenticate” to connect to QuickBooks production company (or sandbox company if you use sandbox tokens in production – not recommended, better to connect to the production QuickBooks company or a separate Intuit sandbox for prod test). Ensure the Intuit app’s redirect includes the production callback as mentioned. Once authenticated in prod, verify by a quick callout test as above (maybe using Workbench or anonymous Apex) that you can retrieve data.
  

By following these steps, we have securely connected Salesforce to QuickBooks without exposing sensitive credentials in code and using Salesforce’s built-in OAuth handling to manage tokens.

### **3.2 QuickBooks OAuth 2.0 Setup and Redirect URI Configuration**

From the QuickBooks side, ensure the OAuth 2.0 configuration is correct:

* **App Type**: The app created on Intuit Developer should be set to **OAuth 2.0 (Authorization Code)** flow – which it is by default for QuickBooks Online apps. Intuit no longer uses OAuth 1.0 for new apps, so OAuth 2.0 is the standard[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/faq#:~:text=QuickBooks%20API%20OAuth%202,users%C3%A2%E2%82%AC%E2%84%A2%20QuickBooks%20Online).
  
* **Redirect URIs**: We must list all possible Salesforce callback URLs. Typically, for a production org with MyDomain: `https://<mydomain>.my.salesforce.com/services/authcallback/<OrgId>/<ProviderName>`. Also include the login.salesforce.com version, and test.salesforce.com if using sandbox. E.g., if MyDomain is deployed, the callback might actually use the MyDomain, but to be safe, add both MyDomain and generic domain versions. The Intuit app allows multiple entries.
  
* **Environment (Sandbox vs Production)**: Intuit’s keys (Client ID/Secret) can have two sets: one for development (sandbox) and one for production. Usually, Intuit gives you one set and you toggle the environment in settings. QuickBooks Online has the concept of sandbox companies vs production companies, but they use the same OAuth endpoints, just different base URL for API calls. Therefore, we don’t necessarily need separate client IDs for sandbox vs prod usage of the integration. We can use the same Intuit app (client ID/secret) to connect to either a QuickBooks sandbox company or a real company. It’s often wise to test with a sandbox company (Intuit provides one) before connecting a live company.
  
* **Realm ID capture**: When a user authorizes, Intuit will redirect with a `code` and `realmId` as URL parameters[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Add%20Redirect%20URI). The Salesforce Auth Provider will grab the code to exchange for token. It does not automatically store realmId. We should capture it manually if needed. One way: after authentication, check the Named Credential’s endpoint usage. Alternatively, as part of initial setup, you could create a small Apex to call `Auth.AuthToken.getAccessToken(AuthProviderId, orgId)` which might return an AuthToken object containing the latest token and possibly the identity. However, simplest: log the realmId from the redirect during initial auth (copy from URL) and store in a Custom Setting (Integration Configuration).
  
* **QuickBooks App Permissions**: Ensure the app has all required scopes. For example, to create and read customers and invoices, the `com.intuit.quickbooks.accounting` scope covers a broad range of accounting data (customers, invoices, payments, etc.). If using QuickBooks Payments API, include `com.intuit.quickbooks.payment` as well. If not, don’t include unnecessary scopes. Also, the user who authorizes should be an admin on the QBO company, otherwise they might not have permission to grant certain scopes.
  
* **Token Durations**: Intuit’s Access Tokens expire (usually in 1 hour), and they provide a Refresh Token that lasts longer (e.g., 90 days, with continuous refresh possible). Salesforce Named Credential will automatically use the refresh token to get a new access token when needed. But note: If 90 days pass without any use or refresh, the token may expire and require re-auth. Also, if the user disconnects the app from QuickBooks side or changes their password if that invalidates tokens, re-auth is needed. We should inform the integration user or admin that they might need to re-authenticate the connection periodically (90 days) if no activity.
  
* **Revocation & Reconnect**: If a token is revoked or expires beyond refresh limit, any callout will start failing with 401 errors. Our code should catch 401 Unauthorized and handle it (see 3.4 Error Handling). Likely, we’ll log the failure and require manual re-auth. We could programmatically attempt an OAuth re-initiation, but it’s complex to do within Apex. Simpler: send an alert to admin to re-auth the Named Credential via UI.
  
* **Multiple Users vs Single**: Our Named Credential is Named Principal – meaning every callout uses the one connected QuickBooks account (the one we authenticated with). If we wanted user-specific QuickBooks connections (like each Salesforce user connecting with their own QBO credentials), that’d be a different approach (per-user authentication via OAuth with scope refresh per user). That’s not needed here; a single integration user is fine to handle all transactions.
  
* **Connect in Production**: When migrating to production, you have two options: use the same Intuit Developer app (client ID/secret) and just add prod redirect, or create a separate Intuit app for production. Many choose to use the same, so that the difference between sandbox and prod is just which QuickBooks company is connected. If your sandbox was connected to a QuickBooks sandbox company, for production you’ll connect to the real QuickBooks company. The tokens and realmId will differ, but the integration code remains the same.
  

To summarize, QuickBooks OAuth2 setup involves registering Salesforce’s callback, obtaining client credentials, and ensuring we handle realmId. By using Salesforce Auth Provider + Named Credential, most of the heavy lifting (token exchange and refresh) is done by Salesforce following 2025 best practices[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=8,we%20will%20create%20a%20custom). This reduces custom code and enhances security.

### **3.3 API Authentication Flows and Token Management**

Our integration will use the **OAuth 2.0 Authorization Code flow**:

1. **User Authorization**: An admin (or integration user) initiates an authorization by clicking “Authenticate” on the Named Credential, which redirects to Intuit. The admin logs in and grants permission to the Salesforce connected app.
   
2. **Authorization Code Grant**: Intuit sends a one-time auth code (and realmId) back to Salesforce’s callback URL.
   
3. **Token Exchange**: Salesforce (Auth Provider) automatically exchanges the code for an **Access Token** and **Refresh Token** via the token endpoint[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=Add%20Redirect%20URI)[newfangled.com](https://www.newfangled.com/connecting-salesforce-quickbooks-oauth/#:~:text=%2F,). This is stored in Salesforce (Connected App token storage).
   
4. **Token Storage**: Salesforce associates the tokens with the Named Credential. The Access Token is typically valid ~1 hour. The Refresh Token can be used to get new access tokens for a longer period (e.g., 90 days, or until revocation).
   
5. **Authenticated Callouts**: When Apex makes a callout using the Named Credential, Salesforce injects the current Access Token in the Authorization header automatically[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=,If%20the). If the Access Token is expired, Salesforce will use the Refresh Token to fetch a new Access Token (this happens behind the scenes on the first failed attempt).
   
6. **Token Refresh Logic**: With Named Credential, you do not need to manually call the token endpoint to refresh – Salesforce will do it. However, note that this happens only when a callout is made and the current token is expired. If no callouts occur for a long time, the refresh token might expire. So a best practice is to periodically call a trivial QuickBooks API (like get company info) to ensure the token stays fresh within the 90-day window if the integration could go idle for long periods. Alternatively, re-auth manually every so often.
   
7. **Multiple Org Connections**: If multiple Salesforce orgs connect to the same Intuit app, each will have its own tokens. This should be fine as long as Intuit app is configured to allow multiple connections (which it does). For our case, one org, one connection.
   
8. **Revocation**: If needed, Intuit provides a revocation endpoint to revoke tokens. Salesforce doesn’t call that by default unless user explicitly clicks “Disconnect” or deletes the Named Credential. If the integration is no longer needed, an admin should delete the Named Credential or use the Auth Provider “Test Only Initialization URL” to revoke.
   

**Manual Token Management (for understanding)**: If we were not using Named Credential, we would have to manually do the above steps in Apex:

* Create a custom Connected App with callback to a custom VF or web endpoint.
  
* Capture the code, call token endpoint via HttpRequest (with basic auth containing client secret).
  
* Store the access/refresh tokens in a Custom Object or Custom Setting.
  
* Use them in callouts (set header manually).
  
* Detect expiration (401 responses), then call refresh token endpoint to get new token, update storage.
  
* Handle token encryption because storing refresh token in plain text is sensitive.
  

Thankfully, Salesforce’s Named Credential with OAuth offloads all this complexity. It’s considered a best practice in 2025 to use Named Credentials for any external OAuth integrations[omnitoria.io](https://omnitoria.io/quickbooks-integration-with-salesforce#:~:text=Quickbooks%20Integration%20with%20Salesforce%20,realm%20or%20companyId%7D%2F). It also means our Apex code can simply call `HttpRequest.setEndpoint('callout:QuickBooks/...')` and not worry about auth details – making code cleaner and more secure.

We should still understand Intuit’s token JSON structure: on exchange, Intuit returns JSON like:

```json
{
  "access_token": "eyJh... (jwt) ...",
  "refresh_token": "AB115....",
  "token_type": "bearer",
  "x_refresh_token_expires_in": 87240 (seconds),
  "expires_in": 3600
}
```

Salesforce will handle parsing that. Named Credential likely stores refresh token encrypted and not accessible to us. If needed, we could use `Auth.AuthToken` Apex class methods to retrieve tokens, but that usually requires the Connected App be set to allow token retrieval. Unless necessary, we can treat it as a black box and trust Salesforce.

**Using the Token in Apex**: Confirm that our Named Credential is referenced by name in callouts. For example:

```java
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:QuickBooks/v3/company/1234567890/invoice?minorversion=65');
req.setMethod('POST');
req.setBody(jsonBody);
Http http = new Http();
HttpResponse res = http.send(req);
```

Because we used `callout:QuickBooks`, Salesforce will:

* Replace it with the URL defined in Named Credential (like `https://sandbox-quickbooks.api.intuit.com`).
  
* Add the path (`/v3/company/...`).
  
* Add the header `Authorization: Bearer <CurrentAccessToken>`.
  
* If the current token is expired or invalid, attempt one refresh using the stored refresh token (which hits Intuit’s token endpoint behind scenes). If that succeeds, update token and proceed with call.
  
* If refresh fails (e.g., refresh token expired), the callout will return 401 and our Apex will get a 401. We then know manual re-auth is needed.
  

Thus, the flow in operation is:

* On first use or after long idle, possibly a slight delay if a refresh is needed, but code doesn’t see that – just sees the final response of the actual API call.
  

**Important**: Named Credential runs the OAuth flow under the context of the user who clicks “Authenticate”. If that user’s account is disconnected or the user is inactivated, tokens might still work (they aren’t tied to SF user after issuance, only to QBO user). But typically an integration user is used and kept active.

**Salesforce API Consideration**: The integration doesn’t involve Salesforce’s own APIs (except that we might use Salesforce’s APIs for deployment or data checks). The mention of API version compatibility in Section 1.5 was more about SF Apex API version and QuickBooks API version. Here in OAuth, just ensure we use the latest OAuth endpoints (which we are).

### **3.4 Error Handling for OAuth Failures**

Even with the robust setup, things can go wrong with OAuth:

* **Expired/Revoked Tokens**: If QuickBooks refresh token expires (90 days of inactivity or manually revoked), Salesforce cannot refresh and will get an HTTP 400/401 on attempt. In such case, our integration callouts will start failing. We should detect this scenario:
  
    * QuickBooks API might return a specific error in body like `AuthenticationFailed` or an `invalid_token` message. If our Apex call receives a 401, our code (in the Queueable or trigger context) should catch that and log an error indicating an auth issue.
      
    * Possibly differentiate from other 401 reasons (though with single integration user, 401 likely always means token problem, unless QuickBooks user permissions changed).
      
    * We could implement a mechanism: if we catch a 401, we do not retry further callouts in that execution (because if token is bad, further attempts will also fail). Instead, log an error and perhaps send an alert (email to admin or create a task).
      
    * The log could say "QuickBooks authentication token expired or revoked. Please re-authenticate the integration." This message directs admin to go to Named Credential and click Re-Authenticate (or update secret if needed).
    
* **OAuth Flow Errors**: During initial connection, errors might occur (e.g., user presses “Deny” on permission). In that case, the Named Credential won’t become Authenticated. The admin will have to attempt again. If a specific error parameter is returned, Salesforce shows it on screen typically. Not much to handle in Apex since it happens interactively.
  
* **Scope Issues**: If we attempt an API outside the granted scopes, QuickBooks may return a 403 or error saying not authorized. For instance, if we didn’t request `Payments` scope but call a payments API, we’ll get an error. This should be caught as an integration error. The solution is to ensure scopes are correct upfront. If such an error appears in logs, it likely means we need to adjust scopes and have the admin re-connect with broader scopes.
  
* **Intuit Service Downtime**: If QuickBooks OAuth endpoint or API is down, callouts might fail with timeouts or 500 errors. Our code should handle HttpResponse status >=500 gracefully by retrying later (see Section 4.4 on retry). For OAuth errors specifically, if token refresh fails due to Intuit downtime, it might recover on next attempt. The Named Credential will attempt refresh each time a callout is made and finds token expired. So possibly a subsequent call might succeed.
  
* **User Revocation**: If the QuickBooks user who authorized (their Intuit account) is deactivated or removed from the QuickBooks company, the token might be revoked. This is similar to general revocation – 401 will result. The solution is the same: a new user with access must authenticate.
  
* **Security Events**: If Intuit suspects a breach and invalidates tokens, again it’s the same flow: 401, re-auth needed.
  
* **Salesforce Session vs Named Cred**: Note, Named Cred tokens are not tied to Salesforce sessions, so Salesforce session expiration doesn’t affect it.
  

**In-code Error Handling**:

* For each callout made in Apex, wrap in try-catch. If HttpResponse.getStatusCode is 401 or 400 with an auth error message:
  
    * Log a specific error message (maybe update an Integration Setting object status).
      
    * Optionally, you could flip a Custom Setting like “Integration_Active__c = false” to prevent further trigger actions until fixed (so we don’t keep hitting errors). But that requires logic to check that flag. It might be safer to do that to avoid flooding QuickBooks with repeated failures.
      
    * Notify admins: Since this is critical (integration halted), consider sending an email to admin or system owner. You can use `Messaging.SingleEmailMessage` in Apex to send an alert (just ensure to limit frequency, perhaps one per detection and then not again until fixed).
    
* Document in runbook: "If integration log shows auth failure, re-connect named credential."
  

**Manual Re-Authentication**:

* In Salesforce, an admin can go to the Named Credential and click “Authenticate” again to re-initiate OAuth. Alternatively, they might have to click “Clear Token” if available (in newer Salesforce UI, connected apps have an option to revoke token). But simply re-auth should get a fresh token and refresh token.
  

**CORS and Domain Configuration Requirements**  
This part is about ensuring the web domains are allowed for communication:

* If any part of integration would involve Lightning Components making direct JS calls to QuickBooks (unlikely, we do server-side callouts), we’d need to set up CORS whitelist for the QuickBooks API domain. But since we use Apex callouts, CORS doesn’t apply.
  
* **Remote Site Settings**: As mentioned, if not using Named Credential, we’d need a Remote Site. But we have Named Cred which bypasses the need. However, one scenario: If the Node middleware calls into Salesforce (e.g., using a Salesforce API or sites endpoint), then the Node’s domain might need to be added to Salesforce CORS or CSP trust depending on how it interacts. Our context doesn’t mention Node calling SF, just SF calling Node. So skip that.
  
* **Salesforce Sites/Experience Cloud**: If for some reason we hosted a web service on Salesforce (like a callback endpoint), we’d worry about domain, but we use Salesforce’s provided callback mechanism for OAuth.
  
* The **Auth Provider Callback** uses Salesforce domains, so that’s fine. Just ensure if MyDomain is enabled, your callback uses it properly (some older Salesforce doc said for Named Credential, better to use login.salesforce.com instead of custom domain to avoid issues if user not logged in – but when user initiates, they are logged in. It should work. If not, use alternate login flow).
  
* **Node Middleware Domain**: If we do call Node (say it’s hosted on AWS at api.myorg.com), if we call directly via Http from Apex, we either use Named Credential or remote site. We could set up a Named Credential for Node too (with maybe no auth or basic auth if needed). If Node expects an API key, we can store that in Named Cred password or as custom header. This is more of architecture in Section 4. If using Named Credential for Node (which is advisable for same reasons), we’d have to configure it similarly (less complex since maybe JWT or basic).
  
* **Locking down QuickBooks Connected App**: On Intuit side, CORS settings not applicable. On Salesforce side, the Connected App (for Auth Provider) could have IP restrictions, etc., but not needed here.
  

In summary, for domain configuration:

* We have added Salesforce’s domain to Intuit redirect allowlist.
  
* We ensure QuickBooks API domain is reachable. Salesforce callouts to HTTPS on standard ports are allowed by default (no need to whitelist external domains beyond remote site or named cred, which we did).
  
* Named Credential implicitly whitelists the domain (no separate remote site needed).
  
* No Lightning component direct calls, so no CORS needed.
  

### **3.5 Security Best Practices for API Keys and Tokens**

Security is paramount given we’re dealing with financial data access:

* **Never Hard-Code Secrets**: We did not hard-code Client ID/Secret in Apex; they are stored in Auth Provider config securely[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=3,Top%20Salesforce%20Partner%29%20%20111). The refresh/access tokens are stored by Salesforce and not visible to us directly. This is good. If we had to handle tokens, we’d store in protected Custom Settings with Encryption or mark fields as protected (in custom metadata) – but we avoided that entirely by using platform features.
  
* **Principle of Least Privilege**: The QuickBooks app’s scopes determine what data can be accessed. We should not request more scopes than needed. If we only need accounting data, we didn’t include payroll or other scopes. Also, the integration user in Salesforce can be a dedicated user with minimal permissions (only needs to trigger the integration and read/write to integration custom objects). By using system context triggers/queueables, we often don’t need user perms, but giving the integration user access only to what’s required (Opportunity and perhaps a custom Integration object) is wise. If using a Named Principal, all runs as that one QuickBooks account, so on QuickBooks side, ensure that account is limited to what’s necessary (but usually an admin is needed to create transactions).
  
* **Secure Storage**: The Named Credential’s sensitive data is encrypted at rest by Salesforce. We should also consider backing up the token if re-auth is burdensome, but better not to – treat it as ephemeral and just re-auth via UI if needed.
  
* **Logging Sensitive Info**: Avoid logging the actual tokens or any PII. Our debug logs or error logs should not print the access token or refresh token. If we capture an error message from QuickBooks that contains any personal data, be mindful. Usually error messages are generic. If writing to a custom log object, avoid storing full payloads if they include sensitive fields (like full credit card numbers – though QBO shouldn’t return those, they tokenize).
  
* **Certificates**: Not applicable for OAuth, but ensure we use HTTPS always (which we do).
  
* **Session Settings**: The connected app (Auth Provider) can be configured to require users to re-login if needed. We generally keep offline access (refresh token) to avoid frequent re-logins.
  
* **Audit**: Salesforce Setup’s Connected App OAuth Usage can show which user authorized and when last used. Monitor that for anomalies. Intuit Developer dashboard also might log usage.
  
* **Encryption**: If QuickBooks returns sensitive data (like personally identifiable info), consider storing it in encrypted fields in SF if needed. For example, if we pull customer tax ID or something, consider Shield Platform Encryption for those fields. Evaluate compliance requirements for financial data in CRM. This is more on data architecture side.
  
* **Limit Exposure**: The Node middleware (if used) should also secure any API keys if it holds them. Possibly out of scope for SF doc, but mention: ensure the Node app’s environment stores the QuickBooks client secret securely, and any SF credentials if used.
  

By adhering to these security best practices, we mitigate risk of credential leakage and unauthorized access, thereby protecting the integrity of both Salesforce and QuickBooks data.

### **3.6 CORS and Domain Configuration Requirements**

_(Note: This is likely less relevant as we are doing server-server integration, but we address it for completeness.)_

**CORS (Cross-Origin Resource Sharing)** primarily matters if a client-side script (like a Lightning Component in Salesforce) tries to call an external API directly from the browser. In our design, all calls to QuickBooks are made from Apex on the server side, so CORS does not come into play for QuickBooks API. The browser is not directly contacting the QuickBooks domain. Therefore, we do **not** need to add QuickBooks domains to Salesforce’s CORS whitelist for this integration.

However, if in the future the integration expands to maybe include a Lightning component that calls a Node.js middleware via JavaScript (e.g., using fetch to call `https://api.mycompany.com` from a Lightning component), then:

* We would need to add `https://api.mycompany.com` (the Node’s domain) to the **CORS Allowlist** in Salesforce Setup (under Security -> CORS). This allows the Salesforce page to call out to that domain from the browser.
  
* Also ensure the external service (Node) returns proper CORS headers (`Access-Control-Allow-Origin: https://<your SF domain>`, etc.).
  

For our current scope, since Apex callouts handle everything, we only worry about Salesforce’s own domain and the remote endpoints for callouts:

* We configured the remote endpoint via Named Credential (which implicitly handles cross-domain callouts at server side, not subject to CORS).
  
* **Content Security Policy (CSP)**: If we have Lightning components, and if they were to render any QuickBooks content or make calls, CSP might block if not configured. But again, not in current design.
  

**Domain Configuration**:

* We already configured the **Auth Provider callback domain**. If your Salesforce org has a My Domain (which all should by 2025 because it’s required), the callback uses that domain. That’s fine as long as it’s added to Intuit. If you ever change your My Domain, you’d have to update the Intuit redirect URIs list accordingly.
  
* If using a custom domain for the Node service in Named Credential, note that Named Credential requires the exact domain to match. If Node’s cert is not signed by a major CA (should be, if using SSL), Salesforce might error on callout (self-signed wouldn’t work unless you import cert). So ensure any custom endpoint has a valid SSL certificate.
  

**Remote Site Setting for Backup**: Although Named Credential should suffice, it’s sometimes recommended to also add the domain to Remote Site Settings if you face issues in older Apex code that might not use named cred. In our case, all integration callouts should use the named cred, so remote site not needed. We can add one as a fallback (Salesforce might throw an error if some callout is attempted outside named cred context). To be safe, create a remote site for `https://quickbooks.api.intuit.com` and `https://sandbox-quickbooks.api.intuit.com` as well, though with Named Credential it’s technically not required[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=When%20making%20an%20Apex%20callout,result%20in%20the%20callout%20failing)[breadwinner.com](https://breadwinner.com/quickbooks-salesforce-integration/apex-quickbooks-salesforce/#:~:text=1,com).

**Summary**: For our integration:

* No special CORS config is needed because no client-side calls.
  
* Named Credential covers domain whitelisting for server callouts.
  
* We have properly configured redirect URIs on Intuit side to include Salesforce domain.
  
* Just ensure if any errors occur with domain, double-check spelling (e.g., sometimes `sandbox-quickbooks.api.intuit.com` vs `quickbooks.api.intuit.com`).
  
* If adding any external web integration pieces in future, revisit CORS and CSP settings.
  

This covers all the OAuth and connectivity setup. In Section 4, we will design the actual integration logic (triggers, queueables, data mapping) now that the plumbing (authentication and API access) is in place and tested.

## Section 4: Salesforce-QuickBooks Integration Architecture

This section details the technical design of the integration between Salesforce and QuickBooks Online. We cover how the trigger on Opportunity detects relevant stage changes, how it hands off processing to a Queueable Apex job for calling the external API, how data is transformed between Salesforce and QuickBooks formats, error handling and retry strategies, scheduled jobs for syncing payment status, and field mapping requirements. The architecture is designed to be robust (handling bulk records, avoiding hitting limits), scalable, and fault-tolerant so that failures in external calls can be logged and retried without data loss.

### **4.1 Opportunity Trigger Pattern for Stage Change Detection**

We will implement an **Opportunity after-update trigger** to detect when an Opportunity’s stage changes to a specific value (likely “Closed Won”) which indicates that an invoice should be created in QuickBooks (this assumption is based on common use-cases; adjust if the integration is triggered on a different stage or event):

* **Trigger Conditions**: In the Opportunity trigger, we only want to act when:
  
    1. `Trigger.isUpdate` (for stage change on update; possibly also handle `isInsert` if newly created Closed Won opps should sync immediately).
       
    2. The `StageName` has changed from something else to “Closed Won” (or to whichever stage signifies deal completion). We can compare `Trigger.oldMap` vs `Trigger.newMap` for each record to check if `old.StageName != new.StageName` and `new.StageName == 'Closed Won'`. This ensures we don’t fire integration logic on every update, only the transition of interest.
       
    3. Optionally, check other conditions: e.g., `Opportunity.Amount` not null (maybe need an amount to invoice), or a custom checkbox "Send to QuickBooks" if they want manual control. But assuming automatic on Closed Won.
    
* **Trigger Handler**: It’s good practice to delegate logic from the trigger body to a handler class. For example, a class `OpportunityInvoiceTriggerHandler` with a method `afterUpdate(List<Opportunity> newList, Map<Id, Opportunity> oldMap)`. The trigger will instantiate the handler and call handler.afterUpdate(trigger.new, trigger.oldMap).
  
* **Bulk Handling**: The handler should collect all opportunities that meet the criteria (stage changed to Closed Won) into a list. If none, exit quietly.
  
* **Enqueue Queueable**: The handler will then instantiate a Queueable Apex job (say `InvoiceSyncJob`) to handle these records and call the external API. We pass the list of Opportunity Ids (or maybe a minimal DTO with necessary info) to the Queueable. We then call `System.enqueueJob(queueableInstance)` to queue it. This call is done once per trigger execution, even if multiple Opps. So if 50 opps closed at once, we enqueue one job with all 50.
  
* **One Job vs Multiple**: Design decision: we could enqueue one job per opportunity to isolate transactions (in case one fails, others still proceed). But that could overwhelm if a mass update happens. Instead, enqueuing one job for up to 50 is fine (50 is not too many to handle in one callout context). If more than ~50, say 200 opps, the trigger context is at most 200, we might still do in one job if QuickBooks API can handle batch or we loop callouts. However, hitting rate limits is a consideration. Alternatively, we could break into smaller batches manually if needed. For simplicity, one job per trigger execution is okay. In job’s execute, we’ll loop through opps and call QuickBooks for each or batch if available.
  
* **Idempotency**: Ensure that if the trigger fires twice for the same opp (like edit, save again in Closed Won), we don’t duplicate invoice. Possibly mark the Opportunity as “Sent to QuickBooks = true” after first time or store the QuickBooks Invoice ID on it. We can use that as a check: trigger logic could skip any opp that already has a QuickBooks Invoice Id or a flag. This prevents duplicate integration. The downside is you need to update the opp after invoice creation to set that flag/ID (which is advisable anyway).
  
* **Recursion**: If we update the opp in the queueable (to save the QB invoice ID), that is a separate transaction; it will fire trigger again but Stage isn’t changing that time (just ID added), so our condition will skip it. So recursion is controlled by the stage check. We should also have a static boolean or state if needed, but probably not necessary here because second trigger run sees no stage change.
  
* **Trigger Order**: If other Opportunity triggers exist, ensure our integration trigger either runs in correct order or is isolated (if they have no interdependency, fine). If there’s an after-insert logic that also might create something, ours might need to handle after insert too (e.g., if opp is created as Closed Won directly, we might want to send invoice). We can include afterInsert in the trigger with similar logic (if StageName == Closed Won on insert). But careful if sales reps frequently create closed-won opps directly.
  
* **Execution user**: The trigger runs under the user who made the change. The queueable will run as that user (with system context since it’s async). If using Named Principal, it doesn’t matter who runs it, the callout uses stored token. But ensure that user profile has “API Enabled” and access to Named Credential’s Auth. Provider (this ties back to the connected app setting where we might have to mark it as admin approved). Easiest: run the integration under an Integration User who made the stage change via automation. But stage likely changed by actual user. So just document requirement: all users who can Closed-Won an opp must be authorized to use the connected app. Setting connected app perm as “All users may self-authorize” typically is default. But with Named Principal, it might not prompt each user, only the initial admin who did the auth.
  
* **Error Propagation**: The trigger should not fail the transaction if the callout fails. Because marking an Opp closed-won should not be blocked by a QuickBooks issue. That’s why we do async: the trigger enqueues and immediately completes. Even if enqueue fails (which only if 50 jobs limit or some Apex error in enqueuing), that would rollback the opp update. But enqueue is rarely failing. We should guard for it: if `System.enqueueJob` returns null (meaning job not queued), we could catch and maybe try alternative (but likely won’t happen unless concurrency issues). We want to let the opp save succeed, and handle integration later.
  
* **Testing the Trigger**: (We will create test scenarios: one opp changes to closed-won, ensure queueable queued, etc., as discussed in test section.)
  

Pseudo-code for trigger logic:

```apex
trigger OpportunityAfterUpdate on Opportunity(after update) {
    List<Id> oppsToSync = new List<Id>();
    for (Opportunity newOpp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(newOpp.Id);
        if (oldOpp.StageName != 'Closed Won' && newOpp.StageName == 'Closed Won') {
            if(String.isBlank(newOpp.QuickBooks_Invoice_ID__c)) { // ensure not already synced
               oppsToSync.add(newOpp.Id);
            }
        }
    }
    if(oppsToSync.size() > 0) {
        System.enqueueJob(new InvoiceSyncJob(oppsToSync));
    }
}
```

(This is a simplified example; actual might do more checks or use a handler class.)

### **4.2 Queueable Class Design for External API Calls**

The Queueable Apex (`InvoiceSyncJob` in example) is the workhorse that will interact with QuickBooks (or the Node middleware) via HTTP callouts. Key design points:

* **Implements Queueable and Database.AllowCallouts**: The class definition should be `public with sharing class InvoiceSyncJob implements Queueable, Database.AllowCallouts`. The `Database.AllowCallouts` marker interface is required to let a Queueable perform callouts (Queueable doesn’t require a special annotation like future does, but including this interface is a clarity and potential requirement)[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=Queueable%20Test%20Class%20,Test.).
  
* **State**: It will have instance variables to hold context passed from trigger, e.g., `private List<Id> oppIds;` plus maybe data that’s needed.
  
* **Constructor**: Accept the list of Opp Ids (and possibly other info).
  
* **Execute Method**: In `public void execute(QueueableContext context)`, do the following:
  
    1. Query the Opportunities (and related data) needed for API. Likely we need: Opportunity fields (Name, Amount, CloseDate, maybe custom fields for billing info), and probably the Account’s info (customer name, address, email to send invoice). So we might query like:
       
        ```sql
        [SELECT Id, Name, Amount, CloseDate, Account.Id, Account.Name, Account.BillingAddress, Account.Phone, Account.QuickBooks_Customer_ID__c, QuickBooks_Invoice_ID__c 
         FROM Opportunity WHERE Id IN :oppIds]
        ```
        
        Include any custom mappings needed. If we plan to create a Customer in QuickBooks if not existing, we need the Account details. We might also gather Opportunity Line Items if we are adding lines to the invoice. If yes, query OpportunityLineItem with Product info in a separate query (or one join via PriceBookEntry if needed).
        
    2. Prepare data for QuickBooks API:
       
        * If QuickBooks requires a **Customer** reference on Invoice, we need a Customer ID (if the Account exists in QuickBooks). We might store a mapping: perhaps Account has a field `QuickBooks_Customer_ID__c` to store the QuickBooks customer ID. Check if that is populated. If not, we must create the customer first via API.
          
        * Consider doing one of two flows:  
            a) **Synchronous creation**: For each Opportunity:  
            - If Account.QuickBooksID is blank: call QuickBooks API to create Customer (with Account name, billing address, etc.). Get the new Customer.Id, update Salesforce Account. Then call API to create Invoice (with CustomerRef = new Id, line items, etc.).  
            - If Account already has QuickBooksID: just create Invoice.  
            This means potentially 2 callouts per Opportunity in series. Doing that for bulk means many callouts (if 50 opps, worst case 100 callouts). Salesforce max is 100 callouts per transaction[salesforce.stackexchange.com](https://salesforce.stackexchange.com/questions/325894/testing-a-class-that-has-multiple-callouts#:~:text=Creating%20a%20MultiRequest%20mock%20class,map%20key%20is%20the%20endpoint), so 50 opps could be fine (100 callouts is exactly the limit). If near limit, we should be cautious. If an opp has multiple line items and we call once per opp, it's okay because that call includes all lines in one invoice call.  
            It’s borderline; if expecting >50 in one go often, we might need to throttle or chain. But closings rarely that high at once except end of quarter maybe. Alternatively:  
            b) **Batch or Multi-call**: QuickBooks has batch API where you can send multiple operations in one request (up to 30 operations per batch request, IIRC)[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api#:~:text=What%20you%20can%20do%20with,improve%20app%20performance%20by). That could optimize if needed, but introduces complexity to parse batch responses.  
            c) **One call per Opp**: Simpler and acceptable if volume not huge. We’ll implement that for clarity, but mindful of limits.
        
    3. Perform Callouts:
       
        * Use Named Credential: endpoint like `'callout:QuickBooks/v3/company/1234567890/customer?minorversion=65'` for Customer, and similar for Invoice.
          
        * Construct JSON payload. QuickBooks expects specific fields:
          
            * For Customer: something like `{"DisplayName": "Account Name", "CompanyName": ..., "BillAddr": { ... } , "PrimaryEmailAddr": {"Address": "email"}}`. Use the fields from Account. Only include required or relevant fields[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=public%20static%20void%20createCustomer%28%29%20). Minimally DisplayName is required.
              
            * For Invoice: It needs at least one Line with an Amount and an ItemRef (the QuickBooks item/product). We have to decide how to map Salesforce products to QuickBooks items. If using a generic "Sales" item for all, we can hardcode an ItemRef (like QuickBooks Item ID for a generic item or map based on ProductName). In a robust integration, you'd sync Product2 as Items in QuickBooks and store mapping. That might be out of scope. Perhaps simpler: use a generic "Service" or "Product" item in QuickBooks for all lines, and just pass description and amount.
              
                * QuickBooks requires `DetailType` per line. Typically "SalesItemLineDetail" for product/service lines[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/rest-api-features#:~:text=%7B%20,1).
                  
                * Example line:
                  
                    ```json
                    "Line": [{
                       "Amount": 100.0,
                       "DetailType": "SalesItemLineDetail",
                       "SalesItemLineDetail": {
                           "ItemRef": {"value": "ITEM_ID", "name": "Service"},
                           "Qty": 2,
                           "UnitPrice": 50.0
                       },
                       "Description": "Opportunity Name or product description"
                    }]
                    ```
                    
                    If we don't have products, we might just have one line for total Amount.
                    
                * **Opportunity Line Items**: If we want each OLI as an invoice line, we need to retrieve OLIs. We then need QuickBooks ItemRef for each product. Without an existing mapping, possibly use a generic Item for all as above, with description as the product name. Alternatively, create items on the fly in QuickBooks for each product - not recommended to do in real-time (should sync products separately if needed).
                  
                * We'll assume for now a simplified case: one line per Opportunity (the whole amount as one service line). This avoids product mapping complexity. We can mention how to extend if needed.
                
            * Include CustomerRef: `CustomerRef: {"value": Account.QuickBooksID}` in invoice JSON.
              
            * Include any other fields needed: maybe `TxnDate` (defaults to today if not), `DueDate` could be set (maybe CloseDate or CloseDate + some terms). Terms, etc., if needed we can set if QuickBooks requires (if no terms, maybe it uses default Net30).
            
        * Perform the callout using `Http.send()`. Use try-catch to catch exceptions (e.g., timeouts).
          
        * Check response status:
          
            * If 200 or 201: parse the JSON. We can use `JSON.deserializeUntyped` or strongly typed classes if we define them. For example, parse to a Map, get `Id` of created Invoice and/or created Customer. QuickBooks responses wrap data in objects: e.g., invoice create returns an `Invoice` object within JSON containing `Id` and maybe `DocNumber` (invoice number). Extract the Id.
              
            * If 4xx or 5xx: handle accordingly. For a 400 with validation error, log it. For 401, this is the OAuth failure case discussed; handle by throwing an exception or logging and stopping further processing (and possibly flagging integration off).
              
            * If any callout fails for one opp, it might be wise to continue to others (so one failing doesn’t prevent others). This is tricky because if we catch exception, we can log and continue loop for others since we’re in a single execute context. We just need to be careful to not let an exception escape the execute method or else the whole job will abort and other opps in list won’t process. So use try-catch around each callout iteration or group.
              
            * If a customer creation fails for one opp, you might skip creating the invoice for that opp because no customer. Log that as well.
            
        * Rate limiting: QuickBooks Online has rate limits (both per minute and burst). If doing many sequential callouts, we could potentially hit rate limits (e.g., QBO limits ~500 requests per minute per app, or some such). 50 should be fine. If concerned, we could introduce a small delay between calls (Salesforce has no sleep function though; some use fine-grained async chaining to throttle). Or use the batch API to group requests. Given time, likely fine.
        
    4. After successful creation:
       
        * Update Salesforce records. Specifically:
          
            * Set each Opportunity’s `QuickBooks_Invoice_ID__c` with the ID returned (and maybe `QuickBooks_Invoice_Number__c` if we want to store the human-friendly number).
              
            * If we created any customers, update Account.QuickBooks_Customer_ID__c with that ID.
              
            * We can batch these updates in one DML at end (one list for opps to update, one list for accounts).
              
            * Use allOrNone=false in DML if you want partial success (so if one opp update fails, others still save).
              
            * Because this is queueable, performing DML is fine and will commit, and it might retrigger triggers on those objects. For Opportunity update (setting QB IDs) we need to be cautious: it will fire Opportunity after-update again. But our trigger condition will see Stage is already Closed Won -> Closed Won (no change), so it won't enqueue again, as we planned.
              
            * For Account update (QB customer ID), if you have an Account trigger, ensure nothing problematic. Usually not.
              
            * Mark an Integration Log or Task to show “Invoice created for Opp X” if needed. (We can decide if we have a separate log object. Could be useful to track integration events.)
        
    5. Error Logging:
       
        * We should design an **Integration Log** custom object to record failures (and successes optionally). Fields: Status (Success/Failed), Opportunity Id, Error Message, Timestamp, maybe JSON response or at least error code.
          
        * In the queueable, if a callout for an opp fails, create a log record. Alternatively, aggregate errors for all opps and insert log records in bulk at end for those with errors.
          
        * This ensures we have a record in SF of what went wrong. The admin can view these logs and decide to retry or fix data.
          
        * The log object should be deployed as part of integration.
          
        * Optionally, for immediate alert, send an email if error occurs (maybe not for every single failure if many fail in one go, to avoid spamming – could do one email summarizing multiple).
        
    6. **Chaining or Reprocessing**:
       
        * If volume is large or if some opps need reprocessing, one approach is to chain another queueable at end (QueueableContext allows chaining via `System.enqueueJob` again). But that is more for if we intentionally split work. We probably won't chain automatically except for maybe scheduled sync jobs (discuss in 4.5).
          
        * If an error is transient (like QuickBooks minor outage), how to retry? We could have a simple retry mechanism: if callout exception or 500 error, maybe try again after a short wait (not trivial to wait in Apex) or just mark for retry. E.g., log it and have scheduled job pick it up (discuss next).
    
* **Governance**:
  
    * By doing in queueable, we get a fresh set of limits separate from trigger context. Within queueable:
      
        * 100 SOQL, 150 DML, 100 callouts etc. Should be enough.
          
        * If processing up to 50 opps, ensure not to do SOQL or DML inside loop. We plan:
          
            * 1 SOQL for opps, (maybe 1 for OLIs if needed, 1 for Accounts if not included – but we can include Account via relationship in opp query to avoid separate query).
              
            * DML: up to 50 opp updates + maybe 50 account updates. We can combine account and opp updates into two lists (because different objects cannot be updated together, but we can do 2 DML statements which is fine).
              
            * Callouts: up to 100 as analyzed.
              
            * If an opp has many OLIs and we decided to do one callout per OLI (not likely, we do one invoice for all lines), that would multiply callouts. Better to create invoice with multiple lines in one call.
            
        * CPU time: be mindful if a lot of JSON processing, but should be fine for tens of records.
          
        * The queueable runs in the background, so even if it takes several seconds to do all callouts, that's fine. Just hope it finishes within Apex max runtime (which is typically 60s synchronous, but async can go longer? Actually, async transactions can also have a limit like 60s CPU, but callouts waiting time doesn't count as CPU, but there's overall limit of 120s for callouts to respond).
    
* **External Service Unavailability**: If QuickBooks is down or responding slowly, some callouts might time out (default timeout is 10 sec, can set up to 120 sec). You might set a moderate timeout like 30 sec on the HttpRequest if needed. If one times out, catch exception, log and move on to next. The whole queueable could end up with many fails which would then rely on retry logic via scheduled job or manual.
  
* **Use of Platform Events or Future**: Not needed since queueable covers asynchronous needs and ordering (and can also be monitored via AsyncApexJob if needed).
  

So the queueable encapsulates external interactions. This separation ensures if QuickBooks is slow, the user saving an Opportunity isn’t impacted (they don’t wait for invoice creation – it happens after).

### **4.3 Data Transformation Between Salesforce and QuickBooks Formats**

Data mapping is crucial to ensure that the information flows correctly between systems:

* **Object Mapping**:
  
    * Salesforce **Opportunity** (Closed Won) → QuickBooks **Invoice**.
      
    * Salesforce **Account** (related to Opportunity) → QuickBooks **Customer**.
      
    * (If we extended, OpportunityLineItem → Invoice Line, and Product2 → Item, but we may simplify as noted.)
    
* **Field Mapping for Customer/Account**:
  
    * **Account.Name** → **Customer.DisplayName** (QuickBooks requires DisplayName, which must be unique across customers).
      
    * **Account.BillingStreet/City/State/PostalCode/Country** → **Customer.BillAddr.Line1/City/CountrySubDivisionCode/PostalCode/Country**. QuickBooks Address object uses fields like `Line1`, `City`, `CountrySubDivisionCode` (for state), etc. We’ll map accordingly[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=String%20requestBody%20%3D%20%E2%80%98,%E2%80%99). If Account has a Shipping Address we prefer, use that if needed.
      
    * **Account.Phone** → **Customer.PrimaryPhone.FreeFormNumber**.
      
    * **Account.PersonEmail or a related contact’s email** → **Customer.PrimaryEmailAddr.Address**. If Account is a business without an email field, maybe take the Opportunity’s primary Contact’s email (would need relation). To keep it simple, if Account has a field for email (maybe a custom field or we skip if none).
      
    * **Account Website** (if present) could map to Customer.WebAddr (QuickBooks has a web address field).
      
    * **Account Number** to Customer.AccountNumber if we want (not required).
      
    * **QuickBooks Customer ID**: store it in Account. This is not a field QuickBooks needs, but how we link future transactions. So once created, assign it to Account.
      
    * If the integration is one-way (Salesforce to QuickBooks primarily for creation), we may not sync other fields back. But if QuickBooks sends updates (like payment status), we’ll handle that separately.
    
* **Field Mapping for Opportunity/Invoice**:
  
    * **Opportunity Amount** → **Invoice.Line.Amount** (if single line equal to total).
      
    * **Opportunity Name** → maybe **Invoice.Line.Description** or **Invoice.CustomerMemo** (note for entire invoice). Could use it for description if we have item details separate. Alternatively, if multiple line items, each line would have product name or description.
      
    * **CloseDate** → could use as Invoice TxnDate (invoice date). Or use current date as invoice date. Possibly better to use current date (since invoice is typically created now, which might be after close date). But close date could be used as e.g. service date or just ignore.
      
    * **Opportunity Id or reference**: We might want to include the Salesforce Opp ID or name somewhere in QuickBooks for traceability. Perhaps in `Invoice.PrivateNote` or `Invoice.CustomerMemo` we can add “SF Opportunity: [Opp Name or ID]”. This helps accountants see origin. We have to be careful not to clutter QuickBooks records; maybe short.
      
    * **Opportunity Owner** not directly needed in invoice, but maybe contact for invoice? QuickBooks invoice has fields like BillEmail (who to email invoice to), which we might set to the Contact’s email if available.
      
    * **Products/Line Items**: If using them:
      
        * **OpportunityLineItem.Quantity** → **SalesItemLineDetail.Qty**.
          
        * **OpportunityLineItem.UnitPrice** → **SalesItemLineDetail.UnitPrice**.
          
        * Then QuickBooks will compute line Amount (or we can send it too).
          
        * **OpportunityLineItem.Product2.Name** → could go to line Description (if using a generic item).
          
        * If we mapped products:
          
            * We’d need QuickBooks ItemRef for each Product. Possibly store QuickBooks Item ID on Product2 as a field. But if not pre-integrated, use a placeholder Item in QuickBooks. E.g., have a QuickBooks “Salesforce Item” in their catalog with ID known (maybe manually configure and store that ID in a Custom Setting).
            
        * We will likely not implement full product mapping in this first version (mention as future improvement).
    
* **Payment Status**:
  
    * QuickBooks invoices have a status (Paid or not, and can have partial payment info). We plan a scheduled job to sync payment status (section 4.5). So we need to map that:
      
    * Possibly a custom field on Opportunity like **Paid__c** (checkbox or status field). Or use existing fields: if using Opportunity Stage for payment (not typical), maybe not. More likely we add a field “QuickBooks Payment Status” to Opp or an associated object.
      
    * QuickBooks Invoice has fields: `Balance` (remaining balance), `PaidStatus` or we derive from Balance = 0 means paid. Payment info can be retrieved via Invoice or directly from Payments API referencing invoice.
      
    * We can map QuickBooks Payment (like Payment date) to a custom field on Opportunity or perhaps use Opportunity’s standard fields (maybe mark Opportunity Closed Won and an additional stage "Paid" if they want to track that? But that may conflict with sales pipeline logic. Probably better to not change stage).
      
    * Could use an Opportunity field "Invoice Paid Date" or "Paid Amount".
      
    * We’ll define perhaps **Opportunity.PaymentStatus__c** (Picklist: Not Paid, Partially Paid, Paid) and **Opportunity.AmountPaid__c**.
      
    * The schedule job will fill those by querying QuickBooks (discussed later).
    
* **Error Codes**:
  
    * If QuickBooks returns validation errors (like required field missing), we should interpret them and possibly map to user-friendly message. The error payload often has a structure with a Message and “Field” etc. We can just log the message QuickBooks provides[atrium.ai](https://atrium.ai/resources/how-to-test-code-coverage-in-salesforce-useful-tips-and-techniques/#:~:text=It%20supports%20the%20following%20API,retrieve).
    
* **Date Formats**:
  
    * Salesforce Date is in yyyy-MM-dd. QuickBooks might expect date in ISO format (yyyy-MM-dd) or possibly a dateTime. But likely for invoice TxnDate a date is fine in that format. If needed, format it as string.
      
    * For times or created datetime, QuickBooks uses ISO8601 (e.g., 2025-08-22T12:00:00-0700). If we had to send any dateTime (maybe not for invoice).
    
* **Currency**:
  
    * If Salesforce org is multi-currency or deals in different currency than QuickBooks default, we must specify currency in invoice. QuickBooks supports multi-currency if enabled in the QBO company, and requires specifying CurrencyRef on transactions if not home currency. For simplicity, assume one currency (e.g., USD). If needed, we could map Opportunity currency (Opportunity has CurrencyIsoCode if multi-currency) to QuickBooks `CurrencyRef`. But only if QuickBooks multi-currency on.
    
* **ID Mapping**:
  
    * Maintain mapping fields in SF (like QuickBooks IDs on SF records) to avoid duplicate creation and to link for updates.
      
    * For example, if an Account’s QuickBooks Customer ID exists, use it; otherwise create new and save back.
      
    * For Opportunity, once invoice is created, we store the QuickBooks Invoice ID in SF. That way if some update or payment comes back we know which SF record it ties to.
      
    * Possibly store QuickBooks Invoice Number as well if needed, but the ID is key for API.
    
* **Node vs Direct QuickBooks**:
  
    * If using a Node middleware, the transformation might be split: Salesforce sends raw Opportunity JSON to Node, Node does transformation to QuickBooks format. In that case:
      
        * Our queueable would construct a payload to send to Node, perhaps minimal (Opportunity and Account data).
          
        * Node endpoint would need to handle mapping to QBO and making QBO API calls, then respond back success/failure and any new IDs.
          
        * This offloads mapping logic to Node (maybe easier to maintain outside SF if code heavy). But then we have to implement Node and ensure reliability. Since requirement said Node preference, we should mention how to adjust if using Node:
          
            * The Named Credential would be for Node’s URL.
              
            * Instead of multiple callouts to Intuit, we’d likely do one callout to Node for all Opps or one per Opp (depending on Node API design).
              
            * Node then does work and perhaps calls back or returns results.
              
            * For the sake of this SF-centric guide, we implemented direct QBO calls in Apex. However, one can replace that portion with a single call to a Node service that takes a batch of Opp IDs and processes them. The rest of the logic (trigger, queueable structure) remains similar, only the callout endpoint and payload differ.
            
        * If Node is used, ensure Node has its own error handling, and Apex just receives overall success/failure. Possibly Node could push results back to SF via API, but simpler is to return result in response and Apex then updates records.
          
        * **Security**: Named Credential for Node might use Basic Auth or JWT. Ensure to protect that credential similarly.
          

Given time, likely they expect the solution focusing on Salesforce pieces with mention of Node as just an external call. The mapping is mostly on Salesforce side in our narrative.

To illustrate transformation, here’s a conceptual example for one Opportunity (direct QBO):

```json
{
  "Customer": {
    "DisplayName": "Acme Corp",
    "PrimaryEmailAddr": {"Address": "[email protected]"},
    "BillAddr": {
       "Line1": "123 Main Street",
       "City": "Mountain View",
       "CountrySubDivisionCode": "CA",
       "PostalCode": "94042",
       "Country": "USA"
    }
  },
  "Invoice": {
    "CustomerRef": {"value": "12345"},  // This value would be filled after Customer create or known
    "TxnDate": "2025-08-22",
    "Line": [{
        "DetailType": "SalesItemLineDetail",
        "Amount": 5000.00,
        "SalesItemLineDetail": {
           "ItemRef": {"value": "1", "name": "Services"}
        },
        "Description": "Opportunity ABC - Implementation Services"
    }]
  }
}
```

This is a bit pseudocode because the actual QuickBooks API expects separate calls for Customer and Invoice, not one JSON combining them. But if Node were used, Node could accept a combined payload and do two calls. In Apex, we will do them separately.

### **4.4 Error Logging and Retry Mechanisms**

Even with the best coding, external integrations will have errors – network issues, data validation errors, etc. We need a robust way to log these errors and retry where appropriate:

* **Integration Log Object**: Create a custom object `Integration_Log__c` with fields:
  
    * **Related Opportunity** (Lookup to Opportunity, if error relates to a specific opp).
      
    * **Action** (e.g., "Create Invoice", "Create Customer", "Sync Payment").
      
    * **Status** (Success/Failed).
      
    * **Error Message** (Long Text to capture error details).
      
    * **Timestamp**.
      
    * Perhaps a field for QuickBooks ID involved, or any relevant info.
      
    * **Retry Count**.
      
    * **Next Retry Time**.
      
    * Possibly a checkbox "Retry Pending".
      
    
    Every time a failure occurs in the queueable, instantiate an Integration_Log__c with details and insert (or accumulate and insert in bulk after loop). This provides a record for admins. Mark Status = "Failed".
    
    For successes, you might log but it can clutter; maybe log successes at a lesser degree (or not at all once stable). Could have a Success entry per Opp creation if needed for audit, but optional.
    
* **Retry Strategy**:
  
    * Some failures are due to correctable issues (e.g., QuickBooks was down temporary, network glitch, or QBO had a locking issue), and should be retried automatically.
      
    * Some failures are due to data problems (missing info, invalid field) – these need data correction before retry.
      
    * We can differentiate by error code or content. For example:
      
        * HTTP 500 or timeout: likely transient – safe to retry.
          
        * HTTP 429 (too many requests): definitely wait and retry after rate limit window.
          
        * HTTP 400 with validation error: do not auto-retry until data fixed.
          
        * HTTP 401 auth: do not retry automatically; require re-auth.
        
    * A simple approach: We could attempt up to N retries automatically for any failure that we suspect transient. But doing that within the same queueable execution is tricky because if QBO is down, a quick retry might fail too. Better to use a scheduled retry.
      
    * **Scheduled Retry Job**: Create a scheduled Apex (see Section 4.5) that periodically looks for Integration_Log__c with Status = "Failed" and where Action = "Create Invoice" (or others) and maybe a field "Retried__c = false" or uses Retry Count. Then it can attempt to re-process those:
      
        * It could gather failed Opportunity IDs from logs and re-enqueue a job for them. But careful: if data issue, it will just fail again. One could mark in log if error contains certain keywords to skip further attempts.
          
        * Could also integrate with an admin process: admin fixes data (e.g., adds missing email to Account) then manually marks a log for retry or triggers a batch.
        
    * **Manual Retry**: Provide a way for admin to manually trigger a retry for a specific record. For example, create a button "Retry Integration" on Opportunity that simply enqueues the same queueable for that single Opp again. Or perhaps update a field "Retry Integration" = true that a separate small trigger catches and enqueues. This can be done as a quick fix approach.
      
    * For multiple failures (like if QuickBooks was down, dozens failed), admin can choose to run the scheduled job on-demand or use a list view on logs to select and press a custom "Retry" action (with a custom batch Apex behind maybe).
    
* **Stop on Critical Failures**:
  
    * If we get a 401 (auth) error, as discussed, we should not keep retrying via automation because it will keep failing until re-auth. The log for that should alert admin. We might set a flag (maybe in a Custom Setting) like "Integration Paused" if auth fails, and have triggers check that and not enqueue further jobs until resolved (to prevent accumulating failures). This is a design choice: failing open vs failing closed. It might be better to pause integration on auth failure so you’re not losing data (like those opps remain unsynced but safe, and then after re-auth maybe can be processed).
      
    * Implementation: If in queueable we hit 401, set a Custom Setting (Integration_Config__c.Auth_Error__c = true). Then the Opportunity trigger can read that and if true, skip enqueuing new jobs (perhaps even create a log entry telling why it skipped). After admin fixes auth and maybe toggles that flag off (or it auto resets on successful re-auth or something).
      
    * This prevents flooding logs with the same auth error for every opp update.
    
* **Logging External IDs**:
  
    * When an invoice creation is successful, we may still log it but as success. If so, could store the QBO Invoice ID and maybe number in the log for reference. This is helpful if you want a quick search from SF to QBO without diving into each Opp.
      
    * But since we store on Opp anyway, log might not be needed for success.
    
* **Notification**:
  
    * Consider using Salesforce notifications for critical errors: e.g., platform events or Email Alerts. Simplest: send an email to integration admin if a log is created with critical error (auth or >some threshold).
      
    * Could integrate with Salesforce’s alerts or even an external monitoring by exposing logs via API.
    
* **Idempotency on Retry**:
  
    * If a failure happened after partial success (e.g., Customer was created, but invoice failed), a retry might attempt to create customer again. That would create duplicate in QuickBooks. To avoid that:
      
        * Our logic should handle if Account.QuickBooksID got set (maybe we set it only after successful creation; if it failed before setting, then no ID, so it will try again to create – which would duplicate if the first actually succeeded but we didn't catch response due to timeout).
          
        * This scenario can happen: we called create Customer, got no response (timeout), not sure if customer created or not. We didn't set SF ID. On retry, we call again – might create duplicate. To mitigate:
          
            * Possibly use unique fields to avoid duplicates: QuickBooks might reject exact same DisplayName if one already exists. Actually, QuickBooks requires unique DisplayName, so second attempt might result in error "DisplayName already exists". That error we could catch and instead query existing customer by name. That’s advanced, but could implement: if customer create returns name conflict, do a lookup API call (QuickBooks provides query API: we could do a query like `select * from Customer where DisplayName = 'Acme Corp'` to find it).
              
            * Simpler: for now, if we get name conflict error, we can assume the customer exists (maybe from previous try) and retrieve its ID by query or by parsing the error if it provides existing record ID (some APIs do not, likely have to query).
              
            * So for idempotency, consider implementing "find or create customer" rather than blind create:
              
                * Attempt to create -> if success, good; if error says duplicate, do query -> get ID -> continue.
                
            * For invoices, duplication is less likely since if first attempt times out, it might or might not have created invoice. If it did, a retry would create a second invoice. That might be acceptable (two invoices for same opp, the user could void one in QuickBooks later). Or we could attempt to check QuickBooks to see if an invoice with some unique field exists. Without a unique key (maybe we could put the Opp Id in the Invoice PrivateNote, and on retry search invoice by that). That’s a complex safeguard; many integrations accept the slight risk of duplicate invoice on rare network failures because accounting can handle a duplicate by deleting one.
              
            * We can mitigate by making invoice number have a pattern or custom field linking to opp. But QuickBooks auto-assigns invoice number sequentially; we could set a custom `DocNumber` to the Opportunity Id or number, but QBO might require numeric sequence (and doesn't allow alphanumeric or duplicates out of sequence easily).
              
            * Perhaps include Opportunity Id in a CustomField on Invoice (QuickBooks supports custom fields if turned on, limited number).
              
            * For now, we'll assume network failures causing unknown outcome are rare.
        
    * Document these idempotency considerations for administrators, so they can check QuickBooks for duplicates if needed after an incident.
    
* **Clean-up**:
  
    * After successful processing via a retry or later, you might update log status to "Success (Retried)" or so, or create a new log for success and keep old failure for history. Up to design.
      
    * Possibly delete or archive old logs after some time to not clutter org.
      

### **4.5 Scheduled Jobs for Payment Status Synchronization**

The integration may not be complete with one-time invoice creation. We also need to keep Salesforce updated with invoice payment status (i.e., whether the customer paid the invoice in QuickBooks). To achieve this, we implement a scheduled Apex job to periodically sync payment information:

* **Schedule Frequency**: Determine how often to sync payments. If near-real-time is not required, a daily sync at off-hours might suffice. Or hourly if needed. Let's assume daily at night or early morning.
  
* **Schedulable Class**: Create an Apex class implementing `Schedulable`, e.g., `PaymentSyncSchedulable`. In its `execute` method:
  
    * It will perform callouts to QuickBooks to retrieve either all recently updated invoices or to check specific invoices that are not marked paid in Salesforce.
      
    * Approaches:
      
        1. **Query by modification date**: QuickBooks API allows querying invoices modified in a date range: e.g., `SELECT Balance, DocNumber, Id FROM Invoice WHERE MetaData.LastUpdatedTime >= '2025-08-01T00:00:00Z'`[atrium.ai](https://atrium.ai/resources/how-to-test-code-coverage-in-salesforce-useful-tips-and-techniques/#:~:text=3,of%20lines%20of%20code%2C%20so). But picking last 24h for daily job. However, ensuring we get all relevant changes might be tricky if job fails or time window.
           
        2. **Track in SF which invoices are unpaid**: We know which Opps are not paid (PaymentStatus__c != Paid). We could iterate through those and for each do a GET to QuickBooks invoice by Id to see if balance = 0.
           
            * If number of open invoices is small, this is fine. If large, maybe better to query QBO in bulk.
            
        3. QuickBooks also has a Reports or AR aging report API, but probably overkill.
        
    * Perhaps do: `SELECT Id, Balance, (maybe PaymentStatus) FROM Invoice WHERE Id in ('list of invoiceIds')` – Not sure if QBO API allows querying by a list of Ids. It does allow batch retrieval up to 30 in one request as mentioned (batch API).
      
    * If number of invoices to check is < 30, we could use batch in one call. If more, either multiple batch calls or iterative calls.
      
    * Many times, you can just do for each open invoice call invoice endpoint: `/invoice/<Id>` which returns the invoice with all fields including `Balance` or a boolean `FullyPaid` depending on version. QuickBooks invoice has a field `Balance`. If `Balance = 0` => fully paid.
      
    * We'll likely implement: Query Salesforce for all Opportunities where QuickBooks_Invoice_ID__c != null and PaymentStatus__c != 'Paid'. That gives list of open invoices to check.
      
    * Then in batches of, say, 20 or 30, call QuickBooks:
      
        * Option 1: Use batch API: prepare a JSON with multiple queries or gets. For example, QuickBooks batch request can contain sub-requests like `{"batchItemRequest":[ {"query": "select Balance from Invoice where Id='XYZ'"} , ... ]}` up to 30. It then returns batchItemResponses. This is efficient (one HTTP call). We can do that.
          
        * Option 2: Simpler coding: loop each and do Http GET on `.../invoice/XYZ?minorversion=65`. That is easier but could be many callouts (if dozens of invoices).
        
    * Since payment status changes maybe relatively infrequently and number of outstanding invoices presumably not huge (depending on business), doing individual calls might be okay if under callout limits. If e.g., 100 open invoices, 100 callouts in one execution – at the limit, but should be fine if rarely above 100. Or do two queueables or one batch job to handle more.
      
    * Could also schedule more often to reduce number each time.
    
* **Process Response**:
  
    * For each invoice (Opportunity), if QuickBooks shows Balance = 0 and we haven't marked it paid:
      
        * Update Opportunity.PaymentStatus__c to 'Paid'.
          
        * Optionally update an actual payment date: QuickBooks doesn't directly give payment date on invoice; you have to query the Payment entity to get the date if needed. Alternatively, in QuickBooks if invoice paid, LastModifiedTime of invoice might coincide with payment or you can query the Payment object. If we want Payment Date on Opportunity, we should fetch Payment records:
          
            * Perhaps do an additional call for each paid invoice to fetch Payment info (which invoice it belongs to, date, amount). That might be too many calls or complexity.
              
            * Instead, just mark Paid. If business needs actual date, then might indeed fetch payment or accept marking it as paid on the sync run date.
            
        * Possibly also update Opportunity.AmountPaid__c = Opportunity.Amount (if fully paid). If partial payments allowed, then PaymentStatus__c could be 'Partially Paid' if Balance < Total but > 0. That’s nuance:
          
            * We could mark PaymentStatus = 'Partially Paid' and store AmountPaid as Total - Balance.
              
            * For partial, we'd definitely need Payment info or at least invoice Balance. If QuickBooks Balance < invoice total, we know something was paid, but to get exact amount paid, it's invoice Total - Balance (we can compute if we got Total and Balance in the invoice response).
              
            * QuickBooks Invoice has `TotalAmt` and `Balance` fields. Yes, `TotalAmt` should be the total, `Balance` remaining. We can derive amount paid.
            
        * If QuickBooks shows still not paid (balance unchanged), do nothing.
        
    * For each invoice found paid:
      
        * Could log a success event or simply update fields.
          
        * Maybe fire an email or notification to sales owner: "Your opportunity X has been paid". That’s a business decision out of scope, but possible.
        
    * Save updates in one or few DML statements (process after gathering results).
    
* **Scheduled Setup**:
  
    * Use `System.schedule` to schedule PaymentSyncSchedulable every night at 2 AM, or via UI (Apex Classes -> Schedule Apex).
      
    * Provide the CRON expression in documentation if needed (like `0 0 2 * * ?` for daily 2 AM).
      
    * Or schedule it hourly if more timely needed (like `0 0 * * * ?` for top of every hour).
    
* **Error Handling in Schedule**:
  
    * Similar to others: wrap QuickBooks calls in try-catch, log any integration failures (to the same Integration_Log__c). For example, if Payment sync callout fails for one invoice, log it and continue.
      
    * If QuickBooks auth fails here, same approach – likely it's global auth fail, so handle similarly by pausing or alerting admin.
    
* **Linking Payment**:
  
    * We won't create Payment records in Salesforce (unless needed). Many simply reflect payment status on the Opportunity. Some might create a "Payment" custom object or feed the info into Opportunity's closed revenue or such, but that’s up to requirements.
      
    * We assume marking as paid is sufficient.
    
* **Visibility**:
  
    * The sales team can then see on Opportunity that PaymentStatus is Paid. If they need to know when and how much, might add fields for PaidDate and PaidAmount as mentioned.
      
    * If partial payment is an important scenario, ensure to reflect partial status and perhaps next sync will update to fully paid when complete.
    
* **Opportunity Stage update**:
  
    * Some might want to change Opp Stage to a "Closed Won - Paid" stage automatically. That could be done either by workflow when PaymentStatus changes to Paid. Up to the business if they want that redundancy. It might confuse pipeline reporting, so maybe they keep stage as Closed Won and separate field for paid.
      
    * We'll not auto-change Stage to avoid interfering with sales pipeline standard stages.
      

**Summary of Payment Sync**:

1. Query SF for all Opps with Invoice ID and not fully paid.
   
2. For each, get QBO invoice status.
   
3. Update SF accordingly.
   
4. Log any issues.
   

### **4.6 Field Mapping and Data Validation Requirements**

We’ve discussed field mapping in transformation (4.3), but let's list key fields clearly and note any validation:

* **Salesforce to QuickBooks (Outgoing)**:
  
    * **Account → Customer**:
      
        * Name → DisplayName (required, must be unique in QBO)[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=public%20static%20void%20createCustomer%28%29%20).
          
            * Validation: If name exists, QBO will error. We handle by catching that and possibly doing a lookup or appending something to name (not ideal to append, better to link to existing).
            
        * Billing Address → BillAddr (Line1, City, State, PostalCode, Country).
          
            * Validation: QBO expects state in CountrySubDivisionCode (two-letter for US states) and Country in ISO code (like "USA").
              
            * If any part missing, QBO might still accept partial address.
            
        * Phone → PrimaryPhone (if present, QBO expects digits possibly but can handle format).
          
        * Email → PrimaryEmailAddr (should be a valid email format or QBO will error likely).
          
            * We should ensure email is not too long and properly formatted. Salesforce does some email field validation normally.
            
        * If Account has CompanyNumber or Fax, we might not use it, optional.
          
        * We might also map Contact Person: QBO Customer has a concept of Primary Contact (with given and family name, etc.). If needed, we could supply from a main Contact on account. For now, skip unless needed.
          
        * Custom: If QuickBooks uses custom fields (like Tax ID), out of scope for now.
        
    * **Opportunity → Invoice**:
      
        * QuickBooks CustomerRef → from Account’s QBO ID (must be present or we have to create the customer).
          
            * So requirement: Integration should either ensure Account has QBO ID by time of invoice creation (which we do by creating if missing).
              
            * If for some reason Account QBO creation fails and we proceed to invoice, that will fail. Our code logic should probably not attempt invoice if customer creation failed.
            
        * TxnDate → we can set to today or Opportunity CloseDate (ensuring format). QuickBooks will default to today if not provided, which is fine.
          
        * Line Items:
          
            * We decided on one line with Amount = Opportunity Amount, using a generic Item.
              
            * For this, we need an ItemRef ID. One option: use QBO "Services" item which usually exists with Id=1 (commonly QBO sample data has "Services" with Id 1). The Kizzy example used `ItemRef: value: "1", name: "Services"`[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/rest-api-features#:~:text=,%7D). We should confirm in our QBO sandbox what item id 1 is. Alternatively, create a dedicated "Salesforce Sales" item in QBO and use its Id.
              
            * Let's assume we identify an ItemId for usage and store it in a custom setting or constant in code.
              
            * Description → could be Opportunity Name, or a combination like "Consulting Services for Opportunity ABC".
              
            * Quantity → can default to 1 if just using total amount as one line. Or if we have breakdown by product, then actual Qtys.
              
            * UnitPrice and Qty: If we set Qty=1, UnitPrice=Opportunity Amount, then Amount=Opportunity Amount. Or just set Amount directly which might be simpler (and QBO might auto-set one or the other if not consistent).
              
            * If doing multiple lines for OLIs:
              
                * For each OLI: map OLI.Quantity, OLI.UnitPrice, and product mapping to item.
                  
                * OLI.TotalPrice should equal OLI.Quantity * UnitPrice; QBO can compute or accept an Amount directly.
                  
                * Must ensure sum of lines equals Opportunity Amount if that should tie (Opportunity Amount often sum of products).
                
            * Validation: QuickBooks requires at least one line. If Opportunity Amount is 0, making a $0 invoice is possible but might not be allowed (need to check QuickBooks behavior; could be allowed, but why invoice $0? Possibly skip).
              
            * If Opportunity has no products and no amount (free?), likely we skip invoice creation or treat it as no charge invoice (maybe not needed).
              
            * If more than one line, ensure you don't exceed any QBO limits (like max lines ~100 maybe).
            
        * Terms and Due Date: If we want invoice due date, QBO by default might set due date based on default Net terms (like Net 30). We can set "DueDate" explicitly if needed (e.g., maybe due date = CloseDate + 30 days). If not set, QBO will use default terms of the customer.
          
        * Reference fields:
          
            * Perhaps use `Invoice.PrivateNote` or `Invoice.CustomerMemo` to include "Salesforce Opp Id: 006...". PrivateNote is internal, CustomerMemo is visible to customer on invoice. Possibly put a note like "Thank you for your business. (Salesforce Opp #1234)" if desired. It's optional.
              
            * `Invoice.DocNumber`: QBO auto-numbers invoices (like 1001, 1002...). We could override with our own numbering, but recommended to let QBO handle to maintain sequential accounting. So we won't set DocNumber.
            
        * `Invoice.BillEmail`: you can specify an email to send invoice to. If we want QBO to email it out to the customer directly, we could set BillEmail (e.g., the contact's email or account's email) and set `Invoice.EmailStatus = "NeedToSend"`. That would mark invoice to be emailed. QBO could then send email when someone triggers or automatically if configured. This is advanced, likely out-of-scope, but mention: if you want QuickBooks to email the invoice to the customer, you need an email on invoice.
          
        * If partial deposit or something exists, we skip such complexity.
        
    * All numeric values: ensure to format with correct decimal points. Apex to JSON: if double, it will output numeric fine. Currency fields should be in the correct currency, if multi-currency, might need currency code. QBO expects monetary amounts as decimal numbers in the JSON.
    
* **QuickBooks to Salesforce (Incoming data)**:
  
    * For Payment sync:
      
        * QuickBooks Invoice Id (we have it stored) to find the invoice in QBO.
          
        * QuickBooks fields:
          
            * Balance (remaining) → update SF: if 0 then Paid, if >0 and <Total then Partial.
              
            * TotalAmt → can use to compute paid = TotalAmt - Balance.
              
            * We could also pull `TxnDate` or `DueDate` if needed for SF (maybe not needed).
              
            * If we want Payment date, QuickBooks Payment object has `TxnDate` (the payment date) and linking to Invoice via `Line.DetailType=LinkedTxn`. We could query Payment where `LinkedTxn.TxnId = invoiceId`. That’s more complex; instead, simpler: use LastPaymentDate if QBO had (I don't recall a direct field on Invoice, might not).
              
            * Possibly use `Invoice.MetaData.LastUpdatedTime` as a proxy for last payment date if the only change was a payment applied. But it could also change if edited. So not reliable for actual payment date.
              
            * For now, we might skip capturing payment date. If needed, one could do: if invoice marked paid now and previously not, assume last update time is close to payment time.
            
        * Multi-currency scenario: if invoice is in foreign currency, QuickBooks Balance and TotalAmt would be in that currency, our Opp might be in a currency (if SF multi-currency). Ideally the Opp currency should match invoice currency. That can be another validation – if not matching, might cause confusion (perhaps force one currency scenario).
        
    * For any future sync of other data (if needed, e.g., if an invoice is voided in QuickBooks, should we reflect that in SF? Possibly mark Opp as invoice cancelled or create a log. But out-of-scope unless required).
      
    * If QuickBooks were to update something like the invoice amount or line items after creation (unlikely to happen spontaneously, usually invoice is final), we probably don't sync that because SF remains the source for opp details. In fact, after closed-won, sales might not update Opp amount. If they do, there's a discrepancy with QuickBooks invoice. Ideally, they'd avoid that or treat SF as not source of truth after that point. It's a business process to consider.
    
* **Data Validation (Pre-Integration)**:
  
    * For integration to succeed, certain SF fields must be present:
      
        * Account must have a Billing Address if QuickBooks needs address on invoice (though QuickBooks doesn't require address).
          
        * Email is needed if wanting to send invoices. But if not sending, not strictly required. QuickBooks can create customer without email.
          
        * Opportunity Amount should not be negative (can't have negative invoice line? Actually could have credit, but assume not).
          
        * If Opportunity has no line items, fine; if it has line items summing to a certain amount, ensure Opp.Amount equals sum for consistency (if not, which one to trust? We might trust line items if we use them).
          
        * If any required custom mapping fields (like if QuickBooks required a field that we map from SF and it's missing, we need to catch that).
        
    * Possibly implement checks in trigger: e.g., if Account missing email or address, we can still proceed; QuickBooks will allow partial data except DisplayName required. But maybe we want to warn user. Could put a Validation Rule: "Cannot mark Opp Closed Won until Account has Billing Address and Email" if that’s a business requirement. Or handle by integration quietly.
      
    * At least log a warning if certain recommended fields are missing but not critical:
      
        * If no email, invoice will be created but you won't be able to email it from QuickBooks easily (they can add later though).
          
        * If no address, invoice will have no address (maybe fine).
        
    * If an Opportunity is updated again with different amount after invoice created: We likely do not want to auto-update invoice (that's a complex two-way sync scenario). Probably just leave as is and if necessary user adjusts manually either side. We can document that after an invoice is created, changes in SF won't reflect in QBO automatically (unless we implement that).
      

Finally, with the architecture and mapping laid out, we can implement and test the integration. Ensure that:

* All triggers and classes have sufficient test coverage (per Section 2).
  
* We have run end-to-end tests in a sandbox connected to a QuickBooks sandbox company, verifying an Opportunity Closed Won leads to a new Customer & Invoice in QuickBooks with correct details, and that our Salesforce records update accordingly (like storing IDs).
  
* Simulate a payment in QuickBooks (mark invoice paid or create a payment) and run the payment sync job, confirm SF updates PaymentStatus to Paid.
  
* Try some edge cases: missing data (see how errors log), multiple opps at once, partial payment scenario if possible, etc.
  
* Verify that deployment of this requires the configured Auth Provider and Named Credential to be set up in target org, as per Section 3.
  

By following this design, the agent can deploy and operate the Salesforce-QuickBooks integration with confidence, as all steps from initiation to deployment and verification are clearly defined.

## Section 5: Change Set Deployment Procedures

In this section, we provide a step-by-step guide to packaging and deploying the integration components from Sandbox to Production using Change Sets. We cover the creation of the outbound change set, ensuring all dependencies are included and in the correct order, validating the deployment, executing tests, handling any deployment errors, and planning for rollback or contingencies. We also outline post-deployment verification steps to ensure everything is working in Production.

### **5.1 Creating Production-Ready Change Sets**

Now that development and testing are completed in sandbox, you need to bundle all the components of this integration into an outbound Change Set:

* In the source sandbox (likely a Full or UAT sandbox), navigate to **Setup -> Outbound Change Sets**. Click **New** to create a change set.
  
* **Name** the change set something like "QuickBooks Integration Deployment". Add a description (e.g., "Contains Apex classes, triggers, fields, etc. for SF-QuickBooks integration").
  
* Click **Add** to start adding components:
  
    * **Apex Triggers**: Add the Opportunity trigger (e.g., _OpportunityAfterUpdateTrigger_ or however named).
      
    * **Apex Classes**: Add all classes created for this integration:
      
        * Trigger handler class (if any, e.g., OpportunityTriggerHandler).
          
        * Queueable classes (InvoiceSyncJob, any PaymentSyncSchedulable class).
          
        * HTTP callout service classes (if separated, e.g., QuickBooksService class or HttpCalloutMock classes – though test classes aren’t needed to deploy, but actually Apex test classes should be deployed too so production can run them. Salesforce automatically includes test classes if you add all classes by name, but double-check).
          
        * Schedulable classes (PaymentSyncScheduler).
          
        * Apex test classes! – Make sure to include all test classes you wrote. They won’t run in production unless deployed. (An alternative is to select "Include all local Apex classes" in add components, but better to individually add to confirm).
        
    * **Custom Objects**: Add any custom object definitions:
      
        * Integration_Log__c (the custom object for logs).
          
        * Any custom metadata or custom settings objects if created (e.g., Integration_Config__mdt).
        
    * **Custom Fields**: Add custom fields added on standard objects:
      
        * QuickBooks_Invoice_ID__c on Opportunity.
          
        * PaymentStatus__c, AmountPaid__c on Opportunity.
          
        * QuickBooks_Customer_ID__c on Account.
          
        * Any other fields (like QuickBooks_Invoice_Number__c if created, etc.).
          
        * If fields are on the custom Integration_Log__c, that is included with object.
        
    * **Page Layouts**: If you added those fields to Opportunity or Account page layouts (likely you should so users can see them), include the updated layouts. E.g., Opportunity Layout, Account Layout. (Alternatively, you can manually add fields in production later, but better to deploy to ensure they're visible.)
      
    * **Permission Sets / Profiles**: If using a dedicated Integration User, perhaps you created a Permission Set granting access to new fields and classes. You may deploy that. Also, if the trigger or classes reference objects, make sure appropriate profiles have access (e.g., if a normal sales user triggers the code, they need at least read access to Account fields we query, etc., but since trigger runs in system mode, field-level security isn’t enforced in Apex for standard fields. However, for new custom fields, if you want users to see them, update profile FLS).
      
        * It's recommended to add **profiles** in change set with field permissions for the new fields. But as noted, profile deployment has limitations[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=The%20first%20thing%20to%20consider,sense%20checking%20a%20user%E2%80%99s%20permissions). As an alternative, create a Permission Set "QuickBooks Integration Access" including those fields and assign it to relevant users after deployment.
          
        * If including profiles: check "View/Add Dependencies" after adding profile – it might prompt to include fields or classes if needed. Actually, better approach: manually configure profile permissions post-deployment to avoid profile in change set issues (especially if production profile already has customizations).
        
    * **Named Credential & Auth Provider**: These are metadata and should be added:
      
        * Add the AuthProvider metadata (e.g., named "QuickBooks").
          
        * Add the NamedCredential (which references the AuthProvider). Note: when deploying Named Credential with OAuth, the consumer secret isn’t copied from sandbox to prod. In production, after deployment, you will have to edit the Auth Provider to re-enter the client secret or more likely just re-establish the auth by clicking authenticate. Actually, the Auth Provider will carry the Consumer Key/Secret values if included, because those are metadata. But the actual token will not exist in prod until you authenticate.
          
        * This is important: ensure the Connected App (which is behind Auth Provider) is set properly in prod. Possibly when deploying Auth Provider, Salesforce might create the Connected App in prod with those details. It should show up in Connected Apps.
        
    * **Remote Site Settings**: If you created any (for Node or Intuit endpoints), include those. (Not needed if only Named Cred used for QBO, but if Node named cred, include that too).
      
    * **Custom Labels**: If you created any custom labels for user-facing messages or such, include them.
      
    * **Email Template or Workflow**: If you decided to send notifications (maybe not in scope; skip if none).
      
    * **Profile Settings**: If not adding profiles, plan manual config. If adding, be careful. For example, if integration user profile needs API Enabled, ensure it’s enabled already by default (System Admin has it by default). If using a std profile that lacks something, might use a perm set.
    
* After selecting all components, click **Add to Change Set**. Use **View/Add Dependencies** to catch any missing pieces:
  
    * E.g., adding an Apex class might list its referenced classes/triggers (should already add all manually).
      
    * Adding a field should catch that the object is needed (but we explicitly added objects/fields).
      
    * For example, if Apex references a Custom Metadata type record, that record may need adding. If you used Custom Settings data, those are not metadata (unless List<metadata> type).
      
    * If anything was missed, add them.
    
* Once the change set is complete, **Upload** it to production:
  
    * Click **Upload**, choose the production org (it should show your production if sandbox is configured with deployment connection).
      
    * Confirm upload.
    
* In Production org, go to **Inbound Change Sets** (in Setup -> Deployment -> Inbound Change Sets). You should see the change set "QuickBooks Integration Deployment" after a few minutes. If not, refresh or ensure the connection was correct.
  
* **Before deploying**, ensure a few things in production:
  
    * The Auth Provider / Named Credential from sandbox might conflict if one already manually created in production. If you earlier manually set up an Auth Provider in prod (with perhaps a different name) to test something, this could cause duplicates or confusion. Ideally, if you manually set up, consider removing it before deploying to avoid duplicate name errors. Or deploy under a new name. But likely you haven't set up in prod yet, so fine.
      
    * Ensure production has any prerequisite:
      
        * My Domain deployed (for Auth Provider callbacks to work).
          
        * Deployment connection allowed (you did that initially).
    
* We will **Validate** first (see next section 5.3).
  

### **5.2 Dependency Management and Component Ordering**

Salesforce handles deploying components in an order that respects dependencies to some extent, but you still must include all related components:

* **Custom Fields and Apex**: Our Apex code references the custom fields on Opportunity/Account (like QuickBooks_Invoice_ID__c). If we deploy Apex classes/triggers **before** the fields exist in production, compilation will fail[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=For%20example%2C%20if%20you%20add,your%20change%20set%20that%20references). In a change set, all components are deployed together in one transaction, but the creation order might have to ensure fields are created before Apex is compiled. Salesforce does compile Apex after all components are in place, generally, so as long as fields are in same change set, it should be fine. To be safe:
  
    * You can split into two change sets: one for schema (objects/fields) and another for Apex, to strictly enforce order (deploy fields first, then code). However, that means two deployments and must ensure tests pass in first (test classes referencing new fields might fail if code deploy but no tests in first set – maybe skip tests for first if no code? But fields alone can deploy with no tests).
      
    * Alternatively, one change set containing everything often works if no circular references. The fields will be created first internally, then triggers compile. This usually works. If a class fails to compile complaining field not found, it means deployment tried to compile too early. That shouldn't happen normally since metadata deployment does compile at end.
      
    * If you want absolute certainty: you could deploy Custom Object & Custom Fields & named credential first (with RunLocalTests but there’s no code so maybe can do with no tests if no Apex in that set, but production demands tests if any Apex present. If first set has no Apex, you can choose to run no tests). Then deploy second set with Apex and triggers (which now find fields). This is a fallback if one-shot fails.
    
* **Record Data**:
  
    * If you have any required records to deploy, e.g., a Custom Metadata record (like an ItemRef Id or a flag), be sure to include those in the change set:
      
        * Custom Metadata types can include records as components. For example, if you created a custom metadata `Integration_Settings__mdt` with field `Default_Service_Item_ID`, and you made a record with that ID value, include that record.
        
    * Remote Site settings should deploy as active and no data beyond that needed.
      
    * We are not deploying actual data (like existing Opportunities or anything).
    
* **Profiles**:
  
    * If included, the profile metadata in change set might not capture all needed FLS for new fields unless you explicitly check them in sandbox profile and then add to set (or add field to set after profile, prompting dependency to include profile). It's tricky. A safer approach: after deploying, manually adjust profile permissions for new fields:
      
        * For example, ensure that Standard User can read those fields if needed, or that Integration User profile has modify all on Integration_Log__c, etc.
        
    * Because profile in change set can sometimes override things unexpectedly or fail if user perms mismatch, consider using a permission set approach. If you created a permission set, include it. Permission sets are easier to deploy and manage.
      
    * Note: If your Apex classes are with sharing or without, it influences if integration user needs special rights. E.g., PaymentSyncSchedulable likely runs in system mode, but if it queries Opportunities, user running it must see those records. If scheduled as admin user, fine. If making it global scheduled job as system, fine. Just consider record access if using with sharing.
    
* **Order of Execution on Deploy**:
  
    * The change set is applied and then all tests run. The order typically:
      
        * Create Custom Objects.
          
        * Create Custom Fields.
          
        * Create Remote Sites, Named Creds, etc.
          
        * Then create Apex classes and triggers (compiling them).
          
        * If triggers are active by default, they might attempt to run as part of deployment tests if any test inserts an Opportunity. Our test classes likely do insert opps which will fire the trigger. This is desired to test, but note: if in test context, the callout won't actually happen unless we set up HttpCalloutMock (which we do). We did implement tests with mocks, so it's fine.
          
        * If something goes wrong like trigger tries to callout during deployment tests without mock, that would fail because callouts in tests require mock. But our test should have provided the mock. Ensure the test covers that (we did).
    
* **Large Volume**: The change set is not huge, maybe a dozen components, so well under limits.
  
* **External references**: Named Credential references Auth Provider by name. That should link up since both are deployed. But ensure no environment-specific values:
  
    * E.g., the Auth Provider’s callback URL contains the Org ID of sandbox; when deployed to prod, it will adjust to prod’s Org ID automatically (since it's defined as a formula with org).
      
    * The Consumer Key/Secret in Auth Provider: In sandbox, you used Intuit dev app credentials. For production, you likely use the same credentials (if Intuit app covers both). So deploying them means prod now has the same key/secret configured – which is correct if using one Intuit app. If you intended to use a separate Intuit app for prod, you'd have to manually update consumer key/secret in Auth Provider after deployment to the prod-specific ones. So double-check plan:
      
        * If using one Intuit app for both, nothing to change, just have to re-auth.
          
        * If separate Intuit app, then after deployment go to Auth Provider in prod, edit Consumer Key/Secret to the prod app’s values (since the change set would have sandbox’s values). Document that step if that’s the case.
    
* **Email Settings**: If any email alerts or flows, ensure they not cause issues. We didn't design any flows, so fine.
  

### **5.3 Validation Procedures Before Deployment**

As emphasized, perform a validate-only deployment in Production to catch any issues early:

* In Production’s Inbound Change Set, after it shows as "Ready to Deploy", click **Validate** instead of Deploy. This will run all tests but not commit changes.
  
* Choose test execution: by default "Run Local Tests" is selected (which runs all Apex tests except managed packages). Leave it. It will run our integration test classes and all other existing tests in prod.
  
* Start validation. This can take a while if many tests. Our integration added new tests which will run. Ensure these tests don’t rely on sandbox-only data. They shouldn’t, as we wrote them to create their data. If any test was written with seeAllData=true or expecting certain data (e.g., you have an existing Pricebook2 Id or something), adjust tests to avoid environmental dependency. We likely accounted for that (like using `Test.getStandardPricebookId()` if needed).
  
* Once validation finishes:
  
    * If **success**, it will show no errors and code coverage %. Confirm the coverage is ≥75%. It should be, as our tests were targeted to raise from 58% to hopefully ~85% or more.
      
        * If overall coverage is still below 75%, it means either some classes were not covered as expected or production has additional classes (maybe old code) dragging coverage. Use the coverage report in Deployment detail (Production’s deployment status page shows overall and maybe a link to class coverage).
          
        * If coverage short, identify which classes have low coverage. Possibly production has code not in sandbox (like installed packages or older triggers). Note: installed package code is excluded unless "RunAllTests" was chosen, which we didn’t. Could be some classes lacked tests. In worst case, write test for them quickly in sandbox, deploy them and revalidate.
          
        * But given we raised from 58% to around 75+, it should pass. If not, be prepared to create some test classes to cover not-ours code or refactor as needed.
        
    * If **errors**:
      
        * Review error list. Common issues could be:
          
            * A class failed to compile due to missing field (meaning field didn’t deploy or dependency order issue). If that happens, consider deploying fields first as separate set.
              
            * Test failures: maybe a test failed in production environment. Possibly because production has data that causes logic differences, or production validation rules that our tests violate (e.g., if there's a validation on Opportunity that our test inserts triggered).
              
                * If a validation rule or trigger on Opportunity (unrelated) rejects the insert in our test, causing test failure, we might need to adjust test to set required fields. Check production for any required fields on opp/account that weren’t in sandbox.
                  
                * For example, if production has a required field "Business Line" on Opportunity, our test insertion of Opportunity might fail as that required field isn't set in test. We should adapt the test: set dummy values for required fields. You might discover these only on validation. The error log would show something like "FIELD_CUSTOM_VALIDATION_EXCEPTION, Business Line is required".
                  
                * If so, fix test in sandbox to populate that field, deploy test class alone or as part of set if possible, then re-run.
                
            * Another error might be something like Named Credential failed to save (e.g., if the Named Credential references an Auth Provider that isn't deployed yet – but we deploy both in same set, it should link).
              
            * Profile errors (like unknown user permission in profile, sometimes if sandbox had permission that production doesn’t e.g., a feature not enabled in prod). If profile deployment fails, consider removing profile from change set and do manual profile adjustments. It's often not critical to deploy profile itself as long as you handle perms manually.
            
        * Address each error: either by adjusting change set (add missing component, remove problematic one) or by modifying code/tests.
          
        * Then create a new change set version (you cannot modify an uploaded change set; you have to create a new one, or you can edit in sandbox and re-upload).
          
        * Validate again until no errors.
        
    * If tests run took too long (some orgs have thousands of tests, can be hours). You might be within acceptable window. Quick Deploy allows skipping re-run if within 10 days[help.salesforce.com](https://help.salesforce.com/s/articleView?id=sf.devops_center_deployment_validate_only.htm&language=en_US&type=5#:~:text=If%20you%20ran%20the%20validation,If%20the), so you likely will utilize that after final validation.
    
* After a successful validation, use the **Quick Deploy** feature:
  
    * On Deployment Status page, there will be **Quick Deploy** button next to that validation (provided it’s within 10 days and no changes since).
      
    * We plan to do the final deployment during a maintenance window (if needed) by clicking Quick Deploy, which will commit changes without running all tests again[gearset.com](https://gearset.com/blog/salesforce-quick-deploy-and-validated-deployment-packages-with-gearset/#:~:text=If%20you%20use%20Change%20Sets,risk%20out%20of%20real%20deployments).
      
    * Quick Deploy takes only a few minutes since no tests are re-run. It will just quickly apply changes.
      
    * Alternatively, you could click Deploy on the validated change set directly and it will prompt "since this change set was validated successfully on [datetime], you can deploy without rerunning tests". Use that option.
    
* Always keep an eye on code coverage in final validation output. Salesforce requires 75% _after_ deploying code. If just at 75 or 76, it's a bit risky if any slight difference. Better to have comfortable margin. Our goal was >80%. If coverage is exactly 75, consider adding another small test or two to bump it for safety.
  

### **5.4 Test Execution Selection During Deployment**

During actual deployment to production (the quick deploy or normal deploy), ensure proper test execution:

* For change sets, by default, all local tests run (which is what we did in validation). For quick deploy, it reuses those results, so we won't run again.
  
* If you needed to deploy in multiple parts and one part contains no code, e.g., deploying only custom fields, you might choose "Run specified tests = none" if possible. But production requires tests if any Apex in the change set. If first change set had only fields and no Apex, you can choose to run no tests (since no code to validate). But if even a single Apex trigger was included, you must run tests. Usually we include everything and run tests once.
  
* In cases where running all tests is extremely lengthy and you’re confident about integration tests specifically, one could use the "Run Specified Tests" option by listing only the new test classes[atrium.ai](https://atrium.ai/resources/how-to-test-code-coverage-in-salesforce-useful-tips-and-techniques/#:~:text=How%20to%20Test%20Code%20Coverage,Code). This drastically cuts test time. **However**, Salesforce only allows that if overall coverage is already ≥75% before deployment. If currently 58%, we cannot deploy by running only a few tests – it would be blocked since coverage pre-deployment is <75. So we must run all tests in this case.
  
* If overall tests are passing in sandbox and there's risk of some prod test failing unrelated, consider using "Run Specified Tests" listing your new test classes to avoid unrelated failures. But that requires confirming existing coverage is high enough. Given prod had 58% pre, that trick cannot be used because if we only run our tests, how does SF compute coverage? It will compute coverage of changed components plus whatever tests we ran. Actually for run specified, Salesforce calculates coverage of classes covered by those tests plus classes in change set. It's a bit unclear, but likely not satisfying the requirement if many classes unchanged have no test run then coverage not considered or considered 0. Safer not to use that in this scenario.
  
* In summary, stick to "Run Local Tests (all)".
  
* Make sure to uncheck "Include managed package tests" because that’s unnecessary unless specifically needed.
  

Document for your deployment team (which might be yourself):

* They must have RunAllTests or RunLocalTests selected. If they mistakenly choose a different level or partial, deployment might be refused (if try to do none or if environment allows, though in production UI it usually enforces run tests).
  
* Also mention: All tests must pass. If any failing tests unrelated to integration are present in production, deployment will fail. It's wise to check production's Apex test results ahead of time, ensure no existing failing tests. If there are, fix them in production or remove those classes if not needed (though one should not have failing tests normally, but if they exist, they will cause your deployment to fail even if your stuff is fine).
  
* If some failing test in prod cannot be fixed right away (maybe due to known issue but acceptable), one workaround is using Run Specified Tests to exclude them (not ideal best practice, but possible). However, as said, with coverage issues, not likely here.
  

### **5.5 Rollback Procedures and Contingency Planning**

Salesforce doesn't support an automatic rollback to previous metadata state once deployed (except the deployment fails then nothing is changed). So contingency planning is important:

* **Backup Metadata**: Before deploying, retrieve the current state of any components you will override:
  
    * Apex classes you are modifying or replacing (in our case, maybe none, since all integration classes are new. If we weren't modifying existing triggers but maybe adding new? If there was an existing Opportunity trigger in prod, and we replaced it or merged, that’s key. Suppose production had an existing Opportunity after insert trigger for something else, and we introduced an after update trigger. Two triggers can coexist, but if we edited an existing one, backup is needed).
      
    * If any class or trigger was modified to accommodate integration, keep a copy of original. For example, if you had to adjust an existing trigger to not conflict (maybe changed its logic or added a static flag), ensure you can revert if needed.
      
    * If data changes: we're mostly adding fields, not deleting anything. So no destructive changes to roll back.
    
* **Test in Prod Org (post validation)**: We rely on the validation which essentially did a test run. If that passed, high confidence. But once deployed, if something is off, you might have to disable or revert quickly:
  
    * If an issue arises with the Opportunity trigger (e.g., it's causing errors in a scenario not caught by tests), you might need to disable the trigger to let business continue:
      
        * Quick option: in Production, comment out the trigger body (can't via UI easily as it's code – you'd have to do a quick deployment of a commented-out trigger or set some condition in trigger to bypass logic).
          
        * Or deactivate trigger by temporarily increasing user requirements (not straightforward in SF, triggers can't be turned off except via Metadata or using a static setting).
          
        * A proactive measure: incorporate a feature flag:
          
            * For example, a Custom Setting "IntegrationEnabled" that the trigger checks: `if(setting.IntegrationEnabled) { enqueue job; } else { do nothing; }`. Keep it true normally. If you set to false in production (via custom setting UI), the trigger early-exits and integration effectively is off. This is a kill-switch without redeploy. This is a nice contingency. If you implemented that, ensure it's configurable. If not, then code change is needed to disable.
            
        * At minimum, know that if needed you can deploy a quick "patch" change set to comment out code or set a condition (with Run Specified Tests just for that patch ideally).
        
    * If Payment schedulable causes issues (unlikely to harm core operations), you can simply unschedule it if needed via Setup (Setup -> Apex Jobs -> unschedule or delete scheduled job).
      
    * If something with Auth/Named Cred goes wrong and affecting user login (shouldn't, as it's separate), not an issue for core.
    
* **Communication**: If deployment fails and quick rollback isn't possible, have a plan with stakeholders:
  
    * Because it's metadata, failing deployment means nothing changed, so no user impact, just delay.
      
    * If deployment succeeds but then we find an issue (like trigger causing errors), that's user impacting. In that event, decide if we should disable functionality:
      
        * Possibly instruct users not to mark deals Closed Won until issue resolved (worst case).
          
        * Or temporarily remove required conditions so no errors (if error is due to missing data in an edge case, fix data, etc.).
        
    * Ideally, test thoroughly in full sandbox with production-like data to avoid such surprises.
    
* **Staged Rollout**: One could also do a partial deploy: for example, deploy everything except actually activating the trigger (like do not include the trigger in initial deployment, then add it once comfortable with setup).
  
    * But triggers in SF can't be deactivated without removing from code. You could, for instance, set the trigger logic to only run for a certain test record or criteria initially. But that complicates things.
      
    * We did mention a feature flag pattern above, which effectively allows staged activation. If you included that and set it off by default in prod, you could deploy safely, then next day enable it to live run. If something goes wrong, disable again. If we didn't build that, it's okay.
    
* **Destructive Changes**: Not present in this integration (we didn't remove anything). If you were replacing an existing integration, you'd plan to remove old components after new ones confirmed working.
  
* **Data Integrity**: Contingency if invoice creation fails temporarily – no harm to data, just might have some Opportunities not synced. Those can be queued or retried later. So no risk of data loss from our side; worst is duplication in QuickBooks which we have to manually fix (delete a duplicate invoice).
  
* **Payment Sync**: If the schedulable accidentally did something undesirable (like marking wrong opps as paid), one can correct those records manually. Un-likely with correct mapping but mention that in worst case, have a way to verify and roll back by checking QuickBooks vs SF.
  

In summary, the plan is:

* Validate thoroughly in sandbox and with validation deploy.
  
* Use Quick Deploy to minimize risk of mid-deployment test failures (since already done).
  
* Keep a backup of any modified components (maybe none except new ones).
  
* If critical issue arises, use feature flag or quick code comment-out deployment to mitigate.
  

### **5.6 Post-Deployment Verification Steps**

After deploying the change set to production, perform a detailed verification to ensure all components are functioning as expected:

1. **Check Deployment Status**: Confirm on Deployment Status page that the deployment is marked **Succeeded**. If quick deployed, it should say succeeded as of that time. If any tests failed but it still let quick deploy (shouldn't if any test failed in validation), address that.
   
2. **Verify Components**:
   
    * Go to **Setup -> Apex Classes** in production. Ensure all new classes are present with correct names and statuses (active).
      
    * Go to **Setup -> Apex Triggers** and verify the Opportunity trigger is present and active on the object.
      
    * Check **Custom Objects**: Integration_Log__c is in Object Manager with correct fields.
      
    * Check **Custom Fields** on Opportunity/Account: confirm they exist via Object Manager and are added to page layouts (if you deployed layout changes, spot-check an Opportunity record to see if "QuickBooks Invoice ID" or Payment Status fields are visible. If not, add them manually to layout).
      
    * Check **Named Credential**: In Setup -> Security -> Named Credentials, find "QuickBooks". Ensure it’s there and references correct URL and Auth provider. It might show Authentication Status "Not Authenticated" initially (since we haven't re-auth in prod yet).
      
    * Check **Auth Provider**: In Setup -> Auth Providers, see "QuickBooks". Confirm Consumer Key/Secret appear (should be masked). The redirect URL listed should contain the prod org ID. Copy that and ensure it's added to Intuit Developer app settings (if not already).
      
    * If using Permission Sets, ensure they deployed: Setup -> Permission Sets -> find "QuickBooks Integration". Assign it to relevant users (like the Integration User or general user profiles if needed).
      
    * If using a Custom Metadata for config, verify the record exists with correct values (e.g., if we had an ItemRef id stored).
    
3. **Reconnect OAuth**:
   
    * Go to Named Credential "QuickBooks" and click **Authenticate**. This will open a new window for Intuit login. Log in with the appropriate Intuit account (for production, likely a production QuickBooks or a sandbox company login if you use that for testing).
      
    * Grant permission. After redirect, Salesforce should show the Named Credential with **Authentication Status: Authenticated**[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=Partner%29%20Image%3A%20Salesforce%20Integration%20,Top%20Salesforce%20Partner).
      
    * If any issue in auth (like wrong consumer secret because you needed to change it, fix the Auth Provider details and try again).
      
    * Once authenticated, maybe test a simple call: Use Developer Console to run an Anonymous Apex GET on e.g., company info or some small query to ensure the token works (as in Section 3.1 verification). E.g.:
      
        ```java
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:QuickBooks/v3/company/<realmId>/companyinfo/<realmId>?minorversion=65');
        req.setMethod('GET');
        Http http = new Http();
        HttpResponse res = http.send(req);
        System.debug(res.getStatusCode() + ' ' + res.getBody());
        ```
        
        Check debug (in DevConsole logs) for a 200 and company name etc. If 200, connectivity is good.
        
        * If 401/403, something still wrong with auth (maybe scopes issue or didn't refresh token properly). Investigate Intuit app scopes etc.
    
4. **End-to-End Functional Test**:
   
    * Identify a test Account in production (maybe create a dummy "Test Customer Corp" with an email like your email or a safe one).
      
    * Create a test Opportunity under that Account with Stage = something like Prospecting, an Amount $100 (small).
      
    * Now, simulate closing it: change Stage to "Closed Won" and save.
      
    * The Opportunity trigger should fire. Because it's asynchronous, the invoice creation will happen shortly after save.
      
    * To monitor: Check **Apex Jobs** in Setup -> Apex Jobs. You should see an entry for InvoiceSyncJob (the Queueable) queued or running. Wait a bit and refresh until it's not queued. If it fails, it might show Status = "Failed". Click its entry to see error message stack trace.
      
        * If it failed, fetch error: maybe "Unauthorized endpoint" (means remote site missing? But we used named cred, so not that). Or JSON parse error, etc. Debug accordingly.
          
        * Check Integration_Log__c records (maybe via a report or query) if it logged something.
        
    * If it succeeded, there should be no Apex error. Check the Opportunity record:
      
        * It should now have QuickBooks_Invoice_ID__c populated (if our code updated it).
          
        * Also Account.QuickBooks_Customer_ID__c if Account was created.
          
        * Maybe PaymentStatus still "Not Paid".
        
    * Login to QuickBooks Online (the environment where you connected). Check **Customers** list for "Test Customer Corp". It should appear (if new).
      
    * Check **Invoices** for that customer or recent invoices. There should be an invoice for $100. Verify the details (line description, etc match expectations).
      
    * If that worked, the core integration is functional. If something didn't appear, investigate:
      
        * If Customer created but no invoice, maybe invoice creation failed due to some missing field or QuickBooks rule. Possibly our code did not set something required (though QBO invoice requires minimal fields).
          
        * See Integration_Log or debug logs (we may need to enable Apex debug logs for the Integration User or running user to catch any system.debug outputs or exceptions).
          
        * Possibly we have to handle that scenario accordingly, fix code and redeploy small fix.
        
    * If all good, you can delete that test invoice from QuickBooks and corresponding SF records as needed (or mark them clearly as test).
      
    * Try a scenario with an Account that already has QuickBooks_Customer_ID (maybe from the above test, create a second opp on same account):
      
        * That opp's invoice should use existing customer, not create duplicate. Verify that no duplicate customer in QBO.
        
    * If partial payments are needed to test, you could mark part of invoice paid in QuickBooks:
      
        * For test, in QuickBooks, receive a payment of say $50 on that $100 invoice (if you have access to do so in QBO sandbox).
          
        * Then run (or wait for schedule or run manually) the PaymentSyncSchedulable:
          
            * You can run it via Developer Console: `System.schedule('TestPaymentSync','0 0 0 ? * * *', new PaymentSyncSchedulable());` which schedules it immediate? Actually cron "0 0 0 ? * * *" is daily at midnight, maybe pick a time a minute from now or just call the class's execute by instantiating and calling `execute(null)` (though normally not allowed outside scheduled context – you can test by making a test wrapper to call it or temporarily make a global method).
              
            * Simpler: temporarily modify PaymentSyncSchedulable to allow manual run for testing (or just schedule it for near immediate time).
              
            * Or set it up as scheduled in production for next hour and wait.
            
        * After it runs, see if the Opportunity PaymentStatus updates to 'Partially Paid' and AmountPaid $50.
          
        * Then pay rest $50 in QBO, run sync, see if it updates to Paid and 100.
        
    * Check the scheduled job is scheduled correctly: In Setup -> Scheduled Jobs, you should see "PaymentSyncSchedulable" scheduled at the intended frequency (if you deployed the scheduling via the metadata, which likely you did not, you have to schedule manually or via a post-deploy script).
      
        * We likely have to schedule it manually in production:
          
            * Go to Setup -> Apex Classes -> click Schedule Apex.
              
            * Name: "Daily QuickBooks Payment Sync", Class: select PaymentSyncSchedulable, schedule time (say 2 AM every day).
              
            * Save. Confirm it's listed in Scheduled Jobs.
              
            * Document that step if not automated.
        
    * Confirm field-level security:
      
        * Log in as a typical sales user profile (or use Login As if admin) and make sure they can see the new fields like QuickBooks Invoice ID on Opportunity or Payment Status. If not visible or accessible, adjust profile perms or share via permission set.
          
        * The integration user (if a separate user) might need permission to see and edit Opportunities, Accounts, and custom objects. Ensure the integration user's profile has at least read on Opportunity/Account (since trigger runs in system mode but our Payment sync uses queries – it runs under the scheduled user (which by default is the user who scheduled it, likely an admin, so fine).
          
        * Also ensure integration user can insert Integration_Log__c and read it. Probably give them modify all on that object if they are to log stuff.
        
    * Remove any debug logging set at high level to not fill logs (if you had Apex debug statements heavy, maybe okay, but consider turning off if not needed).
    
5. **User Training**: Post deployment, inform relevant users:
   
    * Sales Ops or Accounting that now, when an Opportunity is Closed Won, an invoice will be auto-created in QuickBooks. Show them where to find the QuickBooks Invoice ID on the Opportunity (maybe hyperlink logic can be added in formula field to open QBO invoice if needed).
      
    * Instruct Accounting that new QuickBooks customers from Salesforce will appear, to avoid confusion.
      
    * Let them know about the Payment Status field in Salesforce being updated daily – they can use it to see which deals have been paid. They should still rely on QuickBooks for actual payment details, but it's a nice heads-up.
      
    * Any limitations: e.g., "if you mark an Opportunity Closed Won without an email on the Account, the invoice will still be created but you won't have an email on it in QuickBooks" – highlight such scenarios so they can correct data either before or after sync.
      
    * Provide instructions for error handling: If an integration log entry appears (maybe surface via a report or email), how to interpret and fix (e.g., add missing data then mark Opportunity stage to something and back to Closed Won to retry, or ask admin to retry).
    
6. **Monitoring**:
   
    * Keep an eye on **Apex Exception logs** or **Integration Log records** in initial days. Any spike of failures should be addressed quickly (perhaps adding a missing field in mapping or adjusting validation).
      
    * The integration is largely server-side, so system admin should monitor initially to ensure no performance issues (Opportunity save might be slightly slower due to trigger, but since we offloaded heavy work to queueable, user experience should be fine).
      
    * Monitor **Apex Jobs** for any stuck or failing jobs. If Payment sync job fails repeatedly (maybe because one particular invoice always erroring), investigate that log.
      

By following these deployment and verification steps, you ensure that when the 30,000 RUB payment is to be approved (the success criteria mention), presumably the integration has successfully generated the corresponding invoice and perhaps even recorded payment – giving confidence to proceed. The agent executing the deployment will have everything laid out to avoid guesswork and handle any hiccups.

## Section 6: Production Verification Procedures

Finally, this section outlines comprehensive testing and verification in the production environment after deployment, ensuring that the integration works end-to-end: from Opportunity closure triggering invoice creation (and optionally QuickBooks payment), to error handling, performance under load, data consistency between systems, and user acceptance. These procedures double-check every aspect of the integration in a real-world context to validate that the implementation is successful and ready for the business use.

### **6.1 End-to-End Integration Flow Validation**

Perform an end-to-end test of the entire integration flow in production (or a production-like environment):

* **Create a Test Opportunity**: As mentioned, create a new Opportunity under a test Account (preferably an Account that won't mess with real data, maybe "Test Integration Account"). Set an Amount (e.g., 5000 RUB if your org currency is RUB, or any currency appropriate).
  
* **Stage Transition**: Change the Opportunity’s Stage to "Closed Won" and save. This simulates the normal business trigger for the integration.
  
* **Trigger Execution**: Immediately after saving:
  
    * The user save should succeed (no errors or unusual delay beyond normal).
      
    * Check that the Opportunity now might show the QuickBooks Invoice ID if your code updated it synchronously (though likely the ID is updated in the async job, so it may not appear instantly on page refresh; you might have to wait a few seconds and refresh the record).
      
    * Monitor the asynchronous process:
      
        * Go to **Setup -> Apex Jobs**. Look for the job (InvoiceSyncJob). It may show status "Processing" or "Queued", then "Completed".
          
        * If the job status becomes "Completed" with no errors, proceed. If "Failed", click on the job name to see error details (and check Integration_Log__c for a record around that time).
        
    * Once completed, refresh the Opportunity record and verify:
      
        * **QuickBooks Invoice ID** field is populated with an alphanumeric ID (e.g., "130...")[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/rest-api-features#:~:text=POST%20%2Fv3%2Fcompany%2F12345678%2Finvoice%20HTTP%2F1,xPfzFFw%20Host%3A%20quickbooks.api.intuit.com).
          
        * If you stored Invoice Number or any other fields (like maybe a link), check them too.
          
        * Account’s QuickBooks Customer ID is populated (if Account did not have one prior).
        
    * Log in to QuickBooks Online and verify:
      
        * The Account’s name now exists as a Customer (unless it existed before with same name). Open that Customer in QBO; verify its details (address, email, etc. should match Salesforce Account).
          
        * Under that Customer, a new Invoice exists with the correct amount and details:
          
            * Customer name matches.
              
            * Invoice date is correct.
              
            * Line item(s) match what we expected (description includes Opportunity name maybe, amount is correct, etc.).
              
            * Invoice is currently open (unpaid).
            
        * If QuickBooks automatically assigned an invoice number, note it (for cross-check with SF if needed).
        
    * This confirms that the Opportunity → QuickBooks creation part works.
    
* **Alternate Scenarios**:
  
    * Try closing an Opportunity for an Account that already has a QuickBooks ID:
      
        * E.g., if the first test created a Customer, create another Opportunity under the same Account and close it.
          
        * Confirm that the integration did **not** create a duplicate Customer (no new customer in QBO; the invoice should attach to the existing Customer via CustomerRef).
          
        * Confirm the Opportunity was updated with the Invoice ID as well.
        
    * Test an Opportunity with multiple line items (if your integration handles it):
      
        * Add a couple of Opportunity Products (OpportunityLineItems) to an Opportunity, then close it.
          
        * Verify QuickBooks invoice has separate lines for them (if implemented) or one aggregated line if that’s how you designed it.
        
    * Data edge case: Test with an Account missing some info:
      
        * Suppose an Account with no Billing Address or missing email, close an Opportunity for it.
          
        * See if integration still runs. QuickBooks should accept minimal data (just name). Check QBO: does it create the customer with blank address? Likely yes.
          
        * Note any warnings or log entries created (our log might not specifically log this, but if something were required and missing, QBO would error and log it).
          
        * If such a scenario passes (maybe with no email), consider whether that's acceptable (maybe yes, invoice can exist without email).
    
* **Error Injection (if possible)**:
  
    * To test error handling, you could intentionally create a scenario that triggers an error:
      
        * For example, try closing an Opportunity where the Account name is identical to an existing Customer in QuickBooks (but the Account itself has no QuickBooks ID in SF). This may cause QBO to respond with "Duplicate DisplayName" error on Customer create.
          
        * If that happens, see if our Integration_Log__c captured an error entry like "DisplayName already exists"[atrium.ai](https://atrium.ai/resources/how-to-test-code-coverage-in-salesforce-useful-tips-and-techniques/#:~:text=It%20supports%20the%20following%20API,retrieve).
          
        * Check that we didn't create a duplicate in QBO (preferably).
          
        * This tests how our code handles that. If our code attempted a query and fixed it, maybe it just attached to existing. Check if invoice still created under the existing customer.
          
        * If it simply logged error and didn't create invoice, then our integration requires manual intervention for duplicates (maybe linking the SF Account to the existing QBO customer by inputting the QBO ID on Account and retrying).
          
        * Document this as a known scenario (for admin to handle by linking and retrying).
        
    * Another error scenario: temporarily break Named Credential (e.g., revoke the token via Intuit account or change consumer secret to an invalid one) and then try closing an Opportunity:
      
        * The callout should fail with an authentication error.
          
        * Confirm that the Opportunity was not updated with an Invoice ID (and no invoice in QBO, obviously).
          
        * Check that an Integration Log entry is created indicating auth failure (and possibly our feature flag turned off integration if implemented).
          
        * This demonstrates how the system behaves under auth failure. After, fix the credential (re-auth) and perhaps attempt to reprocess the Opportunity (e.g., by editing and saving Stage again or using a manual retry).
    
* **Integration_Log__c**:
  
    * Query or create a List View for Integration Logs. Ensure successes or failures are recorded as expected. For example, after all tests, you might see:
      
        * A log "Invoice creation successful for Opp X" (if we log successes).
          
        * A log for any duplicate or auth fail we intentionally triggered, with error details.
        
    * If none of the test scenarios produced a log, consider forcing one by purposely altering something or keep this step as theoretical. It's good to verify the log object works (maybe create a dummy log from Developer Console to see it saves).
      
    * Also test if the Integration User (if separate) can write logs. If in debug logs you saw an exception "FIELD_ACCESS_EXCEPTION on inserting Integration_Log", it means integration user lacks permission. Fix profile/perm and test again by maybe manually calling the logging method.
    
* **Scheduled Payment Sync**:
  
    * We set up the schedule (daily or manual for now). We already tested it once manually during deployment verification.
      
    * Let it run on its schedule (e.g., next day) and verify it actually updated something:
      
        * Mark one of the test invoices in QBO as paid (Receive Payment in QBO).
          
        * Wait for the scheduled time (or if you can, adjust schedule to a few minutes from now for quick test).
          
        * After it runs, verify the corresponding Opportunity’s PaymentStatus__c changed to "Paid".
          
        * If not, check Apex Jobs for the scheduled job’s run (there will be a job instance logged). See if any error (maybe an email to Apex job failures would come to admin).
          
        * Possibly the Payment sync job didn't run because scheduling might require some conditions or the CRON was off. If so, manually run again or adjust.
        
    * If Partial payments possible, test by marking an invoice partially paid as above. See that PaymentStatus becomes "Partially Paid" and the amount.
      
    * Confirm that the Payment sync doesn't erroneously flip statuses for things that shouldn't (e.g., if an invoice is already paid in SF but QBO still shows open due to no refresh, our logic might mark it differently? Actually if SF says Paid but QBO says open, that would mean SF was wrong. Our code likely only updates where not Paid in SF. If one somehow got mis-marked, it wouldn't revert unless we coded that scenario. We probably didn't; probably okay.)
      
    * Check that the scheduled job appears under Apex Jobs with status Completed and no error logs each time it runs.
      
    * Also note performance: if it had to check many records, ensure it completes in reasonable time (check its duration if possible).
    
* **Load Test / Bulk Scenario**:
  
    * If possible, simulate a bulk closure of opportunities to see if integration handles it:
      
        * Use Data Loader or Workbench to update, say, 10-20 Opportunities at once to Closed Won.
          
        * Monitor that the trigger enqueued only one job (for each batch of up to 200)[learningsfdcisfun.com](https://learningsfdcisfun.com/queueable-test-class/#:~:text=,stopTest), and that the job processed all of them.
          
        * Ensure all those Opps get invoice IDs and QBO has the corresponding number of invoices.
          
        * This tests our bulk logic and confirms no governor limits issues in Queueable (Apex Jobs would fail if so).
          
        * If 20 worked, it’s likely 100 would too (we know ~100 callouts is the limit; if you can test ~100 by creating that many test opps, do so carefully, maybe in a full sandbox instead of production).
          
        * At least test enough to ensure you see the loop works for multiple, and maybe logs any one failing doesn't stop others (e.g., one of the 10 had an error but others still processed if code structured to continue on exception).
        
    * Check that total Apex CPU and heap etc in the job details were within limits (if easily accessible; if not, trust since it succeeded).
    
* **Data Integrity Verification**:
  
    * Compare a sample of data between systems:
      
        * For each test Opportunity, verify all corresponding QuickBooks fields.
          
        * No mismatches in amount, no missing required info (if QuickBooks had some default like if tax or currency differences, ensure it’s fine).
        
    * Ensure that no Salesforce data was unexpectedly changed:
      
        * E.g., Payment sync job didn't modify any unrelated records.
          
        * Opportunity Stage remained Closed Won (we didn't alter it).
          
        * No duplicates or weird records created in Salesforce (we only create logs).
          
        * The Integration_Log records have correct references (look at the lookup fields).
    
* **User Acceptance Testing Criteria**:
  
    * Engage a user or stakeholder to test the functionality from their perspective:
      
        * Sales rep: “When I mark an Opportunity Closed Won, I want an invoice created.” Check if they can verify in SF or want a confirmation (if needed, perhaps they check QuickBooks or rely on accounting to confirm).
          
        * Accounting: “When an invoice is created in QuickBooks from SF, I expect it to show up as usual in QBO. Also, Payment statuses should reflect in SF daily so sales knows who has paid.” Have an accounting user verify that a payment recorded in QBO did reflect in SF’s Payment Status field for that Opportunity.
          
        * If there's any acceptance criteria like “the integration should not noticeably slow down the closing of an Opportunity” – check that the time between hitting Save on Closed Won and regaining control is normal (the trigger itself just enqueues, which is very fast).
          
        * If they expected an email notification or chatter post or anything when invoice created (some orgs might want to notify the Opportunity owner that invoice #X was created), confirm if needed. We didn’t implement notifications, but if that was expected, address gap or note it for future.
        
    * Documentation: Provide users with a short guide on how to use the integration fields:
      
        * For example: "After closing an Opportunity, you'll see the 'QuickBooks Invoice ID'. You can click [somewhere] to view it in QuickBooks." (If you didn't implement a direct link, maybe instruct them to search that ID in QuickBooks).
          
        * "The Payment Status will update within 24 hours of payment. If urgent, contact accounting for immediate payment info."
          
        * "If an invoice needs to be voided or edited, coordinate with accounting – changes in QuickBooks will not reflect back except payment."
          
        * This ensures user clarity and reduces misinterpretation of integration function.
    
* **Performance Testing Under Load**:
  
    * If feasible in a sandbox with larger data, one could test extreme scenarios:
      
        * e.g., Bulk close 200 Opportunities (the max in one trigger context) to see if any limit hits.
          
        * Or schedule Payment sync to query say 500 open invoices. Possibly not easily testable without a large dataset in QBO (which you could create with script if needed).
        
    * Since production might not often have 200 deals closing at once, this might be fine.
      
    * But do monitor system logs for any signs of strain after go-live:
      
        * e.g., check Apex CPU time usage on queueable jobs if any long running queries. Our queries are fairly simple so should be fine.
          
        * Check Salesforce Integration User’s limits: Named Credential callouts usage (should be within daily API call limits – QBO calls are outbound HTTP, they do not count against SF API limits, just daily callout limit which is very high usually).
          
        * If integration fails under heavy load, consider using Batch Apex instead of queueable or splitting calls, but likely unnecessary.
    
* **Data Integrity Post-Payment**:
  
    * Ensure that if a Payment is recorded out-of-band (like an invoice was written off or credit memo), how does that reflect? If not handled, maybe no need in our scenario. Possibly mark as paid if balance 0 even if via credit, which is fine.
      
    * Check that no records are left in an inconsistent state:
      
        * e.g., Integration_Log shows failed but then even after fix we didn't update it. Possibly ensure to clean or mark resolved logs to avoid confusion.
          

After completing all the above verification steps, we can conclude that the integration is working correctly:

* Opportunities generate QuickBooks invoices correctly.
  
* Payment updates flow back.
  
* Error handling and logging are operational.
  
* Users are informed and satisfied that it meets requirements.
  

At this point, the finance team can be confident to approve the payment for this implementation (30,000 RUB or whatever the project cost) as the integration deliverable is functioning as specified, with all test cases passing and no outstanding issues.

* * *

**References** (for verification and deeper details):

* Salesforce code coverage and test practices[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Here%20I%20will%20explain%20the,those%20tests%20must%20complete%20successfully)[medium.com](https://medium.com/@salesforcebrains/apex-test-class-best-practices-10df06f02c7b#:~:text=Note%20the%20following%3A)[automationchampion.com](https://automationchampion.com/2023/05/12/calculate-overall-code-coverage-in-salesforce-2/#:~:text=ApexOrgWideCoverage%20represents%20code%20coverage%20test,results%20for%20an%20entire%20organization)
  
* Change set limitations and best practices[flosum.com](https://www.flosum.com/blog/limitations-of-changesets#:~:text=Failure%20to%20handle%20dependencies%20between,manage%20dependencies%20between%20these%20components)[salesforceben.com](https://www.salesforceben.com/everything-you-need-to-know-about-salesforce-change-sets/#:~:text=For%20example%2C%20if%20you%20add,your%20change%20set%20that%20references)
  
* Apex testing of callouts with HttpCalloutMock[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=1)[apexhours.com](https://www.apexhours.com/testing-web-services-callouts-in-salesforce/#:~:text=public%20class%20MockWeatherCallout%20implements%20HttpCalloutMock,returning%20mock%20response%20return%20mockRes)
  
* QuickBooks API example (invoice JSON structure)[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/rest-api-features#:~:text=POST%20%2Fv3%2Fcompany%2F12345678%2Finvoice%20HTTP%2F1,xPfzFFw%20Host%3A%20quickbooks.api.intuit.com)[developer.intuit.com](https://developer.intuit.com/app/developer/qbo/docs/learn/rest-api-features#:~:text=,%7D)
  
* OAuth setup for QuickBooks and Salesforce Named Credential[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=4,Kizzy)[kizzyconsulting.com](https://kizzyconsulting.com/quickbooks-to-salesforce-integration/#:~:text=8,we%20will%20create%20a%20custom).