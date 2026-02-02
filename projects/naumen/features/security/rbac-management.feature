Feature: Role-Based Access Control (RBAC) Management
  As a system administrator
  I want to manage user roles and permissions
  So that access to WFM features is properly controlled and audited

  Background:
    Given the WFM system is running
    And I am logged in as a system administrator
    And the RBAC system is configured

  @security @rbac @authentication
  Scenario: Create new user role with specific permissions
    Given I am on the Role Management page
    When I click "Create New Role"
    And I enter role name "Contact Center Supervisor"
    And I select permissions:
      | Permission              | Access Level |
      | View Employee Schedules | Read         |
      | Modify Schedules        | Write        |
      | View Reports           | Read         |
      | Approve Time Off       | Write        |
      | Access Admin Panel     | None         |
    And I click "Save Role"
    Then the role "Contact Center Supervisor" should be created
    And the role should have exactly the specified permissions
    And an audit log entry should be created for "Role Created"

  @security @rbac @validation
  Scenario: Prevent creation of role with conflicting permissions
    Given I am on the Role Management page
    When I create a role with both "Employee Data Access" and "Guest User" permissions
    Then I should see an error "Conflicting permissions detected"
    And the role should not be created
    And an audit log entry should record the failed attempt

  @security @rbac @inheritance
  Scenario: Role inheritance and permission cascading
    Given a parent role "Manager" exists with permissions:
      | Permission         | Access Level |
      | View Team Data     | Read         |
      | Generate Reports   | Write        |
    When I create a child role "Team Lead" inheriting from "Manager"
    And I add additional permission "Approve Overtime" with "Write" access
    Then the "Team Lead" role should have all parent permissions
    And the "Team Lead" role should have the additional permission
    And permission changes to "Manager" should cascade to "Team Lead"

  @security @rbac @assignment
  Scenario: Assign multiple roles to user with conflict resolution
    Given user "john.doe@company.com" exists
    And roles exist:
      | Role Name      | Permissions              |
      | Shift Manager  | Schedule Write, View All |
      | Report Viewer  | Reports Read Only        |
      | Temp Admin     | Limited Admin Access     |
    When I assign all three roles to the user
    Then the user should have the union of all permissions
    And conflicts should be resolved using highest privilege principle
    And an audit trail should show all role assignments

  @security @rbac @session
  Scenario: Role-based session timeout enforcement
    Given user "operator@company.com" has role "Basic Operator"
    And the role has session timeout of 30 minutes
    When the user logs in at 09:00
    And remains idle for 31 minutes
    Then the session should be automatically terminated
    And the user should be redirected to login page
    And an audit log should record "Session Expired - Idle Timeout"

  @security @rbac @emergency
  Scenario: Emergency access role activation
    Given user "emergency.admin@company.com" has "Emergency Access" role
    And emergency access is normally disabled
    When a system emergency is declared
    And I activate emergency protocols
    Then the emergency role should be temporarily enabled
    And emergency access should auto-expire after 4 hours
    And all emergency actions should be logged with "EMERGENCY" flag

  @security @rbac @audit
  Scenario: Comprehensive role activity auditing
    Given user "supervisor@company.com" has "Supervisor" role
    When the user performs the following actions:
      | Action                  | Resource              | Timestamp |
      | View Employee Schedule  | schedule/emp/123      | 10:00     |
      | Modify Shift Assignment | shift/456             | 10:15     |
      | Generate Report         | report/weekly/team1   | 10:30     |
      | Access Admin Setting    | admin/notification    | 10:45     |
    Then each action should be logged with:
      | Field         | Value                    |
      | User ID       | supervisor@company.com   |
      | Role          | Supervisor               |
      | Action        | [specific action]        |
      | Resource      | [resource identifier]    |
      | IP Address    | [user's IP]             |
      | Result        | Success/Denied           |
      | Timestamp     | [ISO 8601 format]       |

  @security @rbac @compliance
  Scenario: Role compliance reporting for audit
    Given the system has been running for 30 days
    And multiple users have various roles assigned
    When I generate a role compliance report
    Then the report should include:
      | Section                    | Content                               |
      | Role Distribution          | Count of users per role               |
      | Permission Usage           | Most/least used permissions           |
      | Access Violations          | Failed authorization attempts         |
      | Role Changes               | All role modifications with approvals |
      | Orphaned Permissions       | Permissions not assigned to any role  |
      | Excessive Privileges       | Users with admin-level access         |
    And the report should be exportable in PDF and CSV formats

  @security @rbac @performance
  Scenario: RBAC system performance under load
    Given the system has 1000+ users with various roles
    When 500 concurrent users attempt to access the system
    And each user has an average of 3 roles with 15 permissions each
    Then role resolution should complete within 200ms per user
    And permission checking should complete within 50ms per request
    And the system should maintain <5% CPU overhead for RBAC processing
    And memory usage for role caching should not exceed 100MB

  @security @rbac @integration
  Scenario: RBAC integration with external identity providers
    Given the system is configured for LDAP/Active Directory integration
    When a user "external.user@partner.com" logs in via SSO
    And their external groups are:
      | External Group      | Mapped WFM Role    |
      | Contact_Center_Mgrs | Supervisor         |
      | Reporting_Users     | Report Viewer      |
    Then the user should be automatically assigned mapped WFM roles
    And external group changes should sync within 15 minutes
    And role assignments should be revoked when user leaves external groups

  @security @rbac @backup
  Scenario: RBAC configuration backup and recovery
    Given the RBAC system has a complex configuration with 50+ roles
    When I export the RBAC configuration
    Then the export should include:
      | Component               | Format |
      | Role definitions        | JSON   |
      | Permission mappings     | JSON   |
      | User-role assignments   | CSV    |
      | Role inheritance rules  | JSON   |
      | Audit trail metadata   | JSON   |
    And I should be able to restore the configuration on a fresh system
    And all role relationships should be preserved after restoration

  @security @rbac @mobile
  Scenario: RBAC enforcement on mobile applications
    Given user "mobile.worker@company.com" has "Field Worker" role
    And they access the system via mobile app
    When they attempt to access features:
      | Feature              | Expected Result |
      | Personal Schedule    | Allowed         |
      | Team Schedules       | Denied          |
      | Time Off Requests    | Allowed         |
      | Admin Functions      | Denied          |
      | Report Generation    | Denied          |
    Then mobile app should enforce same RBAC rules as web interface
    And offline capabilities should respect user's role limitations
    And role changes should sync when device comes online