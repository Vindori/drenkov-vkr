import requests
from datetime import datetime, timedelta

def fetch_daily_close_stock_quotes(ticker='GAZP', date=datetime.now(), past=30):
    p = date - timedelta(days=past*3)
    p = p.strftime('%Y-%m-%d')
    date = date.strftime('%Y-%m-%d')

    url_template = "https://iss.moex.com/iss/engines/stock/markets/shares/securities/{ticker}/candles.json"
    url = url_template.format(ticker=ticker)
    params1 = {'from': p, 'till': date, 'interval': 24}

    response1 = requests.get(url, params=params1)
    j1 = response1.json()

    data1 = [{k: r[i] for i, k in enumerate(j1['candles']['columns'])} for r in j1['candles']['data']]
    close_prices1 = [d["close"] for d in data1 if 'close' in d]

    X = close_prices1[-past:]

    return X