"""
Huawei SMN (Simple Message Notification)
==========================================
Push notifications and SMS for ARISE events.

Use cases:
- ECS score milestone alerts (SMS to user)
- Investor interest notifications (email + push)
- Application shortlist notifications
- Session reminders (SMS 1h before)
- Safety alerts (immediate push)

Docs: https://support.huaweicloud.com/smn/index.html
"""
import logging
from typing import Optional, List
import httpx
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.smn")

SMN_BASE = f"https://smn.{settings.HUAWEI_REGION}.myhuaweicloud.com/v2/{settings.HUAWEI_PROJECT_ID}"

def _is_configured() -> bool:
    return bool(settings.HUAWEI_ACCESS_KEY) and settings.HUAWEI_ACCESS_KEY != "placeholder"

async def _get_token() -> str:
    from backend.config.huawei import get_token
    return await get_token()

async def send_notification(
    topic_urn: str,
    subject: str,
    message: str,
    message_structure: Optional[dict] = None,
) -> bool:
    """
    Publishes a notification to an SMN topic.
    Topic subscribers receive via email/SMS/push depending on subscription type.
    Returns True on success.
    """
    if not _is_configured() or not topic_urn:
        logger.debug(f"SMN mock: [{subject}] {message[:60]}")
        return True

    token = await _get_token()
    url = f"{SMN_BASE}/notifications/topics/{topic_urn}/publish"
    payload: dict = {"subject": subject, "message": message}
    if message_structure:
        payload["message_structure"] = str(message_structure)

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(url, json=payload,
                                  headers={"X-Auth-Token": token, "Content-Type": "application/json"})
        success = r.status_code in (200, 201)
        if not success:
            logger.warning(f"SMN publish failed: {r.status_code} — {r.text[:200]}")
        return success
    except Exception as e:
        logger.error(f"SMN exception: {e}")
        return False


async def send_ecs_milestone(user_email: str, user_name: str, new_score: int, band: str) -> bool:
    """Sends an ECS milestone notification when user crosses a band."""
    topic = settings.HUAWEI_SMN_TOPIC_ECS
    subject = f"🎉 Your ARISE ECS Score is now {new_score}!"
    message = (
        f"Hi {user_name},\n\n"
        f"Congratulations! Your Entrepreneurship Credit Score has reached {new_score} "
        f"— you're now in the '{band}' tier.\n\n"
        f"New opportunities are unlocking. Log in to see what's available.\n\n"
        f"The ARISE Team"
    )
    return await send_notification(topic or "", subject, message)


async def send_investor_interest_alert(user_name: str, investor_org: str) -> bool:
    """Alerts an entrepreneur that an investor has expressed interest."""
    topic = settings.HUAWEI_SMN_TOPIC_INVESTOR
    subject = "📈 An investor is interested in your business!"
    message = (
        f"Hi {user_name},\n\n"
        f"A verified investor from {investor_org} has expressed interest in your business profile on ARISE.\n\n"
        f"You are always in control — log in to review and decide whether to accept or decline.\n\n"
        f"Remember: your contact details are only shared after you explicitly accept.\n\n"
        f"The ARISE Team"
    )
    return await send_notification(topic or "", subject, message)


async def send_application_update(user_name: str, job_title: str, status: str, company: str) -> bool:
    """Notifies a job seeker about an application status change."""
    topic = settings.HUAWEI_SMN_TOPIC_JOBS
    status_messages = {
        "viewed":               "Your application has been viewed!",
        "shortlisted":          "🎉 You've been shortlisted!",
        "interview_scheduled":  "📅 An interview has been scheduled!",
        "offered":              "🎊 You've received a job offer!",
        "rejected":             "Application status update",
    }
    subject = f"{status_messages.get(status, 'Application update')} — {job_title}"
    message = (
        f"Hi {user_name},\n\n"
        f"Update on your application for {job_title} at {company}:\n"
        f"Status: {status.replace('_', ' ').title()}\n\n"
        f"Log in to ARISE to view details and next steps.\n\n"
        f"The ARISE Team"
    )
    return await send_notification(topic or "", subject, message)


async def send_session_reminder(user_name: str, mentor_name: str, time_str: str, meeting_link: str) -> bool:
    """Sends a 1-hour session reminder."""
    topic = settings.HUAWEI_SMN_TOPIC_ECS
    subject = f"Reminder: Mentor session with {mentor_name} in 1 hour"
    message = (
        f"Hi {user_name},\n\n"
        f"Your mentorship session with {mentor_name} starts at {time_str}.\n\n"
        f"Join here: {meeting_link}\n\n"
        f"The ARISE Team"
    )
    return await send_notification(topic or "", subject, message)


async def send_safety_alert(admin_email: str, report_type: str, target_id: str, reason: str) -> bool:
    """Sends an immediate safety alert to ARISE admins."""
    topic = settings.HUAWEI_SMN_TOPIC_SAFETY
    subject = f"⚠️ ARISE Safety Alert: {report_type}"
    message = (
        f"Safety report received:\n"
        f"Type: {report_type}\n"
        f"Target ID: {target_id}\n"
        f"Reason: {reason}\n\n"
        f"Please review in the admin console immediately."
    )
    return await send_notification(topic or "", subject, message)