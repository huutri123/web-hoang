from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cấu hình kết nối MySQL cục bộ
# DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/web_edupro"
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/web_edupro"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Hàm tiện ích để get DB Session (dành cho FastAPI Dependency Injection)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
