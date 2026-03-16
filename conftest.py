import os
import time

import jwt
import pytest
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from rest_framework.test import APIClient


@pytest.fixture(scope="session")
def rsa_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


@pytest.fixture(scope="session", autouse=True)
def set_auth_public_key(rsa_key_pair):
    _, public_pem = rsa_key_pair
    os.environ["AUTH_PUBLIC_KEY"] = public_pem.decode()
    yield
    os.environ.pop("AUTH_PUBLIC_KEY", None)


@pytest.fixture
def auth_token(rsa_key_pair):
    private_pem, _ = rsa_key_pair
    payload = {
        "aud": "account",
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
        "realm_access": {
            "roles": [
                "offline_access",
                "admin",
                "uma_authorization",
                "default-roles-codeflix",
            ]
        },
    }
    return jwt.encode(payload, private_pem, algorithm="RS256")


@pytest.fixture
def auth_client(auth_token):
    return APIClient(headers={"Authorization": f"Bearer {auth_token}"})
