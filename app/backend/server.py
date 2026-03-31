from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    discipline_score: int = 100
    total_steps: int = 0
    badges: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    name: str

class Workout(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # swimming or yoga
    duration: int  # minutes
    laps: Optional[int] = None
    intensity: Optional[str] = None  # low, medium, high
    calories: int
    date: str
    time: str  # HH:MM format
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WorkoutCreate(BaseModel):
    user_id: str
    type: str
    duration: int
    laps: Optional[int] = None
    intensity: Optional[str] = None
    date: str
    time: str

class Meal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    calories: int
    mode: str  # home, trip, detox, cheat
    date: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MealCreate(BaseModel):
    user_id: str
    name: str
    calories: int
    mode: str
    date: str

class Nudge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    type: str  # workout, steps
    dismissed: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Friend(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    friend_user_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FriendCreate(BaseModel):
    user_id: str
    friend_user_id: str

class Interaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    target_user_id: str
    type: str  # poke or kudos
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InteractionCreate(BaseModel):
    user_id: str
    target_user_id: str
    type: str

class BMICalculate(BaseModel):
    weight: float  # kg
    height: float  # cm

class BMIResponse(BaseModel):
    bmi: float
    category: str

class StatsResponse(BaseModel):
    discipline_score: int
    total_workouts: int
    total_calories_burned: int
    current_streak: int
    badges: List[str]
    recent_interactions: int

# ========== HELPER FUNCTIONS ==========

def calculate_calories(workout_type: str, duration: int, laps: Optional[int] = None, intensity: Optional[str] = None) -> int:
    """Calculate calories based on MET values"""
    # MET values (Metabolic Equivalent of Task)
    if workout_type == "swimming":
        # Swimming: 8-11 MET depending on intensity
        if laps and laps > 40:
            met = 11  # vigorous
        elif laps and laps > 20:
            met = 9  # moderate
        else:
            met = 7  # light
    elif workout_type == "yoga":
        # Yoga: 2-4 MET depending on intensity
        if intensity == "high":
            met = 4
        elif intensity == "medium":
            met = 3
        else:
            met = 2
    else:
        met = 3  # default
    
    # Formula: Calories = MET × weight(kg) × time(hours)
    # Assuming average weight of 70kg
    weight = 70
    hours = duration / 60
    calories = int(met * weight * hours)
    return calories

async def update_discipline_score(user_id: str):
    """Update discipline score based on recent activity"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    
    # Check if workout done today
    today = datetime.now(timezone.utc).date().isoformat()
    workout_today = await db.workouts.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    
    if not workout_today:
        # Decrease score if no workout
        new_score = max(0, user.get("discipline_score", 100) - 5)
    else:
        # Increase score if workout done
        new_score = min(100, user.get("discipline_score", 100) + 2)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"discipline_score": new_score}}
    )

async def check_and_award_badges(user_id: str):
    """Check and award badges based on achievements"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    
    badges = user.get("badges", [])
    
    # Check 7-day streak
    workouts = await db.workouts.find({"user_id": user_id}, {"_id": 0}).sort("date", -1).to_list(100)
    if workouts:
        dates = sorted(set([w["date"] for w in workouts]), reverse=True)
        streak = 0
        for i, date_str in enumerate(dates):
            expected_date = (datetime.now(timezone.utc).date() - timedelta(days=i)).isoformat()
            if date_str == expected_date:
                streak += 1
            else:
                break
        
        if streak >= 7 and "7_day_streak" not in badges:
            badges.append("7_day_streak")
    
    # Check 5am workout
    early_workouts = [w for w in workouts if w.get("time", "06:00") <= "05:00"]
    if early_workouts and "early_bird" not in badges:
        badges.append("early_bird")
    
    # Check detox completion
    meals = await db.meals.find({"user_id": user_id, "mode": "detox"}, {"_id": 0}).to_list(100)
    detox_dates = sorted(set([m["date"] for m in meals]))
    if len(detox_dates) >= 3 and "detox_champion" not in badges:
        badges.append("detox_champion")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"badges": badges}}
    )

# ========== ROUTES ==========

@api_router.get("/")
async def root():
    return {"message": "Discipline & Flow API"}

# Users
@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    user = User(**input.model_dump())
    doc = user.model_dump()
    await db.users.insert_one(doc)
    return user

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Workouts
@api_router.post("/workouts", response_model=Workout)
async def create_workout(input: WorkoutCreate):
    calories = calculate_calories(input.type, input.duration, input.laps, input.intensity)
    workout = Workout(**input.model_dump(), calories=calories)
    doc = workout.model_dump()
    await db.workouts.insert_one(doc)
    
    # Update discipline score and check badges
    await update_discipline_score(input.user_id)
    await check_and_award_badges(input.user_id)
    
    return workout

@api_router.get("/workouts", response_model=List[Workout])
async def get_workouts(user_id: Optional[str] = None, date: Optional[str] = None):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if date:
        query["date"] = date
    workouts = await db.workouts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return workouts

# Meals
@api_router.post("/meals", response_model=Meal)
async def create_meal(input: MealCreate):
    meal = Meal(**input.model_dump())
    doc = meal.model_dump()
    await db.meals.insert_one(doc)
    return meal

@api_router.get("/meals", response_model=List[Meal])
async def get_meals(user_id: Optional[str] = None, mode: Optional[str] = None):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if mode:
        query["mode"] = mode
    meals = await db.meals.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return meals

# Nudges
@api_router.get("/nudges", response_model=List[Nudge])
async def get_nudges(user_id: str):
    nudges = await db.nudges.find({"user_id": user_id, "dismissed": False}, {"_id": 0}).to_list(100)
    return nudges

@api_router.post("/nudges/dismiss")
async def dismiss_nudge(nudge_id: str):
    result = await db.nudges.update_one(
        {"id": nudge_id},
        {"$set": {"dismissed": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Nudge not found")
    return {"success": True}

@api_router.post("/nudges/generate")
async def generate_nudges(user_id: str):
    """Generate nudges if user hasn't worked out today"""
    today = datetime.now(timezone.utc).date().isoformat()
    workout_today = await db.workouts.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    
    if not workout_today:
        nudge = Nudge(
            user_id=user_id,
            message="The pool is waiting, don't break the streak!",
            type="workout"
        )
        await db.nudges.insert_one(nudge.model_dump())
        return nudge
    
    return {"message": "No nudge needed"}

# Friends
@api_router.get("/friends/{user_id}", response_model=List[User])
async def get_friends(user_id: str):
    friendships = await db.friends.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    friend_ids = [f["friend_user_id"] for f in friendships]
    friends = await db.users.find({"id": {"$in": friend_ids}}, {"_id": 0}).to_list(100)
    return friends

@api_router.post("/friends", response_model=Friend)
async def add_friend(input: FriendCreate):
    friend = Friend(**input.model_dump())
    doc = friend.model_dump()
    await db.friends.insert_one(doc)
    return friend

# Interactions
@api_router.post("/interactions", response_model=Interaction)
async def create_interaction(input: InteractionCreate):
    interaction = Interaction(**input.model_dump())
    doc = interaction.model_dump()
    await db.interactions.insert_one(doc)
    return interaction

@api_router.get("/interactions/{user_id}", response_model=List[Interaction])
async def get_interactions(user_id: str):
    interactions = await db.interactions.find(
        {"target_user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    return interactions

# Stats
@api_router.get("/stats/{user_id}", response_model=StatsResponse)
async def get_stats(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    workouts = await db.workouts.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    total_calories = sum([w["calories"] for w in workouts])
    
    # Calculate streak
    dates = sorted(set([w["date"] for w in workouts]), reverse=True)
    streak = 0
    for i, date_str in enumerate(dates):
        expected_date = (datetime.now(timezone.utc).date() - timedelta(days=i)).isoformat()
        if date_str == expected_date:
            streak += 1
        else:
            break
    
    interactions = await db.interactions.find({"target_user_id": user_id}, {"_id": 0}).to_list(100)
    recent_interactions = len([i for i in interactions if (datetime.now(timezone.utc) - datetime.fromisoformat(i["timestamp"])).days <= 7])
    
    return StatsResponse(
        discipline_score=user.get("discipline_score", 100),
        total_workouts=len(workouts),
        total_calories_burned=total_calories,
        current_streak=streak,
        badges=user.get("badges", []),
        recent_interactions=recent_interactions
    )

# BMI Calculator
@api_router.post("/bmi/calculate", response_model=BMIResponse)
async def calculate_bmi(input: BMICalculate):
    height_m = input.height / 100
    bmi = round(input.weight / (height_m ** 2), 1)
    
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    
    return BMIResponse(bmi=bmi, category=category)

# Progress data for charts
@api_router.get("/progress/{user_id}")
async def get_progress(user_id: str, days: int = 7):
    start_date = datetime.now(timezone.utc).date() - timedelta(days=days-1)
    
    workouts = await db.workouts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    meals = await db.meals.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Group by date
    progress_data = {}
    for i in range(days):
        date = (start_date + timedelta(days=i)).isoformat()
        day_workouts = [w for w in workouts if w["date"] == date]
        day_meals = [m for m in meals if m["date"] == date]
        
        progress_data[date] = {
            "date": date,
            "calories_burned": sum([w["calories"] for w in day_workouts]),
            "calories_consumed": sum([m["calories"] for m in day_meals]),
            "workouts": len(day_workouts)
        }
    
    return list(progress_data.values())

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
