import joblib

def __init__(self, model_path):
	self.model = joblib.load(model_path)
	print(type(self.model))
	print(self.model.keys())