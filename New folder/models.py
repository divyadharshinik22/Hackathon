from sqlalchemy import Column, Integer, String, Date, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    roll_number = Column(String, unique=True, index=True)
    face_encoding = Column(LargeBinary)

    attendances = relationship("Attendance", back_populates="student")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date)
    status = Column(String, default="Present")

    student = relationship("Student", back_populates="attendances")
