# ⚡ QUICK START - Next Agent Session

## 🚀 IMMEDIATE ACTION PLAN

### Step 1: Verify Current State (2 minutes)
```bash
cd /Users/m/git/clients/qbsf
sf apex run test --code-coverage --synchronous -o sanboxsf
```
**Expected**: 52% org-wide coverage, all tests passing

### Step 2: Improve QBInvoiceIntegrationQueueable Coverage (45 minutes)
**Target**: Get from 20% to 80%+ coverage

**Edit**: `/Users/m/git/clients/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`

**Add These Test Methods**:
```apex
@isTest
static void testHttpError() {
    Test.setMock(HttpCalloutMock.class, new HttpErrorMock());
    Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
    
    Test.startTest();
    QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
    System.enqueueJob(queueable);
    Test.stopTest();
    
    // Should handle errors gracefully without throwing exceptions
    System.assertEquals(0, [SELECT COUNT() FROM AsyncApexJob WHERE Status = 'Failed']);
}

@isTest
static void testInvalidJsonResponse() {
    Test.setMock(HttpCalloutMock.class, new InvalidJsonMock());
    Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
    
    Test.startTest();
    QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
    System.enqueueJob(queueable);
    Test.stopTest();
}

@isTest
static void testCalloutException() {
    Test.setMock(HttpCalloutMock.class, new CalloutExceptionMock());
    Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
    
    Test.startTest();
    QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
    System.enqueueJob(queueable);
    Test.stopTest();
}

// Add mock classes at end of file
public class HttpErrorMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(500);
        res.setStatus('Internal Server Error');
        res.setBody('{"error": "Server error"}');
        return res;
    }
}

public class InvalidJsonMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('Invalid JSON Response');
        return res;
    }
}

public class CalloutExceptionMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        throw new CalloutException('Network timeout');
    }
}
```

### Step 3: Deploy and Test (5 minutes)
```bash
sf project deploy start --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls -o sanboxsf
sf apex run test --code-coverage --synchronous -o sanboxsf
```

### Step 4: Check Additional Coverage Sources (15 minutes)
```bash
# Deploy extra test class if exists
sf project deploy start --source-dir QuickBooksInvoiceControllerExtraTest.cls -o sanboxsf

# Check deployment package for more tests
ls /Users/m/git/clients/qbsf/deployment-package/test_classes/
```

### Step 5: Deployment Validation (10 minutes)
```bash
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf
```

### Step 6: End-to-End Test (10 minutes)
1. **Create test opportunity in Salesforce UI**:
   - Account: Any US account
   - Stage: "Qualification" 
   - Amount: $1000

2. **Change stage**: "Qualification" → "Proposal and Agreement"

3. **Verify**: QB_Invoice_ID__c field gets populated

## 🎯 TARGET: 75% Coverage in 90 minutes

**Current**: 52%  
**Need**: +23%  
**Strategy**: Focus on QBInvoiceIntegrationQueueable (biggest impact)

## 📞 Success = Payment Approved!