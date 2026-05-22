import pg8000
from datetime import datetime
from pprint import pprint

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = 
DB_PORT = 5432

def fetch_all_client_users():
    try:
        # Conectar ao banco
        conn = pg8000.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        cursor = conn.cursor()

        # Query para pegar todos os client_user
        cursor.execute("""
            SELECT 
                id,
                clinical_info_id,
                email,
                password_hash,
                first_name,
                last_name,
                is_active,
                verification_code,
                code_expires_at,
                created_at,
                updated_at
            FROM client_user;
        """)

        rows = cursor.fetchall()

        # Transformar os resultados em dicionários
        users = []
        for row in rows:
            user = {
                "id": str(row[0]),
                "clinical_info_id": str(row[1]) if row[1] else None,
                "email": row[2],
                "password_hash": row[3],
                "first_name": row[4],
                "last_name": row[5],
                "is_active": row[6],
                "verification_code": row[7],
                "code_expires_at": row[8].isoformat() if row[8] else None,
                "created_at": row[9].isoformat() if row[9] else None,
                "updated_at": row[10].isoformat() if row[10] else None
            }
            users.append(user)

        return users

    except Exception as e:
        print("Erro ao buscar client_user:", e)
        return []

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


if __name__ == "__main__":
    users = fetch_all_client_users()
    print(f"\nTotal de client_user: {len(users)}\n")

    for idx, u in enumerate(users, start=1):
        print(f"--- Client User #{idx} ---")
        print(f"Nome: {u['first_name']} {u['last_name']}")
        print(f"Email: {u['email']}")
        print(f"Ativo: {u['is_active']}")
        print(f"Clinical Info ID: {u['clinical_info_id']}")
        print(f"Código de Verificação: {u['verification_code']}")
        print(f"Expira em: {u['code_expires_at']}")
        print(f"Criado em: {u['created_at']}, Atualizado em: {u['updated_at']}")
        print(f"Senha Hash: {u['password_hash']}\n")
        print("="*50 + "\n")
