import pg8000

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

tabelas = ["allergy", "medication", "surgery", "disease"]

try:
    # Conecta ao banco
    conn = pg8000.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME
    )
    cursor = conn.cursor()

    for tabela in tabelas:
        print(f"\n=== Tabela: {tabela} ===")
        cursor.execute(f"SELECT * FROM {tabela} ORDER BY id;")
        registros = cursor.fetchall()
        if registros:
            # Imprime cada registro
            for registro in registros:
                print(registro)
        else:
            print("Sem registros.")

except Exception as e:
    print("Erro ao consultar tabelas:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
