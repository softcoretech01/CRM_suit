import aiomysql
from app.core.config import settings

class Database:
    def __init__(self):
        self.admin_pool = None
        self.masters_pool = None
        self.crm_pool = None

    async def connect(self):
        self.admin_pool = await aiomysql.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME_ADMIN,
            autocommit=True
        )
        self.masters_pool = await aiomysql.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME_MASTERS,
            autocommit=True
        )
        self.crm_pool = await aiomysql.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME_CRM,
            autocommit=True
        )

    async def disconnect(self):
        if self.admin_pool:
            self.admin_pool.close()
            await self.admin_pool.wait_closed()
        if self.masters_pool:
            self.masters_pool.close()
            await self.masters_pool.wait_closed()
        if self.crm_pool:
            self.crm_pool.close()
            await self.crm_pool.wait_closed()

db = Database()

# Dependency providers
async def get_admin_db():
    async with db.admin_pool.acquire() as conn:
        yield conn

async def get_masters_db():
    async with db.masters_pool.acquire() as conn:
        yield conn

async def get_crm_db():
    async with db.crm_pool.acquire() as conn:
        yield conn
