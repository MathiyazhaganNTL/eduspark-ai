import sys
import json
from services.ollama_service import generate_insights

res = generate_insights('student are well performed in computer science')
with open('debug_out.txt', 'w') as f:
    f.write("Output:\n")
    for r in res:
        f.write(r.model_dump_json() + "\n")
