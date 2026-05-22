import pg8000
from datetime import datetime

# -----------------------
# Configurações do banco
# -----------------------
DB_NAME = 
DB_USER = 
DB_PASSWORD = 
DB_HOST = "localhost"
DB_PORT = 5432

# =======================
# Lista completa de alergias
# =======================
alergias = [
    # Alimentos
    ("Alergia a leite de vaca", "Reação alérgica ao consumo de leite"),
    ("Alergia a ovos", "Reação alérgica ao consumo de ovos"),
    ("Alergia a amendoim", "Reação alérgica ao consumo de amendoim"),
    ("Alergia a castanha-do-pará", "Reação alérgica ao consumo de castanhas"),
    ("Alergia a castanha de caju", "Reação alérgica ao consumo de castanhas"),
    ("Alergia a nozes", "Reação alérgica ao consumo de nozes"),
    ("Alergia a soja", "Reação alérgica ao consumo de soja"),
    ("Alergia a trigo", "Reação alérgica ao consumo de trigo"),
    ("Alergia a frutos do mar", "Reação alérgica ao consumo de camarão, lagosta, etc."),
    ("Alergia a peixe", "Reação alérgica ao consumo de peixes"),
    ("Alergia a morango", "Reação alérgica ao consumo de morango"),
    ("Alergia a tomate", "Reação alérgica ao consumo de tomate"),
    ("Alergia a chocolate", "Reação alérgica ao consumo de chocolate"),
    ("Alergia a amêndoas", "Reação alérgica ao consumo de amêndoas"),
    ("Alergia a pimenta", "Reação alérgica ao consumo de pimenta"),

    # Ambientais / inalantes
    ("Alergia a pólen", "Reação alérgica a pólen de plantas"),
    ("Alergia a ácaros", "Reação alérgica a ácaros da poeira"),
    ("Alergia a pelos de animais", "Reação alérgica a cães ou gatos"),
    ("Alergia a mofo", "Reação alérgica a fungos ambientais"),
    ("Alergia a poeira", "Reação alérgica à poeira doméstica"),
    ("Alergia a fumaça de cigarro", "Reação alérgica à fumaça"),
    ("Alergia a perfume", "Reação alérgica a fragrâncias"),
    ("Alergia a pó industrial", "Reação alérgica a partículas industriais"),
    ("Alergia a látex", "Reação alérgica a borracha natural"),
    ("Alergia a produtos químicos de limpeza", "Reação alérgica a detergentes e solventes"),

    # Picadas de insetos / venenos
    ("Alergia a picada de abelha", "Reação alérgica ao veneno de abelha"),
    ("Alergia a picada de vespa", "Reação alérgica ao veneno de vespa"),
    ("Alergia a picada de formiga", "Reação alérgica a picada de formiga vermelha"),
    ("Alergia a picada de mosquitos", "Reação alérgica a picadas de mosquito"),
    ("Alergia a carrapatos", "Reação alérgica a picada de carrapato"),

    # Medicamentos
    ("Penicilina", "Reação alérgica a antibiótico do grupo das penicilinas"),
    ("Amoxicilina", "Reação alérgica ao antibiótico amoxicilina"),
    ("Ampicilina", "Reação alérgica ao antibiótico ampicilina"),
    ("Cefalexina", "Reação alérgica a antibiótico cefalosporínico"),
    ("Ceftriaxona", "Reação alérgica a antibiótico cefalosporínico"),
    ("Sulfametoxazol + Trimetoprima", "Reação alérgica ao antibiótico combinado"),
    ("Ibuprofeno", "Reação alérgica a anti-inflamatório não esteroidal (AINE)"),
    ("Aspirina (Ácido acetilsalicílico)", "Reação alérgica a anti-inflamatório e analgésico"),
    ("Naproxeno", "Reação alérgica a anti-inflamatório não esteroidal (AINE)"),
    ("Diclofenaco", "Reação alérgica a anti-inflamatório não esteroidal (AINE)"),
    ("Paracetamol", "Reação alérgica a analgésico e antipirético"),
    ("Cloranfenicol", "Reação alérgica a antibiótico"),
    ("Vancomicina", "Reação alérgica a antibiótico glicopeptídico"),
    ("Morfina", "Reação alérgica a opioide analgésico"),
    ("Codeína", "Reação alérgica a opioide analgésico"),
    ("Ciprofloxacino", "Reação alérgica a antibiótico quinolona"),
    ("Levofloxacino", "Reação alérgica a antibiótico quinolona"),
    ("Doxiciclina", "Reação alérgica a antibiótico tetraciclina"),
    ("Clindamicina", "Reação alérgica a antibiótico lincosamida"),
    ("Metronidazol", "Reação alérgica a antibiótico e antiprotozoário"),
]

# =======================
# Inserir alergias no banco
# =======================
try:
    conn = pg8000.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    cursor = conn.cursor()

    for nome, descricao in alergias:
        cursor.execute(
            "INSERT INTO allergy (name, description, created_at, updated_at) VALUES (%s, %s, %s, %s)",
            (nome, descricao, datetime.now(), datetime.now())
        )

    conn.commit()
    print(f"{len(alergias)} alergias inseridas com sucesso!")

except Exception as e:
    print("Erro ao inserir alergias:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
