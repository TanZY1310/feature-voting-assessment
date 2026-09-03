def test_status_user_forbidden(client, login):
    headers = login("sam@example.com")
    resp = client.put(
        "/requests/req-2/status", json={"status": "in_progress"}, headers=headers
    )
    assert resp.status_code == 403
    assert resp.json()["code"] == "FORBIDDEN"


def test_status_admin_moves(client, login):
    headers = login("lee@example.com")
    resp = client.put(
        "/requests/req-2/status", json={"status": "in_progress"}, headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "in_progress"
    assert data["activity"][0]["detail"] == "moved to In Progress"
    assert data["activity"][0]["type"] == "status_changed"
    assert data["activity"][0]["actor"]["id"] == "u-1"


def test_status_to_redirected_locked(client, login):
    headers = login("lee@example.com")
    resp = client.put(
        "/requests/req-2/status", json={"status": "redirected"}, headers=headers
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "REDIRECTED_LOCKED"


def test_status_on_redirected_locked(client, login):
    headers = login("lee@example.com")
    resp = client.put(
        "/requests/req-10/status", json={"status": "planned"}, headers=headers
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "REDIRECTED_LOCKED"


def test_status_unknown_status(client, login):
    headers = login("lee@example.com")
    resp = client.put(
        "/requests/req-2/status", json={"status": "bogus"}, headers=headers
    )
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID"


def test_status_missing_request(client, login):
    headers = login("lee@example.com")
    resp = client.put(
        "/requests/req-999/status", json={"status": "planned"}, headers=headers
    )
    assert resp.status_code == 404
    assert resp.json()["code"] == "NOT_FOUND"


def test_status_requires_auth(client):
    resp = client.put("/requests/req-2/status", json={"status": "planned"})
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"