// Get the metadata of the OpportunityQuickBooksTrigger
MetadataService.MetadataPort service = createService();
MetadataService.ApexTrigger apexTrigger = (MetadataService.ApexTrigger) service.readMetadata(
    'ApexTrigger', new String[] { 'OpportunityQuickBooksTrigger' }
).getRecords()[0];

// Update the trigger body to use 'Proposal and Agreement' instead of 'Closed Won'
String updatedBody = apexTrigger.body.replace(
    'final String INVOICE_STAGE = \'Closed Won\';',
    'final String INVOICE_STAGE = \'Proposal and Agreement\';'
);

apexTrigger.body = updatedBody;

// Update the trigger
MetadataService.SaveResult[] results = service.updateMetadata(
    new MetadataService.Metadata[] { apexTrigger }
);

// Check results
for (MetadataService.SaveResult result : results) {
    if (result.success) {
        System.debug('Successfully updated trigger');
    } else {
        for (MetadataService.Error error : result.errors) {
            System.debug('Error: ' + error.message);
        }
    }
}