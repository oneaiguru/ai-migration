# bot/states.py
from aiogram.fsm.state import State, StatesGroup

class UserStates(StatesGroup):
    """Finite state machine states for user bot interaction"""
    
    # Initial state
    start = State()
    
    # Story selection state
    story_selection = State()
    
    # Main investigation state
    investigation = State()
    
    # Character interaction states
    character_interaction = State()
    character_question = State()
    
    # Evidence analysis states
    evidence_analysis = State()
    evidence_notes = State()
    
    # Scene exploration state
    scene_exploration = State()
    
    # Case solution state
    case_solution = State()
    
    # Help and settings states
    help = State()
    settings = State()
