from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.session import engine, Base
from app.api.routes import workspace, documents, transactions, reports
from app.api.routes.auth import router as auth_router
from app.api.routes.storage import router as storage_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinOps API",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
)

origins = [settings.frontend_url]
if settings.environment == "development":
    origins += ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"},
    )


app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(storage_router, prefix="/api", tags=["storage"])
app.include_router(workspace.router, prefix="/api", tags=["workspace"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(transactions.router, prefix="/api", tags=["transactions"])
app.include_router(reports.router, prefix="/api", tags=["reports"])


@app.get("/health")
async def health():
    return {"status": "ok"}
