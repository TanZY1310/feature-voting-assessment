def test_vote_increments(client, login):
    headers = login("maya@example.com")
    resp = client.put("/requests/req-6/vote", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["support"] == 4
    assert data["votedByMe"] is True


def test_vote_once_idempotent(client, login):
    headers = login("maya@example.com")
    first = client.put("/requests/req-6/vote", headers=headers).json()
    second = client.put("/requests/req-6/vote", headers=headers).json()
    assert first["support"] == 4
    assert second["support"] == 4


def test_vote_then_clear(client, login):
    headers = login("maya@example.com")
    voted = client.put("/requests/req-6/vote", headers=headers).json()
    assert voted["support"] == 4
    cleared = client.delete("/requests/req-6/vote", headers=headers).json()
    assert cleared["support"] == 3
    assert cleared["votedByMe"] is False


def test_clear_vote_idempotent(client, login):
    headers = login("maya@example.com")
    first = client.delete("/requests/req-6/vote", headers=headers).json()
    second = client.delete("/requests/req-6/vote", headers=headers).json()
    assert first["support"] == 3
    assert second["support"] == 3


def test_vote_closed_released(client, login):
    headers = login("maya@example.com")
    resp = client.put("/requests/req-1/vote", headers=headers)
    assert resp.status_code == 409
    assert resp.json()["code"] == "NOT_OPEN"


def test_vote_closed_declined(client, login):
    headers = login("maya@example.com")
    resp = client.put("/requests/req-5/vote", headers=headers)
    assert resp.status_code == 409
    assert resp.json()["code"] == "NOT_OPEN"


def test_vote_closed_redirected(client, login):
    headers = login("maya@example.com")
    resp = client.put("/requests/req-10/vote", headers=headers)
    assert resp.status_code == 409
    assert resp.json()["code"] == "NOT_OPEN"


def test_clear_vote_on_terminal_ok(client, login):
    headers = login("sam@example.com")
    resp = client.delete("/requests/req-1/vote", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["support"] == 11
    assert data["votedByMe"] is False


def test_vote_missing_request(client, login):
    headers = login("maya@example.com")
    resp = client.put("/requests/req-999/vote", headers=headers)
    assert resp.status_code == 404
    assert resp.json()["code"] == "NOT_FOUND"


def test_vote_requires_auth(client):
    resp = client.put("/requests/req-6/vote")
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"