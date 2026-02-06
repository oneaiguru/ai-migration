import os
from contextlib import contextmanager
from datetime import datetime
from typing import Tuple, Dict

from sqlalchemy import create_engine, func, Column, Integer, String, DateTime, Float
from sqlalchemy.orm import declarative_base, sessionmaker

# Basic, file-based default that can be overridden with DATABASE_URL
DB_URL = os.getenv("DATABASE_URL", "sqlite:///hash_loto.db")
engine = create_engine(DB_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Bet(Base):
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    bet_amount = Column(Float, nullable=False)
    bet_choice = Column(String(8), nullable=False)  # "odd" or "even"
    outcome = Column(String(8), nullable=True)  # "win" or "loss"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


Base.metadata.create_all(bind=engine)


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def create_bet(user_id: int, bet_amount: float, bet_choice: str) -> None:
    with get_session() as session:
        bet = Bet(user_id=user_id, bet_amount=bet_amount, bet_choice=bet_choice)
        session.add(bet)


def get_bet_limits() -> Tuple[int, int]:
    return 1, 10


def get_user_stats(user_id: int) -> Dict[str, float]:
    with get_session() as session:
        stats = (
            session.query(
                func.count(Bet.id).label("total_bets"),
                func.sum(func.case((Bet.outcome == "win", Bet.bet_amount), else_=0)).label("total_won"),
                func.sum(func.case((Bet.outcome == "loss", Bet.bet_amount), else_=0)).label("total_lost"),
                func.sum(func.case((Bet.outcome == "win", 1), else_=0)).label("wins"),
                func.sum(func.case((Bet.outcome == "loss", 1), else_=0)).label("losses"),
                func.sum(Bet.bet_amount).label("balance"),
            )
            .filter(Bet.user_id == user_id)
            .one()
        )

    return {
        "total_bets": stats.total_bets or 0,
        "total_won": stats.total_won or 0,
        "total_lost": stats.total_lost or 0,
        "wins": stats.wins or 0,
        "losses": stats.losses or 0,
        "balance": stats.balance or 0,
    }


def get_game_info() -> str:
    return (
        "Welcome to Hash-Loto!\n\n"
        "How to play:\n"
        "- Bet on whether the last digit of the latest Bitcoin block hash will be odd or even.\n"
        "- Allowed bet sizes: 1, 2, 3, 5, 7, 10 points.\n"
        "- Bets can be placed until a few minutes before the next draw.\n"
        "- Use the /bet command to place a bet.\n"
        "- Check your betting history and balance with the /stats command.\n"
        "- The game outcomes are determined by the last digit of the latest Bitcoin block hash."
    )


def update_bet_outcome(is_odd: bool) -> None:
    outcome = "win" if is_odd else "loss"
    with get_session() as session:
        session.query(Bet).filter(Bet.outcome.is_(None)).update(
            {"outcome": outcome}, synchronize_session=False
        )
