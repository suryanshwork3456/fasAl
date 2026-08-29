# import os
# from datetime import datetime, timedelta, timezone

# import jwt
# from dotenv import load_dotenv
# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# load_dotenv()

# JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
# JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
# JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

# if not JWT_SECRET_KEY:
#     raise RuntimeError(
#         "JWT_SECRET_KEY is not set. Add it to your .env file "
#         "(e.g. generate one with `python -c \"import secrets; print(secrets.token_hex(32))\"`)."
#     )

# bearer_scheme = HTTPBearer()


# def create_access_token(user_id: int, phone: str) -> str:
#     now = datetime.now(timezone.utc)
#     payload = {
#         "sub": str(user_id),
#         "phone": phone,
#         "iat": now,
#         "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES),
#     }
#     return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


# def decode_access_token(token: str) -> dict:
#     try:
#         return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token has expired",
#         )
#     except jwt.InvalidTokenError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token",
#         )


# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
# ) -> dict:
#     """FastAPI dependency: validates the bearer token and returns its payload.

#     Usage in a route:
#         @router.get("/me")
#         def me(current_user: dict = Depends(get_current_user)):
#             ...
#     """
#     payload = decode_access_token(credentials.credentials)
#     return payload
