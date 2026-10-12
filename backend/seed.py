from db import hardware, users, projects

hardware.delete_many({})   # start clean so re-running doesn't create duplicates
hardware.insert_many([
    {"name": "HWSet1", "capacity": 100, "available": 100},
    {"name": "HWSet2", "capacity": 100, "available": 100},
])
users.create_index("userid", unique=True)
projects.create_index("projectId", unique=True)

print(list(hardware.find({}, {"_id": 0})))