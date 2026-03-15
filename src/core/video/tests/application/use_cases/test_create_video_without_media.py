import uuid
from decimal import Decimal

import pytest

from src.core.cast_member.domain.cast_member import CastMember, CastMemberType
from src.core.cast_member.infra.in_memory_cast_member_repository import InMemoryCastMemberRepository
from src.core.category.domain.category import Category
from src.core.category.infra.in_memory_category_repository import InMemoryCategoryRepository
from src.core.genre.domain.genre import Genre
from src.core.genre.infra.in_memory_genre_repository import InMemoryGenreRepository
from src.core.video.application.use_cases.create_video_without_media import CreateVideoWithoutMedia
from src.core.video.application.use_cases.exceptions import RelatedEntitiesNotFound
from src.core.video.domain.value_objects import Rating
from src.core.video.infra.in_memory_video_repository import InMemoryVideoRepository


@pytest.fixture
def category_repository():
    return InMemoryCategoryRepository()


@pytest.fixture
def video_repository():
    return InMemoryVideoRepository()


@pytest.fixture
def genre_repository():
    return InMemoryGenreRepository()


@pytest.fixture
def cast_member_repository():
    return InMemoryCastMemberRepository()


@pytest.fixture
def use_case(
        category_repository: InMemoryCategoryRepository,
        video_repository: InMemoryVideoRepository,
        genre_repository: InMemoryGenreRepository,
        cast_member_repository: InMemoryCastMemberRepository,
) -> CreateVideoWithoutMedia:
    return CreateVideoWithoutMedia(
        video_repository=video_repository,
        category_repository=category_repository,
        genre_repository=genre_repository,
        cast_member_repository=cast_member_repository,
    )


class TestCreateVideoWithoutMedia:
    def test_create_video_without_media_with_associated_categories(
            self,
            use_case: CreateVideoWithoutMedia,
            category_repository: InMemoryCategoryRepository,
            video_repository: InMemoryVideoRepository,
    ) -> None:
        category_repository.save(Category(name="Category 1", description="Category 1 description"))
        category_repository.save(Category(name="Category 2", description="Category 2 description"))

        output = use_case.execute(
            CreateVideoWithoutMedia.Input(
                title="Video 1",
                description="Video 1 description",
                launch_year=2022,
                opened=True,
                duration=Decimal(120),
                rating=Rating.L,
                categories={cat.id for cat in category_repository.list()},
                genres=set(),
                cast_members=set(),
            )
        )

        assert len(video_repository.list()) == 1
        created_video = video_repository.get_by_id(output.id)
        assert created_video.title == "Video 1"
        assert created_video.description == "Video 1 description"
        assert created_video.launch_year == 2022
        assert created_video.opened
        assert created_video.duration == Decimal(120)
        assert created_video.rating == Rating.L
        assert created_video.categories == {cat.id for cat in category_repository.list()}

    def test_create_video_without_media_with_inexistent_categories_raise_an_error(
        self,
        use_case: CreateVideoWithoutMedia,
        category_repository: InMemoryCategoryRepository,
        video_repository: InMemoryVideoRepository,
    ) -> None:
        with pytest.raises(RelatedEntitiesNotFound, match="Invalid categories") as exc:
            use_case.execute(
                CreateVideoWithoutMedia.Input(
                    title="Video 1",
                    description="Video 1 description",
                    launch_year=2022,
                    opened=True,
                    duration=Decimal(120),
                    rating=Rating.L,
                    categories={uuid.uuid4()},
                    genres=set(),
                    cast_members=set(),
                )
            )

        assert len(video_repository.list()) == 0

    def test_create_video_without_media_with_inexistent_genres_raise_an_error(
        self,
        use_case: CreateVideoWithoutMedia,
        video_repository: InMemoryVideoRepository,
    ) -> None:
        with pytest.raises(RelatedEntitiesNotFound, match="Invalid genres"):
            use_case.execute(
                CreateVideoWithoutMedia.Input(
                    title="Video 1",
                    description="Video 1 description",
                    launch_year=2022,
                    opened=True,
                    duration=Decimal(120),
                    rating=Rating.L,
                    categories=set(),
                    genres={uuid.uuid4()},
                    cast_members=set(),
                )
            )

        assert len(video_repository.list()) == 0

    def test_create_video_without_media_with_inexistent_cast_members_raise_an_error(
        self,
        use_case: CreateVideoWithoutMedia,
        video_repository: InMemoryVideoRepository,
    ) -> None:
        with pytest.raises(RelatedEntitiesNotFound, match="Invalid cast members"):
            use_case.execute(
                CreateVideoWithoutMedia.Input(
                    title="Video 1",
                    description="Video 1 description",
                    launch_year=2022,
                    opened=True,
                    duration=Decimal(120),
                    rating=Rating.L,
                    categories=set(),
                    genres=set(),
                    cast_members={uuid.uuid4()},
                )
            )

        assert len(video_repository.list()) == 0

    def test_create_video_without_media_with_all_related_entities(
        self,
        use_case: CreateVideoWithoutMedia,
        category_repository: InMemoryCategoryRepository,
        genre_repository: InMemoryGenreRepository,
        cast_member_repository: InMemoryCastMemberRepository,
        video_repository: InMemoryVideoRepository,
    ) -> None:
        category = Category(name="Action", description="")
        genre = Genre(name="Drama", categories={category.id})
        cast_member = CastMember(name="John Doe", type=CastMemberType.ACTOR)

        category_repository.save(category)
        genre_repository.save(genre)
        cast_member_repository.save(cast_member)

        output = use_case.execute(
            CreateVideoWithoutMedia.Input(
                title="Full Video",
                description="With all related entities",
                launch_year=2024,
                opened=False,
                duration=Decimal(90),
                rating=Rating.AGE_14,
                categories={category.id},
                genres={genre.id},
                cast_members={cast_member.id},
            )
        )

        assert len(video_repository.list()) == 1
        created_video = video_repository.get_by_id(output.id)
        assert created_video.categories == {category.id}
        assert created_video.genres == {genre.id}
        assert created_video.cast_members == {cast_member.id}
