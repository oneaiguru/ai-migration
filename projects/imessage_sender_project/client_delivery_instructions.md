# iMessage Sender - Client Delivery Instructions

This document outlines the steps for preparing and delivering the iMessage Sender application to the client. Follow these steps to ensure all components are properly tested and packaged.

## Testing and Verification

The following steps should be completed before delivering the application to the client:

1. **Set up the environment**
   ```
   pip install -r requirements.txt
   ```

2. **Run unit tests**
   ```
   python test_cli.py --run-all
   ```

3. **Run the final verification script**
   ```
   python final_verification.py
   ```
   This script will generate a comprehensive report of all components and their status.

4. **Test contact manager with sample data**
   ```
   python test_cli.py --contacts test_files/test_contacts.csv --template test_files/test_template.txt --test-send --mode mock
   ```

5. **Test message templating**
   ```
   python test_files/send_test_message.py +79161234567 --template test_files/test_template.txt --mock
   ```

6. **Complete GUI testing**
   Use the GUI testing checklist in `test_files/gui_test_checklist.md` to verify all UI components work properly.

7. **Create the deployment package**
   ```
   python test_files/prepare_deployment.py --version 1.0.0 --output ./dist
   ```
   This will create a zip file in the `dist` directory containing all required files.

## Client Handover

When delivering to the client, include the following:

1. The deployment package (ZIP file)
2. Installation instructions
3. User manual
4. Testing instructions:
   - Use `--mock` mode for initial testing
   - Test with small contact lists (3-5 contacts)
   - Space out test sessions to avoid triggering Apple's spam detection

## Testing Approach for the Client

Provide the client with the following testing instructions:

1. **Mock Testing**: First test the application in mock mode to verify contacts, templates, and the basic workflow.

2. **Limited Real Testing**: When ready to test actual sending, follow these guidelines:
   - Use only your own phone numbers or test accounts
   - Keep test volumes low (1-5 messages per session)
   - Space out test sessions by at least 30 minutes
   - Verify both sending and receiving end

3. **Scaling Up**: Only after successful limited testing, gradually increase the volume:
   - Start with 5-10 contacts
   - Monitor for any issues or rate limiting
   - Gradually increase volume if everything works properly

4. **Production Use**: For production use, recommend the following limits:
   - Maximum 50-100 messages per hour
   - Maximum 1000 messages per day
   - Include appropriate delays between messages (minimum 3-5 seconds)

## Troubleshooting

Common issues and their solutions:

1. **Messages not sending**: Check Apple ID status and connection to iMessage services.

2. **Permission issues**: Make sure Messages.app has appropriate permissions and automation access.

3. **Import failures**: Verify CSV/Excel file format matches expected schema.

4. **Template errors**: Check for proper variable syntax using double curly braces: `{{ variable_name }}`.

## Support

For technical support and maintenance requests, please contact:
[Your support contact information]