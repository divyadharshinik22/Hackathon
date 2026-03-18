from fastapi import FastAPI, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import pickle
import traceback

import models
import schemas
import crud
import face_utils
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Classroom Attendance API")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Classroom Attendance API. Visit /docs for more information."}

@app.post("/students/", response_model=schemas.Student)
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    db_student = crud.get_student_by_roll_number(db, roll_number=roll_number)
    if db_student:
        raise HTTPException(status_code=400, detail="Roll number already registered")
        
    image_bytes = await file.read()
    face_encoding = face_utils.get_face_encoding(image_bytes)
    
    if face_encoding is None:
        raise HTTPException(status_code=400, detail="Ensure exactly one face is clearly visible in the image.")
        
    student_create = schemas.StudentCreate(name=name, roll_number=roll_number)
    return crud.create_student(db=db, student=student_create, face_encoding=face_encoding)

@app.post("/attendance/mark")
async def process_classroom_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        image_bytes = await file.read()
        
        # Load all registered students
        students = crud.get_all_students(db)
        if not students:
            return {"message": "No students registered yet."}
            
        known_encodings = []
        known_ids = []
        for student in students:
            known_encodings.append(pickle.loads(student.face_encoding))
            known_ids.append(student.id)
            
        recognized_ids = face_utils.find_faces_in_image(image_bytes, known_encodings, known_ids)
        
        today = date.today()
        marked_students = []
        for s_id in recognized_ids:
            crud.mark_attendance(db, s_id, today)
            marked_students.append(s_id)
            
        return {
            "message": f"Successfully processed image. Found {len(recognized_ids)} recognized students.",
            "marked_student_ids": marked_students
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/attendance/analytics", response_model=schemas.DailyAttendanceReport)
def get_daily_analytics(query_date: date = None, db: Session = Depends(get_db)):
    if query_date is None:
        query_date = date.today()
        
    attendances = crud.get_attendance_by_date(db, query_date)
    total_students = len(crud.get_all_students(db))
    present_count = len(attendances)
    absent_count = total_students - present_count
    
    return {
        "date": query_date,
        "present_count": present_count,
        "absent_count": absent_count,
        "total_students": total_students
    }
