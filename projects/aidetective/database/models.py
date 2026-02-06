# database/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, JSON, Text
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, List, Dict, Any

Base = declarative_base()

class User(Base):
    """User of the bot"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    telegram_id = Column(Integer, unique=True, nullable=False, index=True)
    username = Column(String(50))
    first_name = Column(String(50))
    last_name = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    investigations = relationship("Investigation", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, telegram_id={self.telegram_id}, username={self.username})>"

class Story(Base):
    """Detective story that users can investigate"""
    __tablename__ = 'stories'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    difficulty = Column(String(20), default="easy")  # easy, medium, hard
    is_premium = Column(Boolean, default=False)
    
    # Relationships
    characters = relationship("Character", back_populates="story", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="story", cascade="all, delete-orphan")
    nodes = relationship("StoryNode", back_populates="story", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="story")
    
    def __repr__(self) -> str:
        return f"<Story(id={self.id}, title='{self.title}')>"

class Character(Base):
    """Character in a story"""
    __tablename__ = 'characters'
    
    id = Column(Integer, primary_key=True)
    story_id = Column(Integer, ForeignKey('stories.id', ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    initial_status = Column(String(20), default="witness")  # witness, suspect, criminal
    
    # Relationships
    story = relationship("Story", back_populates="characters")
    character_states = relationship("CharacterState", back_populates="character", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Character(id={self.id}, name='{self.name}')>"

class Evidence(Base):
    """Evidence in a story"""
    __tablename__ = 'evidence'
    
    id = Column(Integer, primary_key=True)
    story_id = Column(Integer, ForeignKey('stories.id', ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    image_path = Column(String(255))
    scene = Column(String(100))  # The scene where this evidence is found
    
    # Relationships
    story = relationship("Story", back_populates="evidence_items")
    evidence_states = relationship("EvidenceState", back_populates="evidence", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Evidence(id={self.id}, name='{self.name}')>"

class StoryNode(Base):
    """Node in the story graph representing a step in the story"""
    __tablename__ = 'story_nodes'
    
    id = Column(Integer, primary_key=True)
    story_id = Column(Integer, ForeignKey('stories.id', ondelete="CASCADE"), nullable=False)
    node_id = Column(String(50), nullable=False)
    content = Column(Text)
    transitions = Column(JSON)  # Dict of possible transitions to other nodes
    
    # Relationships
    story = relationship("Story", back_populates="nodes")
    
    def __repr__(self) -> str:
        return f"<StoryNode(id={self.id}, node_id='{self.node_id}')>"

class Investigation(Base):
    """User's investigation of a story"""
    __tablename__ = 'investigations'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    story_id = Column(Integer, ForeignKey('stories.id', ondelete="CASCADE"), nullable=False)
    current_node = Column(String(50), default="start")
    state = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="investigations")
    story = relationship("Story", back_populates="investigations")
    character_states = relationship("CharacterState", back_populates="investigation", cascade="all, delete-orphan")
    evidence_states = relationship("EvidenceState", back_populates="investigation", cascade="all, delete-orphan")
    conversation_entries = relationship("ConversationEntry", back_populates="investigation", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Investigation(id={self.id}, user_id={self.user_id}, story_id={self.story_id})>"

class CharacterState(Base):
    """State of a character in an investigation"""
    __tablename__ = 'character_states'
    
    id = Column(Integer, primary_key=True)
    investigation_id = Column(Integer, ForeignKey('investigations.id', ondelete="CASCADE"), nullable=False)
    character_id = Column(Integer, ForeignKey('characters.id', ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="witness")  # witness, suspect, criminal
    notes = Column(Text)
    
    # Relationships
    investigation = relationship("Investigation", back_populates="character_states")
    character = relationship("Character", back_populates="character_states")
    
    def __repr__(self) -> str:
        return f"<CharacterState(investigation_id={self.investigation_id}, character_id={self.character_id}, status='{self.status}')>"

class EvidenceState(Base):
    """State of evidence in an investigation"""
    __tablename__ = 'evidence_states'
    
    id = Column(Integer, primary_key=True)
    investigation_id = Column(Integer, ForeignKey('investigations.id', ondelete="CASCADE"), nullable=False)
    evidence_id = Column(Integer, ForeignKey('evidence.id', ondelete="CASCADE"), nullable=False)
    discovered = Column(Boolean, default=False)
    analyzed = Column(Boolean, default=False)
    notes = Column(Text)
    
    # Relationships
    investigation = relationship("Investigation", back_populates="evidence_states")
    evidence = relationship("Evidence", back_populates="evidence_states")
    
    def __repr__(self) -> str:
        return f"<EvidenceState(investigation_id={self.investigation_id}, evidence_id={self.evidence_id}, discovered={self.discovered})>"

class ConversationEntry(Base):
    """Conversation history between user and characters"""
    __tablename__ = 'conversation_entries'
    
    id = Column(Integer, primary_key=True)
    investigation_id = Column(Integer, ForeignKey('investigations.id', ondelete="CASCADE"), nullable=False)
    character_id = Column(Integer, ForeignKey('characters.id', ondelete="CASCADE"), nullable=False)
    user_message = Column(Text, nullable=False)
    character_response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    investigation = relationship("Investigation", back_populates="conversation_entries")
    
    def __repr__(self) -> str:
        return f"<ConversationEntry(id={self.id}, investigation_id={self.investigation_id}, character_id={self.character_id})>"
