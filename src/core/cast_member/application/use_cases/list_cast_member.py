from dataclasses import dataclass
from uuid import UUID

from src import config
from src.core._shared.application.list_use_case import ListOutput, ListOutputMeta, ListRequest
from src.core.cast_member.domain.cast_member import CastMemberType
from src.core.cast_member.domain.cast_member_repository import CastMemberRepository


@dataclass
class CastMemberOutput:
    id: UUID
    name: str
    type: CastMemberType


@dataclass
class ListCastMemberRequest(ListRequest):
    pass


@dataclass
class ListCastMemberResponse(ListOutput[CastMemberOutput]):
    pass


class ListCastMember:
    def __init__(self, repository: CastMemberRepository) -> None:
        self.repository = repository

    def execute(self, request: ListCastMemberRequest) -> ListCastMemberResponse:
        cast_members = self.repository.list()
        ordered_cast_members = sorted(
            cast_members,
            key=lambda cast_member: getattr(cast_member, request.order_by),
        )
        page_offset = (request.current_page - 1) * config.DEFAULT_PAGINATION_SIZE
        cast_members_page = ordered_cast_members[page_offset:page_offset + config.DEFAULT_PAGINATION_SIZE]

        return ListCastMemberResponse(
            data=[
                CastMemberOutput(
                    id=cast_member.id,
                    name=cast_member.name,
                    type=cast_member.type,
                )
                for cast_member in cast_members_page
            ],
            meta=ListOutputMeta(
                current_page=request.current_page,
                per_page=config.DEFAULT_PAGINATION_SIZE,
                total=len(cast_members),
            ),
        )
