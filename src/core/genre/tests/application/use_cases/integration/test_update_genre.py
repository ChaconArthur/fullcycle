import uuid

import pytest

from src.core.category.domain.category import Category
from src.core.category.infra.in_memory_category_repository import InMemoryCategoryRepository
from src.core.genre.application.use_cases.update_genre import UpdateGenre
from src.core.genre.domain.genre import Genre
from src.core.genre.infra.in_memory_genre_repository import InMemoryGenreRepository


class TestUpdateGenre:
    def test_update_genre_happy_path(self):
        """Update with valid data and existing categories persists changes correctly."""
        category_repository = InMemoryCategoryRepository()
        genre_repository = InMemoryGenreRepository()

        movie = Category(name="Movie")
        documentary = Category(name="Documentary")
        category_repository.save(movie)
        category_repository.save(documentary)

        genre = Genre(name="Action", is_active=True, categories={movie.id, documentary.id})
        genre_repository.save(genre)

        use_case = UpdateGenre(
            repository=genre_repository,
            category_repository=category_repository,
        )

        use_case.execute(UpdateGenre.Input(
            id=genre.id,
            name="Updated Action",
            is_active=False,
            categories={movie.id},
        ))

        updated_genre = genre_repository.get_by_id(genre.id)
        assert updated_genre.name == "Updated Action"
        assert updated_genre.is_active is False
        assert updated_genre.categories == {movie.id}
        assert documentary.id not in updated_genre.categories

    def test_update_genre_replaces_all_categories(self):
        """PUT semantics: categories are fully replaced, not merged."""
        category_repository = InMemoryCategoryRepository()
        genre_repository = InMemoryGenreRepository()

        cat1 = Category(name="Category 1")
        cat2 = Category(name="Category 2")
        cat3 = Category(name="Category 3")
        category_repository.save(cat1)
        category_repository.save(cat2)
        category_repository.save(cat3)

        genre = Genre(name="Genre", is_active=True, categories={cat1.id, cat2.id, cat3.id})
        genre_repository.save(genre)

        use_case = UpdateGenre(
            repository=genre_repository,
            category_repository=category_repository,
        )

        # Update passing only 2 of the 3 categories
        use_case.execute(UpdateGenre.Input(
            id=genre.id,
            name="Genre",
            is_active=True,
            categories={cat1.id, cat2.id},
        ))

        updated_genre = genre_repository.get_by_id(genre.id)
        assert updated_genre.categories == {cat1.id, cat2.id}
        assert cat3.id not in updated_genre.categories

    def test_update_genre_activate_and_deactivate(self):
        """Validates that is_active attribute is updated correctly."""
        category_repository = InMemoryCategoryRepository()
        genre_repository = InMemoryGenreRepository()

        genre = Genre(name="Drama", is_active=True)
        genre_repository.save(genre)

        use_case = UpdateGenre(
            repository=genre_repository,
            category_repository=category_repository,
        )

        # Deactivate
        use_case.execute(UpdateGenre.Input(
            id=genre.id,
            name="Drama",
            is_active=False,
            categories=set(),
        ))
        assert genre_repository.get_by_id(genre.id).is_active is False

        # Reactivate
        use_case.execute(UpdateGenre.Input(
            id=genre.id,
            name="Drama",
            is_active=True,
            categories=set(),
        ))
        assert genre_repository.get_by_id(genre.id).is_active is True
