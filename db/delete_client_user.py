import pg8000

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

def delete_all_client_users():
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

        # Executar DELETE
        cursor.execute("DELETE FROM client_user;")
        conn.commit()

        print("Todos os client_user foram apagados com sucesso!")

    except Exception as e:
        print("Erro ao apagar client_user:", e)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    confirm = input("Tem certeza que deseja apagar TODOS os client_user? (yes/no): ")
    if confirm.lower() == "yes":
        delete_all_client_users()
    else:
        print("Operação cancelada.")
