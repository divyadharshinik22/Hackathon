from pydantic import BaseModel
from datetime import date
from typing import List

class StudentBase(BaseModel):
    name: str
    roll_number: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: date
    status: str

class Attendance(AttendanceBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True
        
class DailyAttendanceReport(BaseModel):
    date: date
    present_count: int
    absent_count: int
    total_students: int
