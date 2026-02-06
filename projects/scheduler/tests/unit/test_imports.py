def test_imports():
    """Test that all imports are working"""
    import task_parser
    import task_distributor
    import task_scheduler
    import api_client
    import processors
    import main_scheduler
    
    assert task_parser
    assert task_distributor
    assert task_scheduler
    assert api_client
    assert processors
    assert main_scheduler

def test_classes():
    """Test that the main classes can be imported"""
    from task_parser import TaskParser
    from task_distributor import TaskDistributor
    from task_scheduler import TaskScheduler
    from api_client import DeepSeekClient
    
    assert TaskParser
    assert TaskDistributor
    assert TaskScheduler
    assert DeepSeekClient
