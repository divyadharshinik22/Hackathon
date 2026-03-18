# AI-Based Classroom Face Detection and Attendance Monitoring System Backend

This project contains the backend API for an AI-Based Classroom Face Detection and Attendance Monitoring System as described.

## Technologies Used
- **FastAPI**: Modern, fast web framework for building APIs with Python.
- **OpenCV & face_recognition**: Deep learning-based computer vision libraries for detecting and identifying student faces.
- **SQLAlchemy & SQLite**: For simple local database management to store student metadata and attendance records.

## Features
1. **Register Students**: Upload a single image of a student to extract and store their face encoding.
2. **Mark Attendance**: Upload an image of the classroom. The system will detect all faces and compare them with registered students to mark their attendance for the day.
3. **Analytics**: Get daily attendance metrics including present/absent count and total students.

## Instructions to Run

### 1. Requirements

First, ensure you have Python installed. You must install the dependencies listed in `requirements.txt`.

**Note for Windows Users**: 
The `face_recognition` and `dlib` libraries require a C++ compiler. The easiest way to get it working is to install Visual Studio with "Desktop development with C++" workload installed. You will also need `CMake` installed and added to your system path.

To install dependencies, open your terminal and run:
```bash
pip install -r requirements.txt
```

### 2. Run the Application

Start the FastAPI backend using `uvicorn`:
```bash
uvicorn main:app --reload
```
The server will start on `http://127.0.0.1:8000`.

### 3. Using the API

You can test the endpoints easily using the interactive Swagger UI documentation that FastAPI provides automatically!

Open your browser and navigate to:
**http://127.0.0.1:8000/docs**

#### Endpoints available:
- `POST /students/` - Add a new student (requires `name`, `roll_number`, and `file` containing their face).
- `POST /attendance/mark` - Upload a picture of a classroom to mark attendance for all recognized faces in it.
- `GET /attendance/analytics` - Get today's attendance report (present, absent count).
