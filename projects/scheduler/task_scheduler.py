#!/usr/bin/env python3
"""
Task Scheduler Module
-------------------
Schedules tasks based on priority, deadlines, cost efficiency, and workload balancing.
"""

import datetime
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

logger = logging.getLogger("TaskScheduler")

@dataclass
class TimeSlot:
    """Represents a time slot with available capacity for task scheduling."""
    start_time: datetime.datetime
    end_time: datetime.datetime
    capacity: float  # workload capacity in units
    is_off_peak: bool

class TaskScheduler:
    """
    Schedules tasks optimally based on priority, deadlines, 
    cost-efficiency, and workload balancing.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the task scheduler with the given configuration.
        
        Args:
            config: Scheduling configuration dictionary
        """
        self.config = config
        self.priority_weights = config.get("task_priority", {})
        self.scheduling_strategy = config.get("scheduling_strategy", {})
        self.priority_aliases = {
            "bug_fix_prioritization": lambda t: "bug_fixes_critical" if t.get("priority", 0) >= 8 or t.get("severity", 0) >= 8 else "bug_fixes_normal",
            "communication_handling": lambda t: "communication_responses",
            "notes_processing": lambda t: "note_processing",
            "proposal_generation": lambda t: "proposal_deadlines",
            "project_batching": lambda t: "urgent_client_work",
        }
        self.strategy_aliases = {
            "proposal_generation": "proposal_reviews",
            "communication_handling": "client_communication",
            "notes_processing": "reasoning_intensive",
            "project_batching": "reasoning_intensive",
            "bug_fix_prioritization": "reasoning_intensive",
        }
        
        # Parse peak and off-peak hours
        peak_hours = config.get("peak_hours", {})
        off_peak_hours = config.get("off_peak_hours", {})
        
        self.peak_start = self._parse_time(peak_hours.get("start", "00:30"))
        self.peak_end = self._parse_time(peak_hours.get("end", "16:30"))
        self.off_peak_start = self._parse_time(off_peak_hours.get("start", "16:30"))
        self.off_peak_end = self._parse_time(off_peak_hours.get("end", "00:30"))
        
        # Generate time slots for the next 7 days
        self.time_slots = self._generate_time_slots(days=7)
        
    def _parse_time(self, time_str: str) -> datetime.time:
        """Parse time string in HH:MM format to datetime.time object."""
        try:
            hour, minute = map(int, time_str.split(":"))
            return datetime.time(hour, minute)
        except (ValueError, AttributeError):
            logger.warning(f"Invalid time format: {time_str}, using default")
            return datetime.time(0, 0)
    
    def _generate_time_slots(self, days: int = 7, slot_hours: int = 1) -> List[TimeSlot]:
        """
        Generate time slots for scheduling.
        
        Args:
            days: Number of days to generate slots for
            slot_hours: Duration of each slot in hours
            
        Returns:
            List of TimeSlot objects
        """
        slots: List[TimeSlot] = []
        now = datetime.datetime.utcnow()
        slot_start = now.replace(minute=0, second=0, microsecond=0)
        if now.minute or now.second or now.microsecond:
            slot_start += datetime.timedelta(hours=slot_hours)

        total_hours = days * 24
        for hour_offset in range(0, total_hours, slot_hours):
            current_start = slot_start + datetime.timedelta(hours=hour_offset)
            slot_end = current_start + datetime.timedelta(hours=slot_hours)

            is_off_peak = self._is_off_peak(current_start.time())

            local_hour = current_start.hour  # adjust here if timezone offset is required
            capacity = 2.0 if 8 <= local_hour < 20 else 1.0

            slots.append(TimeSlot(
                start_time=current_start,
                end_time=slot_end,
                capacity=capacity,
                is_off_peak=is_off_peak
            ))

        return slots
    
    def _is_off_peak(self, time: datetime.time) -> bool:
        """
        Check if a given time is during off-peak hours.
        
        Args:
            time: Time to check
            
        Returns:
            True if time is during off-peak hours
        """
        # Handle case where off-peak period crosses midnight
        if self.off_peak_start > self.off_peak_end:
            return time >= self.off_peak_start or time < self.off_peak_end
        else:
            return self.off_peak_start <= time < self.off_peak_end

    def _parse_deadline(self, deadline_str: Any) -> Optional[datetime.datetime]:
        """Parse deadlines that may include a trailing Z (UTC) or be naive."""
        if not deadline_str:
            return None
        try:
            raw = str(deadline_str)
            if raw.endswith("Z"):
                raw = raw.replace("Z", "+00:00")
            dt = datetime.datetime.fromisoformat(raw)
            if dt.tzinfo is None:
                return dt.replace(tzinfo=datetime.timezone.utc)
            return dt.astimezone(datetime.timezone.utc)
        except Exception:
            return None
    
    def get_task_priority_score(self, task: Dict[str, Any]) -> float:
        """
        Calculate a priority score for a task based on its attributes.
        
        Args:
            task: Task dictionary
            
        Returns:
            Priority score (higher is more important)
        """
        base_priority = task.get("priority", 5)
        
        # Apply priority weights from config (with aliases)
        weight_key = None
        for key in (
            task.get("priority_category"),
            task.get("category"),
            task.get("priority_tag"),
            task.get("type"),
        ):
            if key and key in self.priority_weights:
                weight_key = key
                break

        if not weight_key and task.get("type") in self.priority_aliases:
            alias_key = self.priority_aliases[task["type"]](task)
            if alias_key in self.priority_weights:
                weight_key = alias_key

        task_type_weight = self.priority_weights.get(weight_key, 1.0)
        priority_score = base_priority * task_type_weight
        
        deadline = self._parse_deadline(task.get("deadline"))
        if deadline:
            now = datetime.datetime.now(datetime.timezone.utc)
            days_until_deadline = max(0, (deadline - now).days)

            if days_until_deadline == 0:  # Due today
                priority_score *= 2.0
            elif days_until_deadline <= 1:  # Due tomorrow
                priority_score *= 1.75
            elif days_until_deadline <= 3:  # Due within 3 days
                priority_score *= 1.5
            elif days_until_deadline <= 7:  # Due within a week
                priority_score *= 1.25
        elif task.get("deadline"):
            logger.warning(f"Invalid deadline format in task {task.get('id')}")
        
        # Adjust for client importance if present
        if "client_importance" in task:
            priority_score *= (0.5 + (task["client_importance"] / 10))
        
        return priority_score
    
    def should_schedule_off_peak(self, task: Dict[str, Any]) -> bool:
        """
        Determine if a task should be scheduled during off-peak hours.
        
        Args:
            task: Task dictionary
            
        Returns:
            True if task should be scheduled during off-peak hours
        """
        task_type = task.get("type", "")
        is_reasoning_intensive = task.get("reasoning_intensive", False)
        is_urgent = task.get("priority", 5) >= 8
        has_deadline = bool(task.get("deadline"))

        # Don't delay urgent tasks with deadlines
        if is_urgent and has_deadline:
            return False

        # Check scheduling strategy from config (apply aliases) after urgency check
        strategy_key = task_type
        if strategy_key not in self.scheduling_strategy and task_type in self.strategy_aliases:
            strategy_key = self.strategy_aliases[task_type]

        if strategy_key in self.scheduling_strategy:
            return self.scheduling_strategy[strategy_key] == "off_peak"
        
        # Schedule reasoning-intensive tasks during off-peak when possible
        if is_reasoning_intensive:
            return True
        
        # Schedule lower priority tasks during off-peak
        if task.get("priority", 5) <= 4:
            return True
            
        return False
    
    def find_best_slot(self, task: Dict[str, Any], is_off_peak: bool) -> Optional[TimeSlot]:
        """
        Find the best time slot for a task based on its requirements.
        
        Args:
            task: Task dictionary
            is_off_peak: Whether current time is off-peak
            
        Returns:
            Best matching TimeSlot or None
        """
        priority_score = self.get_task_priority_score(task)
        should_be_off_peak = self.should_schedule_off_peak(task)
        
        estimated_workload = task.get("estimated_workload", 1.0)

        # If task should be off-peak, always pick the next off-peak slot with capacity
        if should_be_off_peak:
            for slot in self.time_slots:
                if slot.is_off_peak and slot.capacity >= estimated_workload:
                    return slot
        
        # If task is urgent or doesn't need to be off-peak, schedule ASAP
        for slot in self.time_slots:
            if slot.capacity >= estimated_workload:
                return slot
        
        # If no slot with sufficient capacity, take the one with most capacity
        return max(self.time_slots, key=lambda slot: slot.capacity)
    
    def schedule_task(self, task: Dict[str, Any], is_off_peak: bool) -> str:
        """
        Schedule a task at the optimal time.
        
        Args:
            task: Task dictionary
            is_off_peak: Whether current time is off-peak
            
        Returns:
            ISO format timestamp for scheduled execution
        """
        # If task has a specific deadline, respect it
        if "execution_time" in task:
            raw_time = task["execution_time"]
            if isinstance(raw_time, str) and raw_time.endswith("Z"):
                raw_time = raw_time.replace("Z", "+00:00")  # normalize UTC Z suffix
            try:
                execution_time = datetime.datetime.fromisoformat(raw_time)
                logger.info(f"Task {task['id']} has predefined execution time: {execution_time}")
                return execution_time.isoformat()
            except (ValueError, TypeError):
                logger.warning(f"Invalid execution_time format in task {task.get('id')}")
        
        # Find best slot based on task characteristics
        best_slot = self.find_best_slot(task, is_off_peak)
        
        if best_slot:
            # Update slot capacity
            estimated_workload = task.get("estimated_workload", 1.0)
            best_slot.capacity -= estimated_workload
            
            # Format scheduled time
            scheduled_time = best_slot.start_time.isoformat()
            logger.info(f"Scheduled task {task['id']} for {scheduled_time} (off-peak: {best_slot.is_off_peak})")
            return scheduled_time
        else:
            # Fallback to immediate execution
            logger.warning(f"No suitable slot found for task {task['id']}, scheduling immediately")
            return datetime.datetime.utcnow().isoformat()
