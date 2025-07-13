from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Investor Model
class Investor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    initial_investment: float
    current_balance: float
    total_invested: float
    join_date: datetime
    status: str = "active"  # active, inactive, suspended
    risk_profile: str = "moderate"  # conservative, moderate, aggressive
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestorCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    initial_investment: float
    risk_profile: str = "moderate"

# Trading Performance Model
class TradingPeriod(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    period_start: datetime
    period_end: datetime
    total_capital: float
    gross_profit: float
    net_profit: float
    total_trades: int
    successful_trades: int
    success_rate: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TradingPeriodCreate(BaseModel):
    period_start: datetime
    period_end: datetime
    total_capital: float
    gross_profit: float
    total_trades: int
    successful_trades: int

# Monthly Profit Distribution Model
class MonthlyProfitDistribution(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    month: int
    total_gross_profit: float
    total_net_profit: float
    carried_over_loss: float = 0.0
    net_distributable_amount: float
    fund_share: float
    total_investor_share: float
    status: str = "pending"  # pending, processed, failed
    processed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Individual Investor Payment Model
class InvestorPayment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investor_id: str
    distribution_id: str
    year: int
    month: int
    investor_balance: float
    gross_profit_share: float
    tier_1_amount: float = 0.0  # 0-4% (80/20)
    tier_2_amount: float = 0.0  # 4-8% (70/30)
    tier_3_amount: float = 0.0  # 8-12% (60/40)
    tier_4_amount: float = 0.0  # 12%+ (50/50)
    total_payment: float
    payment_status: str = "pending"  # pending, paid, failed
    payment_reference: str = ""
    processed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Carry Over Loss Tracking
class CarryOverLoss(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    month: int
    loss_amount: float
    remaining_amount: float
    is_cleared: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cleared_at: Optional[datetime] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
