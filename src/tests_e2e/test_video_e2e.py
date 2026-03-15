import pytest
from rest_framework.test import APIClient

from src.core.cast_member.domain.cast_member import CastMember, CastMemberType
from src.core.category.domain.category import Category
from src.core.genre.domain.genre import Genre
from src.django_project.cast_member_app.repository import DjangoORMCastMemberRepository
from src.django_project.category_app.repository import DjangoORMCategoryRepository
from src.django_project.genre_app.repository import DjangoORMGenreRepository


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def category(db):
    category = Category(name="Action", description="Action movies")
    DjangoORMCategoryRepository().save(category)
    return category


@pytest.fixture
def genre(db, category):
    genre = Genre(name="Drama", categories={category.id})
    DjangoORMGenreRepository().save(genre)
    return genre


@pytest.fixture
def cast_member(db):
    cast_member = CastMember(name="John Doe", type=CastMemberType.ACTOR)
    DjangoORMCastMemberRepository().save(cast_member)
    return cast_member


@pytest.mark.django_db
class TestCreateVideoWithoutMediaE2E:
    def test_create_video_successfully(
        self, api_client: APIClient, category, genre, cast_member
    ) -> None:
        response = api_client.post(
            "/api/videos/",
            data={
                "title": "My Video",
                "description": "A great video",
                "year_launched": 2023,
                "opened": True,
                "rating": "L",
                "duration": 120,
                "categories_id": [str(category.id)],
                "genres_id": [str(genre.id)],
                "cast_members_id": [str(cast_member.id)],
            },
            format="json",
        )

        assert response.status_code == 201
        assert "id" in response.data
        video_id = response.data["id"]
        assert video_id is not None

        # Confirm the video was actually persisted
        from src.django_project.video_app.repository import DjangoORMVideoRepository
        video = DjangoORMVideoRepository().get_by_id(video_id)
        assert video is not None
        assert video.title == "My Video"
        assert video.description == "A great video"
        assert video.launch_year == 2023
        assert video.opened is True
        assert video.rating == "L"
        assert category.id in video.categories
        assert genre.id in video.genres
        assert cast_member.id in video.cast_members

    def test_create_video_with_invalid_category_returns_400(
        self, api_client: APIClient
    ) -> None:
        import uuid

        response = api_client.post(
            "/api/videos/",
            data={
                "title": "My Video",
                "description": "A great video",
                "year_launched": 2023,
                "opened": True,
                "rating": "L",
                "duration": 120,
                "categories_id": [str(uuid.uuid4())],
                "genres_id": [],
                "cast_members_id": [],
            },
            format="json",
        )

        assert response.status_code == 400
        assert "error" in response.data

    def test_create_video_with_missing_required_fields_returns_400(
        self, api_client: APIClient
    ) -> None:
        response = api_client.post(
            "/api/videos/",
            data={
                "title": "My Video",
                # missing description, year_launched, opened, rating, duration
            },
            format="json",
        )

        assert response.status_code == 400
