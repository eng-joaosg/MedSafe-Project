import pg8000

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME =
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

def delete_all_clinical_info():
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

        # Executar o delete
        cursor.execute("DELETE FROM clinical_info;")
        conn.commit()

        print("Todos os registros de clinical_info foram deletados com sucesso!")

    except Exception as e:
        print("Erro ao deletar registros de clinical_info:", e)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    delete_all_clinical_info()
