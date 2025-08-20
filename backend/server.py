from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Set
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
import json
from enum import Enum


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

# Notification Models
class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationType(str, Enum):
    PROFIT = "profit"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    ALERT = "alert"
    SECURITY = "security"
    REPORT = "report"
    SYSTEM = "system"
    TRADE = "trade"
    RISK = "risk"
    PERFORMANCE = "performance"

class NotificationStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Can be investor ID or admin ID
    user_type: str  # "investor" or "admin"
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority
    status: NotificationStatus = NotificationStatus.UNREAD
    metadata: Dict = Field(default_factory=dict)  # Additional data specific to notification type
    scheduled_for: Optional[datetime] = None  # For scheduled notifications
    expires_at: Optional[datetime] = None  # For temporary notifications
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationCreate(BaseModel):
    user_id: str
    user_type: str
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    metadata: Dict = Field(default_factory=dict)
    scheduled_for: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class NotificationSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_type: str  # "investor" or "admin"
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    categories: Dict[str, bool] = Field(default_factory=lambda: {
        "profit": True,
        "deposit": True,
        "withdrawal": True,
        "alert": True,
        "security": True,
        "report": True,
        "system": True,
        "trade": True,
        "risk": True,
        "performance": True
    })
    priority_settings: Dict[str, bool] = Field(default_factory=lambda: {
        "low": True,
        "medium": True,
        "high": True,
        "critical": True
    })
    quiet_hours: Dict = Field(default_factory=lambda: {
        "enabled": False,
        "start_time": "22:00",
        "end_time": "08:00",
        "timezone": "UTC"
    })
    frequency_limits: Dict = Field(default_factory=lambda: {
        "daily_limit": 50,
        "hourly_limit": 10
    })
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationSettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    categories: Optional[Dict[str, bool]] = None
    priority_settings: Optional[Dict[str, bool]] = None
    quiet_hours: Optional[Dict] = None
    frequency_limits: Optional[Dict] = None

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}  # user_id -> set of websockets

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected for user: {user_id}")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            disconnected_websockets = set()
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(message)
                except:
                    disconnected_websockets.add(websocket)
            
            # Clean up disconnected websockets
            for websocket in disconnected_websockets:
                self.active_connections[user_id].discard(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_all(self, message: str):
        for user_id, websockets in self.active_connections.items():
            disconnected_websockets = set()
            for websocket in websockets:
                try:
                    await websocket.send_text(message)
                except:
                    disconnected_websockets.add(websocket)
            
            # Clean up disconnected websockets
            for websocket in disconnected_websockets:
                websockets.discard(websocket)

manager = ConnectionManager()

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Apex Capital Management API"}

# WebSocket endpoint for real-time notifications
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
            # For now, just echo back
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# Notification Management Endpoints
@api_router.post("/notifications", response_model=Notification)
async def create_notification(notification: NotificationCreate):
    """Create a new notification"""
    notification_dict = notification.dict()
    notification_obj = Notification(**notification_dict)
    await db.notifications.insert_one(notification_obj.dict())
    
    # Send real-time notification via WebSocket
    notification_data = {
        "type": "new_notification",
        "data": notification_obj.dict()
    }
    await manager.send_personal_message(
        json.dumps(notification_data), 
        notification.user_id
    )
    
    return notification_obj

@api_router.get("/notifications/{user_id}", response_model=List[Notification])
async def get_user_notifications(
    user_id: str,
    status: Optional[NotificationStatus] = None,
    type: Optional[NotificationType] = None,
    priority: Optional[NotificationPriority] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get notifications for a specific user with filtering"""
    filter_query = {"user_id": user_id}
    
    if status:
        filter_query["status"] = status
    if type:
        filter_query["type"] = type
    if priority:
        filter_query["priority"] = priority
    
    notifications = await db.notifications.find(filter_query)\
        .sort("created_at", -1)\
        .skip(offset)\
        .limit(limit)\
        .to_list(limit)
    
    return [Notification(**notif) for notif in notifications]

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read"""
    update_result = await db.notifications.update_one(
        {"id": notification_id},
        {
            "$set": {
                "status": NotificationStatus.READ,
                "read_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@api_router.patch("/notifications/{user_id}/mark-all-read")
async def mark_all_notifications_read(user_id: str):
    """Mark all notifications as read for a user"""
    await db.notifications.update_many(
        {"user_id": user_id, "status": NotificationStatus.UNREAD},
        {
            "$set": {
                "status": NotificationStatus.READ,
                "read_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "All notifications marked as read"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a specific notification"""
    delete_result = await db.notifications.delete_one({"id": notification_id})
    
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted"}

@api_router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: str):
    """Get count of unread notifications for a user"""
    count = await db.notifications.count_documents({
        "user_id": user_id,
        "status": NotificationStatus.UNREAD
    })
    
    return {"unread_count": count}

# Notification Settings Endpoints
@api_router.get("/notification-settings/{user_id}", response_model=NotificationSettings)
async def get_notification_settings(user_id: str):
    """Get notification settings for a user"""
    settings = await db.notification_settings.find_one({"user_id": user_id})
    
    if not settings:
        # Create default settings
        default_settings = NotificationSettings(user_id=user_id, user_type="investor")
        await db.notification_settings.insert_one(default_settings.dict())
        return default_settings
    
    return NotificationSettings(**settings)

@api_router.patch("/notification-settings/{user_id}", response_model=NotificationSettings)
async def update_notification_settings(user_id: str, settings_update: NotificationSettingsUpdate):
    """Update notification settings for a user"""
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    update_result = await db.notification_settings.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification settings not found")
    
    updated_settings = await db.notification_settings.find_one({"user_id": user_id})
    return NotificationSettings(**updated_settings)

# Bulk Notification Endpoints (for admin use)
@api_router.post("/notifications/broadcast")
async def broadcast_notification(notification: NotificationCreate):
    """Broadcast notification to all users (admin only)"""
    if notification.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all active users
    if notification.user_id == "all_investors":
        investors = await db.investors.find({"status": "active"}).to_list(1000)
        user_ids = [investor["id"] for investor in investors]
    elif notification.user_id == "all_admins":
        # Add logic for admin users if needed
        user_ids = ["admin"]  # Placeholder
    else:
        user_ids = [notification.user_id]
    
    created_notifications = []
    
    for user_id in user_ids:
        notif_data = notification.dict()
        notif_data["user_id"] = user_id
        notification_obj = Notification(**notif_data)
        
        await db.notifications.insert_one(notification_obj.dict())
        created_notifications.append(notification_obj)
        
        # Send real-time notification
        notification_data = {
            "type": "new_notification",
            "data": notification_obj.dict()
        }
        await manager.send_personal_message(
            json.dumps(notification_data), 
            user_id
        )
    
    return {"message": f"Notification broadcast to {len(created_notifications)} users"}

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

# Investor Management Endpoints
@api_router.post("/investors", response_model=Investor)
async def create_investor(investor: InvestorCreate):
    investor_dict = investor.dict()
    investor_dict['current_balance'] = investor_dict['initial_investment']
    investor_dict['total_invested'] = investor_dict['initial_investment']
    investor_dict['join_date'] = datetime.now(timezone.utc)
    
    investor_obj = Investor(**investor_dict)
    await db.investors.insert_one(investor_obj.dict())
    return investor_obj

@api_router.get("/investors", response_model=List[Investor])
async def get_investors():
    investors = await db.investors.find().to_list(1000)
    return [Investor(**investor) for investor in investors]

@api_router.get("/investors/{investor_id}", response_model=Investor)
async def get_investor(investor_id: str):
    investor = await db.investors.find_one({"id": investor_id})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    return Investor(**investor)

# Trading Performance Endpoints
@api_router.post("/trading-periods", response_model=TradingPeriod)
async def create_trading_period(period: TradingPeriodCreate):
    period_dict = period.dict()
    
    # Calculate success rate
    success_rate = (period_dict["successful_trades"] / period_dict["total_trades"]) * 100 if period_dict["total_trades"] > 0 else 0
    
    # Calculate net profit (example: deduct 2% management costs)
    net_profit = period_dict["gross_profit"] * 0.98
    
    period_obj = TradingPeriod(
        **period_dict,
        net_profit=net_profit,
        success_rate=success_rate
    )
    
    await db.trading_periods.insert_one(period_obj.dict())
    return period_obj

@api_router.get("/trading-periods", response_model=List[TradingPeriod])
async def get_trading_periods():
    periods = await db.trading_periods.find().sort("period_start", -1).to_list(1000)
    return [TradingPeriod(**period) for period in periods]

# Payment History Endpoints
@api_router.get("/profit-distributions", response_model=List[MonthlyProfitDistribution])
async def get_profit_distributions():
    distributions = await db.monthly_distributions.find().sort("year", -1).sort("month", -1).to_list(1000)
    return [MonthlyProfitDistribution(**dist) for dist in distributions]

@api_router.get("/investor-payments/{investor_id}", response_model=List[InvestorPayment])
async def get_investor_payments(investor_id: str):
    payments = await db.investor_payments.find({"investor_id": investor_id}).sort("year", -1).sort("month", -1).to_list(1000)
    return [InvestorPayment(**payment) for payment in payments]

@api_router.post("/manual-profit-distribution")
async def trigger_manual_profit_distribution():
    """Manually trigger profit distribution for testing purposes"""
    try:
        await process_monthly_profit_distribution()
        return {"message": "Profit distribution processed successfully"}
    except Exception as e:
        logger.error(f"Manual profit distribution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Notification Helper Functions
async def create_notification_for_user(
    user_id: str,
    user_type: str,
    title: str,
    message: str,
    type: NotificationType,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    metadata: Dict = None
):
    """Helper function to create notifications"""
    notification = Notification(
        user_id=user_id,
        user_type=user_type,
        title=title,
        message=message,
        type=type,
        priority=priority,
        metadata=metadata or {}
    )
    
    await db.notifications.insert_one(notification.dict())
    
    # Send real-time notification with JSON serializable data
    notification_dict = notification.dict()
    # Convert datetime objects to ISO format strings
    for key, value in notification_dict.items():
        if isinstance(value, datetime):
            notification_dict[key] = value.isoformat()
    
    notification_data = {
        "type": "new_notification",
        "data": notification_dict
    }
    await manager.send_personal_message(
        json.dumps(notification_data), 
        user_id
    )
    
    return notification

async def create_system_notifications():
    """Create sample system notifications for demo purposes"""
    sample_notifications = [
        {
            "user_id": "investor@example.com",
            "user_type": "investor",
            "title": "Weekly Profit Distribution",
            "message": "Your weekly profit of $2,450 has been added to your account",
            "type": NotificationType.PROFIT,
            "priority": NotificationPriority.HIGH,
            "metadata": {"amount": 2450, "period": "2025-01"}
        },
        {
            "user_id": "investor@example.com",
            "user_type": "investor",
            "title": "Security Alert",
            "message": "New login detected from unknown device",
            "type": NotificationType.SECURITY,
            "priority": NotificationPriority.CRITICAL,
            "metadata": {"ip": "192.168.1.100", "device": "Chrome on Windows"}
        },
        {
            "user_id": "admin@apexcapital.com",
            "user_type": "admin",
            "title": "System Performance Alert",
            "message": "Trading system performance is above target (95.2% success rate)",
            "type": NotificationType.PERFORMANCE,
            "priority": NotificationPriority.MEDIUM,
            "metadata": {"success_rate": 95.2, "period": "week-3"}
        },
        {
            "user_id": "admin@apexcapital.com",
            "user_type": "admin",
            "title": "New Investor Application",
            "message": "New investor application received from Michael Chen ($500,000)",
            "type": NotificationType.SYSTEM,
            "priority": NotificationPriority.HIGH,
            "metadata": {"investor_name": "Michael Chen", "amount": 500000}
        }
    ]
    
    for notif_data in sample_notifications:
        await create_notification_for_user(**notif_data)

# Profit Calculation Functions
def calculate_investor_profit_share(annual_return_percentage: float, investor_balance: float) -> dict:
    """Calculate profit distribution based on tiered structure"""
    total_profit = investor_balance * (annual_return_percentage / 100)
    
    tier_1_amount = 0.0  # 0-4% (80/20)
    tier_2_amount = 0.0  # 4-8% (70/30)
    tier_3_amount = 0.0  # 8-12% (60/40)
    tier_4_amount = 0.0  # 12%+ (50/50)
    
    remaining_return = annual_return_percentage
    
    # Tier 1: 0-4% (Investor gets 80%)
    if remaining_return > 0:
        tier_1_rate = min(remaining_return, 4.0)
        tier_1_profit = investor_balance * (tier_1_rate / 100)
        tier_1_amount = tier_1_profit * 0.8
        remaining_return -= tier_1_rate
    
    # Tier 2: 4-8% (Investor gets 70%)
    if remaining_return > 0:
        tier_2_rate = min(remaining_return, 4.0)
        tier_2_profit = investor_balance * (tier_2_rate / 100)
        tier_2_amount = tier_2_profit * 0.7
        remaining_return -= tier_2_rate
    
    # Tier 3: 8-12% (Investor gets 60%)
    if remaining_return > 0:
        tier_3_rate = min(remaining_return, 4.0)
        tier_3_profit = investor_balance * (tier_3_rate / 100)
        tier_3_amount = tier_3_profit * 0.6
        remaining_return -= tier_3_rate
    
    # Tier 4: 12%+ (Investor gets 50%)
    if remaining_return > 0:
        tier_4_profit = investor_balance * (remaining_return / 100)
        tier_4_amount = tier_4_profit * 0.5
    
    total_investor_share = tier_1_amount + tier_2_amount + tier_3_amount + tier_4_amount
    
    return {
        "tier_1_amount": tier_1_amount,
        "tier_2_amount": tier_2_amount,
        "tier_3_amount": tier_3_amount,
        "tier_4_amount": tier_4_amount,
        "total_payment": total_investor_share,
        "gross_profit_share": total_profit
    }

async def get_current_carry_over_loss() -> float:
    """Get total carry-over loss from previous months"""
    carry_over_losses = await db.carry_over_losses.find({"is_cleared": False}).to_list(1000)
    return sum(loss["remaining_amount"] for loss in carry_over_losses)

async def clear_carry_over_losses(amount_to_clear: float):
    """Clear carry-over losses up to the specified amount"""
    carry_over_losses = await db.carry_over_losses.find({"is_cleared": False}).sort("created_at", 1).to_list(1000)
    
    remaining_to_clear = amount_to_clear
    
    for loss in carry_over_losses:
        if remaining_to_clear <= 0:
            break
            
        if loss["remaining_amount"] <= remaining_to_clear:
            # Clear this loss completely
            await db.carry_over_losses.update_one(
                {"id": loss["id"]},
                {
                    "$set": {
                        "remaining_amount": 0.0,
                        "is_cleared": True,
                        "cleared_at": datetime.now(timezone.utc)
                    }
                }
            )
            remaining_to_clear -= loss["remaining_amount"]
        else:
            # Partially clear this loss
            new_remaining = loss["remaining_amount"] - remaining_to_clear
            await db.carry_over_losses.update_one(
                {"id": loss["id"]},
                {"$set": {"remaining_amount": new_remaining}}
            )
            remaining_to_clear = 0

async def add_carry_over_loss(year: int, month: int, loss_amount: float):
    """Add a new carry-over loss"""
    carry_over_loss = {
        "id": str(uuid.uuid4()),
        "year": year,
        "month": month,
        "loss_amount": abs(loss_amount),
        "remaining_amount": abs(loss_amount),
        "is_cleared": False,
        "created_at": datetime.now(timezone.utc),
        "cleared_at": None
    }
    await db.carry_over_losses.insert_one(carry_over_loss)

async def process_monthly_profit_distribution():
    """Main function to process monthly profit distribution"""
    logger.info("Starting monthly profit distribution process...")
    
    now = datetime.now(timezone.utc)
    current_year = now.year
    current_month = now.month
    
    try:
        # Get previous month's trading performance
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1
        
        # Calculate total performance for the period (simplified - using sample data)
        # In real implementation, this would aggregate actual trading data
        investors = await db.investors.find({"status": "active"}).to_list(1000)
        
        if not investors:
            logger.info("No active investors found")
            return
        
        total_capital = sum(investor["current_balance"] for investor in investors)
        
        # Sample monthly return (in real system, this would come from actual trading data)
        # For demonstration, assuming 2.5% monthly return
        monthly_return_rate = 2.5  # This should be calculated from actual trading performance
        gross_profit = total_capital * (monthly_return_rate / 100)
        
        # Get carry-over losses
        carry_over_loss = await get_current_carry_over_loss()
        
        # Calculate net distributable amount
        net_distributable_amount = gross_profit - carry_over_loss
        
        # Create monthly distribution record
        distribution = MonthlyProfitDistribution(
            year=prev_year,
            month=prev_month,
            total_gross_profit=gross_profit,
            total_net_profit=gross_profit,
            carried_over_loss=carry_over_loss,
            net_distributable_amount=net_distributable_amount,
            fund_share=0.0,
            total_investor_share=0.0,
            status="processing"
        )
        
        if net_distributable_amount <= 0:
            # Add to carry-over losses
            if gross_profit < 0:
                await add_carry_over_loss(prev_year, prev_month, abs(gross_profit))
            
            distribution.status = "no_distribution"
            await db.monthly_distributions.insert_one(distribution.dict())
            logger.info(f"No distribution for {prev_year}-{prev_month:02d}: Net amount = {net_distributable_amount}")
            return
        
        # Clear carry-over losses if we have positive profit
        if carry_over_loss > 0 and gross_profit > 0:
            await clear_carry_over_losses(min(gross_profit, carry_over_loss))
        
        # Process individual investor payments
        total_investor_payments = 0.0
        total_fund_share = 0.0
        
        for investor in investors:
            # Calculate annual return rate (simplified)
            annual_return_rate = monthly_return_rate * 12  # Simplified calculation
            
            # Calculate profit share for this investor
            profit_details = calculate_investor_profit_share(annual_return_rate, investor["current_balance"])
            
            # Create payment record
            payment = InvestorPayment(
                investor_id=investor["id"],
                distribution_id=distribution.id,
                year=prev_year,
                month=prev_month,
                investor_balance=investor["current_balance"],
                gross_profit_share=profit_details["gross_profit_share"],
                tier_1_amount=profit_details["tier_1_amount"],
                tier_2_amount=profit_details["tier_2_amount"],
                tier_3_amount=profit_details["tier_3_amount"],
                tier_4_amount=profit_details["tier_4_amount"],
                total_payment=profit_details["total_payment"],
                payment_status="paid",
                payment_reference=f"PROFIT-{prev_year}{prev_month:02d}-{investor['id'][:8]}",
                processed_at=now
            )
            
            # In real implementation, integrate with payment gateway here
            await process_payment_to_investor(payment)
            
            await db.investor_payments.insert_one(payment.dict())
            
            total_investor_payments += payment.total_payment
            total_fund_share += (profit_details["gross_profit_share"] - profit_details["total_payment"])
            
            # Update investor balance
            new_balance = investor["current_balance"] + payment.total_payment
            await db.investors.update_one(
                {"id": investor["id"]},
                {
                    "$set": {
                        "current_balance": new_balance,
                        "updated_at": now
                    }
                }
            )
            
            # Create notification for investor about payment
            await create_notification_for_user(
                user_id=investor["id"],
                user_type="investor",
                title="Monthly Profit Payment Processed",
                message=f"Your profit share of ${payment.total_payment:,.2f} has been processed and will be deposited within 24 hours.",
                type=NotificationType.PROFIT,
                priority=NotificationPriority.HIGH,
                metadata={
                    "amount": payment.total_payment,
                    "period": f"{prev_year}-{prev_month:02d}",
                    "payment_reference": payment.payment_reference,
                    "tier_breakdown": {
                        "tier_1": profit_details["tier_1_amount"],
                        "tier_2": profit_details["tier_2_amount"],
                        "tier_3": profit_details["tier_3_amount"],
                        "tier_4": profit_details["tier_4_amount"]
                    }
                }
            )
            
            logger.info(f"Processed payment for investor {investor['name']}: ${payment.total_payment:.2f}")
        
        # Update distribution record
        distribution.total_investor_share = total_investor_payments
        distribution.fund_share = total_fund_share
        distribution.status = "completed"
        distribution.processed_at = now
        
        await db.monthly_distributions.insert_one(distribution.dict())
        
        logger.info(f"Monthly profit distribution completed for {prev_year}-{prev_month:02d}")
        logger.info(f"Total distributed: ${total_investor_payments:.2f}")
        logger.info(f"Fund share: ${total_fund_share:.2f}")
        
    except Exception as e:
        logger.error(f"Error in monthly profit distribution: {e}")
        raise

async def process_payment_to_investor(payment: InvestorPayment):
    """Process actual payment to investor (placeholder for payment gateway integration)"""
    # This is where you would integrate with a real payment system
    # For now, we'll just log the payment
    logger.info(f"Processing payment: {payment.payment_reference} - ${payment.total_payment:.2f}")
    
    # Simulate payment processing
    await asyncio.sleep(0.1)
    
    # In real implementation:
    # - Integrate with bank transfer APIs
    # - Send payment confirmations
    # - Handle payment failures and retries
    
    return True

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

# Initialize scheduler
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    """Initialize scheduler on startup"""
    # Schedule monthly profit distribution for 9:00 AM on the 1st of every month
    scheduler.add_job(
        process_monthly_profit_distribution,
        CronTrigger(day=1, hour=9, minute=0),
        id="monthly_profit_distribution",
        replace_existing=True,
        coalesce=True,
        max_instances=1
    )
    
    scheduler.start()
    logger.info("Scheduler started - Monthly profit distribution scheduled for 9:00 AM on 1st of each month")
    
    # Create sample data for testing
    await create_sample_data()
    await create_system_notifications()

@app.on_event("shutdown")
async def shutdown_db_client():
    scheduler.shutdown()
    client.close()

async def create_sample_data():
    """Create sample investors and trading data for testing"""
    try:
        # Check if sample data already exists
        existing_investors = await db.investors.count_documents({})
        if existing_investors > 0:
            logger.info("Sample data already exists")
            return
        
        # Create sample investors
        sample_investors = [
            {
                "name": "John Investor",
                "email": "investor@example.com",
                "phone": "+1-555-0123",
                "initial_investment": 100000.0,
                "risk_profile": "moderate"
            },
            {
                "name": "Sarah Miller",
                "email": "sarah@example.com",
                "phone": "+1-555-0124",
                "initial_investment": 200000.0,
                "risk_profile": "aggressive"
            },
            {
                "name": "Robert Chen",
                "email": "robert@example.com",
                "phone": "+1-555-0125",
                "initial_investment": 350000.0,
                "risk_profile": "conservative"
            }
        ]
        
        for investor_data in sample_investors:
            investor = Investor(
                **investor_data,
                current_balance=investor_data["initial_investment"],
                total_invested=investor_data["initial_investment"],
                join_date=datetime.now(timezone.utc),
                status="active"
            )
            await db.investors.insert_one(investor.dict())
        
        logger.info("Sample data created successfully")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
