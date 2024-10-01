import yfinance as yf
import random
import numpy as np
from yahoo_fin import stock_info
from flask import Blueprint, request, jsonify
from models import db, Portfolio, Transaction, User

# Create a blueprint for stock-related routes
stock_bp = Blueprint('stock', __name__)

# Predefined stock symbols and index symbols
STOCK_SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
    'META', 'NVDA', 'NFLX', 'BABA', 'V', 'JPM', 'JNJ', 'DIS', 'PYPL'
]
INDEX_SYMBOLS = {
    'NASDAQ': '^IXIC',
    'SP500': '^GSPC',
    'DowJones': '^DJI'
}

# Endpoint to buy stocks
@stock_bp.route('/api/buy_stock', methods=['POST'])
def buy_stock():
    data = request.json
    user_id = data.get('user_id')
    ticker = data.get('ticker')
    quantity = data.get('quantity')
    price = data.get('price')

    # Record the transaction and update the portfolio
    transaction = Transaction(
        user_id=user_id,
        ticker=ticker,
        quantity=quantity,
        price=price,
        transaction_type='buy'
    )
    db.session.add(transaction)

    # Update the portfolio, or add new stock if it doesn't exist
    portfolio = Portfolio.query.filter_by(user_id=user_id, ticker=ticker).first()
    if portfolio:
        total_quantity = portfolio.quantity + quantity
        portfolio.avg_price = (portfolio.avg_price * portfolio.quantity + price * quantity) / total_quantity
        portfolio.quantity = total_quantity
    else:
        portfolio = Portfolio(user_id=user_id, ticker=ticker, quantity=quantity, avg_price=price)
        db.session.add(portfolio)

    db.session.commit()
    return jsonify({"message": f"Bought {quantity} shares of {ticker}."}), 201

# Endpoint to sell stocks
@stock_bp.route('/api/sell_stock', methods=['POST'])
def sell_stock():
    data = request.json
    user_id = data.get('user_id')
    ticker = data.get('ticker')
    quantity = data.get('quantity')
    price = data.get('price')

    # Validate user and portfolio
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    portfolio = Portfolio.query.filter_by(user_id=user_id, ticker=ticker).first()
    if not portfolio or portfolio.quantity < quantity:
        return jsonify({"message": "Insufficient shares to sell"}), 400

    # Record the transaction and update portfolio
    transaction = Transaction(
        user_id=user_id,
        ticker=ticker,
        quantity=quantity,
        price=price,
        transaction_type='sell'
    )
    db.session.add(transaction)

    portfolio.quantity -= quantity
    if portfolio.quantity == 0:
        db.session.delete(portfolio)  # Remove stock from portfolio if no shares left
    db.session.commit()

    return jsonify({"message": f"Sold {quantity} shares of {ticker}."}), 201

# Endpoint to view user portfolio
@stock_bp.route('/api/view_portfolio/<int:user_id>', methods=['GET'])
def view_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).all()
    if not portfolio:
        return jsonify({"message": "No portfolio found"}), 404

    portfolio_data = []
    total_revenue, total_assets, todays_revenue = 0, 0, 0

    # Fetch stock data using yfinance and calculate metrics
    for p in portfolio:
        try:
            stock = yf.Ticker(p.ticker)
            history_data = stock.history(period="1d")
            current_price = history_data["Close"][0]
            open_price = history_data["Open"][0]
            name = stock.info.get('longName', p.ticker)
        except Exception:
            current_price, open_price, name = None, None, p.ticker

        # Calculate value, profit/loss, and today's revenue
        if current_price is not None:
            current_value = current_price * p.quantity
            profit_loss = (current_price - p.avg_price) * p.quantity
            total_assets += current_value
            total_revenue += profit_loss
            todays_profit = (current_price - open_price) * p.quantity if open_price else "N/A"
            todays_revenue += todays_profit if todays_profit != "N/A" else 0
        else:
            current_value, profit_loss, todays_profit = "N/A", "N/A", "N/A"

        stock_data = {
            "ticker": p.ticker,
            "name": name,
            "quantity": p.quantity,
            "avg_price": p.avg_price,
            "current_price": current_price,
            "current_value": current_value,
            "profit_loss": profit_loss,
            "todays_profit": todays_profit,
            "logo": f"https://logo.clearbit.com/{p.ticker.lower()}.com"
        }
        portfolio_data.append(stock_data)

    response_data = {
        "portfolio": portfolio_data,
        "summary": {
            "total_assets": total_assets,
            "total_revenue": total_revenue,
            "todays_revenue": todays_revenue
        }
    }
    return jsonify(response_data), 200

# Endpoint to view transaction history
@stock_bp.route('/api/view_transactions/<int:user_id>', methods=['GET'])
def view_transactions(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    if not transactions:
        return jsonify({"message": "No transactions found"}), 404

    transaction_data = [
        {
            "ticker": t.ticker,
            "quantity": t.quantity,
            "price": t.price,
            "transaction_type": t.transaction_type,
            "timestamp": t.timestamp
        } for t in transactions
    ]
    return jsonify(transaction_data), 200

# Endpoint to get stock data for a specific symbol and time range
@stock_bp.route('/api/stock-data', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol', default='AAPL').strip()
    time_range = request.args.get('range', default='1d').strip()

    try:
        stock = yf.Ticker(symbol)
        stock_quote = stock.history(period=time_range)

        if stock_quote.empty:
            return jsonify({"error": f"No data found for {symbol} in the given range"}), 404

        historical_data = stock.history(period=time_range)

        stock_data = {
            "name": symbol,
            "currentPrice": stock_quote['Close'].iloc[-1],
            "dayRange": f"{stock_quote['Low'].iloc[-1]} - {stock_quote['High'].iloc[-1]}",
            "marketCap": stock.info.get('marketCap', "N/A"),
            "peRatio": stock.info.get('trailingPE', "N/A"),
            "avgVolume": stock.info.get('averageVolume', "N/A"),
            "previousClose": stock_quote['Close'].iloc[-2] if len(stock_quote) > 1 else "N/A",
            "exchange": stock.info.get('exchange', "N/A"),
            "chart": {
                "dates": historical_data.index.strftime('%Y-%m-%d').tolist(),
                "prices": historical_data['Close'].tolist()
            }
        }

        return jsonify(stock_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to get random stocks from the predefined list
@stock_bp.route('/api/stocks', methods=['GET'])
def get_random_stocks():
    selected_symbols = random.sample(STOCK_SYMBOLS, 5)
    stocks = []

    for symbol in selected_symbols:
        try:
            stock = yf.Ticker(symbol)
            stock_quote = stock.history(period="1d")
            current_price = stock_quote['Close'].iloc[-1] if not stock_quote.empty else 'N/A'
            open_price = stock_quote['Open'].iloc[-1] if not stock_quote.empty else 'N/A'
            change = current_price - open_price if isinstance(current_price, (int, float)) else 'N/A'
            name = stock.info.get('shortName', 'N/A')

            stocks.append({
                'ticker': symbol,
                'name': name,
                'price': round(current_price, 2) if isinstance(current_price, (int, float)) else 'N/A',
                'change': round(change, 2) if isinstance(change, (int, float)) else 'N/A',
                'percentage': 'N/A'
            })
        
        except Exception as e:
            stocks.append({
                'ticker': symbol,
                'name': 'N/A',
                'price': 'N/A',
                'change': 'N/A',
                'percentage': 'N/A',
                'error': str(e)
            })
    
    return jsonify(stocks), 200

# Endpoint to get major stock indices data
@stock_bp.route('/api/stock-indices', methods=['GET'])
def get_stock_indices():
    indices_data = {}

    for index_name, symbol in INDEX_SYMBOLS.items():
        stock = yf.Ticker(symbol)
        stock_history = stock.history(period="6mo")

        prices = stock_history['Close'].tolist() if not stock_history.empty else []
        dates = stock_history.index.strftime('%Y-%m-%d').tolist() if not stock_history.empty else []

        indices_data[index_name] = {
            'symbol': symbol,
            'prices': prices,
            'dates': dates
        }

    return jsonify(indices_data), 200

# Endpoint to calculate annualized returns for major indices
@stock_bp.route('/api/annualized-return', methods=['GET'])
def get_annualized_return():
    annualized_returns = {}

    for index_name, symbol in INDEX_SYMBOLS.items():
        stock = yf.Ticker(symbol)
        stock_history = stock.history(period="1y")

        if not stock_history.empty:
            initial_price = stock_history['Close'].iloc[0]
            final_price = stock_history['Close'].iloc[-1]
            num_days = len(stock_history)

            annualized_return = (final_price / initial_price) ** (252 / num_days) - 1
        else:
            annualized_return = 'N/A'

        annualized_returns[index_name] = {
            'symbol': symbol,
            'annualized_return': round(annualized_return * 100, 2) if isinstance(annualized_return, (int, float)) else 'N/A'
        }

    return jsonify(annualized_returns), 200
