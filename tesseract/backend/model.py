import sys
import json
import numpy as np
from sklearn.ensemble import IsolationForest

# 🔥 FIXED: smaller dataset (faster)
X_train = np.random.normal(loc=50, scale=10, size=(100, 2))

model = IsolationForest(contamination=0.1, n_estimators=50)  # 🔥 lighter model
model.fit(X_train)

# Get input safely
try:
    data = json.loads(sys.argv[1])
    cpu = float(data["cpu"])
    memory = float(data["memory"])
except:
    print(json.dumps({"anomaly": 0}))
    sys.exit(0)

# Predict
prediction = model.predict([[cpu, memory]])

# Output
result = {
    "anomaly": int(prediction[0] == -1),
    "cpu": cpu,
    "memory": memory
}

print(json.dumps(result))