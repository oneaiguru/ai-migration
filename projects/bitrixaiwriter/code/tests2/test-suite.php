<?php
/**
 * Test suite for Text Rewriter System
 * 
 * Run with: ./vendor/bin/phpunit tests
 */

namespace Tests;

use PHPUnit\Framework\TestCase;
use Core\TextRewriteController;
use Core\PromptGenerator;
use Core\UniquenessChecker;
use Api\BitrixApiClient;
use Api\ClaudeApiClient;

/**
 * BitrixApiClient Tests
 */
class BitrixApiClientTest extends TestCase
{
    private $bitrixClient;
    private $mockHttpClient;

    protected function setUp(): void
    {
        // Create mock for HTTP client
        $this->mockHttpClient = $this->createMock(\GuzzleHttp\Client::class);
        
        // Initialize BitrixApiClient with mocked HTTP client
        $this->bitrixClient = new BitrixApiClient(
            'https://test.example.com/rest',
            'test_user',
            'test_password'
        );
        
        // Inject mock HTTP client
        $reflection = new \ReflectionClass($this->bitrixClient);
        $property = $reflection->getProperty('httpClient');
        $property->setAccessible(true);
        $property->setValue($this->bitrixClient, $this->mockHttpClient);
    }

    public function testAuth()
    {
        // Mock response for auth request
        $mockResponse = $this->createMock(\GuzzleHttp\Psr7\Response::class);
        $mockResponse->method('getBody')
            ->willReturn(json_encode(['result' => ['sessid' => 'test_session_id']]));
        
        // Set expectations for HTTP client
        $this->mockHttpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                'https://test.example.com/rest/user.login.json',
                $this->anything()
            )
            ->willReturn($mockResponse);
        
        // Test auth method
        $result = $this->bitrixClient->auth();
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('sessid', $result);
        $this->assertEquals('test_session_id', $result['sessid']);
    }

    public function testGetProducts()
    {
        // First mock auth
        $mockAuthResponse = $this->createMock(\GuzzleHttp\Psr7\Response::class);
        $mockAuthResponse->method('getBody')
            ->willReturn(json_encode(['result' => ['sessid' => 'test_session_id']]));
        
        // Mock response for getProducts
        $mockProductResponse = $this->createMock(\GuzzleHttp\Psr7\Response::class);
        $mockProductResponse->method('getBody')
            ->willReturn(json_encode([
                'result' => [
                    [
                        'ID' => 1,
                        'NAME' => 'Test Product',
                        'DETAIL_TEXT' => 'Test Description'
                    ]
                ]
            ]));
        
        // Set expectations for HTTP client
        $this->mockHttpClient->expects($this->exactly(2))
            ->method('request')
            ->withConsecutive(
                [
                    'POST',
                    'https://test.example.com/rest/user.login.json',
                    $this->anything()
                ],
                [
                    'POST',
                    'https://test.example.com/rest/catalog.product.list.json',
                    $this->anything()
                ]
            )
            ->willReturnOnConsecutiveCalls($mockAuthResponse, $mockProductResponse);
        
        // Test getProducts method
        $result = $this->bitrixClient->getProducts();
        
        $this->assertIsArray($result);
        $this->assertCount(1, $result);
        $this->assertEquals(1, $result[0]['ID']);
        $this->assertEquals('Test Product', $result[0]['NAME']);
    }

    public function testUpdateProduct()
    {
        // Mock auth response
        $mockAuthResponse = $this->createMock(\GuzzleHttp\Psr7\Response::class);
        $mockAuthResponse->method('getBody')
            ->willReturn(json_encode(['result' => ['sessid' => 'test_session_id']]));
        
        // Mock update response
        $mockUpdateResponse = $this->createMock(\GuzzleHttp\Psr7\Response::class);
        $mockUpdateResponse->method('getBody')
            ->willReturn(json_encode(['result' => true]));
        
        // Set expectations for HTTP client
        $this->mockHttpClient->expects($this->exactly(2))
            ->method('request')
            ->withConsecutive(
                [
                    'POST',
                    'https://test.example.com/rest/user.login.json',
                    $this->anything()
                ],
                [
                    'POST',
                    'https://test.example.com/rest/catalog.product.update.json',
                    $this->callback(function($options) {
                        $body = json_decode($options['body'], true);
                        return isset($body['id']) && $body['id'] === 1 
                            && isset($body['fields']) 
                            && isset($body['fields']['DETAIL_TEXT'])
                            && $body['fields']['DETAIL_TEXT'] === 'New Description';
                    })
                ]
            )
            ->willReturnOnConsecutiveCalls($mockAuthResponse, $mockUpdateResponse);
        
        // Test updateProduct method
        $result = $this->bitrixClient->updateProduct(1, ['DETAIL_TEXT' => 'New Description']);
        
        $this->assertTrue($result);
    }
}

/**
 * ClaudeApiClient Tests
 */
class ClaudeApiClientTest extends TestCase
{
    private $claudeClient;
    private $mockHttpClient;

    protected function setUp(): void
    {
        // Create mock for HTTP client
        $this->mockHttpClient = $this->createMock(\GuzzleHttp\Client::class);
        
        // Initialize ClaudeApiClient with mocked HTTP client
        $this->claudeClient = new ClaudeApiClient('test_api_key');
        
        // Inject mock HTTP client
        $reflection = new \ReflectionClass($this->claudeClient);
        $property = $reflection->getProperty('httpClient');
        $property->setAccessible(true);
        $property->setValue($this->claudeClient, $this->mockHttpClient);
    }

    public function testGenerateText()
    {
        // Mock response for Claude API request
        $mockResponse = $this->createMock(\GuzzleHttp\Psr7\Response::class);
        $mockResponse->method('getBody')
            ->willReturn(json_encode([
                'content' => [
                    [
                        'type' => 'text',
                        'text' => 'This is a generated response'
                    ]
                ]
            ]));
        
        // Set expectations for HTTP client
        $this->mockHttpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                'https://api.anthropic.com/v1/messages',
                $this->callback(function($options) {
                    $body = json_decode($options['body'], true);
                    return isset($body['model']) 
                        && isset($body['messages']) 
                        && isset($body['messages'][0]['content'])
                        && $body['messages'][0]['content'] === 'Test prompt';
                })
            )
            ->willReturn($mockResponse);
        
        // Test generateText method
        $result = $this->claudeClient->generateText('Test prompt');
        
        $this->assertEquals('This is a generated response', $result);
    }

    public function testExtractTextFromResponse()
    {
        // Test with valid response
        $response = [
            'content' => [
                [
                    'type' => 'text',
                    'text' => 'Part 1 of response'
                ],
                [
                    'type' => 'text',
                    'text' => 'Part 2 of response'
                ]
            ]
        ];
        
        $reflection = new \ReflectionClass($this->claudeClient);
        $method = $reflection->getMethod('extractTextFromResponse');
        $method->setAccessible(true);
        
        $result = $method->invoke($this->claudeClient, $response);
        
        $this->assertEquals("Part 1 of response\nPart 2 of response", $result);
    }

    public function testExtractTextFromResponseWithInvalidResponse()
    {
        // Test with invalid response
        $response = ['error' => 'Some error'];
        
        $reflection = new \ReflectionClass($this->claudeClient);
        $method = $reflection->getMethod('extractTextFromResponse');
        $method->setAccessible(true);
        
        $this->expectException(\Exception::class);
        $method->invoke($this->claudeClient, $response);
    }
}

/**
 * PromptGenerator Tests
 */
class PromptGeneratorTest extends TestCase
{
    private $promptGenerator;

    protected function setUp(): void
    {
        $this->promptGenerator = new PromptGenerator();
    }

    public function testGeneratePrompt()
    {
        $originalDescription = "Test product - Digital oscilloscope with 2 channels. Technical specifications: Bandwidth: 100 MHz, Sample rate: 1 GS/s.";
        
        $prompt = $this->promptGenerator->generatePrompt($originalDescription);
        
        // Check that the prompt contains the original description
        $this->assertStringContainsString($originalDescription, $prompt);
        
        // Check that the prompt contains instructions
        $this->assertStringContainsString('инструкции', $prompt);
        
        // Check that the prompt contains technical specs extracted from the description
        $this->assertStringContainsString('Bandwidth: 100 MHz', $prompt);
        $this->assertStringContainsString('Sample rate: 1 GS/s', $prompt);
    }

    public function testGenerateFewShotPrompt()
    {
        $originalDescription = "Test product - Digital multimeter.";
        $examples = [
            'Original text 1' => 'Rewritten text 1',
            'Original text 2' => 'Rewritten text 2'
        ];
        
        $prompt = $this->promptGenerator->generateFewShotPrompt($originalDescription, $examples);
        
        // Check that the prompt contains the original description
        $this->assertStringContainsString($originalDescription, $prompt);
        
        // Check that the prompt contains examples
        $this->assertStringContainsString('Original text 1', $prompt);
        $this->assertStringContainsString('Rewritten text 1', $prompt);
        $this->assertStringContainsString('Original text 2', $prompt);
        $this->assertStringContainsString('Rewritten text 2', $prompt);
    }

    public function testGetOptimalParameters()
    {
        // Test with different categories
        $params1 = $this->promptGenerator->getOptimalParameters('измерительные приборы');
        $params2 = $this->promptGenerator->getOptimalParameters('электроника');
        
        // Check that different categories return different temperature values
        $this->assertNotEquals($params1['temperature'], $params2['temperature']);
        
        // Check that values are within expected ranges
        $this->assertGreaterThanOrEqual(0, $params1['temperature']);
        $this->assertLessThanOrEqual(1, $params1['temperature']);
        $this->assertGreaterThanOrEqual(0, $params2['temperature']);
        $this->assertLessThanOrEqual(1, $params2['temperature']);
    }
}

/**
 * UniquenessChecker Tests
 */
class UniquenessCheckerTest extends TestCase
{
    private $uniquenessChecker;

    protected function setUp(): void
    {
        $this->uniquenessChecker = new UniquenessChecker('test_api_key');
    }

    public function testSetUniquenessThreshold()
    {
        // Test with valid threshold
        $this->uniquenessChecker->setUniquenessThreshold(80);
        
        $reflection = new \ReflectionClass($this->uniquenessChecker);
        $property = $reflection->getProperty('uniquenessThreshold');
        $property->setAccessible(true);
        
        $this->assertEquals(80, $property->getValue($this->uniquenessChecker));
        
        // Test with invalid threshold (should throw exception)
        $this->expectException(\InvalidArgumentException::class);
        $this->uniquenessChecker->setUniquenessThreshold(101);
    }

    public function testAddTextsForComparison()
    {
        $texts = ['Text 1', 'Text 2', 'Text 3'];
        
        $this->uniquenessChecker->addTextsForComparison($texts);
        
        $reflection = new \ReflectionClass($this->uniquenessChecker);
        $property = $reflection->getProperty('previousTexts');
        $property->setAccessible(true);
        
        $previousTexts = $property->getValue($this->uniquenessChecker);
        
        // Check that all texts have been added
        $this->assertCount(3, $previousTexts);
        $this->assertEquals('Text 1', $previousTexts[0]);
        $this->assertEquals('Text 2', $previousTexts[1]);
        $this->assertEquals('Text 3', $previousTexts[2]);
    }

    public function testCheckLocalUniqueness()
    {
        // Add some texts for comparison
        $this->uniquenessChecker->addTextsForComparison([
            'This is a test description of a digital multimeter.',
            'Another test description for a different product.'
        ]);
        
        // Test similar text
        $newText = 'This is a similar test description of a digital multimeter device.';
        $result1 = $this->uniquenessChecker->checkLocalUniqueness($newText);
        
        // Test different text
        $newText2 = 'Completely different text that has no similarity to previous ones.';
        $result2 = $this->uniquenessChecker->checkLocalUniqueness($newText2);
        
        // First text should have lower uniqueness due to similarity
        $this->assertLessThan($result2['uniqueness'], $result1['uniqueness']);
        
        // Second text should have very high uniqueness
        $this->assertGreaterThan(90, $result2['uniqueness']);
    }

    public function testGetWords()
    {
        $text = "This is a test text with some special-characters and 123 numbers!";
        
        $reflection = new \ReflectionClass($this->uniquenessChecker);
        $method = $reflection->getMethod('getWords');
        $method->setAccessible(true);
        
        $words = $method->invoke($this->uniquenessChecker, $text);
        
        $this->assertIsArray($words);
        $this->assertContains('this', $words);
        $this->assertContains('is', $words);
        $this->assertContains('a', $words);
        $this->assertContains('test', $words);
        $this->assertContains('text', $words);
        $this->assertContains('with', $words);
        $this->assertContains('some', $words);
        $this->assertContains('specialcharacters', $words); // special-characters without dash
        $this->assertContains('and', $words);
        $this->assertContains('123', $words);
        $this->assertContains('numbers', $words);
    }

    public function testCalculateJaccardSimilarity()
    {
        $words1 = ['this', 'is', 'a', 'test', 'text'];
        $words2 = ['this', 'is', 'another', 'text'];
        
        $reflection = new \ReflectionClass($this->uniquenessChecker);
        $method = $reflection->getMethod('calculateJaccardSimilarity');
        $method->setAccessible(true);
        
        $similarity = $method->invoke($this->uniquenessChecker, $words1, $words2);
        
        // There are 2 words in common out of 7 unique words total
        // Jaccard similarity should be 2/7 = approximately 0.286
        $this->assertEqualsWithDelta(0.286, $similarity, 0.001);
    }
}

/**
 * TextRewriteController Tests
 */
class TextRewriteControllerTest extends TestCase
{
    private $controller;
    private $mockBitrixClient;
    private $mockClaudeClient;
    private $mockPromptGenerator;
    private $mockUniquenessChecker;

    protected function setUp(): void
    {
        // Create mocks for dependencies
        $this->mockBitrixClient = $this->createMock(BitrixApiClient::class);
        $this->mockClaudeClient = $this->createMock(ClaudeApiClient::class);
        $this->mockPromptGenerator = $this->createMock(PromptGenerator::class);
        $this->mockUniquenessChecker = $this->createMock(UniquenessChecker::class);
        
        // Config for controller
        $config = [
            'batch_size' => 2,
            'retry_attempts' => 2,
            'log_file' => 'php://memory',
            'save_history' => true,
            'output_dir' => sys_get_temp_dir(),
            'uniqueness' => [
                'threshold' => 70,
                'use_external_api' => false
            ]
        ];
        
        // Create temporary directory for output
        if (!is_dir($config['output_dir'])) {
            mkdir($config['output_dir'], 0755, true);
        }
        
        // Initialize controller with mocks
        $this->controller = new TextRewriteController(
            $this->mockBitrixClient,
            $this->mockClaudeClient,
            $this->mockPromptGenerator,
            $this->mockUniquenessChecker,
            $config
        );
    }

    public function testRunFullProcess()
    {
        // Setup mock products
        $mockProducts = [
            [
                'ID' => 1,
                'NAME' => 'Product 1',
                'DETAIL_TEXT' => 'Description for product 1'
            ],
            [
                'ID' => 2,
                'NAME' => 'Product 2',
                'DETAIL_TEXT' => 'Description for product 2'
            ]
        ];
        
        // Setup mock prompt and generated text
        $mockPrompt = 'Test prompt';
        $mockGeneratedText = 'Generated description';
        
        // Setup uniqueness check result
        $mockUniquenessResult = [
            'uniqueness' => 85,
            'is_unique' => true,
            'source' => 'local'
        ];
        
        // Setup bulk update result
        $mockUpdateResult = [
            1 => ['success' => true, 'error' => null],
            2 => ['success' => true, 'error' => null]
        ];
        
        // Set up expectations for BitrixApiClient
        $this->mockBitrixClient->expects($this->once())
            ->method('getProducts')
            ->with([], ['ID', 'NAME', 'DETAIL_TEXT'], 5)
            ->willReturn($mockProducts);
        
        $this->mockBitrixClient->expects($this->once())
            ->method('bulkUpdateProducts')
            ->with([
                1 => ['DETAIL_TEXT' => $mockGeneratedText, 'DETAIL_TEXT_TYPE' => 'html'],
                2 => ['DETAIL_TEXT' => $mockGeneratedText, 'DETAIL_TEXT_TYPE' => 'html']
            ])
            ->willReturn($mockUpdateResult);
        
        // Set up expectations for PromptGenerator
        $this->mockPromptGenerator->expects($this->exactly(2))
            ->method('generatePrompt')
            ->withConsecutive(
                [$mockProducts[0]['DETAIL_TEXT']],
                [$mockProducts[1]['DETAIL_TEXT']]
            )
            ->willReturn($mockPrompt);
        
        // Set up expectations for ClaudeApiClient
        $this->mockClaudeClient->expects($this->exactly(2))
            ->method('generateText')
            ->with($mockPrompt)
            ->willReturn($mockGeneratedText);
        
        // Set up expectations for UniquenessChecker
        $this->mockUniquenessChecker->expects($this->exactly(2))
            ->method('checkUniqueness')
            ->with($mockGeneratedText, false)
            ->willReturn($mockUniquenessResult);
        
        // Run the full process
        $result = $this->controller->runFullProcess([], 5);
        
        // Check results
        $this->assertEquals(2, $result['total']);
        $this->assertEquals(2, $result['success']);
        $this->assertEquals(0, $result['failed']);
        $this->assertEquals(2, $result['unique']);
        $this->assertEquals(0, $result['not_unique']);
        $this->assertEquals(0, $result['skipped']);
        $this->assertEmpty($result['errors']);
    }

    public function testGenerateUniqueText()
    {
        // Setup mock prompt and generated text
        $mockPrompt = 'Test prompt';
        $mockGeneratedText = 'Generated description';
        
        // Setup uniqueness check result
        $mockUniquenessResult = [
            'uniqueness' => 85,
            'is_unique' => true,
            'source' => 'local'
        ];
        
        // Set up expectations for PromptGenerator
        $this->mockPromptGenerator->expects($this->once())
            ->method('generatePrompt')
            ->with('Original description')
            ->willReturn($mockPrompt);
        
        // Set up expectations for ClaudeApiClient
        $this->mockClaudeClient->expects($this->once())
            ->method('generateText')
            ->with($mockPrompt)
            ->willReturn($mockGeneratedText);
        
        // Set up expectations for UniquenessChecker
        $this->mockUniquenessChecker->expects($this->once())
            ->method('checkUniqueness')
            ->with($mockGeneratedText, false)
            ->willReturn($mockUniquenessResult);
        
        // Use reflection to access private method
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateUniqueText');
        $method->setAccessible(true);
        
        // Generate unique text
        $result = $method->invoke(
            $this->controller,
            1,
            'Product Name',
            'Original description'
        );
        
        // Check result
        $this->assertEquals($mockGeneratedText, $result);
    }

    public function testGenerateUniqueTextNotUnique()
    {
        // Setup mock prompt and generated text
        $mockPrompt = 'Test prompt';
        $mockGeneratedText = 'Generated description';
        
        // Setup uniqueness check result (not unique)
        $mockUniquenessResult = [
            'uniqueness' => 60,
            'is_unique' => false,
            'source' => 'local'
        ];
        
        // Set up expectations for PromptGenerator
        $this->mockPromptGenerator->expects($this->exactly(2))
            ->method('generatePrompt')
            ->with('Original description')
            ->willReturn($mockPrompt);
        
        // Set up expectations for ClaudeApiClient
        $this->mockClaudeClient->expects($this->exactly(2))
            ->method('generateText')
            ->with($mockPrompt)
            ->willReturn($mockGeneratedText);
        
        // Set up expectations for UniquenessChecker
        $this->mockUniquenessChecker->expects($this->exactly(2))
            ->method('checkUniqueness')
            ->with($mockGeneratedText, false)
            ->willReturn($mockUniquenessResult);
        
        // Use reflection to access private method
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateUniqueText');
        $method->setAccessible(true);
        
        // Generate unique text (should fail due to low uniqueness)
        $result = $method->invoke(
            $this->controller,
            1,
            'Product Name',
            'Original description'
        );
        
        // Check result (should be false due to failed uniqueness checks)
        $this->assertFalse($result);
    }
}
