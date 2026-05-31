from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
try:
    import yfinance as yf
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    AI_LIBS_AVAILABLE = True
except ImportError:
    AI_LIBS_AVAILABLE = False
from datetime import datetime, timedelta, timezone
import sqlite3
import jwt
import os

import bcrypt
if not hasattr(bcrypt, '__about__'):
    class MockAbout:
        pass
    MockAbout.__version__ = getattr(bcrypt, '__version__', '4.0.0')
    bcrypt.__about__ = MockAbout

from passlib.context import CryptContext

DB_PATH = "/tmp/users.db" if os.environ.get("VERCEL") else "users.db"
from pydantic import BaseModel

app = FastAPI(title="CryptoPulse AI Backend")

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Map our frontend tickers to yfinance tickers
TICKER_MAP = {
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
    "SOL": "SOL-USD",
    "ADA": "ADA-USD",
    "BNB": "BNB-USD",
    "XRP": "XRP-USD",
    "AVAX": "AVAX-USD",
    "DOT": "DOT-USD",
    "DOGE": "DOGE-USD",
    "SHIB": "SHIB-USD"
}

# --- AUTHENTICATION SETUP ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "crypto_pulse_secret_key_change_in_prod"
ALGORITHM = "HS256"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (email TEXT PRIMARY KEY, password TEXT, display_name TEXT, default_currency TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS portfolios
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, name TEXT, ticker TEXT, quantity REAL)''')
    try:
        c.execute("ALTER TABLE users ADD COLUMN display_name TEXT")
        c.execute("ALTER TABLE users ADD COLUMN default_currency TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

init_db()

class UserAuth(BaseModel):
    email: str
    password: str

@app.post("/register")
def register_user(user: UserAuth):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT email FROM users WHERE email=?", (user.email,))
        if c.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = pwd_context.hash(user.password)
        display_name = user.email.split('@')[0]
        default_currency = "USD"
        c.execute("INSERT INTO users (email, password, display_name, default_currency) VALUES (?, ?, ?, ?)", (user.email, hashed_password, display_name, default_currency))
        conn.commit()
        conn.close()
        
        token = jwt.encode({"sub": user.email, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

@app.post("/login")
def login_user(user: UserAuth):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT password FROM users WHERE email=?", (user.email,))
        row = c.fetchone()
        conn.close()
        
        if not row or not pwd_context.verify(user.password, row[0]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        token = jwt.encode({"sub": user.email, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

def get_current_user_email(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token missing subject")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class ProfileUpdate(BaseModel):
    display_name: str
    default_currency: str

@app.get("/profile")
def get_profile(email: str = Depends(get_current_user_email)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT email, display_name, default_currency FROM users WHERE email=?", (email,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email": row[0],
        "display_name": row[1] or email.split('@')[0],
        "default_currency": row[2] or "USD"
    }

@app.put("/profile")
def update_profile(profile: ProfileUpdate, email: str = Depends(get_current_user_email)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE users SET display_name=?, default_currency=? WHERE email=?", (profile.display_name, profile.default_currency, email))
    conn.commit()
    conn.close()
    return {"message": "Profile updated successfully"}

class PortfolioAsset(BaseModel):
    name: str
    ticker: str
    quantity: float

@app.get("/portfolio")
def get_portfolio(email: str = Depends(get_current_user_email)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name, ticker, quantity FROM portfolios WHERE email=?", (email,))
    rows = c.fetchall()
    conn.close()
    
    portfolio = []
    for row in rows:
        portfolio.append({
            "id": row[0],
            "name": row[1],
            "ticker": row[2],
            "quantity": row[3]
        })
    return portfolio

@app.post("/portfolio")
def add_portfolio_asset(asset: PortfolioAsset, email: str = Depends(get_current_user_email)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, quantity FROM portfolios WHERE email=? AND ticker=?", (email, asset.ticker))
    row = c.fetchone()
    if row:
        new_quantity = row[1] + asset.quantity
        c.execute("UPDATE portfolios SET quantity=? WHERE id=?", (new_quantity, row[0]))
    else:
        c.execute("INSERT INTO portfolios (email, name, ticker, quantity) VALUES (?, ?, ?, ?)", (email, asset.name, asset.ticker, asset.quantity))
    conn.commit()
    conn.close()
    return {"message": "Asset added successfully"}

@app.delete("/portfolio/{ticker}")
def delete_portfolio_asset(ticker: str, email: str = Depends(get_current_user_email)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM portfolios WHERE email=? AND ticker=?", (email, ticker))
    conn.commit()
    conn.close()
    return {"message": "Asset removed successfully"}
# ----------------------------

# USD to INR conversion rate (Approximate for the MVP)
USD_TO_INR = 84.0

def fetch_historical_data(ticker_symbol: str, days: int = 60):
    try:
        # Fetch data with 1h interval for better granularity over 30 days
        # yfinance limits 1h data to max 730 days. 30 days is fine.
        data = yf.download(tickers=ticker_symbol, period=f"{days}d", interval="1h")
        if data.empty:
            raise ValueError(f"No data found for {ticker_symbol}")
        return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def train_and_predict(data):
    """
    Trains a simple Linear Regression model on closing prices and predicts the next 24 hours.
    Returns: (predictions_array, confidence_score)
    """
    # Prepare data for Scikit-Learn
    # We will use the index (time step) as the feature X to predict the Close price Y
    df = data.copy()
    df['TimeIndex'] = np.arange(len(df))
    
    # We will just predict based on simple linear regression over the short term
    X = df[['TimeIndex']].values
    
    # The 'Close' column from yfinance might be a Series or DataFrame depending on the version
    # If it's a multi-index (e.g. Close, BTC-USD), we flatten it.
    if isinstance(df['Close'], pd.DataFrame):
        y = df['Close'].iloc[:, 0].values
    else:
        y = df['Close'].values
        
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate R^2 score as a proxy for "Confidence"
    r2_score = model.score(X, y)
    # Map R^2 (which can be < 0 if fit is terrible) to a 0-100 confidence score
    confidence = max(10, min(99, int((r2_score * 50) + 50)))
    
    # Predict the next 24 hours (24 steps of 1 hour)
    last_index = df['TimeIndex'].max()
    future_X = np.array([[last_index + i] for i in range(1, 25)])
    predictions = model.predict(future_X)
    
    return predictions, confidence

@app.get("/")
def read_root():
    return {"status": "online", "message": "CryptoPulse AI Backend is running."}

@app.get("/predict")
def predict_price(coin: str = "BTC"):
    ticker = TICKER_MAP.get(coin.upper())
    if not ticker:
        raise HTTPException(status_code=400, detail="Coin not supported")

    if not AI_LIBS_AVAILABLE:
        # Return mock data for Vercel since heavy libs are omitted
        import random
        base_price = 7900000 if coin.upper() == "BTC" else 280000 if coin.upper() == "ETH" else 15000
        change = base_price * (0.01 + random.random() * 0.04)
        return {
            "coin": coin.upper(),
            "current_price": base_price,
            "predicted_price_24h": base_price + change,
            "confidence_score": 0.88,
            "signal": "BUY" if change > 0 else "SELL",
            "historical_data": [
                {"date": (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'), "price": base_price - (change * i / 5)}
                for i in range(30, 0, -1)
            ]
        }

    # Fetch last 60 days of data
    hist_data = fetch_historical_data(ticker)
    if hist_data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch market data.")

    # 2. Train model and generate prediction
    preds_usd, conf = train_and_predict(hist_data)
    
    # Get current price
    if isinstance(hist_data['Close'], pd.DataFrame):
        current_price_usd = float(hist_data['Close'].iloc[-1, 0])
    else:
        current_price_usd = float(hist_data['Close'].iloc[-1])

    # 3. Format the data for the frontend (Convert USD to INR)
    current_price_inr = current_price_usd * USD_TO_INR
    
    # Create the 24-hour forecast nodes
    # We'll pick +1H, +4H, +12H, and +24H from the prediction array
    forecast = [
        {
            "time": "Now",
            "price": current_price_inr,
            "aiLower": current_price_inr,
            "aiUpper": current_price_inr,
            "predicted": current_price_inr
        },
        {
            "time": "+1H",
            "price": None,
            "aiLower": preds_usd[0] * USD_TO_INR * 0.99,
            "aiUpper": preds_usd[0] * USD_TO_INR * 1.01,
            "predicted": preds_usd[0] * USD_TO_INR
        },
        {
            "time": "+4H",
            "price": None,
            "aiLower": preds_usd[3] * USD_TO_INR * 0.98,
            "aiUpper": preds_usd[3] * USD_TO_INR * 1.02,
            "predicted": preds_usd[3] * USD_TO_INR
        },
        {
            "time": "+12H",
            "price": None,
            "aiLower": preds_usd[11] * USD_TO_INR * 0.95,
            "aiUpper": preds_usd[11] * USD_TO_INR * 1.05,
            "predicted": preds_usd[11] * USD_TO_INR
        },
        {
            "time": "+24H",
            "price": None,
            "aiLower": preds_usd[23] * USD_TO_INR * 0.92,
            "aiUpper": preds_usd[23] * USD_TO_INR * 1.08,
            "predicted": preds_usd[23] * USD_TO_INR
        }
    ]

    # Calculate overall trend based on 24H prediction vs current
    trend = "up" if preds_usd[23] > current_price_usd else "down"
    signal = "STRONG BUY" if (trend == "up" and conf > 80) else "BUY" if trend == "up" else "SELL"

    target_inr = preds_usd[23] * USD_TO_INR

    return {
        "coin": coin.upper(),
        "current_price_inr": current_price_inr,
        "target_24h_inr": target_inr,
        "trend": trend,
        "confidence": conf,
        "signal": signal,
        "forecast": forecast
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
