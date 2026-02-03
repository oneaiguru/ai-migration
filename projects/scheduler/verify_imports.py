import os
import sys

# Add symlinks directory to path
sys.path.insert(0, os.path.abspath('_modules_tmp'))

try:
    # Try importing all modules
    from task_parser import TaskParser
    from task_distributor import TaskDistributor
    from task_scheduler import TaskScheduler
    from api_client import DeepSeekClient
    
    print("✅ All imports are working correctly!")
except ImportError as e:
    print("❌ Import error:", e)
    sys.exit(1)
except SyntaxError as e:
    print("❌ Syntax error:", e)
    sys.exit(1)
