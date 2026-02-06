Feature: Data Encryption and Protection
  As a system administrator
  I want all sensitive data to be properly encrypted
  So that WFM data is protected at rest, in transit, and in memory

  Background:
    Given the WFM system is running with encryption enabled
    And I have administrator privileges
    And encryption keys are properly configured

  @security @encryption @data-at-rest
  Scenario: Employee PII encryption at rest
    Given the database contains employee records with sensitive data:
      | Field Type         | Example Data           | Encryption Required |
      | Full Name          | John Smith             | No                  |
      | Phone Number       | +1-555-123-4567       | Yes                 |
      | Email Address      | john.smith@company.com | Yes                 |
      | Social Security    | 123-45-6789           | Yes                 |
      | Bank Account       | 9876543210            | Yes                 |
      | Home Address       | 123 Main St, City     | Yes                 |
    When I query the database directly
    Then PII fields should be stored in encrypted format using AES-256
    And encryption keys should be stored separately from data
    And non-PII fields should remain unencrypted for performance

  @security @encryption @data-in-transit
  Scenario: API communication encryption
    Given the WFM frontend communicates with backend APIs
    When I monitor network traffic during normal operations:
      | Operation              | Data Transmitted       |
      | User Login             | Credentials            |
      | Schedule Updates       | Employee assignments   |
      | Report Generation      | Sensitive metrics      |
      | File Uploads           | Document attachments   |
    Then all communications must use TLS 1.3 or higher
    And certificate validation must be enforced
    And weak cipher suites should be disabled
    And data should not be readable in network captures

  @security @encryption @key-management
  Scenario: Encryption key rotation and management
    Given the system uses multiple encryption keys:
      | Key Type           | Rotation Period | Current Version |
      | Database Master    | 90 days         | v2023.12        |
      | API Session Keys   | 30 days         | v2024.01        |
      | File Storage Keys  | 60 days         | v2024.01        |
    When automatic key rotation is triggered
    Then new keys should be generated securely
    And old encrypted data should remain accessible
    And new data should use new keys
    And old keys should be retained for data recovery
    And key rotation should be logged in audit trail

  @security @encryption @memory-protection
  Scenario: Sensitive data protection in memory
    Given the application handles sensitive employee data
    When sensitive data is loaded into memory for processing:
      | Data Type              | Protection Required    |
      | Passwords/Tokens       | Immediate clearing     |
      | Credit Card Numbers    | Encrypted in memory    |
      | SSN/Tax IDs           | Encrypted in memory    |
      | Bank Account Details   | Encrypted in memory    |
    Then sensitive variables should be cleared after use
    And memory dumps should not contain readable sensitive data
    And garbage collection should overwrite sensitive memory regions
    And core dumps should be disabled or encrypted

  @security @encryption @backup-encryption
  Scenario: Encrypted backup and recovery procedures
    Given the system performs daily backups
    When backup process executes:
      | Backup Type        | Encryption Method      | Key Management      |
      | Database Dump      | AES-256-GCM           | Separate key store  |
      | File System        | Full disk encryption   | TPM-based keys      |
      | Configuration      | GPG encryption        | Admin key pairs     |
      | Logs              | Compressed + AES       | Rotation keys       |
    Then all backup files should be encrypted before storage
    And backup encryption keys should be managed separately
    And recovery procedures should be tested monthly
    And backup integrity should be verified automatically

  @security @encryption @field-level
  Scenario: Granular field-level encryption
    Given different data fields require different encryption levels
    When storing employee information:
      | Field Category     | Encryption Level   | Access Control     |
      | Public Info        | None               | All users          |
      | Internal Contact   | Standard AES       | Same department    |
      | Payroll Data      | AES + HSM          | HR & Finance only  |
      | Medical Records   | AES-256 + Audit    | HR managers only   |
      | Legal Documents   | HSM + Multi-sig    | Legal team only    |
    Then each field should use appropriate encryption strength
    And decryption should require proper authorization
    And field access should be logged for audit
    And encryption performance should not impact user experience

  @security @encryption @compliance
  Scenario: Encryption compliance verification
    Given the system must comply with GDPR, FSTEC, and ISO 27001
    When compliance audit is performed:
      | Requirement               | Implementation          | Verification Method   |
      | GDPR Article 32          | AES-256 encryption      | Technical audit       |
      | FSTEC Level 4            | GOST encryption support | Certification test    |
      | ISO 27001 A.10.1.1      | Cryptographic controls | Process review        |
      | PCI DSS (if applicable)  | Card data protection    | PCI scan             |
    Then all compliance requirements should be met
    And encryption implementations should be documented
    And compliance reports should be generated automatically
    And any gaps should trigger alerts

  @security @encryption @performance
  Scenario: Encryption performance optimization
    Given the system handles high-volume data operations
    When measuring encryption overhead:
      | Operation Type         | Baseline (ms) | With Encryption (ms) | Overhead |
      | Database Write         | 10            | 12                   | 20%      |
      | Database Read          | 8             | 9                    | 12.5%    |
      | API Response           | 15            | 17                   | 13%      |
      | File Upload           | 100           | 110                  | 10%      |
      | Report Generation     | 200           | 215                  | 7.5%     |
    Then encryption overhead should not exceed 25% of baseline
    And user-facing operations should remain under 500ms
    And batch operations should complete within SLA windows
    And hardware acceleration should be utilized where available

  @security @encryption @key-escrow
  Scenario: Emergency key escrow and recovery
    Given encryption keys may need emergency access
    When establishing key escrow procedures:
      | Scenario                | Escrow Method           | Recovery Process      |
      | Employee Termination    | HR master key          | Multi-person approval |
      | System Administrator    | C-suite escrow         | Legal authorization   |
      | Disaster Recovery       | Offline vault storage  | Executive approval    |
      | Legal Investigation     | Court-ordered access   | Legal compliance team |
    Then escrow keys should be stored securely offline
    And recovery should require multiple approvals
    And all escrow access should be logged and audited
    And regular escrow testing should be performed

  @security @encryption @quantum-resistance
  Scenario: Quantum-resistant encryption preparation
    Given quantum computing threats to current encryption
    When evaluating encryption algorithm readiness:
      | Current Algorithm      | Quantum Vulnerability  | Migration Timeline    |
      | RSA-2048              | High                   | 2-3 years             |
      | AES-256               | Low-Medium             | Monitor standards     |
      | ECDSA                 | High                   | 1-2 years             |
      | SHA-256               | Low                    | Monitor standards     |
    Then post-quantum cryptography migration plan should exist
    And algorithm agility should be built into the system
    And NIST post-quantum standards should be monitored
    And gradual migration should be possible without downtime

  @security @encryption @mobile-sync
  Scenario: Secure mobile device synchronization
    Given mobile workers need offline access to encrypted data
    When mobile device syncs with central system:
      | Sync Type             | Encryption Method       | Key Distribution      |
      | Initial Setup         | Device enrollment cert | Secure provisioning   |
      | Daily Data Sync       | AES session keys        | Key exchange protocol |
      | Offline Cache         | Local device encryption | Device-specific keys  |
      | Emergency Wipe        | Remote key destruction  | Push notification     |
    Then mobile data should be encrypted on device
    And sync should use end-to-end encryption
    And lost devices should not compromise central data
    And remote wipe should be immediate and verifiable

  @security @encryption @audit-trail
  Scenario: Encryption operation audit logging
    Given all encryption operations must be auditable
    When encryption-related events occur:
      | Event Type            | Log Details Required                    |
      | Key Generation        | Algorithm, key ID, timestamp            |
      | Key Rotation          | Old/new key IDs, rotation reason        |
      | Encryption/Decryption | Data type, user, operation result       |
      | Key Access           | Who, when, what data, authorization     |
      | Failed Operations     | Error type, user, attempted operation   |
      | Configuration Changes | What changed, who, approval process     |
    Then all events should be logged immutably
    And logs should be encrypted and tamper-evident
    And log retention should meet compliance requirements
    And automated alerts should trigger on anomalies