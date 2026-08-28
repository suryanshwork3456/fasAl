# OTP Authentication Backend Setup

## 1. Create a Virtual Environment

Navigate to your backend/project folder:

```bash
python3 -m venv venv
```

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal after activation.

---

## 2. Install Required Packages

With the virtual environment activated:

```bash
pip install -r requirements.txt
```


## 4. Create `.env`

Create a file named `.env` in the backend root directory.

Add:

```env
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME

REDIS_URL=redis://localhost:6379
```

Replace `YOUR_PASSWORD` with your PostgreSQL password and `YOUR_DATABASE_NAME` with the database you created.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:mypassword@localhost:5432/auth_db

REDIS_URL=redis://localhost:6379

```

> **Important:** Never commit `.env` to GitHub.

Add the following to `.gitignore`:

```text
.env
venv/
__pycache__/
```

---

## 5. Run the Backend

Activate the virtual environment if it isn't already active:

```bash
source venv/bin/activate
```

Then start FastAPI:

```bash
uvicorn main:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI's interactive API documentation:

```text
http://localhost:8000/docs
```

---

## 6. Deactivate the Virtual Environment

When you're finished:

```bash
deactivate
```
