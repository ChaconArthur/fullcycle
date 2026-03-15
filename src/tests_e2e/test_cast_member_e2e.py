import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
class TestCastMemberE2E:
    def test_user_can_create_list_update_and_delete_cast_member(
        self, api_client: APIClient
    ) -> None:
        # Lista vazia inicial
        list_response = api_client.get("/api/cast_members/")
        assert list_response.status_code == 200
        assert list_response.data == {
            "data": [],
            "meta": {"current_page": 1, "per_page": 2, "total": 0},
        }

        # Cria um ator
        create_response = api_client.post(
            "/api/cast_members/",
            {"name": "John Doe", "type": "ACTOR"},
        )
        assert create_response.status_code == 201
        cast_member_id = create_response.data["id"]

        # Verifica que aparece na listagem
        list_response = api_client.get("/api/cast_members/")
        assert list_response.status_code == 200
        assert list_response.data == {
            "data": [
                {"id": cast_member_id, "name": "John Doe", "type": "ACTOR"}
            ],
            "meta": {"current_page": 1, "per_page": 2, "total": 1},
        }

        # Edita o membro de elenco (troca nome e tipo)
        update_response = api_client.put(
            f"/api/cast_members/{cast_member_id}/",
            {"name": "Jane Doe", "type": "DIRECTOR"},
        )
        assert update_response.status_code == 204

        # Verifica que a atualização aparece na listagem
        list_response = api_client.get("/api/cast_members/")
        assert list_response.data == {
            "data": [
                {"id": cast_member_id, "name": "Jane Doe", "type": "DIRECTOR"}
            ],
            "meta": {"current_page": 1, "per_page": 2, "total": 1},
        }

        # Deleta o membro
        delete_response = api_client.delete(f"/api/cast_members/{cast_member_id}/")
        assert delete_response.status_code == 204

        # Verifica que a listagem está vazia novamente
        list_response = api_client.get("/api/cast_members/")
        assert list_response.data == {
            "data": [],
            "meta": {"current_page": 1, "per_page": 2, "total": 0},
        }
