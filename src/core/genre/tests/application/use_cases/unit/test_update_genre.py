import uuid
from unittest.mock import create_autospec

import pytest

from src.core.category.domain.category import Category
from src.core.category.domain.category_repository import CategoryRepository
from src.core.genre.application.use_cases.exceptions import (
    GenreNotFound,
    InvalidGenre,
    RelatedCategoriesNotFound,
)
from src.core.genre.application.use_cases.update_genre import UpdateGenre
from src.core.genre.domain.genre import Genre
from src.core.genre.domain.genre_repository import GenreRepository


@pytest.fixture
def movie_category() -> Category:
    return Category(name="Movie")


@pytest.fixture
def documentary_category() -> Category:
    return Category(name="Documentary")


@pytest.fixture
def existing_genre(movie_category, documentary_category) -> Genre:
    return Genre(
        name="Action",
        is_active=True,
        categories={movie_category.id, documentary_category.id},
    )


@pytest.fixture
def mock_genre_repository(existing_genre) -> GenreRepository:
    repository = create_autospec(GenreRepository)
    repository.get_by_id.return_value = existing_genre
    return repository


@pytest.fixture
def mock_category_repository(movie_category, documentary_category) -> CategoryRepository:
    repository = create_autospec(CategoryRepository)
    repository.list.return_value = [movie_category, documentary_category]
    return repository


@pytest.fixture
def mock_empty_category_repository() -> CategoryRepository:
    repository = create_autospec(CategoryRepository)
    repository.list.return_value = []
    return repository


class TestUpdateGenre:
    def test_when_genre_not_found_then_raise_genre_not_found(
        self,
        mock_category_repository,
    ):
        repository = create_autospec(GenreRepository)
        repository.get_by_id.return_value = None

        use_case = UpdateGenre(
            repository=repository,
            category_repository=mock_category_repository,
        )

        non_existent_id = uuid.uuid4()
        with pytest.raises(GenreNotFound, match=str(non_existent_id)):
            use_case.execute(UpdateGenre.Input(
                id=non_existent_id,
                name="New Name",
                is_active=True,
                categories=set(),
            ))

    def test_when_provided_categories_do_not_exist_then_raise_related_categories_not_found(
        self,
        mock_genre_repository,
        mock_empty_category_repository,
        existing_genre,
    ):
        use_case = UpdateGenre(
            repository=mock_genre_repository,
            category_repository=mock_empty_category_repository,
        )

        non_existent_category_id = uuid.uuid4()
        with pytest.raises(RelatedCategoriesNotFound, match="Categories with provided IDs not found: ") as exc:
            use_case.execute(UpdateGenre.Input(
                id=existing_genre.id,
                name="Updated Name",
                is_active=True,
                categories={non_existent_category_id},
            ))

        assert str(non_existent_category_id) in str(exc.value)

    def test_when_invalid_attributes_then_raise_invalid_genre(
        self,
        mock_genre_repository,
        mock_category_repository,
        existing_genre,
    ):
        use_case = UpdateGenre(
            repository=mock_genre_repository,
            category_repository=mock_category_repository,
        )

        with pytest.raises(InvalidGenre, match="name cannot be empty"):
            use_case.execute(UpdateGenre.Input(
                id=existing_genre.id,
                name="",
                is_active=True,
                categories=set(),
            ))

    def test_when_valid_input_then_update_genre(
        self,
        mock_genre_repository,
        mock_category_repository,
        existing_genre,
        movie_category,
    ):
        use_case = UpdateGenre(
            repository=mock_genre_repository,
            category_repository=mock_category_repository,
        )

        use_case.execute(UpdateGenre.Input(
            id=existing_genre.id,
            name="Updated Genre",
            is_active=False,
            categories={movie_category.id},
        ))

        mock_genre_repository.update.assert_called_once()
        updated_genre = mock_genre_repository.update.call_args[0][0]
        assert updated_genre.name == "Updated Genre"
        assert updated_genre.is_active is False
        assert updated_genre.categories == {movie_category.id}

    def test_update_replaces_categories_completely(
        self,
        mock_genre_repository,
        mock_category_repository,
        existing_genre,
        movie_category,
        documentary_category,
    ):
        """Verifies PUT-like behavior: passing only 1 category should replace all previous categories."""
        # Genre initially has 2 categories (movie + documentary)
        assert len(existing_genre.categories) == 2

        use_case = UpdateGenre(
            repository=mock_genre_repository,
            category_repository=mock_category_repository,
        )

        # Update passing only 1 category
        use_case.execute(UpdateGenre.Input(
            id=existing_genre.id,
            name="Action Updated",
            is_active=True,
            categories={movie_category.id},
        ))

        mock_genre_repository.update.assert_called_once()
        updated_genre = mock_genre_repository.update.call_args[0][0]
        assert updated_genre.categories == {movie_category.id}
        assert documentary_category.id not in updated_genre.categories
