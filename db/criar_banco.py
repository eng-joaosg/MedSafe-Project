import pg8000

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME =
DB_USER =
DB_PASSWORD =
DB_HOST = "localhost"
DB_PORT = 5432

# =======================
# ETAPA 1: CRIAR O BANCO SE NÃO EXISTIR
# =======================
try:
    conn = pg8000.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database="postgres")
    conn.autocommit = True
    cursor = conn.cursor()

    # Criar extensão para gen_random_uuid()
    cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    try:
        cursor.execute(f'DROP DATABASE IF EXISTS "{DB_NAME}";')
        print(f"Banco '{DB_NAME}' apagado com sucesso (se existia).")
    except Exception as e:
        print("Erro ao apagar o banco:", e)

    try:
        cursor.execute(f'CREATE DATABASE "{DB_NAME}";')
        print(f"Banco '{DB_NAME}' criado com sucesso!")
    except Exception as e:
        print("Erro ao criar o banco:", e)

    cursor.close()
    conn.close()
except Exception as e:
    print("Erro ao conectar ao PostgreSQL:", e)

# =======================
# ETAPA 2: CRIAR AS TABELAS
# =======================
try:
    conn = pg8000.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    cursor = conn.cursor()

    tabelas = [
        """
        CREATE TABLE IF NOT EXISTS clinical_info (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name VARCHAR(40) NOT NULL,
            last_name VARCHAR(60) NOT NULL,
            blood_type VARCHAR(3),
            sex VARCHAR(12) NOT NULL,
            date_of_birth DATE NOT NULL,
            other_info VARCHAR(255),
            public_code VARCHAR(6) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS client_user (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clinical_info_id UUID REFERENCES clinical_info(id) ON DELETE SET NULL,
            email VARCHAR(60) UNIQUE NOT NULL,
            password_hash CHAR(60) NOT NULL,
            first_name VARCHAR(40) NOT NULL,
            last_name VARCHAR(60) NOT NULL,
            is_active BOOLEAN DEFAULT FALSE,
            verification_code VARCHAR(6) NULL,
            code_expires_at TIMESTAMPTZ NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS allergy (
            id SMALLSERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description VARCHAR(100),
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL 
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS disease (
            id SMALLSERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description VARCHAR(100),
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            icd_code VARCHAR(20)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS medication (
            id SMALLSERIAL PRIMARY KEY,
            name VARCHAR(60) UNIQUE NOT NULL,
            description VARCHAR(100),
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS surgery (
            id SMALLSERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description VARCHAR(100),
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS staff_user (
            id NUMERIC(8,0) PRIMARY KEY,
            first_name VARCHAR(40) NOT NULL,
            last_name VARCHAR(60) NOT NULL,
            email VARCHAR(60) UNIQUE NOT NULL,
            password_hash CHAR(60) NOT NULL,
            role VARCHAR(30) NOT NULL DEFAULT 'DEVELOPER',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL 
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS emergency_contact (
            clinical_info_id UUID NOT NULL REFERENCES clinical_info(id) ON DELETE CASCADE,
            id SMALLINT NOT NULL, -- 1, 2 ou 3
            first_name VARCHAR(40) NULL,
            last_name VARCHAR(60) NULL,
            ddd VARCHAR(3) NULL,
            phone VARCHAR(10) NULL,
            relationship VARCHAR(50) NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (clinical_info_id, id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS clinical_info_allergy (
            clinical_info_id UUID NOT NULL REFERENCES clinical_info(id) ON DELETE CASCADE,
            allergy_id SMALLINT NOT NULL REFERENCES allergy(id) ON DELETE CASCADE,
            severity VARCHAR(10) NOT NULL,
            PRIMARY KEY (clinical_info_id, allergy_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS clinical_info_disease (
            clinical_info_id UUID NOT NULL REFERENCES clinical_info(id) ON DELETE CASCADE,
            disease_id SMALLINT NOT NULL REFERENCES disease(id) ON DELETE CASCADE,
            PRIMARY KEY (clinical_info_id, disease_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS clinical_info_medication (
            clinical_info_id UUID NOT NULL REFERENCES clinical_info(id) ON DELETE CASCADE,
            medication_id SMALLINT NOT NULL REFERENCES medication(id) ON DELETE CASCADE,
            dosage SMALLINT,
            usage_interval SMALLINT,
            PRIMARY KEY (clinical_info_id, medication_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS clinical_info_surgery (
            clinical_info_id UUID NOT NULL REFERENCES clinical_info(id) ON DELETE CASCADE,
            surgery_id SMALLINT NOT NULL REFERENCES surgery(id) ON DELETE CASCADE,
            PRIMARY KEY (clinical_info_id, surgery_id)
        );
        """
    ]

    for t in tabelas:
        cursor.execute(t)

    conn.commit()
    print("Todas as tabelas foram criadas com sucesso!")

except Exception as e:
    print("Erro ao criar as tabelas:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
        print("Conexão finalizada.")
