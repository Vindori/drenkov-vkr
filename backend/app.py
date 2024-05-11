# -*- coding:utf-8 -*-

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

import stocks
import datetime
import fasttext
import preprocess
import numpy as np
import tensorflow as tf


ft = fasttext.load_model('cc.ru.300.bin')
spp = tf.keras.models.load_model('vkr_12_05.keras')

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/forecast/', methods=['GET', 'POST'])
def forecast_stock():
    if request.method == 'GET':
        return 'GET not allowed', 502
    
    title = request.json.get('title', '')
    text = request.json.get('text', '')
    ticker = request.json.get('ticker', '')

    if title == '':
        return jsonify({'error':'Заполните все поля'}), 400
    if text == '':
        return jsonify({'error':'Заполните все поля'}), 400
    if ticker == '':
        return jsonify({'error':'Заполните все поля'}), 400
    
    try:
        stock_prices = stocks.fetch_daily_close_stock_quotes(ticker, date=datetime.datetime.now(), past=30)
        assert len(stock_prices) == 30
    except Exception:
        return jsonify({'error': 'Не удалось получить данные с Мосбиржи. Возможно данная компания не торгует акциями на MOEX.'}), 400
    vec = preprocess.process_news(title, text, ft)

    X_min = min(stock_prices)
    X_max = max(stock_prices)
    X = [(i - X_min) / (X_max - X_min) for i in stock_prices]

    spnp = np.array(X)
    vecnp = np.array(vec)

    preditions = spp.predict([spnp.reshape(1,30), vecnp.reshape(1,600)])

    preditions_list = [i * (X_max - X_min) + X_min for i in preditions.tolist()[-1]]

    return jsonify({'numbers':stock_prices + preditions_list, 
                    'forecastedCount': len(preditions_list), 
                    'lastValue': stock_prices[-1]})

app.run('127.0.0.1', port=8000, debug=False)