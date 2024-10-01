### Features:
1. **Query Stock Tickers**: Search for stock tickers (e.g., $AAPL, $TSLA) using the [yfinance](https://pypi.org/project/yfinance/) library to get real-time data.
2. **Buy and Sell Stocks**: Enter stock ticker, quantity, and track these transactions in a database.
3. **View Portfolio**: Display a list of all stock tickers previously bought.
4. **View Transactions**: View a detailed history of all stock transactions (buy/sell).

### Setup Instructions:
#### 1. Extract the Zip File:
   - Unzip the provided zip file to your desired location.
#### 2. Backend Setup (Flask):
1. **Navigate to the Backend Directory:**
   ```
   cd backend
   ```
2. **Create and Activate a Virtual Environment:**
   ```
   python -m venv venv
   source venv/bin/activate
   ```
3. **Install Backend Dependencies:**
   ```
   pip install -r requirements.txt
   ```
4. **Configure PostgreSQL Database:**
   - Create a PostgreSQL database.
   - Update the .env file with your PostgreSQL connection details:
   ```
   DATABASE_URI=postgresql://<username>:<password>@localhost:5432/<your_database>
   ```
5. **Run the Backend Server:**
   ```
   python app.py
   ```
#### 3. Frontend Setup (React):
1. **Navigate to the Frontend Directory:**
   ```
   cd ..
   cd frontend
   ```
2. **Install Frontend Dependencies:**
   ```
   Install Frontend Dependencies:
   ```
3. **Start the Frontend Development Server:**
   ```
   npm run dev
   ```
4. **Access the Application:**
   - Frontend: The React frontend will be available at http://localhost:5173
   - Backend: The Flask backend will run on http://localhost:5000

### API Information
| API                            | Method | Input Type                    | Description              |
|--------------------------------|--------|-------------------------------|--------------------------|
| /api/register                  | POST   | {                             | Registers a new user     |
|                                |        |     "name": "string",         |                          |
|                                |        |     "email": "string",        |                          |
|                                |        |     "password":"string"       |                          |
|                                |        | }                             |                          | 
|--------------------------------|--------|-------------------------------|--------------------------|
| /api/login                     | POST   | {                             | Logs in an existing user |
|                                |        |     "email": "string",        |                          |
|                                |        |     "password":"string"       |                          |
|                                |        | }                             |                          |
|--------------------------------|--------|-------------------------------|--------------------------|
| /api/oauth-register            | POST   | {                             | Registers a user via     |
|                                |        |     "email": "string",        | OAuth                    |
|                                |        |     "password":"string",      |                          |
|                                |        |     "provider":"string"       |                          |
|                                |        | }                             |                          |
|                                |        |(Provider: 'google'or'github') |                          |
|--------------------------------|--------|-------------------------------|--------------------------|
|/api/buy_stock                  | POST   | {                             | Buys a specific stock    |
|                                |        |     "user_id": "integer",     |                          |
|                                |        |     "ticker": "string",       |                          |
|                                |        |     "quantity": "integer",    |                          |
|                                |        |     "price": "float"          |                          |
|                                |        | }                             |                          |              |--------------------------------|--------|-------------------------------|--------------------------|
|/api/sell_stock                 | POST   | {                             | Sells a specific stock   |
|                                |        |     "user_id": "integer",     |                          |
|                                |        |     "ticker": "string",       |                          |
|                                |        |     "quantity": "integer",    |                          |
|                                |        |     "price": "float"          |                          |
|                                |        | }                             |                          | 
|--------------------------------|--------|-------------------------------|--------------------------|
|/api/view_portfolio/<user_id>   | GET    | None(Pass user_id in the URL) |Views user's portfolio    |
|--------------------------------|--------|-------------------------------|--------------------------|
|/api/view_transactions/<user_id>| GET    | None(Pass user_id in the URL) |Views user's transaction  |
|--------------------------------|--------|-------------------------------|--------------------------|
|/api/stock-data                 | GET    |URL parameters (e.g 'AAPL')    |Fetch stock data for a    |
|                                |        |range ('1d', '5d'etc.)         |Specific symbol           |
|--------------------------------|--------|-------------------------------|--------------------------|
|/api/stocks                     | GET    |None                           |Fetch random stocks       |
|--------------------------------|--------|-------------------------------|--------------------------|
|/api//api/stock-indices         | GET    |None                           |Fetch major stock indices |
|--------------------------------|--------|-------------------------------|--------------------------|
|/api//api/annualized-return     | GET    |None                           |Fetch annualized returns  |
|                                |        |                               |for indices               |

