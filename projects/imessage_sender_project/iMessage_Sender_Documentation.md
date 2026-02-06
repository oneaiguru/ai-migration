# iMessage Sender - User Guide and Documentation

## Introduction

iMessage Sender is a powerful tool for sending personalized iMessage messages to multiple recipients. The system allows you to:

- Import contacts from CSV, Excel, and text files
- Create and use message templates with variables
- Send bulk messages with customizable delays
- Track message delivery status
- Generate reports on message campaigns

This documentation provides all the information you need to set up, test, and use the iMessage Sender system.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Features Overview](#features-overview)
5. [Working with Contacts](#working-with-contacts)
6. [Using Message Templates](#using-message-templates)
7. [Sending Messages](#sending-messages)
8. [Testing Best Practices](#testing-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Technical Reference](#technical-reference)

## System Requirements

- macOS 12.0 or newer
- Python 3.7 or newer
- Messages.app configured with an active Apple ID
- Internet connection for installing dependencies

## Installation

### Automatic Installation

1. Extract the iMessage Sender ZIP file to a location of your choice.
2. Open Terminal and navigate to the extracted folder:
   ```
   cd /path/to/imessage_sender
   ```
3. Run the installation script:
   ```
   ./start_imessage_sender.command
   ```
   This script will create a virtual environment and install all dependencies.

### Manual Installation

1. Extract the iMessage Sender ZIP file.
2. Open Terminal and navigate to the extracted folder.
3. Create a virtual environment:
   ```
   python3 -m venv venv
   ```
4. Activate the virtual environment:
   ```
   source venv/bin/activate
   ```
5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Getting Started

### Initial Configuration

After installation, you should configure the system:

1. Run the application:
   ```
   python3 gui.py
   ```
   (If using the command script: `./start_imessage_sender.command`)

2. Go to the Settings tab and configure:
   - Log file location
   - Templates directory
   - Default delay between messages (recommended: 3-7 seconds)
   - Other preferences

3. Test the configuration with a test message to your own number.

## Features Overview

### Contact Management

- Import contacts from CSV, Excel, and text files
- Validate phone numbers automatically
- Detect and handle duplicate contacts
- Export contacts to various formats

### Message Templates

- Create templates with variable placeholders
- Support for special variables like date and time
- Preview templates with sample data
- Save and load templates from files

### Message Sending

- Send to individual contacts or in bulk
- Add media attachments (images, documents)
- Configure delays between messages
- Monitor sending progress

### Reporting

- Track message delivery status
- Generate sending reports
- Export logs in various formats

## Working with Contacts

### Supported File Formats

- **CSV**: Standard comma-separated values files
- **Excel**: XLSX files with contact data
- **TXT**: Plain text files with one phone number per line

### CSV Format

The recommended CSV format includes at least these columns:
- `phone` (required): The phone number to send to
- `name` (optional): The recipient's name
- Additional columns can be used as variables in templates

Example:
```csv
phone,name,company,event
+11234567890,John Smith,ACME Inc,product launch
+10987654321,Jane Doe,XYZ Corp,training session
```

### Phone Number Format

Phone numbers should ideally be in international format:
- Starting with + and country code: `+11234567890`
- The system will attempt to format Russian phone numbers correctly (convert 8 to +7)

### Importing Contacts

1. Go to the Contacts tab
2. Click "Import Contacts"
3. Select the file format and locate your file
4. Review the imported contacts
5. Fix any validation issues if needed

## Using Message Templates

### Template Variables

Use double curly braces to define variables:
```
Hello, {{ name }}!

This is a reminder about {{ event }} on {{ date }}.

Best regards,
{{ company }}
```

### Special Variables

The following special variables are available:
- `{{ date }}`: Current date (format: DD.MM.YYYY)
- `{{ time }}`: Current time (format: HH:MM)
- `{{ datetime }}`: Combined date and time
- `{{ year }}`, `{{ month }}`, `{{ day }}`: Individual date components
- `{{ hour }}`, `{{ minute }}`: Individual time components

### Creating Templates

1. Go to the Templates tab
2. Click "New Template"
3. Write your message with variables
4. Preview with sample data
5. Save the template to a file

## Sending Messages

### Test Sending

Always test your setup before sending to multiple recipients:

1. Import a small contact file (or add a test contact manually)
2. Create and select a template
3. Click "Test Send" to send to a single contact (preferably yourself)
4. Verify the message is received correctly

### Bulk Sending

To send to multiple contacts:

1. Import your contacts
2. Select your template
3. Configure sending parameters (delays, batch size)
4. Click "Start Sending"
5. Monitor the progress

### Recommended Sending Practices

- **Start small**: Begin with 5-10 contacts
- **Monitor carefully**: Watch for any issues or rate limits
- **Use reasonable delays**: At least 3-5 seconds between messages
- **Respect daily limits**: Keep total volume under 500-1000 messages per day
- **Send during appropriate hours**: Avoid very late or early hours

## Testing Best Practices

### Testing Modes

The system supports different testing modes:

- **Mock Mode**: Simulates sending without actually sending messages
- **Real Mode**: Actually sends messages through Messages.app

### Using Mock Mode

For testing without sending actual messages:

```bash
python test_files/send_test_message.py +11234567890 --mock
```

This will simulate the sending process without actually sending any messages.

### Testing Template Rendering

To test if your template renders correctly:

1. Go to the Templates tab
2. Load your template
3. Click "Preview"
4. Verify all variables are replaced correctly

### Testing Contact Import

To verify your contact list works correctly:

1. Import your contact file
2. Check the number of successfully imported contacts
3. Verify phone numbers are formatted correctly
4. Check for any validation warnings

## Troubleshooting

### Common Issues

#### Messages Not Sending

- Check that Messages.app is running and signed in
- Verify that your Apple ID is properly configured
- Make sure you have a working internet connection
- Check if the recipient can receive iMessages

#### Import Failures

- Verify the file format (encoding, column names)
- Check for special characters in the file
- Ensure required columns (phone) are present
- Try a different file format if needed

#### Template Issues

- Check that all variable names match your contact data
- Verify the syntax of variable placeholders
- Look for typos in variable names

### Log Files

The application keeps detailed logs that can help troubleshoot issues:

- Check the logs directory for log files
- Look for ERROR or WARNING level messages
- Export logs for troubleshooting assistance

## Technical Reference

### Command Line Options

The system includes several command-line tools for advanced usage:

#### Test CLI

```bash
python test_cli.py --run-all                # Run all tests
python test_cli.py --test-module test_basic # Run specific tests
python test_cli.py --mode mock --contacts file.csv --template template.txt --test-send  # Test with mock sending
```

#### Send Test Message

```bash
python test_files/send_test_message.py +11234567890           # Send to specific number
python test_files/send_test_message.py +11234567890 --mock    # Test without sending
python test_files/send_test_message.py +11234567890 --template test_files/template.txt  # Use specific template
```

### File Structure

The application has the following structure:

- `contact_manager.py`: Contact management functionality
- `message_template.py`: Template handling
- `imessage_sender.py`: Core sending functionality
- `logger.py`: Logging system
- `config.py`: Configuration management
- `gui.py`: Graphical user interface
- `requirements.txt`: Dependencies
- `templates/`: Directory for saved templates
- `logs/`: Directory for log files
- `test_files/`: Test utilities and resources

### Security and Privacy

This application:
- Only sends messages through your own Messages.app
- Does not transmit your contacts or messages to any third parties
- Runs entirely on your local machine
- Respects Apple's messaging guidelines

### Best Practices for Production Use

1. **Start with small batches**: Begin with 5-10 contacts
2. **Use reasonable delays**: 3-7 seconds between messages is recommended
3. **Stay within limits**: Keep under 500-1000 messages per day
4. **Monitor for blocks**: Watch for any signs of rate limiting
5. **Use high-quality lists**: Ensure contacts are valid and verified
6. **Respect messaging hours**: Send during appropriate times
7. **Test thoroughly**: Always test templates and flows before bulk sending

## Support

For technical support and maintenance requests, please contact:
[Your support contact information]