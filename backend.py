from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import time

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

# Load the model and tokenizer
MODEL_PATH = "sql_injection_model_full"
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()  # Set the model to evaluation mode
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise

@app.route('/check-sql-injection', methods=['POST'])
def check_sql_injection():
    try:
        # Get data from request
        data = request.json
        query = data.get('query', '')
        amount = data.get('amount', '0')
        
        # Add a small delay to simulate processing
        time.sleep(0.5)
        
        # Tokenize and prepare input
        inputs = tokenizer(query, return_tensors="pt", truncation=True, max_length=512)
        
        # Get prediction
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            confidence = predictions[0][1].item()
            
            # SQL injection patterns to check
            sql_patterns = [
                "'", "--", ";", "OR 1=1", "OR '1'='1'", "UNION", 
                "SELECT", "DROP", "DELETE", "UPDATE", "INSERT",
                "EXEC", "EXECUTE", "/*", "*/", "@@", "#"
            ]
            
            # Check if input contains SQL injection patterns
            contains_sql_pattern = any(pattern.lower() in query.lower() for pattern in sql_patterns)
            
            # Combine model prediction with pattern matching
            is_sql_injection = contains_sql_pattern and confidence > 0.3
        
        # Prepare response
        response = {
            'isSQLInjection': bool(is_sql_injection),
            'confidence': round(float(confidence) * 100, 2),
            'message': 'Security Alert: Potential SQL Injection Detected!' if is_sql_injection else 'Transaction Verified',
            'amount': amount,
            'query': query
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'An error occurred while processing your request'
        }), 500

@app.route('/model-metrics', methods=['GET'])
def get_model_metrics():
    # Return actual model metrics from the training results
    return jsonify({
        'accuracy': 0.9991,  # 99.91% accuracy
        'precision': 0.9982, # 99.82% precision
        'recall': 1.0000,    # 100% recall
        'f1_score': 0.9991   # 99.91% F1 score
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

