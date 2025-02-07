from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from sklearn.cluster import KMeans
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["GET"],  # Allow only GET requests
    allow_headers=["*"],  # Allow all headers
)

# MongoDB connection
try:
    client = MongoClient("mongodb+srv://madhu:madhuabey@cluster0.j6qxp.mongodb.net/auth-db?retryWrites=true&w=majority&appName=Cluster0")
    db = client["auth-db"]
    collection = db["users"]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise HTTPException(status_code=500, detail="Failed to connect to MongoDB")

@app.get("/cluster-users")
def cluster_users():
    try:
        # Fetch all users' locations from MongoDB
        users = list(collection.find({}, {"latitude": 1, "longitude": 1, "_id": 0}))
        if not users:
            raise HTTPException(status_code=404, detail="No users found")

        # Filter out users with missing latitude or longitude
        valid_users = [
            user for user in users
            if user.get("latitude") is not None and user.get("longitude") is not None
        ]

        if not valid_users:
            raise HTTPException(status_code=400, detail="No valid users with latitude and longitude")

        # Prepare data for clustering
        locations = np.array([[user["latitude"], user["longitude"]] for user in valid_users])

        # Apply K-Means clustering
        kmeans = KMeans(n_clusters=3, random_state=42)  # Adjust n_clusters as needed
        kmeans.fit(locations)
        labels = kmeans.labels_

        # Add cluster labels to users
        clustered_users = []
        for i, user in enumerate(valid_users):
            user["cluster"] = int(labels[i])
            clustered_users.append(user)

        return {"clustered_users": clustered_users}
    except Exception as e:
        print(f"Error in clustering: {e}")
        raise HTTPException(status_code=500, detail=str(e))