def test_merge_user_forbidden(client, login):
    headers = login("sam@example.com")
    resp = client.post("/requests/req-4/merge", json={"into": "req-12"}, headers=headers)
    assert resp.status_code == 403
    assert resp.json()["code"] == "FORBIDDEN"


def test_merge_self(client, login):
    headers = login("lee@example.com")
    resp = client.post("/requests/req-4/merge", json={"into": "req-4"}, headers=headers)
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID"


def test_merge_absorbed_missing(client, login):
    headers = login("lee@example.com")
    resp = client.post("/requests/req-999/merge", json={"into": "req-12"}, headers=headers)
    assert resp.status_code == 404
    assert resp.json()["code"] == "NOT_FOUND"


def test_merge_target_missing(client, login):
    headers = login("lee@example.com")
    resp = client.post("/requests/req-4/merge", json={"into": "req-999"}, headers=headers)
    assert resp.status_code == 404
    assert resp.json()["code"] == "NOT_FOUND"


def test_merge_absorbed_already_redirected(client, login):
    headers = login("lee@example.com")
    resp = client.post("/requests/req-10/merge", json={"into": "req-12"}, headers=headers)
    assert resp.status_code == 409
    assert resp.json()["code"] == "REDIRECTED_LOCKED"


def test_merge_into_redirected(client, login):
    headers = login("lee@example.com")
    resp = client.post("/requests/req-4/merge", json={"into": "req-10"}, headers=headers)
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID"


def test_merge_union_of_voters(client, login):
    headers = login("lee@example.com")
    survivor_before = client.get("/requests/req-12").json()["support"]
    absorbed_before = client.get("/requests/req-4").json()["support"]
    # req-4 voters {u-1..u-6}; req-12 voters {u-1..u-5} -> union = 6.
    resp = client.post("/requests/req-4/merge", json={"into": "req-12"}, headers=headers)
    assert resp.status_code == 200
    survivor = resp.json()
    assert survivor["support"] == absorbed_before
    assert survivor["support"] < survivor_before + absorbed_before
    assert survivor["mergedFrom"][0]["id"] == "req-4"


def test_merge_absorbed_becomes_redirected(client, login):
    headers = login("lee@example.com")
    client.post("/requests/req-4/merge", json={"into": "req-12"}, headers=headers)
    absorbed = client.get("/requests/req-4").json()
    assert absorbed["status"] == "redirected"
    assert absorbed["mergedInto"] == "req-12"
    assert absorbed["mergedIntoRequest"]["id"] == "req-12"
    assert len(absorbed["comments"]) == 2


def test_merge_no_double_count_across_requests(client, login):
    headers = login("lee@example.com")
    survivor = client.post(
        "/requests/req-4/merge", json={"into": "req-12"}, headers=headers
    ).json()
    union = client.put("/requests/req-12/vote", headers=headers).json()
    assert union["support"] == survivor["support"]
    again = client.put("/requests/req-12/vote", headers=headers).json()
    assert again["support"] == union["support"]


def test_merge_same_absorbed_twice_locked(client, login):
    headers = login("lee@example.com")
    client.post("/requests/req-4/merge", json={"into": "req-12"}, headers=headers)
    resp = client.post("/requests/req-4/merge", json={"into": "req-12"}, headers=headers)
    assert resp.status_code == 409
    assert resp.json()["code"] == "REDIRECTED_LOCKED"


def test_merge_requires_auth(client):
    resp = client.post("/requests/req-4/merge", json={"into": "req-12"})
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"