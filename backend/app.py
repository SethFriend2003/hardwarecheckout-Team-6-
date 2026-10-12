from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.errors import DuplicateKeyError
from db import users, projects, hardware
from security import encrypt_userid, hash_password, check_password

app = Flask(__name__)
CORS(app)

HW_SETS = ["HWSet1", "HWSet2"]

# ---------- Users ----------
@app.post("/api/register")
def register():
    data = request.get_json()
    userid, password = data.get("userid"), data.get("password")
    if not userid or not password:
        return jsonify(error="userid and password required"), 400
    try:
        users.insert_one({"userid": encrypt_userid(userid),
                          "password": hash_password(password),
                          "projects": []})
    except DuplicateKeyError:
        return jsonify(error="userid already exists"), 409
    return jsonify(message="user created"), 201

@app.post("/api/login")
def login():
    data = request.get_json()
    user = users.find_one({"userid": encrypt_userid(data.get("userid", ""))})
    if not user or not check_password(user["password"], data.get("password", "")):
        return jsonify(error="invalid userid or password"), 401
    return jsonify(message="logged in", userid=data["userid"], projects=user["projects"])

# ---------- Projects ----------
@app.post("/api/projects")
def create_project():
    data = request.get_json()
    pid, userid = data.get("projectId"), data.get("userid")
    if not pid or not data.get("name") or not userid:
        return jsonify(error="projectId, name and userid required"), 400
    enc = encrypt_userid(userid)
    try:
        projects.insert_one({"projectId": pid,
                             "name": data["name"],
                             "description": data.get("description", ""),
                             "members": [enc],
                             "hwCheckedOut": {hw: 0 for hw in HW_SETS}})
    except DuplicateKeyError:
        return jsonify(error="projectId already exists"), 409
    users.update_one({"userid": enc}, {"$addToSet": {"projects": pid}})
    return jsonify(message="project created"), 201

@app.post("/api/projects/join")
def join_project():
    data = request.get_json()
    pid, enc = data.get("projectId"), encrypt_userid(data.get("userid", ""))
    result = projects.update_one({"projectId": pid}, {"$addToSet": {"members": enc}})
    if result.matched_count == 0:
        return jsonify(error="project not found"), 404
    users.update_one({"userid": enc}, {"$addToSet": {"projects": pid}})
    return jsonify(message=f"joined {pid}")

@app.get("/api/projects/<pid>")
def get_project(pid):
    project = projects.find_one({"projectId": pid}, {"_id": 0, "members": 0})
    if not project:
        return jsonify(error="project not found"), 404
    return jsonify(project)

# ---------- Hardware ----------
@app.get("/api/hardware")
def hardware_status():
    return jsonify(list(hardware.find({}, {"_id": 0})))

def parse_hw_request(data):
    hw, pid = data.get("hwName"), data.get("projectId")
    try:
        qty = int(data.get("qty", 0))
    except (TypeError, ValueError):
        qty = 0
    if hw not in HW_SETS or qty <= 0 or not projects.find_one({"projectId": pid}):
        return None
    return hw, pid, qty

@app.post("/api/hardware/checkout")
def checkout():
    parsed = parse_hw_request(request.get_json())
    if not parsed:
        return jsonify(error="invalid hwName, qty, or projectId"), 400
    hw, pid, qty = parsed
    result = hardware.update_one({"name": hw, "available": {"$gte": qty}},
                                 {"$inc": {"available": -qty}})
    if result.modified_count == 0:
        return jsonify(error=f"not enough {hw} available"), 409
    projects.update_one({"projectId": pid}, {"$inc": {f"hwCheckedOut.{hw}": qty}})
    return jsonify(message=f"checked out {qty} of {hw}")

@app.post("/api/hardware/checkin")
def checkin():
    parsed = parse_hw_request(request.get_json())
    if not parsed:
        return jsonify(error="invalid hwName, qty, or projectId"), 400
    hw, pid, qty = parsed
    result = projects.update_one({"projectId": pid, f"hwCheckedOut.{hw}": {"$gte": qty}},
                                 {"$inc": {f"hwCheckedOut.{hw}": -qty}})
    if result.modified_count == 0:
        return jsonify(error=f"project doesn't hold {qty} of {hw}"), 409
    hardware.update_one({"name": hw}, {"$inc": {"available": qty}})
    return jsonify(message=f"checked in {qty} of {hw}")

if __name__ == "__main__":
    app.run(debug=True)