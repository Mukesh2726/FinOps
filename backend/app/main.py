from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import get_logger
from app.database.session import engine, Base
from app.api.routes import workspace, documents, transactions, reports

# Create tables
Base.metadata.create_all(bind=engine)

logger = get_logger(__name__)

app = FastAPI(title="FinOps API", version="1.0.0", docs_url="/docs" if settings.environment == "development" else None)

# CORS
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
    logger.error("unhandled_exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error", "error_code": "INTERNAL_ERROR"},
    )


# Routers
app.include_router(workspace.router, prefix="/api", tags=["workspace"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(transactions.router, prefix="/api", tags=["transactions"])
app.include_router(reports.router, prefix="/api", tags=["reports"])


@app.get("/health")
async def health():
    return {"status": "ok"}
