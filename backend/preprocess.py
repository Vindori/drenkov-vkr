from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import numpy as np
import nltk
import re


nltk.download('stopwords')
nltk.download('punkt')
stop_words = set(stopwords.words('russian'))

def stem_russian_word(word):
    parsed_word = morph.parse(word)[0]
    return parsed_word.normal_form

def preprocess_russian_text(text):
    cleaned_text = re.sub(r'[^а-яА-Яa-zA-ZЁё\s]', '', text)
    
    words = word_tokenize(cleaned_text, language='russian')
    filtered_words = [word for word in words if word.lower() not in stop_words]
    
    return " ".join(filtered_words).lower()

def vectorize_sentence(text, model):
    return model.get_sentence_vector(text)

def process_news(title, text, model):
    title_filtered = preprocess_russian_text(title)
    text_filtered = preprocess_russian_text(text)
    
    title_vec = vectorize_sentence(title_filtered, model)
    text_vec = vectorize_sentence(text_filtered, model)
    
    return np.append(title_vec, text_vec, axis=0)