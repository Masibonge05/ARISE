"""
ARISE Database Seed
===================
Seeds the database with realistic demo data for:
- Grand Finale demo presentation
- Development testing

Creates three complete persona journeys:
- Sphiwe (job seeker/freelancer) — 78% TrustID, ECS 520
- Sipho (freelancer) — verified portfolio, ECS 680
- Zama (entrepreneur) — business registered, ECS 710

Run: python -m backend.seed
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.config.database import SessionLocal, init_db
from backend.models.user import (
    User, PersonaType, VerificationStatus, SkillVerificationSource,
    UserSkill, Qualification, WorkExperience, PortfolioItem,
    JobSeekerProfile, FreelancerProfile, Notification
)
from backend.models.business import (
    BusinessProfile, BusinessStage, BusinessVerificationStatus,
    BusinessMilestone, FundingStatus
)
from backend.models.mentor import MentorProfile, MentorSession, SessionStatus
from backend.models.job import EmployerProfile, Job, JobType, WorkStyle, JobStatus, EmployerVerificationStatus
from backend.models.ecs import ECSHistory, MicroLender
from backend.utils.auth import hash_password


def seed_database():
    init_db()
    db = SessionLocal()

    try:
        print("🌱 Seeding ARISE demo database...")

        # ── Clean existing demo data ───────────────────────────────────────
        for email in ["sphiwe@demo.arise.co.za", "sipho@demo.arise.co.za",
                      "zama@demo.arise.co.za", "dsbd@demo.arise.co.za",
                      "tech4africa@demo.arise.co.za"]:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                db.delete(existing)
        db.commit()

        # ── SPHIWE — Job Seeker ────────────────────────────────────────────
        print("  Creating Sphiwe (Job Seeker)...")
        sphiwe = User(
            email="sphiwe@demo.arise.co.za",
            hashed_password=hash_password("Demo1234"),
            first_name="Sphiwe",
            last_name="Dlamini",
            primary_persona=PersonaType.JOB_SEEKER,
            secondary_personas=["freelancer"],
            province="Gauteng",
            city="Tembisa",
            bio="Final-year BEng Electrical Engineering student with a passion for UI/UX design. Self-taught Figma designer with 2 years of freelance experience.",
            is_email_verified=True,
            is_identity_verified=True,
            identity_verification_status=VerificationStatus.VERIFIED,
            trust_completion_score=78.0,
            ecs_score=520,
            preferred_language="English",
            date_of_birth=datetime(2002, 5, 15),
            gender="male",
        )
        db.add(sphiwe)
        db.flush()

        db.add(JobSeekerProfile(
            user_id=sphiwe.id,
            desired_job_title="UI/UX Designer",
            desired_sector="Technology",
            desired_salary_min=18000,
            desired_salary_max=30000,
            work_style_preference="hybrid",
            employment_type="full_time",
        ))

        db.add(FreelancerProfile(
            user_id=sphiwe.id,
            hourly_rate=350,
            project_minimum=1500,
            service_categories=["UI/UX Design", "Graphic Design", "Figma"],
            average_rating=4.9,
            total_projects_completed=6,
            total_earnings=24800,
            is_top_freelancer=True,
        ))

        # Sphiwe's qualifications
        db.add(Qualification(
            user_id=sphiwe.id,
            institution_name="University of Johannesburg",
            qualification_title="BEng Electrical and Electronic Engineering",
            field_of_study="Electrical Engineering",
            year_completed=2026,
            is_current=True,
            verification_status=VerificationStatus.VERIFIED,
            institution_is_registered=True,
            verified_at=datetime.utcnow() - timedelta(days=30),
        ))

        # Sphiwe's skills
        for skill_name, category, source, level in [
            ("Figma", "Tool", SkillVerificationSource.PLATFORM_ASSESSED, "advanced"),
            ("Adobe XD", "Tool", SkillVerificationSource.SELF_CLAIMED, "intermediate"),
            ("UI Design", "Technical", SkillVerificationSource.WORK_VERIFIED, "advanced"),
            ("JavaScript", "Technical", SkillVerificationSource.SELF_CLAIMED, "intermediate"),
            ("English", "Language", SkillVerificationSource.EDUCATION_VERIFIED, "expert"),
            ("isiZulu", "Language", SkillVerificationSource.SELF_CLAIMED, "fluent"),
            ("Communication", "Soft", SkillVerificationSource.WORK_VERIFIED, "advanced"),
        ]:
            db.add(UserSkill(
                user_id=sphiwe.id, skill_name=skill_name, category=category,
                verification_source=source, level=level,
                assessment_score=88 if source == SkillVerificationSource.PLATFORM_ASSESSED else None,
            ))

        # Sphiwe's work experience
        db.add(WorkExperience(
            user_id=sphiwe.id,
            company_name="Freelance",
            job_title="UI/UX Designer",
            start_date=datetime(2022, 6, 1),
            is_current=True,
            description="Delivered logo design, brand identity, and UI mockups for 6+ clients via ARISE marketplace.",
            verification_status=VerificationStatus.VERIFIED,
            verified_at=datetime.utcnow() - timedelta(days=14),
        ))

        # ECS history for Sphiwe
        for event, score_before, score_after, days_ago in [
            ("email_verified", 0, 25, 90),
            ("identity_verified", 25, 75, 85),
            ("qualification_verified", 75, 100, 70),
            ("skill_assessed", 100, 115, 60),
            ("first_client", 115, 145, 45),
            ("project_completed", 145, 165, 30),
            ("five_star_review", 165, 180, 20),
            ("project_completed", 180, 200, 10),
        ]:
            db.add(ECSHistory(
                user_id=sphiwe.id, event_type=event,
                score_before=score_before, score_after=score_after,
                points_delta=score_after - score_before,
                event_description=f"ECS event: {event.replace('_', ' ')}",
                created_at=datetime.utcnow() - timedelta(days=days_ago),
            ))


        # ── SIPHO — Freelancer ─────────────────────────────────────────────
        print("  Creating Sipho (Freelancer)...")
        sipho = User(
            email="sipho@demo.arise.co.za",
            hashed_password=hash_password("Demo1234"),
            first_name="Sipho",
            last_name="Nkosi",
            primary_persona=PersonaType.FREELANCER,
            province="Gauteng",
            city="Soweto",
            bio="Graphic designer and brand strategist. 4 years experience creating brand identities for township entrepreneurs and emerging SA brands.",
            is_email_verified=True,
            is_identity_verified=True,
            identity_verification_status=VerificationStatus.VERIFIED,
            trust_completion_score=84.0,
            ecs_score=680,
            preferred_language="English",
            is_available=True,
        )
        db.add(sipho)
        db.flush()

        db.add(FreelancerProfile(
            user_id=sipho.id,
            hourly_rate=450,
            project_minimum=2500,
            service_categories=["Branding", "Logo Design", "Print Design", "Social Media"],
            average_rating=4.9,
            total_projects_completed=12,
            total_earnings=58000,
            is_top_freelancer=True,
        ))

        for skill_name, source in [
            ("Logo Design", SkillVerificationSource.ACCREDITED),
            ("Brand Identity", SkillVerificationSource.WORK_VERIFIED),
            ("Adobe Illustrator", SkillVerificationSource.PLATFORM_ASSESSED),
            ("Figma", SkillVerificationSource.PLATFORM_ASSESSED),
            ("Print Design", SkillVerificationSource.WORK_VERIFIED),
        ]:
            db.add(UserSkill(user_id=sipho.id, skill_name=skill_name, category="Tool", verification_source=source, level="expert"))

        for title, client, rating in [
            ("FreshMart Brand Identity", "FreshMart SA", 5),
            ("MobiPay App UI Design", "MobiPay", 5),
            ("Thandi's Bakery Social Media Kit", "Thandi's Bakery", 4),
        ]:
            db.add(PortfolioItem(
                user_id=sipho.id, title=title, category="branding",
                client_name=client, is_client_verified=True, client_rating=rating,
            ))


        # ── ZAMA — Entrepreneur ────────────────────────────────────────────
        print("  Creating Zama (Entrepreneur)...")
        zama = User(
            email="zama@demo.arise.co.za",
            hashed_password=hash_password("Demo1234"),
            first_name="Zama",
            last_name="Mokoena",
            primary_persona=PersonaType.ENTREPRENEUR,
            province="Gauteng",
            city="Soweto",
            bio="Fashion entrepreneur building a contemporary African clothing brand. Winner of the 2024 UJ Business Idea Competition.",
            is_email_verified=True,
            is_identity_verified=True,
            identity_verification_status=VerificationStatus.VERIFIED,
            trust_completion_score=72.0,
            ecs_score=710,
            preferred_language="English",
            gender="female",
            is_visible_to_investors=True,
            date_of_birth=datetime(2000, 3, 22),
        )
        db.add(zama)
        db.flush()

        business = BusinessProfile(
            owner_id=zama.id,
            business_name="Zama Fashion Studio",
            sector="Fashion",
            stage=BusinessStage.EARLY,
            province="Gauteng",
            city="Soweto",
            description="A contemporary African fashion brand creating sustainable, culturally-inspired clothing for the modern African woman. We source locally, employ locally, and design globally.",
            cipc_number="2024/234567/07",
            verification_status=BusinessVerificationStatus.VERIFIED,
            verified_at=datetime.utcnow() - timedelta(days=45),
            revenue_range="R0 – R50,000",
            employees_count=3,
            funding_status=FundingStatus.SEEKING_INVESTMENT,
            funding_amount_seeking=250000,
            equity_offering_percent=20,
            funding_use_of_funds="Equipment purchase, 2 full-time staff, and marketing campaign targeting Cape Town market.",
            is_visible_to_investors=True,
        )
        db.add(business)
        db.flush()

        for title, date_offset, category in [
            ("Business registered on ARISE LaunchPad", 90, "legal"),
            ("First 10 paying customers", 60, "revenue"),
            ("CIPC registration verified", 45, "legal"),
            ("Won UJ Business Idea Competition 2024", 120, "recognition"),
            ("First mentor session completed", 30, "mentorship"),
        ]:
            db.add(BusinessMilestone(
                business_id=business.id, title=title,
                milestone_date=datetime.utcnow() - timedelta(days=date_offset),
                category=category, is_verified=True,
            ))


        # ── DSBD OFFICIAL — Government ────────────────────────────────────
        print("  Creating DSBD official (GovLink)...")
        dsbd = User(
            email="dsbd@demo.arise.co.za",
            hashed_password=hash_password("Demo1234"),
            first_name="Minister",
            last_name="Ndabeni",
            primary_persona=PersonaType.GOVERNMENT,
            is_email_verified=True,
            is_identity_verified=True,
            trust_completion_score=100.0,
        )
        db.add(dsbd)


        # ── VERIFIED EMPLOYER ─────────────────────────────────────────────
        print("  Creating Tech4Africa employer...")
        employer_user = User(
            email="tech4africa@demo.arise.co.za",
            hashed_password=hash_password("Demo1234"),
            first_name="HR",
            last_name="Tech4Africa",
            primary_persona=PersonaType.EMPLOYER,
            is_email_verified=True,
        )
        db.add(employer_user)
        db.flush()

        employer = EmployerProfile(
            user_id=employer_user.id,
            company_name="Tech4Africa",
            company_size="11-50",
            industry="Technology",
            description="Johannesburg-based tech company building digital solutions for African businesses.",
            province="Gauteng",
            city="Johannesburg",
            cipc_number="2019/445221/07",
            verification_status=EmployerVerificationStatus.VERIFIED,
            trust_score=4.5,
            total_jobs_posted=12,
            total_hires=8,
            is_bbee_participant=True,
            ed_budget_monthly=25000,
        )
        db.add(employer)
        db.flush()

        # Jobs from Tech4Africa
        job1 = Job(
            employer_id=employer.id,
            title="Junior UI/UX Designer",
            description="We are looking for a passionate junior UI/UX designer to join our growing product team. You will work on real projects from day one, designing interfaces used by thousands of South Africans.",
            requirements="Portfolio showing at least 2 UI/UX projects. Proficiency in Figma. Understanding of user research principles.",
            sector="Technology",
            job_type=JobType.FULL_TIME,
            work_style=WorkStyle.HYBRID,
            province="Gauteng",
            city="Johannesburg",
            salary_min=18000,
            salary_max=25000,
            show_salary=True,
            required_skills=["Figma", "Adobe XD", "User Research", "Wireframing"],
            required_experience_years=1,
            status=JobStatus.ACTIVE,
            safety_scan_passed=True,
            application_count=12,
            view_count=89,
        )
        db.add(job1)


        # ── MICRO LENDERS ─────────────────────────────────────────────────
        print("  Creating micro-lenders...")
        for name, min_ecs, max_loan, desc in [
            ("Youthful Futures Fund", 300, 25000, "Micro-loans for youth entrepreneurs aged 18-35"),
            ("SEFA Digital Accelerator", 400, 100000, "Digitally-verified micro-enterprise financing"),
            ("Ubuntu Capital", 500, 250000, "Community-backed lending using ECS credit scoring"),
            ("FNB SME Credit Line", 650, 1000000, "FNB small business credit for established ECS holders"),
        ]:
            db.add(MicroLender(
                name=name, description=desc, min_ecs_score=min_ecs,
                max_loan_amount=max_loan, interest_rate_min=8.5, interest_rate_max=22.0,
                target_personas=["entrepreneur", "freelancer"], is_active=True,
            ))

        db.commit()
        print("\n✅ ARISE database seeded successfully!")
        print("\nDemo accounts:")
        print("  Sphiwe (Job Seeker):  sphiwe@demo.arise.co.za / Demo1234")
        print("  Sipho  (Freelancer):  sipho@demo.arise.co.za / Demo1234")
        print("  Zama   (Entrepreneur):zama@demo.arise.co.za / Demo1234")
        print("  DSBD   (GovLink):     dsbd@demo.arise.co.za / Demo1234")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()