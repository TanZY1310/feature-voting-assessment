from database import SessionLocal
from seed import seed_if_empty


def main() -> None:
    with SessionLocal() as db:
        if seed_if_empty(db):
            print("Database was empty - seeded sample data.")
        else:
            print("Database already contains data - skipping seed.")


if __name__ == "__main__":
    main()