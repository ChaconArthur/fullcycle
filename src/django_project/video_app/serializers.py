from rest_framework import serializers


class SetField(serializers.ListField):
    def to_internal_value(self, data):
        return set(super().to_internal_value(data))

    def to_representation(self, value):
        return list(super().to_representation(value))


class CreateVideoWithoutMediaInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    year_launched = serializers.IntegerField()
    opened = serializers.BooleanField()
    rating = serializers.CharField(max_length=20)
    duration = serializers.DecimalField(max_digits=10, decimal_places=2)
    categories_id = SetField(child=serializers.UUIDField(), required=False, default=set)
    genres_id = SetField(child=serializers.UUIDField(), required=False, default=set)
    cast_members_id = SetField(child=serializers.UUIDField(), required=False, default=set)


class CreateVideoWithoutMediaOutputSerializer(serializers.Serializer):
    id = serializers.UUIDField()
