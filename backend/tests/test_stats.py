def test_stats_user_forbidden(client, login):
    headers = login("sam@example.com")
    resp = client.get("/stats", headers=headers)
    assert resp.status_code == 403
    assert resp.json()["code"] == "FORBIDDEN"


def test_stats_requires_auth(client):
    resp = client.get("/stats")
    assert resp.status_code == 401
    assert resp.json()["code"] == "UNAUTHORIZED"


def test_stats_shape(client, login):
    headers = login("lee@example.com")
    resp = client.get("/stats", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["totalRequests"] == 12
    assert data["activeRequests"] == 7
    assert data["totalSupport"] == 70
    assert data["releasedRequests"] == 2
    assert len(data["statusDistribution"]) == 6
    assert len(data["topVoted"]) == 5
    assert len(data["votesOverTime"]) == 30
    by_status = {b["status"]: b["count"] for b in data["statusDistribution"]}
    assert by_status["redirected"] == 1
    assert by_status["released"] == 2
    assert data["topVoted"][0]["support"] >= data["topVoted"][1]["support"]