def test_login_user(client):
    resp = client.post(
        "/auth/login", json={"email": "sam@example.com", "password": "password"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["id"] == "u-2"
    assert data["user"]["name"] == "Sam Rivera"
    assert data["user"]["role"] == "user"
    assert "token" in data


def test_login_admin(client):
    resp = client.post(
        "/auth/login", json={"email": "lee@example.com", "password": "password"}
    )
    assert resp.status_code == 200
    assert resp.json()["user"]["role"] == "admin"


def test_login_bad_password(client):
    resp = client.post(
        "/auth/login", json={"email": "sam@example.com", "password": "wrong"}
    )
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"


def test_login_unknown_email(client):
    resp = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": "password"}
    )
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"


def test_session_with_token(client, login):
    resp = client.get("/session", headers=login("sam@example.com"))
    assert resp.status_code == 200
    assert resp.json()["id"] == "u-2"


def test_session_without_token(client):
    resp = client.get("/session")
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"


def test_session_invalid_token(client):
    resp = client.get("/session", headers={"Authorization": "Bearer not-a-token"})
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"