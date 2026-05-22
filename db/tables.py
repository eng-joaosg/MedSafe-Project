import pg8000

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

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

    # Consulta para listar todas as tabelas do esquema público
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)

    tabelas = cursor.fetchall()
    print("Tabelas existentes no banco:")
    for tabela in tabelas:
        print("-", tabela[0])

except Exception as e:
    print("Erro ao listar tabelas:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
