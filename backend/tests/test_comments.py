def test_list_comments_newest_first(client):
    resp = client.get("/requests/req-1/comments")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    assert data[0]["createdAt"] >= data[1]["createdAt"]
    assert data[0]["requestId"] == "req-1"


def test_list_comments_missing_request(client):
    resp = client.get("/requests/req-999/comments")
    assert resp.status_code == 404
    assert resp.json()["code"] == "NOT_FOUND"


def test_add_comment(client, login):
    headers = login("sam@example.com")
    resp = client.post(
        "/requests/req-12/comments", json={"body": "nice idea"}, headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["author"]["id"] == "u-2"
    assert data["body"] == "nice idea"
    assert data["id"] == "c-9"


def test_add_comment_requires_auth(client):
    resp = client.post("/requests/req-12/comments", json={"body": "x"})
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"


def test_add_comment_empty_body(client, login):
    headers = login("sam@example.com")
    resp = client.post("/requests/req-12/comments", json={"body": "   "}, headers=headers)
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID"


def test_add_comment_missing_request(client, login):
    headers = login("sam@example.com")
    resp = client.post(
        "/requests/req-999/comments", json={"body": "x"}, headers=headers
    )
    assert resp.status_code == 404


def test_add_comment_does_not_create_activity(client, login):
    headers = login("sam@example.com")
    before = len(client.get("/requests/req-12").json()["activity"])
    client.post("/requests/req-12/comments", json={"body": "x"}, headers=headers)
    after = len(client.get("/requests/req-12").json()["activity"])
    assert before == after


def test_set_response_user_forbidden(client, login):
    headers = login("sam@example.com")
    resp = client.put("/requests/req-12/response", json={"body": "hi"}, headers=headers)
    assert resp.status_code == 403
    assert resp.json()["code"] == "FORBIDDEN"


def test_set_response_creates_slot(client, login):
    headers = login("lee@example.com")
    resp = client.put(
        "/requests/req-12/response", json={"body": "We'll look into it."}, headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["requestId"] == "req-12"
    assert data["author"]["id"] == "u-1"
    assert data["body"] == "We'll look into it."
    detail = client.get("/requests/req-12").json()
    assert detail["officialResponse"]["body"] == "We'll look into it."
    assert detail["activity"][0]["type"] == "response_posted"


def test_set_response_edits_single_slot(client, login):
    headers = login("lee@example.com")
    client.put("/requests/req-12/response", json={"body": "first"}, headers=headers)
    resp = client.put("/requests/req-12/response", json={"body": "second"}, headers=headers)
    data = resp.json()
    assert data["body"] == "second"
    assert data["author"]["id"] == "u-1"
    detail = client.get("/requests/req-12").json()
    assert detail["officialResponse"]["body"] == "second"
    assert detail["activity"][0]["type"] == "response_edited"


def test_set_response_empty_body(client, login):
    headers = login("lee@example.com")
    resp = client.put("/requests/req-12/response", json={"body": " "}, headers=headers)
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID"


def test_set_response_missing_request(client, login):
    headers = login("lee@example.com")
    resp = client.put("/requests/req-999/response", json={"body": "x"}, headers=headers)
    assert resp.status_code == 404


def test_remove_response(client, login):
    headers = login("lee@example.com")
    resp = client.delete("/requests/req-1/response", headers=headers)
    assert resp.status_code == 200
    assert resp.json() is None
    detail = client.get("/requests/req-1").json()
    assert detail["officialResponse"] is None
    assert detail["activity"][0]["type"] == "response_removed"


def test_remove_response_noop_when_absent(client, login):
    headers = login("lee@example.com")
    resp = client.delete("/requests/req-12/response", headers=headers)
    assert resp.status_code == 200
    assert resp.json() is None


def test_remove_response_user_forbidden(client, login):
    headers = login("sam@example.com")
    resp = client.delete("/requests/req-1/response", headers=headers)
    assert resp.status_code == 403