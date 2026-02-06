from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Author(Base):
    __tablename__ = 'authors'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    chatbots = relationship("Chatbot", back_populates="author", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="author", cascade="all, delete-orphan")
    billing_records = relationship("BillingRecord", back_populates="author", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Author(id={self.id}, username='{self.username}')>"
class Chatbot(Base):
    __tablename__ = 'chatbots'

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('authors.id'))  # Correct reference
    description = Column(String)
    telegram_token = Column(String, unique=True, nullable=False)
    avatar = Column(String)
    created_at = Column(DateTime)

    author = relationship("Author", back_populates="chatbots")
    
    prompts = relationship("PromptVersion", back_populates="chatbot", cascade="all, delete-orphan")
    localizations = relationship("LocalizationVersion", back_populates="chatbot", cascade="all, delete-orphan")
    users = relationship("User", back_populates="chatbot", cascade="all, delete-orphan")
    ab_test_variants = relationship("ABTestVariant", back_populates="chatbot", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Chatbot(id={self.id}, name='{self.name}')>"

class PromptVersion(Base):
    __tablename__ = 'prompt_versions'

    id = Column(Integer, primary_key=True)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    key = Column(String(100), nullable=False)
    gender = Column(String(20), nullable=False)
    language = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    version = Column(Integer, nullable=False)
    variant = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    chatbot = relationship("Chatbot", back_populates="prompts")

    def __repr__(self):
        return f"<PromptVersion(id={self.id}, key='{self.key}', version={self.version})>"

class LocalizationVersion(Base):
    __tablename__ = 'localization_versions'

    id = Column(Integer, primary_key=True)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    key = Column(String(100), nullable=False)
    language = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    version = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    chatbot = relationship("Chatbot", back_populates="localizations")

    def __repr__(self):
        return f"<LocalizationVersion(id={self.id}, key='{self.key}', language='{self.language}', version={self.version})>"

class Subscription(Base):
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('authors.id', ondelete='CASCADE'), nullable=False)
    plan_name = Column(String(50), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    author = relationship("Author", back_populates="subscriptions")

    def __repr__(self):
        return f"<Subscription(id={self.id}, author_id={self.author_id}, plan_name='{self.plan_name}')>"

class BillingRecord(Base):
    __tablename__ = 'billing_records'

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('authors.id', ondelete='CASCADE'), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("Author", back_populates="billing_records")

    def __repr__(self):
        return f"<BillingRecord(id={self.id}, author_id={self.author_id}, amount={self.amount})>"

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    balance = Column(Float, default=0.0)
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    total_input_cost = Column(Float, default=0.0)
    total_output_cost = Column(Float, default=0.0)
    referral_code = Column(String(20), unique=True)
    referral_code_created_at = Column(DateTime)
    referral_count = Column(Integer, default=0)
    referral_bonus_balance = Column(Float, default=0.0)
    referred_by_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    
    chatbot = relationship("Chatbot", back_populates="users")
    partners = relationship("Partner", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    interactions = relationship("Interaction", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    token_usage = relationship("TokenUsage", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    ab_test_assignments = relationship("UserABTestAssignment", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class Partner(Base):
    __tablename__ = 'partners'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="partners")
    conversations = relationship("Conversation", back_populates="partner", cascade="all, delete-orphan")
    def __repr__(self):
        return f"<Partner(id={self.id}, name='{self.name}')>"

class Conversation(Base):
    __tablename__ = 'conversations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    partner_id = Column(Integer, ForeignKey('partners.id', ondelete='CASCADE'))
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    partner = relationship("Partner", back_populates="conversations")

    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id={self.user_id}, partner_id={self.partner_id})>"

class UserSession(Base):
    __tablename__ = 'user_sessions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(20), nullable=False)
    start_time = Column(DateTime, nullable=False)
    last_activity = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")
    interactions = relationship("Interaction", back_populates="session", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, status='{self.status}')>"

class Interaction(Base):
    __tablename__ = 'interactions'

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('user_sessions.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("UserSession", back_populates="interactions")
    user = relationship("User", back_populates="interactions")
    feedback = relationship("Feedback", back_populates="interaction", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Interaction(id={self.id}, user_id={self.user_id}, type='{self.type}')>"

class Feedback(Base):
    __tablename__ = 'feedback'

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('user_sessions.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    interaction_id = Column(Integer, ForeignKey('interactions.id', ondelete='CASCADE'), nullable=False)
    is_positive = Column(Boolean, nullable=False)
    text_feedback = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("UserSession", back_populates="feedback")
    user = relationship("User", back_populates="feedback")
    interaction = relationship("Interaction", back_populates="feedback")

    def __repr__(self):
        return f"<Feedback(id={self.id}, user_id={self.user_id}, is_positive={self.is_positive})>"

class TokenUsage(Base):
    __tablename__ = 'token_usage'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    token_count = Column(Integer, nullable=False)
    model = Column(String(50), nullable=False)
    input_tokens = Column(Integer, nullable=False)
    output_tokens = Column(Integer, nullable=False)
    input_cost = Column(Float, nullable=False)
    output_cost = Column(Float, nullable=False)
    response_time = Column(Float, nullable=False)
    usage_date = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="token_usage")

    def __repr__(self):
        return f"<TokenUsage(id={self.id}, user_id={self.user_id}, token_count={self.token_count})>"

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, user_id={self.user_id}, amount={self.amount})>"
class ABTestVariant(Base):
    __tablename__ = 'ab_test_variants'

    id = Column(Integer, primary_key=True)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    test_name = Column(String(100), nullable=False)
    variant_name = Column(String(50), nullable=False)
    description = Column(Text)
    model_config = Column(String(100))  # Added this line
    positive_feedback_count = Column(Integer, default=0)
    negative_feedback_count = Column(Integer, default=0)

    chatbot = relationship("Chatbot", back_populates="ab_test_variants")
    assignments = relationship("UserABTestAssignment", back_populates="variant", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ABTestVariant(id={self.id}, test_name='{self.test_name}', variant_name='{self.variant_name}')>"

class UserABTestAssignment(Base):
    __tablename__ = 'user_ab_test_assignments'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), nullable=False)
    variant_id = Column(Integer, ForeignKey('ab_test_variants.id', ondelete='CASCADE'), nullable=False)

    
    user = relationship("User", back_populates="ab_test_assignments")
    variant = relationship("ABTestVariant", back_populates="assignments")
