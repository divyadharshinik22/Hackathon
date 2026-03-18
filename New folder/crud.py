from sqlalchemy.orm import Session
from datetime import date
import models
import schemas

def get_student_by_roll_number(db: Session, roll_number: str):
    return db.query(models.Student).filter(models.Student.roll_number == roll_number).first()

def create_student(db: Session, student: schemas.StudentCreate, face_encoding: bytes):
    db_student = models.Student(
        name=student.name, 
        roll_number=student.roll_number, 
        face_encoding=face_encoding
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_all_students(db: Session):
    return db.query(models.Student).all()

def mark_attendance(db: Session, student_id: int, date_obj: date):
    # Check if already marked
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id,
        models.Attendance.date == date_obj
    ).first()
    
    if not existing:
        attendance = models.Attendance(student_id=student_id, date=date_obj, status="Present")
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        return attendance
    return existing

def get_attendance_by_date(db: Session, date_obj: date):
    return db.query(models.Attendance).filter(models.Attendance.date == date_obj).all()
