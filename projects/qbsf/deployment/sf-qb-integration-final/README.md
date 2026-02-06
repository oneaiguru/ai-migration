# Salesforce-QuickBooks Integration

This is the production package for the Salesforce-QuickBooks Integration middleware.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your specific configuration details.

### Invoice Currency Policy

`QB_INVOICE_CURRENCY_POLICY` controls which currency the middleware uses when creating invoices:

- `opportunity` (default): invoice currency follows the Salesforce Opportunity currency.
- `customer`: invoice currency follows the existing QuickBooks customer currency (required by QBO when the customer currency is fixed and differs from the Opportunity).

For new deployments, set this explicitly to avoid surprises during upgrades.

3. **Start the application**:
   ```bash
   npm start
   ```

For full documentation, refer to the separate documentation package provided.
