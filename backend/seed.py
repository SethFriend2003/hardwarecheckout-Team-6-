import sys
from db import hardware, users, projects

# Safe to run against a shared database: hardware is only (re)created when it is empty,
# or when you pass --reset on purpose (which also forgets everything currently checked out).
reset = "--reset" in sys.argv
if reset or hardware.count_documents({}) == 0:
    hardware.delete_many({})
    hardware.insert_many([
        {"name": "HWSet1", "capacity": 100, "available": 100},
        {"name": "HWSet2", "capacity": 100, "available": 100},
    ])
else:
    print("Hardware already seeded, leaving it alone. Use --reset to wipe and reseed.")

users.create_index("userid", unique=True)
projects.create_index("projectId", unique=True)

print(list(hardware.find({}, {"_id": 0})))
