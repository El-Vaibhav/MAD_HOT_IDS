import joblib
import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from river.tree import HoeffdingTreeClassifier
import sys
# ---------------------------------------------------
# REQUIRED FOR LOADING PICKLED MODEL
# ---------------------------------------------------
# Required for pickle loading

class SklearnHoeffdingTree(BaseEstimator, ClassifierMixin):

    def __init__(self):
        self.model = HoeffdingTreeClassifier()

    def fit(self, X, y):
        for xi, yi in zip(X, y):
            self.model.learn_one(dict(enumerate(xi)), yi)
        return self

    def predict(self, X):
        preds = []

        for xi in X:
            pred = self.model.predict_one(dict(enumerate(xi)))

            if pred is None:
                pred = 0

            preds.append(pred)

        return np.array(preds)

    def predict_proba(self, X):

        probs = []

        for xi in X:

            p = self.model.predict_proba_one(dict(enumerate(xi)))

            row = [0] * 10

            for k, v in p.items():
                row[int(k)] = v

            probs.append(row)

        return np.array(probs)

sys.modules["__main__"].SklearnHoeffdingTree = SklearnHoeffdingTree

# ---------------------------------------------------
# LIVE IDS PREDICTOR
# ---------------------------------------------------

class LivePredictor:

    def __init__(self, model_path):

        # load saved IDS model
        data = joblib.load(model_path)

        # If saved as dictionary pipeline
        if isinstance(data, dict):

            self.model = data.get("model", None)
            self.scaler = data.get("scaler", None)
            self.encoder = data.get("label_encoder", None)

        else:
            self.model = data
            self.scaler = None
            self.encoder = None

        print("IDS Model Loaded Successfully")

    def predict(self, features):

        try:

            vector = np.zeros((1, 50))

            vector[0][0] = features["packetRate"]
            vector[0][1] = features["packetSize"]
            vector[0][2] = features["flowDuration"]

            # apply scaling if present
            if self.scaler is not None:
                vector = self.scaler.transform(vector)

            prediction = self.model.predict(vector)[0]

            # decode label
            if self.encoder is not None:
                prediction = self.encoder.inverse_transform([prediction])[0]

            confidence = None

            if hasattr(self.model, "predict_proba"):
                confidence = float(np.max(self.model.predict_proba(vector)))

            return {
                "sourceIp": features["sourceIp"],
                "destIp": features["destIp"],
                "protocol": features["protocol"],
                "packetRate": features["packetRate"],
                "packetSize": features["packetSize"],
                "flowDuration": features["flowDuration"],
                "prediction": str(prediction),
                "confidence": confidence
            }

        except Exception as e:
            print("Prediction error:", e)
            return None