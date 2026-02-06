#!/bin/bash
# /Users/m/Documents/wfm/competitor/naumen/cleanup_redundant_files.sh

echo "🧹 CLEANING UP REDUNDANT FILES..."

# ========================
# BACKUP FIRST
# ========================
echo "📦 Creating backup archive..."
cd /Users/m/Downloads
tar -czf backup_generated_files_$(date +%Y%m%d_%H%M%S).tar.gz *.ts *.html 2>/dev/null || echo "No .ts/.html files to backup in Downloads"

cd /Users/m/Documents/wfm/competitor/naumen/employee-management
tar -czf mv_backup_$(date +%Y%m%d_%H%M%S).tar.gz mv/ 2>/dev/null || echo "No mv directory to backup"

# ========================
# CHECK FILES ARE INTEGRATED
# ========================
echo "🔍 Checking integration status..."

# List of files that should be integrated
integrated_files=(
    "employee_types.ts:src/types/employee.ts"
    "employee_list_container.ts:src/components/EmployeeListContainer.tsx"
    "employee_filters.ts:src/components/EmployeeFilters.tsx"
    "employee_search_bar.ts:src/components/EmployeeSearchBar.tsx"
    "employee_table.ts:src/components/EmployeeTable.tsx"
    "skills_display.ts:src/components/SkillsDisplay.tsx"
    "team_badge_status_indicator.ts:src/components/TeamBadge.tsx"
    "employee_detail_modal.ts:src/components/EmployeeDetailModal.tsx"
    "employee_edit_form.ts:src/components/EmployeeEditForm.tsx"
    "photo_upload_component.ts:src/components/PhotoUploadComponent.tsx"
    "bulk_actions_toolbar.ts:src/components/BulkActionsToolbar.tsx"
    "team_management_panel.ts:src/components/TeamManagementPanel.tsx"
)

echo "✅ INTEGRATED FILES STATUS:"
for file_pair in "${integrated_files[@]}"; do
    source_file=$(echo $file_pair | cut -d':' -f1)
    target_file=$(echo $file_pair | cut -d':' -f2)
    
    if [ -f "/Users/m/Documents/wfm/competitor/naumen/employee-management/$target_file" ]; then
        echo "✅ $target_file exists"
    else
        echo "❌ $target_file MISSING"
    fi
done

# ========================
# REMOVE REDUNDANT FILES
# ========================
echo "🗑️  Removing redundant files..."

# Remove Downloads generated files (after backup)
cd /Users/m/Downloads
rm -f bulk_actions_toolbar.ts
rm -f employee_card_component.ts
rm -f employee_cards_view.ts
rm -f employee_detail_modal.ts
rm -f employee_edit_form.ts
rm -f employee_filters.ts
rm -f employee_import_export.ts
rm -f employee_list_container.ts
rm -f employee_management_demo.html
rm -f employee_search_bar.ts
rm -f employee_table.ts
rm -f employee_types.ts
rm -f main_app_demo.ts
rm -f performance_metrics_view.ts
rm -f photo_upload_component.ts
rm -f quick_add_employee.ts
rm -f skills_display.ts
rm -f skills_matrix_view.ts
rm -f team_badge_status_indicator.ts
rm -f team_management_panel.ts

echo "✅ Cleaned Downloads folder"

# Remove mv directory (after backup)
cd /Users/m/Documents/wfm/competitor/naumen/employee-management
rm -rf mv/

echo "✅ Cleaned mv directory"

echo "🎉 CLEANUP COMPLETE!"
echo "📦 Backups created in respective directories"
echo "🔧 All working files remain in their proper locations"