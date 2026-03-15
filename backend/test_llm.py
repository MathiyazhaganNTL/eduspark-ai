import sys
import logging
logging.basicConfig(level=logging.INFO)
from services.ollama_service import generate_insights
res = generate_insights('student are well performed in computer science')
print('\nFinal:', res)
