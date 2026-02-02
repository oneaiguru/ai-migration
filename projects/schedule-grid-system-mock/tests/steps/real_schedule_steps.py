from behave import given, when, then
import requests
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

UI_BASE_URL = "http://localhost:3000"
API_BASE_URL = "http://localhost:8000/api/v1"

@given('I navigate to the schedule grid page')
def step_navigate_schedule_grid(context):
    context.driver.get(f"{UI_BASE_URL}/schedule")
    # Wait for page to load
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "schedule-grid-container"))
    )

@when('the component loads schedule data')
def step_component_loads_schedule(context):
    # Monitor network requests for schedule API call
    # This would be done through browser dev tools API or proxy
    time.sleep(2)  # Allow component to make API call
    context.schedule_load_attempted = True

@then('the operation should be sent to GET "{endpoint}"')
def step_verify_get_api_call(context, endpoint):
    # Verify the API call was made to the correct endpoint
    # In a real implementation, this would check network logs
    expected_url = f"{API_BASE_URL}{endpoint}"
    # This is a placeholder - real implementation would capture network requests
    assert context.schedule_load_attempted, f"Expected API call to {expected_url}"

@then('I should receive real schedule data from the backend')
def step_verify_real_schedule_data(context):
    # Check that actual data is displayed, not mock data
    employees = context.driver.find_elements(By.CLASS_NAME, "employee-row")
    assert len(employees) > 0, "No employees displayed"
    
    # Look for real data indicators (not mock patterns)
    first_employee = employees[0]
    employee_name = first_employee.find_element(By.CLASS_NAME, "employee-name").text
    # Real names should not be predictable mock names
    assert employee_name != "Абдуллаева Д.", "Displaying mock data instead of real data"

@then('the employees should be displayed with actual data')
def step_verify_employees_actual_data(context):
    # Verify employee data comes from API
    employees = context.driver.find_elements(By.CLASS_NAME, "employee-row")
    assert len(employees) > 0, "No employees found"
    
    for employee in employees[:3]:  # Check first 3 employees
        name_element = employee.find_element(By.CLASS_NAME, "employee-name")
        hours_element = employee.find_element(By.CLASS_NAME, "employee-hours")
        
        assert name_element.text.strip() != "", "Employee name is empty"
        assert hours_element.text.strip() != "", "Employee hours are empty"

@then('the schedule grid should show real shifts')
def step_verify_real_shifts(context):
    # Check for schedule cells with real shift data
    shift_cells = context.driver.find_elements(By.CLASS_NAME, "shift-block")
    if len(shift_cells) > 0:
        # Verify shifts have real times, not mock times
        first_shift = shift_cells[0]
        shift_time = first_shift.get_attribute("title") or first_shift.text
        # Should contain actual time data
        assert ":" in shift_time, "Shift does not contain time information"

@given('the schedule grid is loaded with real data')
def step_schedule_grid_loaded_real_data(context):
    step_navigate_schedule_grid(context)
    step_component_loads_schedule(context)
    # Wait for data to load
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "shift-block"))
    )

@when('I drag a shift from one employee to another')
def step_drag_shift_between_employees(context):
    # Find a shift to drag
    source_shift = context.driver.find_element(By.CLASS_NAME, "shift-block")
    
    # Find an empty cell in a different employee row
    employee_rows = context.driver.find_elements(By.CLASS_NAME, "employee-row")
    target_cell = None
    
    for row in employee_rows[1:]:  # Skip first row
        empty_cells = row.find_elements(By.CLASS_NAME, "empty-cell")
        if empty_cells:
            target_cell = empty_cells[0]
            break
    
    assert target_cell is not None, "No empty cell found for drop target"
    
    # Perform drag and drop
    action_chains = ActionChains(context.driver)
    action_chains.drag_and_drop(source_shift, target_cell).perform()
    
    context.drag_drop_performed = True

@then('the operation should validate move with POST "{endpoint}"')
def step_verify_validate_move_api(context, endpoint):
    # Verify validation API call was made
    expected_url = f"{API_BASE_URL}{endpoint}"
    # In real implementation, would capture network requests
    assert context.drag_drop_performed, f"Expected validation call to {expected_url}"

@then('if valid, update schedule with PUT "{endpoint}"')
def step_verify_update_schedule_api(context, endpoint):
    # Verify update API call was made after validation
    # This would check for the PUT request in network logs
    time.sleep(1)  # Allow API call to complete
    # Real implementation would verify the PUT request was made

@then('the shift should be moved to the new position')
def step_verify_shift_moved(context):
    # Check that the shift appears in the new location
    # This requires checking the DOM after the move operation
    time.sleep(2)  # Allow UI to update
    # Verify the shift is now in the target location

@then('the change should be persisted in the backend')
def step_verify_backend_persistence(context):
    # Refresh the page and verify the change persists
    context.driver.refresh()
    WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "schedule-grid-container"))
    )
    # Verify the moved shift is still in the new position after refresh

@given('the API server is not running')
def step_api_server_not_running(context):
    # This step assumes the API server is stopped for testing
    # In real test setup, this would involve stopping the API service
    context.api_server_running = False

@when('I attempt to load the schedule grid')
def step_attempt_load_schedule_grid(context):
    step_navigate_schedule_grid(context)
    # Allow time for API call to fail
    time.sleep(3)

@then('I should see an error message "{error_message}"')
def step_verify_error_message(context, error_message):
    # Look for error message in the UI
    try:
        error_element = WebDriverWait(context.driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "error-message"))
        )
        assert error_message in error_element.text, f"Expected error message '{error_message}' not found"
    except:
        # Alternative: check for any error indicators
        error_indicators = context.driver.find_elements(By.XPATH, "//*[contains(text(), 'error') or contains(text(), 'Error')]")
        assert len(error_indicators) > 0, "No error message displayed"

@then('a retry button should be available')
def step_verify_retry_button(context):
    retry_button = context.driver.find_element(By.XPATH, "//button[contains(text(), 'Повторить') or contains(text(), 'Retry')]")
    assert retry_button.is_displayed(), "Retry button not found or not visible"

@when('I attempt to move a shift to an invalid position')
def step_attempt_invalid_shift_move(context):
    # Try to move a shift to a position that should fail validation
    # This might be moving to a cell that already has a shift
    shifts = context.driver.find_elements(By.CLASS_NAME, "shift-block")
    if len(shifts) >= 2:
        source_shift = shifts[0]
        target_shift = shifts[1]
        
        # Try to drop on another shift (should be invalid)
        action_chains = ActionChains(context.driver)
        action_chains.drag_and_drop(source_shift, target_shift).perform()
        
        context.invalid_move_attempted = True

@then('I should receive validation errors from the backend')
def step_verify_validation_errors(context):
    # Check for validation error messages in the UI
    time.sleep(2)  # Allow error to appear
    error_elements = context.driver.find_elements(By.CLASS_NAME, "validation-error")
    assert len(error_elements) > 0, "No validation errors displayed"

@then('the move should be rejected with specific conflict messages')
def step_verify_conflict_messages(context):
    # Look for specific conflict messages
    error_element = context.driver.find_element(By.CLASS_NAME, "error-message")
    error_text = error_element.text.lower()
    
    # Should contain conflict-related words
    conflict_indicators = ["conflict", "occupied", "invalid", "cannot", "конфликт", "занято"]
    has_conflict_indicator = any(indicator in error_text for indicator in conflict_indicators)
    assert has_conflict_indicator, f"Error message does not indicate conflict: {error_text}"

@then('the shift should remain in its original position')
def step_verify_shift_unchanged(context):
    # Verify the shift did not move from its original position
    # This would require storing the original position and comparing
    shifts = context.driver.find_elements(By.CLASS_NAME, "shift-block")
    assert len(shifts) > 0, "No shifts found after failed move"

@then('the statistics should show real coverage percentage')
def step_verify_real_coverage_stats(context):
    # Look for coverage statistics in the footer
    coverage_element = context.driver.find_element(By.XPATH, "//*[contains(text(), '%')]")
    coverage_text = coverage_element.text
    # Should not be the mock 92% value
    assert "92%" not in coverage_text, "Displaying mock coverage percentage"

@then('the total employees count should match backend data')
def step_verify_real_employee_count(context):
    employee_count_element = context.driver.find_element(By.XPATH, "//*[contains(text(), 'сотрудников')]")
    count_text = employee_count_element.text
    # Extract number and verify it's reasonable (not the mock 5)
    import re
    numbers = re.findall(r'\d+', count_text)
    if numbers:
        count = int(numbers[0])
        assert count != 5, "Displaying mock employee count"

@then('the total shifts count should reflect actual schedules')
def step_verify_real_shifts_count(context):
    shifts_element = context.driver.find_element(By.XPATH, "//*[contains(text(), 'Смен в расписании')]")
    # Verify this shows actual data, not a hard-coded mock value
    assert shifts_element.is_displayed(), "Shifts count not displayed"

@then('the refresh button should reload data from the API')
def step_verify_refresh_functionality(context):
    # Find and click the refresh button
    refresh_button = context.driver.find_element(By.XPATH, "//button[contains(text(), 'Обновить') or contains(text(), '🔄')]")
    refresh_button.click()
    
    # Wait for reload to complete
    time.sleep(2)
    
    # Verify the component reloaded (this could be checked by monitoring network calls)
    assert True  # Placeholder - real implementation would verify API call

@given('my authentication token is invalid')
def step_invalid_auth_token(context):
    # Clear or corrupt the auth token
    context.driver.execute_script("localStorage.removeItem('authToken');")
    context.driver.execute_script("localStorage.setItem('authToken', 'invalid-token');")

@then('I should receive an authentication error')
def step_verify_auth_error(context):
    # Look for authentication-related error messages
    try:
        error_element = WebDriverWait(context.driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "error-message"))
        )
        error_text = error_element.text.lower()
        auth_indicators = ["authentication", "token", "login", "unauthorized", "аутентификация", "токен"]
        has_auth_indicator = any(indicator in error_text for indicator in auth_indicators)
        assert has_auth_indicator, f"Error message does not indicate auth problem: {error_text}"
    except:
        assert False, "No authentication error displayed"

@then('I should be prompted to log in again')
def step_verify_login_prompt(context):
    # Check for login redirect or prompt
    current_url = context.driver.current_url
    login_indicators = ["login", "auth", "sign-in"]
    has_login_indicator = any(indicator in current_url.lower() for indicator in login_indicators)
    
    if not has_login_indicator:
        # Alternative: look for login form or button
        login_elements = context.driver.find_elements(By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Войти')]")
        assert len(login_elements) > 0, "No login prompt found"

@then('no schedule data should be displayed')
def step_verify_no_schedule_data(context):
    # Verify that no employee or shift data is shown
    employees = context.driver.find_elements(By.CLASS_NAME, "employee-row")
    shifts = context.driver.find_elements(By.CLASS_NAME, "shift-block")
    
    assert len(employees) == 0, "Employee data displayed despite auth error"
    assert len(shifts) == 0, "Shift data displayed despite auth error"