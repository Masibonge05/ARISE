"""Notification service — creates in-app notifications for users"""
import logging
from sqlalchemy.orm import Session
from backend.models.user import Notification

logger = logging.getLogger("arise.notification")

def create_notification(
    user_id: str,
    notif_type: str,
    title: str,
    body: str,
    db: Session,
    action_url: str = None,
    metadata: dict = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        body=body,
        action_url=action_url,
        extra_data=metadata or {},
    )
    db.add(notif)
    db.commit()
    logger.info(f"Notification created: {notif_type} for user {user_id}")
    return notif

NOTIFICATION_TEMPLATES = {
    "application_viewed": lambda job_title: {
        "title": "Your application was viewed",
        "body": f"An employer viewed your application for {job_title}. Fingers crossed!",
        "action_url": "/applications",
    },
    "shortlisted": lambda job_title: {
        "title": "🎉 You've been shortlisted!",
        "body": f"You've been shortlisted for {job_title}. An interview may be coming.",
        "action_url": "/applications",
    },
    "ecs_updated": lambda points, new_score: {
        "title": f"ECS Score +{points}",
        "body": f"Your Entrepreneurship Credit Score is now {new_score}.",
        "action_url": "/ecs",
    },
    "investor_interest": lambda: {
        "title": "Investor expressed interest",
        "body": "A verified investor has viewed your business profile and expressed interest. Review and respond on your terms.",
        "action_url": "/investors",
    },
    "session_reminder": lambda mentor_name, time: {
        "title": f"Reminder: Session with {mentor_name}",
        "body": f"Your mentorship session starts in 1 hour at {time}.",
        "action_url": "/mentors/sessions",
    },
}