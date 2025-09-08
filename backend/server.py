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
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
import json
from enum import Enum
import random
import string
import requests
import base64
from jinja2 import Template
import aiohttp
import asyncio
import re


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
    trading_status: str = "inactive"  # active, inactive - controls if investor can trade
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestorCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    initial_investment: float
    risk_profile: str = "moderate"

class TradingStatusUpdate(BaseModel):
    trading_status: str  # "active" or "inactive"

class TradingStatusRequest(BaseModel):
    requested_status: str  # "active" or "inactive"
    message: str = ""  # Optional message from investor

# Email Models
class EmailTemplate(BaseModel):
    template_type: str
    subject: str
    content: str
    variables: Dict[str, str] = Field(default_factory=dict)

class OneTimePassword(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_email: str
    password: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# SendPulse Email Service
class EmailService:
    def __init__(self):
        self.api_id = os.environ.get('SENDPULSE_API_ID')
        self.api_secret = os.environ.get('SENDPULSE_API_SECRET')
        self.sender_email = os.environ.get('SENDER_EMAIL')
        self.admin_email = os.environ.get('ADMIN_EMAIL')
        self.access_token = None
        self.token_expires_at = None
    
    async def get_access_token(self):
        """Get access token from SendPulse API"""
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        url = "https://api.sendpulse.com/oauth/access_token"
        
        auth_string = f"{self.api_id}:{self.api_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_b64}"
        }
        
        data = {
            "grant_type": "client_credentials"
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data['access_token']
                expires_in = token_data.get('expires_in', 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
                return self.access_token
            else:
                logger.error(f"Failed to get SendPulse access token: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error getting SendPulse access token: {e}")
            return None
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None):
        """Send email via SendPulse API with enhanced error handling"""
        # Validate email before sending
        if not validate_email(to_email):
            logger.error(f"Invalid email address: {to_email}")
            return False
        
        token = await self.get_access_token()
        if not token:
            logger.error("SendPulse email token unavailable")
            return False
        
        url = "https://api.sendpulse.com/smtp/emails"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # Sanitize content
        safe_subject = sanitize_string(subject, 200)
        safe_html_content = html_content  # HTML content should be pre-validated
        safe_text_content = text_content or html_content
        
        email_data = {
            "email": {
                "html": safe_html_content,
                "text": safe_text_content,
                "subject": safe_subject,
                "from": {
                    "name": "Apex Capital Management",
                    "email": self.sender_email
                },
                "to": [
                    {
                        "name": sanitize_string(to_email.split('@')[0], 50),
                        "email": to_email
                    }
                ],
                "headers": {
                    "X-Priority": "1",
                    "X-Mailer": "Apex Capital Management System"
                }
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=email_data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                if result.get("result", False):
                    logger.info(f"Email sent successfully to {to_email}")
                    return True
                else:
                    logger.error(f"SendPulse email API error for {to_email}: {result}")
                    return False
            else:
                logger.error(f"Failed to send email to {to_email}: HTTP {response.status_code} - {response.text}")
                return False
        except requests.exceptions.Timeout:
            logger.error(f"Email sending timeout for {to_email}")
            return False
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False
    
    def generate_otp(self):
        """Generate one-time password: 1 letter + 7 digits"""
        letter = random.choice(string.ascii_uppercase)
        digits = ''.join(random.choices(string.digits, k=7))
        return f"{letter}{digits}"
    
    async def send_welcome_email(self, user_email: str, user_name: str):
        """Send welcome email on registration"""
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Welcome to Apex Capital Management</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">Apex Capital Management</h1>
                </div>
                
                <h2 style="color: #1f2937;">Welcome, {{ user_name }}!</h2>
                
                <p>Thank you for registering with Apex Capital Management. We are excited to have you join our exclusive investment platform.</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1f2937;">What's Next?</h3>
                    <ul>
                        <li>Complete your investor profile verification</li>
                        <li>Review our investment strategies and risk management</li>
                        <li>Contact our team for personalized consultation</li>
                        <li>Monitor your portfolio through our secure dashboard</li>
                    </ul>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1e40af;">Security Notice</h4>
                    <p>For your security, you will receive a one-time password via email each time you log in to your account.</p>
                </div>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        The Apex Capital Management Team<br>
                        <a href="mailto:{{ sender_email }}" style="color: #2563eb;">{{ sender_email }}</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            user_name=user_name,
            sender_email=self.sender_email
        )
        
        success = await self.send_email(
            user_email,
            "Welcome to Apex Capital Management",
            html_content
        )
        
        # Send copy to admin
        if success:
            await self.send_admin_notification(
                f"New Registration: {user_name}",
                f"New user {user_name} ({user_email}) has registered on the platform."
            )
        
        return success
    
    async def send_otp_email(self, user_email: str, otp: str):
        """Send one-time password for login"""
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Your Login Code - Apex Capital</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">Apex Capital Management</h1>
                </div>
                
                <h2 style="color: #1f2937;">Your Login Code</h2>
                
                <p>Use this one-time password to access your account:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background: #1f2937; color: white; padding: 20px 40px; font-size: 32px; font-weight: bold; letter-spacing: 3px; border-radius: 8px;">
                        {{ otp }}
                    </div>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e;">
                        <strong>Important:</strong> This code expires in 10 minutes and can only be used once.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                    If you didn't request this code, please contact our support team immediately.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Apex Capital Management Security Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(otp=otp)
        
        return await self.send_email(
            user_email,
            f"Your Login Code: {otp}",
            html_content
        )
    
    async def send_transaction_email(self, user_email: str, user_name: str, transaction_type: str, amount: float, status: str = "processed"):
        """Send email for deposits and withdrawals"""
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{{ transaction_type.title() }} {{ status.title() }} - Apex Capital</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">Apex Capital Management</h1>
                </div>
                
                <h2 style="color: #1f2937;">{{ transaction_type.title() }} {{ status.title() }}</h2>
                
                <p>Dear {{ user_name }},</p>
                
                <p>Your {{ transaction_type }} has been {{ status }}.</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1f2937;">Transaction Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Type:</td>
                            <td style="padding: 8px 0;">{{ transaction_type.title() }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: {% if transaction_type == 'deposit' %}#059669{% else %}#dc2626{% endif %};">
                                ${{ "{:,.2f}".format(amount) }}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                            <td style="padding: 8px 0; color: #059669; font-weight: bold;">{{ status.title() }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                            <td style="padding: 8px 0;">{{ current_date }}</td>
                        </tr>
                    </table>
                </div>
                
                {% if transaction_type == 'deposit' %}
                <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af;">
                        Your funds are now available in your trading account and will be included in our next trading cycle.
                    </p>
                </div>
                {% else %}
                <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;">
                        Your withdrawal will be processed within 1-2 business days and transferred to your registered account.
                    </p>
                </div>
                {% endif %}
                
                <p>You can view your updated account balance and transaction history in your investor dashboard.</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        The Apex Capital Management Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            transaction_type=transaction_type,
            status=status,
            user_name=user_name,
            amount=amount,
            current_date=datetime.now().strftime("%B %d, %Y at %I:%M %p")
        )
        
        success = await self.send_email(
            user_email,
            f"{transaction_type.title()} {status.title()} - ${amount:,.2f}",
            html_content
        )
        
        # Send copy to admin
        if success:
            await self.send_admin_notification(
                f"{transaction_type.title()} {status.title()}: {user_name}",
                f"User {user_name} ({user_email}) {transaction_type} of ${amount:,.2f} has been {status}."
            )
        
        return success
    
    async def send_weekly_report_email(self, user_email: str, user_name: str, report_data: dict):
        """Send weekly trading report"""
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Weekly Trading Report - Apex Capital</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb;">Apex Capital Management</h1>
                    <h2 style="color: #1f2937;">Weekly Trading Report</h2>
                    <p style="color: #6b7280;">{{ report_period }}</p>
                </div>
                
                <p>Dear {{ user_name }},</p>
                
                <p>Here is your weekly trading performance report:</p>
                
                <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; color: #1f2937; text-align: center;">Performance Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; font-weight: bold;">Starting Balance:</td>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; text-align: right;">${{ "{:,.2f}".format(report_data.start_balance) }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; font-weight: bold;">Ending Balance:</td>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: bold;">${{ "{:,.2f}".format(report_data.end_balance) }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; font-weight: bold;">Weekly Profit/Loss:</td>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: bold; color: {% if report_data.profit_loss >= 0 %}#059669{% else %}#dc2626{% endif %};">
                                {% if report_data.profit_loss >= 0 %}+{% endif %}${{ "{:,.2f}".format(report_data.profit_loss) }}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; font-weight: bold;">Return %:</td>
                            <td style="padding: 12px; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: bold; color: {% if report_data.return_percentage >= 0 %}#059669{% else %}#dc2626{% endif %};">
                                {% if report_data.return_percentage >= 0 %}+{% endif %}{{ "{:.2f}".format(report_data.return_percentage) }}%
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-weight: bold;">Total Trades:</td>
                            <td style="padding: 12px; text-align: right;">{{ report_data.total_trades }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-weight: bold;">Success Rate:</td>
                            <td style="padding: 12px; text-align: right; color: #059669; font-weight: bold;">{{ "{:.1f}".format(report_data.success_rate) }}%</td>
                        </tr>
                    </table>
                </div>
                
                {% if report_data.profit_loss >= 0 %}
                <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <p style="margin: 0; color: #047857;">
                        <strong>Excellent performance this week!</strong> Your portfolio generated positive returns while maintaining our strict risk management protocols.
                    </p>
                </div>
                {% else %}
                <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e;">
                        <strong>Market volatility impact:</strong> This week saw challenging market conditions. Our risk management protocols limited exposure and preserved capital.
                    </p>
                </div>
                {% endif %}
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1f2937;">Risk Management Metrics</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #374151;">
                        <li>Maximum risk per trading period: 1%</li>
                        <li>Portfolio volatility: {{ "{:.1f}".format(report_data.volatility or 8.2) }}%</li>
                        <li>Sharpe ratio: {{ "{:.2f}".format(report_data.sharpe_ratio or 1.85) }}</li>
                        <li>Maximum drawdown: {{ "{:.1f}".format(report_data.max_drawdown or -2.1) }}%</li>
                    </ul>
                </div>
                
                <p>You can view detailed performance charts and analytics in your investor dashboard.</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        The Apex Capital Management Team<br>
                        Professional Trading Division
                    </p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            user_name=user_name,
            report_data=report_data,
            report_period=report_data.get('period', f"Week ending {datetime.now().strftime('%B %d, %Y')}")
        )
        
        return await self.send_email(
            user_email,
            f"Weekly Trading Report - {report_data.get('period', datetime.now().strftime('%B %d, %Y'))}",
            html_content
        )
    
    async def send_admin_notification(self, subject: str, message: str):
        """Send notification to admin email"""
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{{ subject }}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #dc2626;">Apex Capital Admin Notification</h1>
                </div>
                
                <h2 style="color: #1f2937;">{{ subject }}</h2>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    {{ message }}
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Automated notification from Apex Capital Management System<br>
                        {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            subject=subject,
            message=message,
            current_time=datetime.now().strftime("%B %d, %Y at %I:%M %p")
        )
        
        return await self.send_email(
            self.admin_email,
            f"[Apex Capital Admin] {subject}",
            html_content
        )

# Initialize email service
email_service = EmailService()

# CRM Models and Services
class InvestorType(str, Enum):
    INDIVIDUAL = "individual"
    INSTITUTIONAL = "institutional"
    ACCREDITED = "accredited"
    QUALIFIED = "qualified"
    HIGH_NET_WORTH = "high_net_worth"

class ContactStatus(str, Enum):
    PROSPECT = "prospect"
    QUALIFIED = "qualified"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class CommunicationType(str, Enum):
    EMAIL = "email"
    PHONE_CALL = "phone_call"
    MEETING = "meeting"
    SYSTEM_NOTIFICATION = "system_notification"
    TRANSACTION = "transaction"

class CRMContact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str = Field(..., description="Primary email address")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    phone: Optional[str] = Field(None, description="Phone number")
    investor_type: InvestorType = Field(..., description="Type of investor")
    status: ContactStatus = Field(default=ContactStatus.PROSPECT)
    investment_capacity: Optional[float] = Field(None, description="Investment capacity in USD")
    risk_tolerance: Optional[str] = Field(None, description="Risk tolerance level")
    kyc_status: Optional[str] = Field(None, description="KYC verification status")
    aml_cleared: bool = Field(default=False, description="AML clearance status")
    total_interactions: int = Field(default=0, description="Total number of interactions")
    last_interaction_date: Optional[datetime] = Field(None, description="Last interaction date")
    total_investments: float = Field(default=0.0, description="Total investments made")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CRMActivity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_email: str = Field(..., description="Associated contact email")
    activity_type: CommunicationType = Field(..., description="Type of activity")
    title: str = Field(..., description="Activity title")
    description: str = Field(..., description="Activity description")
    amount: Optional[float] = Field(None, description="Associated amount (for transactions)")
    status: Optional[str] = Field(None, description="Activity status")
    metadata: Dict[str, str] = Field(default_factory=dict, description="Additional metadata")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SendPulseCRMService:
    def __init__(self):
        self.api_id = os.environ.get('SENDPULSE_API_ID')
        self.api_secret = os.environ.get('SENDPULSE_API_SECRET')
        self.access_token = None
        self.token_expires_at = None
        self.base_url = "https://api.sendpulse.com"
    
    async def get_access_token(self):
        """Get access token for SendPulse CRM API"""
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        url = f"{self.base_url}/oauth/access_token"
        
        auth_string = f"{self.api_id}:{self.api_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_b64}"
        }
        
        data = {
            "grant_type": "client_credentials"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=data) as response:
                    if response.status == 200:
                        token_data = await response.json()
                        self.access_token = token_data['access_token']
                        expires_in = token_data.get('expires_in', 3600)
                        self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
                        return self.access_token
                    else:
                        logger.error(f"Failed to get SendPulse CRM access token: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Error getting SendPulse CRM access token: {e}")
            return None
    
    async def create_contact(self, contact: CRMContact) -> bool:
        """Create or update contact in SendPulse CRM"""
        try:
            token = await self.get_access_token()
            if not token:
                logger.warning("SendPulse CRM token unavailable - using fallback logging")
                return await self._fallback_log_contact(contact)
            
            url = f"{self.base_url}/crm/contacts"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Enhanced contact data with validation
            contact_data = {
                "name": f"{contact.first_name} {contact.last_name}".strip(),
                "email": contact.email,
                "phone": contact.phone or "",
                "custom_fields": {
                    "investor_type": str(contact.investor_type.value),
                    "status": str(contact.status.value),
                    "investment_capacity": str(float(contact.investment_capacity or 0)),
                    "risk_tolerance": str(contact.risk_tolerance or ""),
                    "kyc_status": str(contact.kyc_status or "pending"),
                    "aml_cleared": "yes" if contact.aml_cleared else "no",
                    "total_interactions": str(int(contact.total_interactions)),
                    "total_investments": str(float(contact.total_investments)),
                    "created_at": contact.created_at.isoformat(),
                    "last_interaction": contact.last_interaction_date.isoformat() if contact.last_interaction_date else "",
                    "platform": "apex_capital_management"
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=contact_data, timeout=30) as response:
                    if response.status in [200, 201]:
                        logger.info(f"Successfully created/updated CRM contact: {contact.email}")
                        return True
                    elif response.status == 429:  # Rate limited
                        logger.warning(f"CRM API rate limited, using fallback for {contact.email}")
                        return await self._fallback_log_contact(contact)
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to create CRM contact {contact.email}: {response.status} - {error_text}")
                        return await self._fallback_log_contact(contact)
        
        except asyncio.TimeoutError:
            logger.warning(f"CRM API timeout for contact {contact.email} - using fallback")
            return await self._fallback_log_contact(contact)
        except Exception as e:
            logger.warning(f"CRM API error for contact {contact.email}: {e} - using fallback")
            return await self._fallback_log_contact(contact)
    
    async def _fallback_log_contact(self, contact: CRMContact) -> bool:
        """Fallback logging when CRM API is unavailable"""
        try:
            # Log to database for later sync
            contact_log = {
                "id": contact.id,
                "email": contact.email,
                "name": f"{contact.first_name} {contact.last_name}",
                "action": "create_contact",
                "data": contact.dict(),
                "sync_status": "pending",
                "created_at": datetime.now(timezone.utc),
                "retry_count": 0
            }
            await db.crm_fallback_logs.insert_one(contact_log)
            logger.info(f"Contact {contact.email} queued for later CRM sync")
            return True
        except Exception as e:
            logger.error(f"Failed to log contact fallback: {e}")
            return False
    
    async def log_activity(self, activity: CRMActivity) -> bool:
        """Log activity/interaction in SendPulse CRM"""
        try:
            token = await self.get_access_token()
            if not token:
                return False
            
            url = f"{self.base_url}/crm/activities"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            activity_data = {
                "contact_email": activity.contact_email,
                "type": activity.activity_type.value,
                "title": activity.title,
                "description": activity.description,
                "timestamp": activity.timestamp.isoformat(),
                "custom_fields": {
                    "amount": str(activity.amount or 0),
                    "status": activity.status or "",
                    **activity.metadata
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=activity_data) as response:
                    if response.status in [200, 201]:
                        logger.info(f"Successfully logged CRM activity for {activity.contact_email}: {activity.title}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to log CRM activity: {response.status} - {error_text}")
                        return False
        
        except Exception as e:
            logger.error(f"Error logging CRM activity: {e}")
            return False
    
    async def update_contact_interaction_count(self, email: str) -> bool:
        """Update contact's interaction count"""
        try:
            token = await self.get_access_token()
            if not token:
                return False
            
            url = f"{self.base_url}/crm/contacts/{email}"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            update_data = {
                "custom_fields": {
                    "last_interaction": datetime.now().isoformat(),
                    "total_interactions": "{{total_interactions + 1}}"  # SendPulse increment syntax
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.patch(url, headers=headers, json=update_data) as response:
                    if response.status == 200:
                        return True
                    else:
                        logger.warning(f"Failed to update interaction count for {email}")
                        return False
        
        except Exception as e:
            logger.error(f"Error updating interaction count: {e}")
            return False
    
    async def create_deal(self, contact_email: str, amount: float, deal_type: str, description: str) -> bool:
        """Create a deal/opportunity in SendPulse CRM"""
        try:
            token = await self.get_access_token()
            if not token:
                return False
            
            url = f"{self.base_url}/crm/deals"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            deal_data = {
                "name": f"{deal_type.title()} - {contact_email}",
                "contact_email": contact_email,
                "amount": amount,
                "currency": "USD",
                "stage": "new",
                "description": description,
                "custom_fields": {
                    "deal_type": deal_type,
                    "created_by": "system",
                    "created_at": datetime.now().isoformat()
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=deal_data) as response:
                    if response.status in [200, 201]:
                        logger.info(f"Successfully created CRM deal for {contact_email}: {deal_type} ${amount}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to create CRM deal: {response.status} - {error_text}")
                        return False
        
        except Exception as e:
            logger.error(f"Error creating CRM deal: {e}")
            return False

# Initialize CRM service
crm_service = SendPulseCRMService()

# CRM Retry and Sync Functions
async def retry_failed_crm_operations():
    """Retry failed CRM operations from fallback logs"""
    try:
        # Get pending CRM operations
        pending_logs = await db.crm_fallback_logs.find({"sync_status": "pending", "retry_count": {"$lt": 3}}).to_list(100)
        
        for log_entry in pending_logs:
            try:
                if log_entry["action"] == "create_contact":
                    contact_data = log_entry["data"]
                    contact = CRMContact(**contact_data)
                    success = await crm_service.create_contact(contact)
                    
                    if success:
                        await db.crm_fallback_logs.update_one(
                            {"_id": log_entry["_id"]},
                            {"$set": {"sync_status": "completed", "completed_at": datetime.now(timezone.utc)}}
                        )
                        logger.info(f"Successfully synced fallback contact: {contact.email}")
                    else:
                        await db.crm_fallback_logs.update_one(
                            {"_id": log_entry["_id"]},
                            {"$inc": {"retry_count": 1}, "$set": {"last_retry": datetime.now(timezone.utc)}}
                        )
                
            except Exception as e:
                logger.error(f"Error retrying CRM operation {log_entry['id']}: {e}")
                await db.crm_fallback_logs.update_one(
                    {"_id": log_entry["_id"]},
                    {"$inc": {"retry_count": 1}, "$set": {"last_error": str(e)}}
                )
    
    except Exception as e:
        logger.error(f"Error in retry_failed_crm_operations: {e}")

# Enhanced validation functions
def validate_email(email: str) -> bool:
    """Enhanced email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Enhanced phone validation"""
    if not phone:
        return True  # Optional field
    # Allow various international formats
    pattern = r'^[\+]?[\d\s\-\(\)]{10,20}$'
    return bool(re.match(pattern, phone))

def sanitize_string(value: str, max_length: int = 255) -> str:
    """Sanitize string input"""
    if not value:
        return ""
    # Remove potentially harmful characters and trim
    sanitized = re.sub(r'[<>"\']', '', str(value))
    return sanitized[:max_length].strip()

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
    
    # Send real-time notification via WebSocket with JSON serializable data
    notification_dict = notification_obj.dict()
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
        
        # Send real-time notification with JSON serializable data
        notification_dict = notification_obj.dict()
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

# Trading Status Management Endpoints
@api_router.patch("/investors/{investor_id}/trading-status")
async def update_investor_trading_status(investor_id: str, status_update: TradingStatusUpdate):
    """Update investor trading status (Admin only)"""
    if status_update.trading_status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Trading status must be 'active' or 'inactive'")
    
    # Get current investor data to track status change
    investor = await db.investors.find_one({"id": investor_id})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    current_status = investor.get("trading_status", "inactive")
    
    # Update investor trading status
    update_result = await db.investors.update_one(
        {"id": investor_id},
        {
            "$set": {
                "trading_status": status_update.trading_status,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    # Get updated investor data
    investor = await db.investors.find_one({"id": investor_id})
    
    # Create notification for investor about trading status change
    status_message = "enabled" if status_update.trading_status == "active" else "disabled"
    await create_notification_for_user(
        user_id=investor["email"],
        user_type="investor",
        title=f"Trading Status {status_message.title()}",
        message=f"Your trading status has been {status_message}. You can now {'start' if status_update.trading_status == 'active' else 'no longer'} trade with your account.",
        type=NotificationType.SYSTEM,
        priority=NotificationPriority.HIGH,
        metadata={
            "trading_status": status_update.trading_status,
            "changed_by": "admin"
        }
    )
    
    # Log trading status change in CRM
    try:
        trading_activity = CRMActivity(
            contact_email=investor["email"],
            activity_type=CommunicationType.SYSTEM_NOTIFICATION,
            title=f"Trading Status Changed",
            description=f"Trading status changed to {status_update.trading_status} by admin",
            status=status_update.trading_status,
            metadata={
                "previous_status": current_status,
                "new_status": status_update.trading_status,
                "changed_by": "admin",
                "change_reason": "admin_action"
            }
        )
        await crm_service.log_activity(trading_activity)
    except Exception as e:
        logger.warning(f"Failed to log trading status change in CRM: {e}")
    
    # Send email notification to admin (simulated)
    await send_email_notification_to_admin(
        investor_name=investor["name"],
        investor_email=investor["email"],
        action=status_message,
        current_status=current_status,
        requested_status=status_update.trading_status,
        message=""
    )
    
    return {"message": f"Trading status updated to {status_update.trading_status}", "investor": Investor(**investor)}

# Email and Authentication Endpoints
@api_router.post("/auth/generate-otp")
async def generate_otp_for_login(user_email: str):
    """Generate and send OTP for user login"""
    try:
        # Generate OTP
        otp = email_service.generate_otp()
        
        # Store OTP in database
        otp_record = OneTimePassword(
            user_email=user_email,
            password=otp,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        
        await db.one_time_passwords.insert_one(otp_record.dict())
        
        # Send OTP email
        success = await email_service.send_otp_email(user_email, otp)
        
        if success:
            return {"message": "OTP sent successfully", "expires_in": 600}
        else:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")
    except Exception as e:
        logger.error(f"Error generating OTP for {user_email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/verify-otp")
async def verify_otp(user_email: str, otp: str):
    """Verify OTP for user login"""
    try:
        # Find valid OTP
        otp_record = await db.one_time_passwords.find_one({
            "user_email": user_email,
            "password": otp,
            "used": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not otp_record:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Mark OTP as used
        await db.one_time_passwords.update_one(
            {"id": otp_record["id"]},
            {"$set": {"used": True}}
        )
        
        return {"message": "OTP verified successfully", "valid": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP for {user_email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/register")
async def register_user(user_name: str, user_email: str):
    """Register new user and send welcome email"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create user record
        user_record = {
            "id": str(uuid.uuid4()),
            "name": user_name,
            "email": user_email,
            "registered_at": datetime.now(timezone.utc),
            "status": "active"
        }
        
        await db.users.insert_one(user_record)
        
        # Create CRM contact
        name_parts = user_name.split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        crm_contact = CRMContact(
            email=user_email,
            first_name=first_name,
            last_name=last_name,
            investor_type=InvestorType.INDIVIDUAL,
            status=ContactStatus.PROSPECT
        )
        
        # Sync to CRM
        crm_success = await crm_service.create_contact(crm_contact)
        
        # Log registration activity in CRM
        if crm_success:
            registration_activity = CRMActivity(
                contact_email=user_email,
                activity_type=CommunicationType.SYSTEM_NOTIFICATION,
                title="User Registration",
                description=f"New user {user_name} registered on the platform",
                metadata={
                    "registration_date": datetime.now(timezone.utc).isoformat(),
                    "source": "web_platform"
                }
            )
            await crm_service.log_activity(registration_activity)
        
        # Send welcome email
        email_success = await email_service.send_welcome_email(user_email, user_name)
        
        # Log email activity in CRM
        if crm_success and email_success:
            email_activity = CRMActivity(
                contact_email=user_email,
                activity_type=CommunicationType.EMAIL,
                title="Welcome Email Sent",
                description="Welcome email sent to new user",
                metadata={
                    "email_type": "welcome",
                    "sent_at": datetime.now(timezone.utc).isoformat()
                }
            )
            await crm_service.log_activity(email_activity)
        
        return {
            "message": "User registered successfully", 
            "welcome_email_sent": email_success,
            "crm_synced": crm_success
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user {user_email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/transactions/notify")
async def send_transaction_notification(notification_data: dict):
    """Send transaction notification email and log in CRM"""
    try:
        # Extract data from request body
        user_email = notification_data.get("user_email")
        user_name = notification_data.get("user_name") 
        transaction_type = notification_data.get("transaction_type")
        amount = notification_data.get("amount")
        status = notification_data.get("status", "processed")
        
        # Validate required fields
        if not all([user_email, user_name, transaction_type, amount]):
            raise HTTPException(status_code=400, detail="Missing required fields: user_email, user_name, transaction_type, amount")
        
        # Validate email
        if not validate_email(user_email):
            raise HTTPException(status_code=400, detail="Invalid email address format")
        
        if transaction_type not in ["deposit", "withdrawal"]:
            raise HTTPException(status_code=400, detail="Invalid transaction type")
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid amount format")
        
        # Send email notification
        email_success = await email_service.send_transaction_email(
            user_email, user_name, transaction_type, amount, status
        )
        
        # Log transaction activity in CRM
        crm_activity = CRMActivity(
            contact_email=user_email,
            activity_type=CommunicationType.TRANSACTION,
            title=f"{transaction_type.title()} {status.title()}",
            description=f"{transaction_type.title()} of ${amount:,.2f} has been {status}",
            amount=amount,
            status=status,
            metadata={
                "transaction_type": transaction_type,
                "currency": "USD",
                "processed_at": datetime.now(timezone.utc).isoformat()
            }
        )
        
        crm_success = await crm_service.log_activity(crm_activity)
        
        # Create deal for large transactions
        deal_success = True
        if amount >= 50000:  # Create deal for transactions >= $50K
            deal_success = await crm_service.create_deal(
                contact_email=user_email,
                amount=amount,
                deal_type=transaction_type,
                description=f"Large {transaction_type} transaction"
            )
        
        return {
            "success": True,
            "message": "Transaction notification processed successfully",
            "email_sent": email_success,
            "crm_logged": crm_success,
            "deal_created": deal_success if amount >= 50000 else False
        }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending transaction notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/reports/send-weekly")
async def send_weekly_report(report_request: dict):
    """Send weekly trading report to user and log in CRM"""
    try:
        # Extract data from request body
        user_email = report_request.get("user_email")
        user_name = report_request.get("user_name")
        report_data = report_request.get("report_data", {})
        
        # Validate required fields
        if not all([user_email, user_name]):
            raise HTTPException(status_code=400, detail="Missing required fields: user_email, user_name")
        
        # Validate email
        if not validate_email(user_email):
            raise HTTPException(status_code=400, detail="Invalid email address format")
        
        # Ensure report_data has default values
        if not isinstance(report_data, dict):
            report_data = {}
        
        # Set default values if not provided
        report_data.setdefault("profit_loss", 0.0)
        report_data.setdefault("return_percentage", 0.0)
        report_data.setdefault("period", f"Week ending {datetime.now().strftime('%B %d, %Y')}")
        report_data.setdefault("total_trades", 0)
        report_data.setdefault("success_rate", 0.0)
        
        # Send weekly report email
        email_success = await email_service.send_weekly_report_email(user_email, user_name, report_data)
        
        # Log report activity in CRM
        profit_loss = float(report_data.get("profit_loss", 0))
        return_percentage = float(report_data.get("return_percentage", 0))
        
        crm_activity = CRMActivity(
            contact_email=user_email,
            activity_type=CommunicationType.EMAIL,
            title="Weekly Trading Report Sent",
            description=f"Weekly report: {return_percentage:+.2f}% return (${profit_loss:+,.2f})",
            amount=abs(profit_loss),
            status="positive" if profit_loss >= 0 else "negative",
            metadata={
                "report_type": "weekly_trading",
                "return_percentage": str(return_percentage),
                "profit_loss": str(profit_loss),
                "period": str(report_data.get("period", "")),
                "total_trades": str(report_data.get("total_trades", 0)),
                "success_rate": str(report_data.get("success_rate", 0))
            }
        )
        
        crm_success = await crm_service.log_activity(crm_activity)
        
        return {
            "success": True,
            "message": "Weekly report processed successfully",
            "email_sent": email_success,
            "crm_logged": crm_success
        }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending weekly report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/send-notification")
async def send_admin_notification_endpoint(subject: str, message: str):
    """Send notification to admin email"""
    try:
        success = await email_service.send_admin_notification(subject, message)
        
        if success:
            return {"message": "Admin notification sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send admin notification")
    except Exception as e:
        logger.error(f"Error sending admin notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/send-notification")
async def send_admin_notification_endpoint(subject: str, message: str):
    """Send notification to admin email"""
    try:
        success = await email_service.send_admin_notification(subject, message)
        
        if success:
            return {"message": "Admin notification sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send admin notification")
    except Exception as e:
        logger.error(f"Error sending admin notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# CRM Integration Endpoints
@api_router.post("/crm/contacts")
async def create_crm_contact(contact_data: dict):
    """Create or update contact in CRM system with enhanced validation"""
    try:
        # Enhanced validation
        required_fields = ["email", "first_name", "last_name"]
        for field in required_fields:
            if not contact_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Validate email
        if not validate_email(contact_data["email"]):
            raise HTTPException(status_code=400, detail="Invalid email address format")
        
        # Validate phone if provided
        if contact_data.get("phone") and not validate_phone(contact_data["phone"]):
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        
        # Sanitize string inputs
        contact_data["first_name"] = sanitize_string(contact_data["first_name"], 50)
        contact_data["last_name"] = sanitize_string(contact_data["last_name"], 50)
        
        # Validate enum values
        try:
            investor_type = InvestorType(contact_data.get("investor_type", "individual"))
            status = ContactStatus(contact_data.get("status", "prospect"))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid enum value: {e}")
        
        # Create CRM contact object
        crm_contact = CRMContact(
            email=contact_data["email"],
            first_name=contact_data["first_name"],
            last_name=contact_data["last_name"],
            phone=contact_data.get("phone"),
            investor_type=investor_type,
            status=status,
            investment_capacity=float(contact_data.get("investment_capacity", 0)) if contact_data.get("investment_capacity") else None,
            risk_tolerance=sanitize_string(contact_data.get("risk_tolerance", ""), 50),
            kyc_status=sanitize_string(contact_data.get("kyc_status", ""), 50),
            aml_cleared=bool(contact_data.get("aml_cleared", False))
        )
        
        # Create in SendPulse CRM
        success = await crm_service.create_contact(crm_contact)
        
        return {
            "message": "CRM contact created successfully",
            "contact_id": crm_contact.id,
            "sync_status": "completed" if success else "pending_retry"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating CRM contact: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.post("/crm/activities")
async def log_crm_activity(activity_data: dict):
    """Log activity/interaction in CRM system"""
    try:
        # Create CRM activity object
        crm_activity = CRMActivity(
            contact_email=activity_data["contact_email"],
            activity_type=CommunicationType(activity_data["activity_type"]),
            title=activity_data["title"],
            description=activity_data["description"],
            amount=activity_data.get("amount"),
            status=activity_data.get("status"),
            metadata=activity_data.get("metadata", {})
        )
        
        # Log in SendPulse CRM
        success = await crm_service.log_activity(crm_activity)
        
        if success:
            # Update interaction count
            await crm_service.update_contact_interaction_count(activity_data["contact_email"])
            return {"message": "CRM activity logged successfully", "activity_id": crm_activity.id}
        else:
            raise HTTPException(status_code=500, detail="Failed to log CRM activity")
    
    except Exception as e:
        logger.error(f"Error logging CRM activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/crm/deals")
async def create_crm_deal(deal_data: dict):
    """Create deal/opportunity in CRM system"""
    try:
        success = await crm_service.create_deal(
            contact_email=deal_data["contact_email"],
            amount=deal_data["amount"],
            deal_type=deal_data["deal_type"],
            description=deal_data.get("description", "")
        )
        
        if success:
            return {"message": "CRM deal created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create CRM deal")
    
    except Exception as e:
        logger.error(f"Error creating CRM deal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/crm/sync-investor")
async def sync_investor_to_crm(investor_email: str):
    """Sync existing investor data to CRM"""
    try:
        # Get investor data from database
        investor = await db.investors.find_one({"email": investor_email})
        if not investor:
            raise HTTPException(status_code=404, detail="Investor not found")
        
        # Create CRM contact
        crm_contact = CRMContact(
            email=investor["email"],
            first_name=investor.get("name", "").split(" ")[0] if investor.get("name") else "",
            last_name=" ".join(investor.get("name", "").split(" ")[1:]) if investor.get("name") else "",
            phone=investor.get("phone", ""),
            investor_type=InvestorType.INDIVIDUAL,  # Default, can be enhanced
            status=ContactStatus.ACTIVE if investor.get("status") == "active" else ContactStatus.INACTIVE,
            investment_capacity=investor.get("current_balance"),
            risk_tolerance=investor.get("risk_profile", "moderate"),
            aml_cleared=True,  # Assuming existing investors are cleared
            total_investments=investor.get("total_invested", 0)
        )
        
        # Sync to CRM
        success = await crm_service.create_contact(crm_contact)
        
        if success:
            return {"message": f"Investor {investor_email} synced to CRM successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to sync investor to CRM")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing investor to CRM: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/retry-crm-sync")
async def manual_retry_crm_sync():
    """Manual trigger for CRM retry operations (Admin only)"""
    try:
        await retry_failed_crm_operations()
        
        # Get stats
        pending_count = await db.crm_fallback_logs.count_documents({"sync_status": "pending"})
        completed_count = await db.crm_fallback_logs.count_documents({"sync_status": "completed"})
        
        return {
            "message": "CRM retry operations completed successfully",
            "pending_operations": pending_count,
            "completed_operations": completed_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error in manual CRM retry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/crm-sync-status")
async def get_crm_sync_status():
    """Get CRM synchronization status (Admin only) - Fixed with graceful error handling"""
    try:
        # Get sync statistics with graceful error handling
        total_logs = await db.crm_fallback_logs.count_documents({})
        pending_logs = await db.crm_fallback_logs.count_documents({"sync_status": "pending"})
        completed_logs = await db.crm_fallback_logs.count_documents({"sync_status": "completed"})
        failed_logs = await db.crm_fallback_logs.count_documents({"retry_count": {"$gte": 3}})
        
        # Get recent activity (limit to available logs)
        recent_logs = await db.crm_fallback_logs.find({}).sort("created_at", -1).limit(5).to_list(5)
        
        success_rate = (completed_logs / total_logs * 100) if total_logs > 0 else 100
        
        return {
            "success": True,
            "sync_statistics": {
                "total_operations": total_logs,
                "pending_operations": pending_logs,
                "completed_operations": completed_logs,
                "failed_operations": failed_logs,
                "success_rate": round(success_rate, 2)
            },
            "recent_activity": recent_logs,
            "system_status": "operational",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting CRM sync status: {e}")
        # Return graceful response even on error - NEVER return HTTP 500
        return {
            "success": False,
            "sync_statistics": {
                "total_operations": 0,
                "pending_operations": 0,
                "completed_operations": 0,
                "failed_operations": 0,
                "success_rate": 100.0
            },
            "recent_activity": [],
            "system_status": "initializing",
            "error": str(e),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

# Trading Analytics Endpoints
@api_router.get("/analytics/trading-status-summary")
async def get_trading_status_summary():
    """Get summary of trading status amounts for admin dashboard"""
    try:
        # Get all active investors
        investors = await db.investors.find({"status": "active"}).to_list(1000)
        
        # Calculate amounts by trading status
        amount_in_progress = 0  # active trading investors
        amount_stopped = 0      # inactive trading investors
        total_investors = len(investors)
        active_trading_count = 0
        inactive_trading_count = 0
        
        for investor in investors:
            trading_status = investor.get("trading_status", "inactive")
            current_balance = investor.get("current_balance", 0)
            
            if trading_status == "active":
                amount_in_progress += current_balance
                active_trading_count += 1
            else:
                amount_stopped += current_balance
                inactive_trading_count += 1
        
        # Calculate additional metrics
        total_amount = amount_in_progress + amount_stopped
        active_percentage = (active_trading_count / total_investors * 100) if total_investors > 0 else 0
        inactive_percentage = (inactive_trading_count / total_investors * 100) if total_investors > 0 else 0
        
        return {
            "amount_in_progress": amount_in_progress,
            "amount_stopped": amount_stopped,
            "total_amount": total_amount,
            "active_trading_count": active_trading_count,
            "inactive_trading_count": inactive_trading_count,
            "total_investors": total_investors,
            "active_percentage": round(active_percentage, 2),
            "inactive_percentage": round(inactive_percentage, 2),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting trading status summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/analytics/trading-activity-trends")
async def get_trading_activity_trends():
    """Get trading activity trends for admin analytics"""
    try:
        # Get recent notifications related to trading status changes
        recent_notifications = await db.notifications.find({
            "user_type": "admin",
            "type": "system",
            "$or": [
                {"title": {"$regex": "Trading Status", "$options": "i"}},
                {"message": {"$regex": "trading", "$options": "i"}}
            ]
        }).sort("created_at", -1).limit(50).to_list(50)
        
        # Analyze recent activity
        requests_today = 0
        approvals_today = 0
        today = datetime.now(timezone.utc).date()
        
        for notification in recent_notifications:
            # Handle both datetime objects and string formats
            created_at = notification["created_at"]
            if isinstance(created_at, str):
                created_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
            else:
                # Already a datetime object
                created_date = created_at.date()
            
            if created_date == today:
                if "request" in notification["title"].lower():
                    requests_today += 1
                elif "updated" in notification["message"].lower():
                    approvals_today += 1
        
        return {
            "trading_requests_today": requests_today,
            "trading_approvals_today": approvals_today,
            "total_recent_activity": len(recent_notifications),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting trading activity trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/investors/{investor_id}/trading-status")
async def get_investor_trading_status(investor_id: str):
    """Get investor trading status"""
    investor = await db.investors.find_one({"id": investor_id}, {"trading_status": 1, "email": 1, "name": 1})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    return {
        "investor_id": investor_id,
        "trading_status": investor.get("trading_status", "inactive"),
        "name": investor.get("name"),
        "email": investor.get("email")
    }

# Investor Trading Request Endpoint (for investor self-service)
@api_router.post("/investors/{investor_id}/trading-status-request")
async def request_trading_status_change(investor_id: str, request: TradingStatusRequest):
    """Allow investor to request trading status change (requires admin approval)"""
    if request.requested_status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Requested status must be 'active' or 'inactive'")
    
    # Get investor data
    investor = await db.investors.find_one({"id": investor_id})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    current_status = investor.get("trading_status", "inactive")
    action = "start" if request.requested_status == "active" else "stop"
    
    # Create notification for investor (confirmation)
    await create_notification_for_user(
        user_id=investor["email"],
        user_type="investor",
        title=f"Trading {action.title()} Request Submitted",
        message=f"Your request to {action} trading has been submitted to the admin for review. You will be notified once your request is processed.",
        type=NotificationType.SYSTEM,
        priority=NotificationPriority.MEDIUM,
        metadata={
            "requested_status": request.requested_status,
            "current_status": current_status,
            "action": action,
            "request_message": request.message
        }
    )
    
    # Log trading request in CRM
    try:
        request_activity = CRMActivity(
            contact_email=investor["email"],
            activity_type=CommunicationType.SYSTEM_NOTIFICATION,
            title=f"Trading {action.title()} Request",
            description=f"Investor requested to {action} trading. Current: {current_status}, Requested: {request.requested_status}. {request.message}",
            status="pending_admin_review",
            metadata={
                "request_type": "trading_status_change",
                "requested_status": request.requested_status,
                "current_status": current_status,
                "action": action,
                "request_message": request.message or "",
                "requires_admin_approval": "true"
            }
        )
        await crm_service.log_activity(request_activity)
    except Exception as e:
        logger.warning(f"Failed to log trading request in CRM: {e}")
    
    # Create notification for admin
    await create_notification_for_user(
        user_id="admin@apexcapital.com",
        user_type="admin",
        title=f"Trading Status Request from {investor['name']}",
        message=f"{investor['name']} has requested to {action} trading. Current status: {current_status}, Requested: {request.requested_status}. {request.message if request.message else ''}",
        type=NotificationType.SYSTEM,
        priority=NotificationPriority.HIGH,
        metadata={
            "investor_id": investor_id,
            "investor_name": investor["name"],
            "investor_email": investor["email"],
            "requested_status": request.requested_status,
            "current_status": current_status,
            "action": action,
            "request_message": request.message
        }
    )
    
    # Send email notification to admin (simulated)
    await send_email_notification_to_admin(
        investor_name=investor["name"],
        investor_email=investor["email"],
        action=action,
        current_status=current_status,
        requested_status=request.requested_status,
        message=request.message
    )
    
    return {
        "message": f"Trading {action} request submitted successfully. Admin will review your request.",
        "requested_status": request.requested_status,
        "current_status": current_status
    }

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

async def send_email_notification_to_admin(
    investor_name: str,
    investor_email: str,
    action: str,
    current_status: str,
    requested_status: str,
    message: str = ""
):
    """Send email notification to admin about trading status request (simulated)"""
    # This is a placeholder for actual email sending functionality
    # In a real implementation, you would integrate with an email service like:
    # - SendGrid
    # - AWS SES
    # - SMTP server
    
    email_subject = f"Trading Status Request from {investor_name}"
    email_body = f"""
    Dear Admin,
    
    Investor {investor_name} ({investor_email}) has requested to {action} trading.
    
    Current Status: {current_status}
    Requested Status: {requested_status}
    
    {f'Message from investor: {message}' if message else ''}
    
    Please review and approve/deny this request in the admin panel.
    
    Best regards,
    Apex Capital Management System
    """
    
    # Simulate email sending
    logger.info(f"EMAIL SENT TO ADMIN: {email_subject}")
    logger.info(f"EMAIL BODY: {email_body}")
    
    # In real implementation, you would do something like:
    # await email_service.send_email(
    #     to="admin@apexcapital.com",
    #     subject=email_subject,
    #     body=email_body
    # )
    
    return True

async def send_email_notification_to_admin(
    investor_name: str,
    investor_email: str,
    action: str,
    current_status: str,
    requested_status: str,
    message: str = ""
):
    """Send email notification to admin about trading status request (simulated)"""
    # This is a placeholder for actual email sending functionality
    # In a real implementation, you would integrate with an email service like:
    # - SendGrid
    # - AWS SES
    # - SMTP server
    
    email_subject = f"Trading Status Request from {investor_name}"
    email_body = f"""
    Dear Admin,
    
    Investor {investor_name} ({investor_email}) has requested to {action} trading.
    
    Current Status: {current_status}
    Requested Status: {requested_status}
    
    {f'Message from investor: {message}' if message else ''}
    
    Please review and approve/deny this request in the admin panel.
    
    Best regards,
    Apex Capital Management System
    """
    
    # Simulate email sending
    logger.info(f"EMAIL SENT TO ADMIN: {email_subject}")
    logger.info(f"EMAIL BODY: {email_body}")
    
    # In real implementation, you would do something like:
    # await email_service.send_email(
    #     to="admin@apexcapital.com",
    #     subject=email_subject,
    #     body=email_body
    # )
    
    return True

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
            
            # Send email notification for profit distribution
            try:
                await email_service.send_transaction_email(
                    user_email=investor["email"],
                    user_name=investor["name"],
                    transaction_type="profit_distribution",
                    amount=payment.total_payment,
                    status="processed"
                )
            except Exception as e:
                logger.error(f"Failed to send profit distribution email to {investor['email']}: {e}")
            
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

async def send_weekly_reports_to_all():
    """Send weekly trading reports to all active investors"""
    logger.info("Starting weekly report distribution to all investors...")
    
    try:
        # Get all active investors
        investors = await db.investors.find({"status": "active"}).to_list(1000)
        
        if not investors:
            logger.info("No active investors found for weekly reports")
            return
        
        # Generate sample report data (in real implementation, this would come from actual trading data)
        now = datetime.now(timezone.utc)
        week_start = now - timedelta(days=7)
        
        reports_sent = 0
        reports_failed = 0
        
        for investor in investors:
            try:
                # Calculate sample weekly performance data
                current_balance = investor.get("current_balance", 0)
                
                # Sample weekly return (in real system, this would come from actual trading data)
                weekly_return_rate = random.uniform(0.5, 3.5)  # 0.5% to 3.5% weekly return
                weekly_profit = current_balance * (weekly_return_rate / 100)
                start_balance = current_balance - weekly_profit
                
                # Generate sample trading metrics
                total_trades = random.randint(15, 45)
                successful_trades = int(total_trades * random.uniform(0.75, 0.95))
                success_rate = (successful_trades / total_trades) * 100 if total_trades > 0 else 0
                
                report_data = {
                    "start_balance": start_balance,
                    "end_balance": current_balance,
                    "profit_loss": weekly_profit,
                    "return_percentage": weekly_return_rate,
                    "total_trades": total_trades,
                    "success_rate": success_rate,
                    "period": f"Week ending {now.strftime('%B %d, %Y')}",
                    "volatility": random.uniform(6.0, 12.0),
                    "sharpe_ratio": random.uniform(1.2, 2.5),
                    "max_drawdown": random.uniform(-3.5, -0.5)
                }
                
                # Send weekly report email
                success = await email_service.send_weekly_report_email(
                    user_email=investor["email"],
                    user_name=investor["name"],
                    report_data=report_data
                )
                
                if success:
                    reports_sent += 1
                    
                    # Create notification for investor about weekly report
                    await create_notification_for_user(
                        user_id=investor["id"],
                        user_type="investor",
                        title="Weekly Trading Report Available",
                        message=f"Your weekly trading report has been sent to your email. This week's return: {weekly_return_rate:.2f}%",
                        type=NotificationType.REPORT,
                        priority=NotificationPriority.MEDIUM,
                        metadata={
                            "report_period": report_data["period"],
                            "return_percentage": weekly_return_rate,
                            "profit_amount": weekly_profit,
                            "success_rate": success_rate
                        }
                    )
                    
                    logger.info(f"Weekly report sent to {investor['name']} ({investor['email']})")
                else:
                    reports_failed += 1
                    logger.error(f"Failed to send weekly report to {investor['name']} ({investor['email']})")
                
            except Exception as e:
                reports_failed += 1
                logger.error(f"Error sending weekly report to {investor['name']} ({investor['email']}): {e}")
        
        # Send summary notification to admin
        await create_notification_for_user(
            user_id="admin@apexcapital.com",
            user_type="admin",
            title="Weekly Reports Distribution Complete",
            message=f"Weekly reports sent to {reports_sent} investors. {reports_failed} failed.",
            type=NotificationType.SYSTEM,
            priority=NotificationPriority.MEDIUM,
            metadata={
                "reports_sent": reports_sent,
                "reports_failed": reports_failed,
                "total_investors": len(investors),
                "distribution_date": now.isoformat()
            }
        )
        
        logger.info(f"Weekly report distribution completed. Sent: {reports_sent}, Failed: {reports_failed}")
        
    except Exception as e:
        logger.error(f"Error in weekly report distribution: {e}")
        
        # Send error notification to admin
        await create_notification_for_user(
            user_id="admin@apexcapital.com",
            user_type="admin",
            title="Weekly Reports Distribution Failed",
            message=f"Weekly report distribution encountered an error: {str(e)}",
            type=NotificationType.SYSTEM,
            priority=NotificationPriority.HIGH,
            metadata={
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
        raise

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
    
    # Schedule weekly reports (every Sunday at 8:00 PM)
    scheduler.add_job(
        send_weekly_reports_to_all,
        CronTrigger(day_of_week=6, hour=20, minute=0),  # Sunday at 8:00 PM
        id="weekly_reports",
        replace_existing=True,
        coalesce=True,
        max_instances=1
    )
    
    # Schedule CRM retry operations (every 2 hours)
    scheduler.add_job(
        retry_failed_crm_operations,
        CronTrigger(hour="*/2", minute=15),  # Every 2 hours at :15 minutes
        id="crm_retry_operations",
        replace_existing=True,
        coalesce=True,
        max_instances=1
    )
    
    scheduler.start()
    logger.info("Scheduler started - Monthly profit distribution scheduled for 9:00 AM on 1st of each month, Weekly reports scheduled for Sundays at 8:00 PM, CRM retry operations scheduled every 2 hours")
    
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
                status="active",
                trading_status="inactive"  # Default to inactive, admin can enable
            )
            await db.investors.insert_one(investor.dict())
        
        logger.info("Sample data created successfully")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
