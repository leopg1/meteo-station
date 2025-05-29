from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
import os

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///weather_station.db')

# Creare engine SQLAlchemy
engine = create_engine(DATABASE_URL)

# Creare sesiune de bază de date
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Clasă de bază pentru modelele declarative
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """Inițializează baza de date și creează tabele"""
    # Importăm modelele aici pentru a ne asigura că sunt încărcate
    from models.user import User
    
    # Creăm tabelele
    Base.metadata.create_all(bind=engine)
    
    # Verificăm dacă există utilizatori și creăm un admin implicit dacă nu
    if db_session.query(User).count() == 0:
        admin = User(
            username='admin',
            email='admin@statiemeteo.local',
            role='admin'
        )
        admin.set_password('admin123')  # Parolă temporară, trebuie schimbată la prima autentificare!
        db_session.add(admin)
        db_session.commit()
        print("Utilizator admin creat cu username: 'admin' și parola: 'admin123'")
        print("IMPORTANT: Schimbați această parolă după prima autentificare!")

def shutdown_session(exception=None):
    """Închide sesiunea la finalul cererii"""
    db_session.remove()
