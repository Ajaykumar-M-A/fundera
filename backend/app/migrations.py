from datetime import date

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Stock, User
from app.services.auth import hash_password


USER_COLUMNS = {
    "role": "VARCHAR(20) DEFAULT 'USER'",
    "status": "VARCHAR(20) DEFAULT 'PENDING'",
    "kyc_status": "VARCHAR(20) DEFAULT 'PENDING'",
}

ORDER_COLUMNS = {
    "transaction_id": "VARCHAR(64)",
    "realized_profit": "FLOAT DEFAULT 0",
}


def run_safe_migrations(engine):
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    if "users" in table_names:
        _add_missing_columns(engine, "users", USER_COLUMNS)
    if "orders" in table_names:
        _add_missing_columns(engine, "orders", ORDER_COLUMNS)


def _add_missing_columns(engine, table_name: str, columns: dict[str, str]):
    existing = {col["name"] for col in inspect(engine).get_columns(table_name)}
    with engine.begin() as conn:
        for name, ddl in columns.items():
            if name not in existing:
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {name} {ddl}"))


def seed_database(db: Session):
    _seed_admin(db)
    _seed_trader(db)
    _seed_stocks(db)
    db.commit()


def _seed_admin(db: Session):
    if db.query(User).filter(User.role == "ADMIN").first():
        return
    admin = User(
        full_name="Fundera Admin",
        email=settings.admin_email,
        mobile_number="9999999999",
        hashed_password=hash_password(settings.admin_password),
        date_of_birth=date(1990, 1, 1),
        gender="Not specified",
        address_line="Fundera HQ",
        city="Mumbai",
        state="Maharashtra",
        country="India",
        pincode="400001",
        pan_number="AAAAA0000A",
        aadhaar_number=None,
        occupation="Administrator",
        account_holder_name="Fundera Admin",
        bank_name="Fundera Bank",
        account_number="000000000001",
        ifsc_code="FUND0000001",
        branch_name="Main",
        account_type="Savings",
        investment_experience="Expert",
        annual_income="Internal",
        risk_appetite="Moderate",
        investment_goal="Administration",
        balance=0,
        role="ADMIN",
        status="APPROVED",
        kyc_status="VERIFIED",
    )
    db.add(admin)


def _seed_trader(db: Session):
    if db.query(User).filter(User.email == settings.trader_email).first():
        return
    trader = User(
        full_name="Fundera Trader",
        email=settings.trader_email,
        mobile_number="8888888888",
        hashed_password=hash_password(settings.trader_password),
        date_of_birth=date(1992, 5, 15),
        gender="Not specified",
        address_line="Trader Street",
        city="Mumbai",
        state="Maharashtra",
        country="India",
        pincode="400001",
        pan_number="TRADR1234T",
        aadhaar_number="123412341234",
        occupation="Retail Investor",
        account_holder_name="Fundera Trader",
        bank_name="Trader Bank",
        account_number="000000000002",
        ifsc_code="TRAD0000002",
        branch_name="Main",
        account_type="Savings",
        investment_experience="3-5 years",
        annual_income="₹10 - ₹25 Lakhs",
        risk_appetite="Moderate",
        investment_goal="Long-term growth",
        balance=settings.starting_balance,
        role="USER",
        status="APPROVED",
        kyc_status="VERIFIED",
    )
    db.add(trader)


def _seed_stocks(db: Session):
    if db.query(Stock).first():
        return
    stocks = [
        {
            "company_name": "Reliance Industries",
            "ticker": "RELIANCE",
            "exchange": "NSE",
            "sector": "Energy",
            "industry": "Oil, Gas and Retail",
            "ceo": "Mukesh Ambani",
            "employees": 389000,
            "market_cap": 19_500_000_000_000,
            "eps": 102.4,
            "pe_ratio": 28.6,
            "dividend_yield": 0.31,
            "beta": 1.05,
            "book_value": 1180,
            "roe": 9.2,
            "roa": 4.7,
            "today_open": 2915,
            "previous_close": 2898,
            "today_high": 2942,
            "today_low": 2884,
            "current_price": 2928,
            "week_52_high": 3024,
            "week_52_low": 2220,
            "volume": 8_300_000,
            "average_volume": 7_900_000,
            "available_quantity": 100_000,
            "company_description": "Diversified Indian conglomerate with energy, retail, telecom, and digital services businesses.",
            "financial_summary": "Large-cap cash-generative business with diversified earnings and active capital expenditure.",
            "latest_news": "Reliance expands retail footprint|Jio digital services continue subscriber growth",
        },
        {
            "company_name": "Tata Consultancy Services",
            "ticker": "TCS",
            "exchange": "NSE",
            "sector": "Technology",
            "industry": "IT Services",
            "ceo": "K. Krithivasan",
            "employees": 601000,
            "market_cap": 14_400_000_000_000,
            "eps": 124.7,
            "pe_ratio": 31.4,
            "dividend_yield": 1.15,
            "beta": 0.72,
            "book_value": 285,
            "roe": 49.1,
            "roa": 24.5,
            "today_open": 3895,
            "previous_close": 3872,
            "today_high": 3940,
            "today_low": 3862,
            "current_price": 3918,
            "week_52_high": 4254,
            "week_52_low": 3311,
            "volume": 2_400_000,
            "average_volume": 2_100_000,
            "available_quantity": 80_000,
            "company_description": "Global IT services, consulting, and business solutions company in the Tata group.",
            "financial_summary": "High-margin services leader with strong return ratios and steady dividend payouts.",
            "latest_news": "TCS signs multi-year cloud transformation deal|Automation demand supports pipeline",
        },
        {
            "company_name": "HDFC Bank",
            "ticker": "HDFCBANK",
            "exchange": "NSE",
            "sector": "Financials",
            "industry": "Private Banks",
            "ceo": "Sashidhar Jagdishan",
            "employees": 213000,
            "market_cap": 12_100_000_000_000,
            "eps": 83.2,
            "pe_ratio": 19.7,
            "dividend_yield": 1.2,
            "beta": 0.92,
            "book_value": 610,
            "roe": 16.8,
            "roa": 1.9,
            "today_open": 1645,
            "previous_close": 1632,
            "today_high": 1660,
            "today_low": 1628,
            "current_price": 1652,
            "week_52_high": 1794,
            "week_52_low": 1363,
            "volume": 11_200_000,
            "average_volume": 10_700_000,
            "available_quantity": 120_000,
            "company_description": "Large Indian private sector bank serving retail, wholesale, and treasury customers.",
            "financial_summary": "Strong deposit franchise with broad lending base and stable asset quality focus.",
            "latest_news": "Deposit growth remains in focus|Digital banking volumes continue rising",
        },
    ]
    db.add_all(Stock(**stock) for stock in stocks)
