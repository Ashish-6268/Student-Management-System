import pytest

def get_master_data(client, auth_headers):
    classes = client.get("/api/v1/settings/classes", headers=auth_headers).json()["data"]
    boards = client.get("/api/v1/settings/boards", headers=auth_headers).json()["data"]
    modes = client.get("/api/v1/settings/modes", headers=auth_headers).json()["data"]
    return classes[0], boards[0], modes[0]

def test_create_and_get_student(client, auth_headers):
    cls, brd, md = get_master_data(client, auth_headers)
    subs = client.get(f"/api/v1/settings/classes/{cls['id']}/subjects", headers=auth_headers).json()["data"]
    selected_subject_ids = [s["id"] for s in subs[:2]]

    payload = {
        "roll_number": "ROLL-001",
        "name": "Aarav Sharma",
        "class_id": cls["id"],
        "board_id": brd["id"],
        "mode_id": md["id"],
        "email": "aarav@example.com",
        "contact_number_1": "9876543210",
        "contact_number_2": "9123456780",
        "remarks": "Strong in math",
        "subject_ids": selected_subject_ids
    }

    create_res = client.post("/api/v1/students/", json=payload, headers=auth_headers)
    assert create_res.status_code == 200
    student_data = create_res.json()["data"]
    assert student_data["roll_number"] == "ROLL-001"
    assert student_data["name"] == "Aarav Sharma"
    assert len(student_data["subjects"]) == 2
    student_id = student_data["id"]

    # Get single student
    get_res = client.get(f"/api/v1/students/{student_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == "Aarav Sharma"
    assert get_res.json()["data"]["is_archived"] is False

def test_student_roll_number_unique(client, auth_headers):
    cls, brd, md = get_master_data(client, auth_headers)
    subs = client.get(f"/api/v1/settings/classes/{cls['id']}/subjects", headers=auth_headers).json()["data"]
    
    payload = {
        "roll_number": "ROLL-DUP",
        "name": "Student One",
        "class_id": cls["id"],
        "board_id": brd["id"],
        "mode_id": md["id"],
        "email": "one@example.com",
        "contact_number_1": "9876543210",
        "subject_ids": [subs[0]["id"]]
    }
    res1 = client.post("/api/v1/students/", json=payload, headers=auth_headers)
    assert res1.status_code == 200

    # Duplicate roll number
    payload["name"] = "Student Two"
    payload["email"] = "two@example.com"
    res2 = client.post("/api/v1/students/", json=payload, headers=auth_headers)
    assert res2.status_code == 409

def test_student_contact_validation(client, auth_headers):
    cls, brd, md = get_master_data(client, auth_headers)
    subs = client.get(f"/api/v1/settings/classes/{cls['id']}/subjects", headers=auth_headers).json()["data"]

    payload = {
        "roll_number": "ROLL-INVALID-PHONE",
        "name": "Invalid Phone",
        "class_id": cls["id"],
        "board_id": brd["id"],
        "mode_id": md["id"],
        "email": "invalid@example.com",
        "contact_number_1": "12345", # Less than 10 digits
        "subject_ids": [subs[0]["id"]]
    }
    res = client.post("/api/v1/students/", json=payload, headers=auth_headers)
    assert res.status_code == 422

def test_student_archive_and_restore(client, auth_headers):
    cls, brd, md = get_master_data(client, auth_headers)
    subs = client.get(f"/api/v1/settings/classes/{cls['id']}/subjects", headers=auth_headers).json()["data"]

    payload = {
        "roll_number": "ROLL-ARCHIVE",
        "name": "Archive Test",
        "class_id": cls["id"],
        "board_id": brd["id"],
        "mode_id": md["id"],
        "email": "archive@example.com",
        "contact_number_1": "9876543210",
        "subject_ids": [subs[0]["id"]]
    }
    create_res = client.post("/api/v1/students/", json=payload, headers=auth_headers)
    student_id = create_res.json()["data"]["id"]

    # Archive student
    arch_res = client.patch(f"/api/v1/students/{student_id}/archive", headers=auth_headers)
    assert arch_res.status_code == 200

    # Verify archived status
    get_res = client.get(f"/api/v1/students/{student_id}", headers=auth_headers)
    assert get_res.json()["data"]["is_archived"] is True

    # Attempting to edit an archived student must be blocked (400)
    update_res = client.put(
        f"/api/v1/students/{student_id}",
        json={"name": "Attempt Update"},
        headers=auth_headers
    )
    assert update_res.status_code == 400

    # Restore student
    restore_res = client.patch(f"/api/v1/students/{student_id}/restore", headers=auth_headers)
    assert restore_res.status_code == 200

    # Verify restored and editable
    get_res2 = client.get(f"/api/v1/students/{student_id}", headers=auth_headers)
    assert get_res2.json()["data"]["is_archived"] is False

    update_res2 = client.put(
        f"/api/v1/students/{student_id}",
        json={"name": "Successfully Updated"},
        headers=auth_headers
    )
    assert update_res2.status_code == 200
    assert update_res2.json()["data"]["name"] == "Successfully Updated"

def test_pagination_filtering_and_sorting(client, auth_headers):
    classes = client.get("/api/v1/settings/classes", headers=auth_headers).json()["data"]
    boards = client.get("/api/v1/settings/boards", headers=auth_headers).json()["data"]
    modes = client.get("/api/v1/settings/modes", headers=auth_headers).json()["data"]

    # Create 12 students to test 10-record pagination
    for i in range(1, 13):
        cls = classes[i % len(classes)]
        brd = boards[i % len(boards)]
        md = modes[i % len(modes)]
        subs = client.get(f"/api/v1/settings/classes/{cls['id']}/subjects", headers=auth_headers).json()["data"]
        client.post("/api/v1/students/", json={
            "roll_number": f"PAG-{i:03d}",
            "name": f"Student {chr(65 + i)}",
            "class_id": cls["id"],
            "board_id": brd["id"],
            "mode_id": md["id"],
            "email": f"student{i}@example.com",
            "contact_number_1": f"98765432{i:02d}",
            "subject_ids": [subs[0]["id"]]
        }, headers=auth_headers)

    # 1. 10-record pagination
    page1 = client.get("/api/v1/students/?page=1&per_page=10", headers=auth_headers).json()
    assert len(page1["data"]) == 10
    assert page1["meta"]["per_page"] == 10
    assert page1["meta"]["total"] >= 12

    page2 = client.get("/api/v1/students/?page=2&per_page=10", headers=auth_headers).json()
    assert len(page2["data"]) >= 2

    # 2. Filtering by Class
    target_class_id = classes[0]["id"]
    filter_cls = client.get(f"/api/v1/students/?class_id={target_class_id}", headers=auth_headers).json()
    assert all(s["class_name"] == classes[0]["name"] for s in filter_cls["data"])

    # 3. Filtering by Mode
    target_mode_id = modes[0]["id"]
    filter_mode = client.get(f"/api/v1/students/?mode_id={target_mode_id}", headers=auth_headers).json()
    assert all(s["mode_name"] == modes[0]["name"] for s in filter_mode["data"])

    # 4. Sorting: 3-way (name, roll_number, class)
    sort_name_asc = client.get("/api/v1/students/?sort_by=name&sort_order=asc", headers=auth_headers).json()
    names = [s["name"] for s in sort_name_asc["data"]]
    assert names == sorted(names)

    sort_roll_desc = client.get("/api/v1/students/?sort_by=roll_number&sort_order=desc", headers=auth_headers).json()
    rolls = [s["roll_number"] for s in sort_roll_desc["data"]]
    assert rolls == sorted(rolls, reverse=True)
