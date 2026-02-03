#!/bin/bash
# check_package.sh - Скрипт для проверки и установки пакета

echo "==================================================="
echo "Проверка пакета invgen в Salesforce"
echo "==================================================="

# Переменные
SF_ALIAS="sanboxsf"
SF_INSTANCE_URL="https://customer-inspiration-2543--sanboxsf.sandbox.my.salesforce.com"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для печати секции
print_section() {
  echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Функция для проверки результата операции
check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    exit 1
  fi
}

# 1. Аутентификация в Salesforce Sandbox
print_section "Аутентификация в Salesforce Sandbox"

echo "Логин в Salesforce Sandbox..."
sf org login web --alias $SF_ALIAS --instance-url $SF_INSTANCE_URL
check_result "Логин в Salesforce Sandbox"

# 2. Получаем имена объектов
print_section "Получение информации об объектах"

# Создаем временный файл Apex для выполнения
cat > check_objects.apex << 'EOF'
// Поиск объектов Invoice
Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
List<String> objectNames = new List<String>();

for(String key : gd.keySet()) {
    Schema.DescribeSObjectResult describeResult = gd.get(key).getDescribe();
    String name = describeResult.getName();
    String label = describeResult.getLabel();
    
    // Ищем объекты со словом "Invoice" в метке или имени API
    if(name.containsIgnoreCase('invoice') || label.containsIgnoreCase('invoice')) {
        objectNames.add('API Name: ' + name + ', Label: ' + label);
    }
}

System.debug('Found Invoice objects: ' + objectNames);

// Проверяем наличие пространства имен invgen
String namespacePrefix = null;
Set<String> namespacePrefixes = new Set<String>();

for(String key : gd.keySet()) {
    Schema.DescribeSObjectResult describeResult = gd.get(key).getDescribe();
    String name = describeResult.getName();
    
    // Извлекаем префикс пространства имен, если он есть
    if(name.contains('__') && name.indexOf('__') > 0) {
        String prefix = name.substring(0, name.indexOf('__'));
        namespacePrefixes.add(prefix);
        
        if(prefix == 'invgen') {
            namespacePrefix = prefix;
        }
    }
}

System.debug('Detected namespace prefixes: ' + namespacePrefixes);
System.debug('invgen namespace exists: ' + (namespacePrefix != null));

// Проверяем конкретный объект Invoice
try {
    Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get('invgen__Invoice__c').getDescribe();
    System.debug('invgen__Invoice__c object exists: ' + describeResult.getName() + ', Label: ' + describeResult.getLabel());
    
    // Получаем список полей
    Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
    List<String> fieldNames = new List<String>();
    
    for(String fieldName : fieldMap.keySet()) {
        Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
        fieldNames.add(fieldName + ' (' + fieldDescribe.getType() + ')');
    }
    
    System.debug('Fields for invgen__Invoice__c: ' + fieldNames);
    
} catch(Exception e) {
    System.debug('invgen__Invoice__c object does not exist: ' + e.getMessage());
}
EOF

# Выполняем Apex код
sf apex run --file check_objects.apex --target-org $SF_ALIAS
check_result "Получение информации об объектах"

# 3. Определяем следующие шаги
print_section "Определение следующих шагов"

echo "На основе полученных результатов, следующие шаги могут включать:"
echo "1. Установка пакета invgen (если он отсутствует)"
echo "2. Модификация файлов развертывания для использования правильных имен объектов"
echo "3. Повторное развертывание"

echo -e "\n${GREEN}=========================================="
echo "Проверка завершена! Пожалуйста, проанализируйте результаты"
echo "==========================================${NC}"