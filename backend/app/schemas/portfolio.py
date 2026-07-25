from pydantic import BaseModel, Field


class PortfolioTopUp(BaseModel):
    amount: float | None = Field(default=None, ge=0)


class PortfolioOut(BaseModel):
    balance: float
    equity: float
    total_pnl: float
    open_positions: int
    total_exposure: float
    total_investment: float
    todays_profit_loss: float
    overall_profit_loss: float
    portfolio_value: float
    available_cash: float
    buying_power: float
    todays_return_percent: float
    total_return_percent: float
    sector_allocation: list[dict]
    top_holding: dict | None = None
    recent_transactions: list[dict]
    performance: list[dict]
