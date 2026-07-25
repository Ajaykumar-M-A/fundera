from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://fundera:fundera@db:5432/fundera"
    secret_key: str = "change-me-in-production-use-openssl-rand"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    instrument_symbol: str = "BTC/USD"
    initial_price: float = 95000.0
    starting_balance: float = 100_000.0
    admin_email: str = "admin@fundera.local"
    admin_password: str = "Admin@12345"
    trader_email: str = "trader@fundera.local"
    trader_password: str = "Trader@12345"

    class Config:
        env_file = ".env"


settings = Settings()
